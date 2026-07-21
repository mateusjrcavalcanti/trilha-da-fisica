import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleStop, Volume2 } from "lucide-react";
import useLocalStorageState from "use-local-storage-state";
import { Toaster, toast } from "sonner";
import { AudioControls } from "@/components/game/AudioControls";
import { Button } from "@/components/ui/button";
import { DevToolsPanel } from "@/components/game/DevToolsPanel";
import { DiceHud } from "@/components/game/DiceHud";
import { EndGameCard } from "@/components/game/EndGameCard";
import { GameCard } from "@/components/game/GameCard";
import { GameScene } from "@/components/game/GameScene";
import { ScoreHud } from "@/components/game/ScoreHud";
import { boardTiles, positionForPlayer, routeForPlayer, startPositions } from "@/components/game/board";
import type { CurrentQuestion, Phase, PlayerId, PlayerViewState, Question } from "@/components/game/types";
import questionsData from "@/data/questions";
import { launchVictoryConfetti } from "@/lib/confetti";
import {
  initialPlayerState,
  labels,
  musicTrackForPhase,
  otherPlayer,
  plainLabels,
  yawBetween,
  yawForPath,
} from "@/lib/gameState";
import { useGameAudio } from "@/lib/useGameAudio";
import { randomInt, shuffle } from "@/lib/utils";

type RobotAction = PlayerViewState["action"];
type RobotExpression = PlayerViewState["expression"];

function App() {
  const audio = useGameAudio();
  const timers = useRef<number[]>([]);
  const restoredTransientState = useRef(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [devRevealCorrect, setDevRevealCorrect] = useState(false);
  const [devUseFixedDice, setDevUseFixedDice] = useState(false);
  const [devDiceValue, setDevDiceValue] = useState(6);
  const [phase, setPhase] = useLocalStorageState<Phase>("fisica-quiz-phase", { defaultValue: "idle" });
  const [activePlayer, setActivePlayer] = useLocalStorageState<PlayerId | null>("fisica-quiz-active-player", { defaultValue: null });
  const [winner, setWinner] = useLocalStorageState<PlayerId | null>("fisica-quiz-winner", { defaultValue: null });
  const [scores, setScores] = useLocalStorageState<Record<PlayerId, number>>("fisica-quiz-scores", {
    defaultValue: {
      jogadorUm: -1,
      jogadorDois: -1,
    },
  });
  const [players, setPlayers] = useLocalStorageState<Record<PlayerId, PlayerViewState>>("fisica-quiz-players", {
    defaultValue: initialPlayerState,
  });
  const [remainingQuestions, setRemainingQuestions] = useLocalStorageState<Question[]>("fisica-quiz-remaining-questions", {
    defaultValue: [],
  });
  const [currentQuestion, setCurrentQuestion] = useLocalStorageState<CurrentQuestion | null>("fisica-quiz-current-question", {
    defaultValue: null,
  });
  const [selectedAnswer, setSelectedAnswer] = useLocalStorageState<string | null>("fisica-quiz-selected-answer", {
    defaultValue: null,
  });
  const [lastRoll, setLastRoll] = useLocalStorageState<number | null>("fisica-quiz-last-roll", { defaultValue: null });
  const currentMusicTrack = musicTrackForPhase(phase);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    void audio.startMusic(currentMusicTrack);
  }, [audio, currentMusicTrack]);

  useEffect(() => {
    const unlockAudio = () => {
      void audio.startMusic(musicTrackForPhase(phase));
    };

    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    window.addEventListener("keydown", unlockAudio, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
    };
  }, [audio, phase]);

  useEffect(() => {
    if (restoredTransientState.current) return;
    restoredTransientState.current = true;

    if (phase === "feedback") {
      setPhase(currentQuestion ? "question" : "idle");
      setSelectedAnswer(null);
      setLastRoll(null);
    }

    if (phase === "resolving") {
      setPhase(currentQuestion && activePlayer ? "question" : "idle");
      setSelectedAnswer(null);
      setLastRoll(null);
      setPlayers((current) => ({
        jogadorUm: {
          ...current.jogadorUm,
          action: activePlayer === "jogadorUm" ? "Idle" : "Sitting",
          expression: "neutral",
          facingYaw: current.jogadorUm.facingYaw ?? 0,
          path: [],
          targetPosition: positionForPlayer("jogadorUm", scores.jogadorUm),
        },
        jogadorDois: {
          ...current.jogadorDois,
          action: activePlayer === "jogadorDois" ? "Idle" : "Sitting",
          expression: "neutral",
          facingYaw: current.jogadorDois.facingYaw ?? 0,
          path: [],
          targetPosition: positionForPlayer("jogadorDois", scores.jogadorDois),
        },
      }));
    }
  }, [activePlayer, currentQuestion, phase, scores, setLastRoll, setPhase, setPlayers, setSelectedAnswer]);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }, []);

  const updatePlayer = useCallback((player: PlayerId, patch: Partial<PlayerViewState>) => {
    setPlayers((current) => ({
      ...current,
      [player]: {
        ...current[player],
        ...patch,
      },
    }));
  }, [setPlayers]);

  const setTurnAnimations = useCallback((player: PlayerId, action: RobotAction = "Idle", expression: RobotExpression = "neutral") => {
    setPlayers((current) => ({
      jogadorUm: {
        ...current.jogadorUm,
        action: player === "jogadorUm" ? action : "Sitting",
        expression: player === "jogadorUm" ? expression : "neutral",
        facingYaw: current.jogadorUm.facingYaw ?? 0,
      },
      jogadorDois: {
        ...current.jogadorDois,
        action: player === "jogadorDois" ? action : "Sitting",
        expression: player === "jogadorDois" ? expression : "neutral",
        facingYaw: current.jogadorDois.facingYaw ?? 0,
      },
    }));
  }, [setPlayers]);

  const finishByScore = useCallback((scoreState: Record<PlayerId, number>) => {
    setCurrentQuestion(null);
    if (scoreState.jogadorUm === scoreState.jogadorDois) {
      setPhase("draw");
      setWinner(null);
      toast("🤝 Empate!");
      audio.playEffect("draw");
      return;
    }

    const nextWinner = scoreState.jogadorUm > scoreState.jogadorDois ? "jogadorUm" : "jogadorDois";
    setWinner(nextWinner);
    setActivePlayer(nextWinner);
    setPhase("finished");
    updatePlayer(nextWinner, { action: "Dance", expression: "neutral" });
    toast(`🏆 O jogador ${nextWinner === "jogadorUm" ? "Um" : "Dois"} venceu!`);
    audio.playEffect("victory");
    launchVictoryConfetti();
  }, [audio, setActivePlayer, setCurrentQuestion, setPhase, setWinner, updatePlayer]);

  const beginTurn = useCallback(
    (player: PlayerId, questionPool: Question[], scoreState: Record<PlayerId, number>) => {
      if (!questionPool.length) {
        toast("📚 As perguntas acabaram!");
        finishByScore(scoreState);
        return;
      }

      const questionIndex = randomInt(0, questionPool.length - 1);
      const question = questionPool[questionIndex];
      if (!question) {
        finishByScore(scoreState);
        return;
      }

      const nextPool = questionPool.filter((_, index) => index !== questionIndex);

      setRemainingQuestions(nextPool);
      setCurrentQuestion({
        question,
        answers: shuffle([
          ...question.erradas.map((label) => ({ label, isCorrect: false })),
          { label: question.correta, isCorrect: true },
        ]),
      });
      setSelectedAnswer(null);
      setLastRoll(null);
      setActivePlayer(player);
      setWinner(null);
      setPhase("question");
      setTurnAnimations(player);
    },
    [
      finishByScore,
      setActivePlayer,
      setCurrentQuestion,
      setLastRoll,
      setPhase,
      setRemainingQuestions,
      setSelectedAnswer,
      setTurnAnimations,
      setWinner,
    ],
  );

  const startGame = useCallback(() => {
    clearTimers();
    const scoreState = { jogadorUm: -1, jogadorDois: -1 };
    setScores(scoreState);
    setPlayers({
      jogadorUm: {
        targetPosition: startPositions.jogadorUm,
        path: [],
        action: "Wave",
        expression: "neutral",
        facingYaw: 0,
        resetToken: players.jogadorUm.resetToken + 1,
      },
      jogadorDois: {
        targetPosition: startPositions.jogadorDois,
        path: [],
        action: "Sitting",
        expression: "neutral",
        facingYaw: 0,
        resetToken: players.jogadorDois.resetToken + 1,
      },
    });
    toast("🤖 Jogo iniciado!");
    void audio.startMusic("game");
    audio.playEffect("start");
    beginTurn("jogadorUm", [...questionsData], scoreState);
  }, [
    audio,
    beginTurn,
    clearTimers,
    players.jogadorDois.resetToken,
    players.jogadorUm.resetToken,
    setPlayers,
    setScores,
  ]);

  const stopGame = useCallback(() => {
    clearTimers();
    const scoreState = { jogadorUm: -1, jogadorDois: -1 };

    setScores(scoreState);
    setRemainingQuestions([]);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setLastRoll(null);
    setActivePlayer(null);
    setWinner(null);
    setPhase("idle");
    setPlayers({
      jogadorUm: {
        targetPosition: startPositions.jogadorUm,
        path: [],
        action: "Sitting",
        expression: "neutral",
        facingYaw: 0,
        resetToken: players.jogadorUm.resetToken + 1,
      },
      jogadorDois: {
        targetPosition: startPositions.jogadorDois,
        path: [],
        action: "Sitting",
        expression: "neutral",
        facingYaw: 0,
        resetToken: players.jogadorDois.resetToken + 1,
      },
    });
    toast("⏹️ Partida parada.");
    void audio.startMusic("menu");
  }, [
    audio,
    clearTimers,
    players.jogadorDois.resetToken,
    players.jogadorUm.resetToken,
    setActivePlayer,
    setCurrentQuestion,
    setLastRoll,
    setPhase,
    setPlayers,
    setRemainingQuestions,
    setScores,
    setSelectedAnswer,
    setWinner,
  ]);

  const goToNextTurn = useCallback(
    (currentPlayer: PlayerId, scoreState: Record<PlayerId, number>) => {
      beginTurn(otherPlayer[currentPlayer], remainingQuestions, scoreState);
    },
    [beginTurn, remainingQuestions],
  );

  const answerQuestion = useCallback(
    (answer: { label: string; isCorrect: boolean }) => {
      if (!activePlayer || phase !== "question") return;

      setSelectedAnswer(answer.label);
      setPhase("feedback");

      if (!answer.isCorrect) {
        toast("❌ Resposta errada!");
        audio.playEffect("wrong");
        updatePlayer(activePlayer, { action: "No", expression: "Sad", path: [] });
        schedule(() => {
          setTurnAnimations(otherPlayer[activePlayer]);
          goToNextTurn(activePlayer, scores);
        }, 1250);
        return;
      }

      const movement = devUseFixedDice ? Math.min(6, Math.max(1, devDiceValue)) : randomInt(1, 6);
      const nextScore = Math.min(scores[activePlayer] + movement, boardTiles.length - 1);
      const movementPath = routeForPlayer(activePlayer, scores[activePlayer], nextScore);
      const scoreState = {
        ...scores,
        [activePlayer]: nextScore,
      };

      toast("✅ Resposta certa!");
      audio.playEffect("correct");
      updatePlayer(activePlayer, { action: "Yes", expression: "neutral", path: [] });
      setLastRoll(movement);
      schedule(() => {
        updatePlayer(activePlayer, { action: "Jump", expression: "Surprised", path: [] });
      }, 950);
      schedule(() => {
        audio.playEffect("dice");
        audio.playEffect("walk", movement);
        setScores(scoreState);
        setPhase("moving");
        updatePlayer(activePlayer, {
          action: "Walking",
          expression: "neutral",
          facingYaw: yawForPath(positionForPlayer(activePlayer, scores[activePlayer]), movementPath),
          targetPosition: positionForPlayer(activePlayer, nextScore),
          path: movementPath,
        });
      }, 1450);
    },
    [
      activePlayer,
      audio,
      devDiceValue,
      devUseFixedDice,
      goToNextTurn,
      phase,
      schedule,
      scores,
      setLastRoll,
      setPhase,
      setScores,
      setSelectedAnswer,
      setTurnAnimations,
      updatePlayer,
    ],
  );

  const handleArrival = useCallback(
    (player: PlayerId) => {
      if (phase === "resolving" && players[player].action === "WalkJump" && scores[player] === -1) {
        updatePlayer(player, {
          action: "Sitting",
          expression: "neutral",
          facingYaw: 0,
          targetPosition: startPositions[player],
          path: [],
          resetToken: players[player].resetToken + 1,
        });
        return;
      }

      if (phase !== "moving" || activePlayer !== player) return;

      const landedScore = scores[player];
      const tile = boardTiles[landedScore];
      const opponent = otherPlayer[player];

      if (tile?.kind === "finish") {
        setWinner(player);
        setPhase("finished");
        updatePlayer(player, { action: "Dance", expression: "neutral" });
        toast(`🏆 O jogador ${player === "jogadorUm" ? "Um" : "Dois"} venceu!`);
        audio.playEffect("victory");
        launchVictoryConfetti();
        return;
      }

      if (tile?.kind === "danger") {
        const returnStartDelay = 1200;
        const returnPath = routeForPlayer(player, landedScore, -1);
        const returnDuration = Math.max(1600, returnPath.length * 650);
        const returnEndDelay = returnStartDelay + returnDuration;

        setPhase("resolving");
        toast("🕳️ Caiu no buraco! Volte para a largada.");
        audio.playEffect("fall");
        updatePlayer(player, { action: "Jump", expression: "Surprised", path: [] });
        schedule(() => {
          updatePlayer(player, { action: "Death", expression: "Sad", path: [] });
        }, 520);
        schedule(() => {
          const scoreState = { ...scores, [player]: -1 };
          setScores(scoreState);
          updatePlayer(player, {
            action: "WalkJump",
            expression: "Surprised",
            facingYaw: yawForPath(positionForPlayer(player, landedScore), returnPath),
            targetPosition: startPositions[player],
            path: returnPath,
          });
        }, returnStartDelay);
        schedule(() => {
          updatePlayer(player, {
            action: "Sitting",
            expression: "neutral",
            facingYaw: 0,
            targetPosition: startPositions[player],
            path: [],
            resetToken: players[player].resetToken + 1,
          });
        }, returnEndDelay);
        schedule(() => {
          const scoreState = { ...scores, [player]: -1 };
          goToNextTurn(player, scoreState);
        }, returnEndDelay + 250);
        return;
      }

      if (landedScore >= 0 && landedScore === scores[opponent]) {
        const opponentReturnPath = routeForPlayer(opponent, landedScore, -1);
        const opponentReturnDuration = Math.max(1600, opponentReturnPath.length * 650);

        setPhase("resolving");
        toast("💥 Dormiu no ponto!");
        audio.playEffect("punch");
        updatePlayer(player, {
          action: "Punch",
          expression: "Angry",
          facingYaw: yawBetween(positionForPlayer(player, landedScore), positionForPlayer(opponent, landedScore)),
          targetPosition: positionForPlayer(player, landedScore),
          path: [],
        });
        schedule(() => {
          audio.playEffect("fall");
          updatePlayer(opponent, { action: "Death", expression: "Sad", path: [] });
        }, 520);
        schedule(() => {
          const scoreState = { ...scores, [opponent]: -1 };
          setScores(scoreState);
          updatePlayer(player, {
            targetPosition: positionForPlayer(player, landedScore),
            path: [],
            action: "Sitting",
            expression: "neutral",
            facingYaw: yawBetween(positionForPlayer(player, landedScore), positionForPlayer(opponent, landedScore)),
          });
          updatePlayer(opponent, {
            action: "WalkJump",
            expression: "Surprised",
            facingYaw: yawForPath(positionForPlayer(opponent, landedScore), opponentReturnPath),
            targetPosition: startPositions[opponent],
            path: opponentReturnPath,
          });
        }, 1200);
        schedule(() => {
          const scoreState = { ...scores, [opponent]: -1 };
          updatePlayer(opponent, {
            targetPosition: startPositions[opponent],
            path: [],
            action: "Sitting",
            expression: "neutral",
            facingYaw: 0,
            resetToken: players[opponent].resetToken + 1,
          });
          updatePlayer(player, {
            targetPosition: positionForPlayer(player, landedScore),
            path: [],
            action: "Sitting",
            expression: "neutral",
            facingYaw: yawBetween(positionForPlayer(player, landedScore), positionForPlayer(opponent, landedScore)),
          });
          goToNextTurn(player, scoreState);
        }, 1200 + opponentReturnDuration + 250);
        return;
      }

      goToNextTurn(player, scores);
    },
    [activePlayer, audio, goToNextTurn, phase, players, schedule, scores, setPhase, setScores, setWinner, updatePlayer],
  );

  const questionActions = useMemo(
    () => currentQuestion?.answers.map((answer) => {
      const isPicked = selectedAnswer === answer.label;
      const shouldReveal = phase === "feedback";

      return {
        label: answer.label,
        disabled: phase !== "question",
        status: (shouldReveal || devRevealCorrect) && answer.isCorrect ? "correct" as const : shouldReveal && isPicked ? "incorrect" as const : "neutral" as const,
        onClick: () => answerQuestion(answer),
      };
    }) ?? [],
    [answerQuestion, currentQuestion, devRevealCorrect, phase, selectedAnswer],
  );
  const notificationPosition = activePlayer === "jogadorDois" ? "bottom-right" : "bottom-left";
  const hasRunningGame = phase !== "idle" && phase !== "finished" && phase !== "draw";
  const showDevTools = typeof window !== "undefined" && window.location.hostname === "localhost";

  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      onPointerDownCapture={() => {
        void audio.startMusic(currentMusicTrack);
      }}
    >
      <GameScene
        jogadorUm={players.jogadorUm}
        jogadorDois={players.jogadorDois}
        activePlayer={phase === "idle" || phase === "finished" || phase === "draw" ? null : activePlayer}
        onJogadorUmArrive={() => handleArrival("jogadorUm")}
        onJogadorDoisArrive={() => handleArrival("jogadorDois")}
      />
      {phase !== "idle" && phase !== "finished" && phase !== "draw" ? (
        <ScoreHud scores={scores} remainingQuestions={remainingQuestions.length} />
      ) : null}
      <DiceHud value={lastRoll} visible={phase === "feedback" || phase === "moving"} />
      {hasRunningGame ? (
        <Button
          className="fixed bottom-4 right-[5.25rem] z-10 flex h-14 w-14 shadow-xl"
          size="icon"
          variant="secondary"
          title="Parar partida"
          onClick={stopGame}
        >
          <CircleStop className="h-7 w-7" aria-hidden="true" />
        </Button>
      ) : null}
      {showDevTools ? (
        <DevToolsPanel
          open={devToolsOpen}
          revealCorrect={devRevealCorrect}
          useFixedDice={devUseFixedDice}
          diceValue={devDiceValue}
          onOpenChange={setDevToolsOpen}
          onRevealCorrectChange={setDevRevealCorrect}
          onUseFixedDiceChange={setDevUseFixedDice}
          onDiceValueChange={setDevDiceValue}
        />
      ) : null}
      <AudioControls
        settings={audio.settings}
        setSettings={audio.setSettings}
        onEnableAudio={() => {
          void audio.startMusic(currentMusicTrack);
        }}
      />
      {audio.musicBlocked && audio.settings.musicEnabled && !audio.settings.muted ? (
        <Button
          className="fixed bottom-4 left-4 z-20 gap-2 rounded-full shadow-xl"
          variant="secondary"
          onClick={() => {
            void audio.startMusic(currentMusicTrack);
          }}
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Ativar música
        </Button>
      ) : null}
      {phase === "idle" ? (
        <GameCard
          title="Fim de jogo!"
          subtitle="Deseja iniciar uma nova rodada?"
          actions={[{ label: "Iniciar", ariaLabel: "Iniciar jogo", prominentIcon: "play", onClick: startGame }]}
          showRobotIcon
        />
      ) : null}
      {(phase === "question" || phase === "feedback") && currentQuestion && activePlayer ? (
        <GameCard
          position={activePlayer === "jogadorUm" ? "left" : "right"}
          title={labels[activePlayer]}
          subtitle={currentQuestion.question.pergunta}
          actions={questionActions}
          player={activePlayer}
        />
      ) : null}
      {phase === "draw" ? <GameCard title="🤝 Empate!" showRobotIcon /> : null}
      {phase === "finished" && winner ? (
        <EndGameCard winnerName={plainLabels[winner]} scores={scores} onRestart={startGame} />
      ) : null}
      <Toaster richColors position={notificationPosition} />
    </main>
  );
}

export default App;
