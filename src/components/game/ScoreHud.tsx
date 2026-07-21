import { Activity, CircleGauge } from "lucide-react";
import { boardTiles } from "./board";
import type { PlayerId, PlayerProfile } from "./types";

type ScoreHudProps = {
  scores: {
    jogadorUm: number;
    jogadorDois: number;
  };
  remainingQuestions: number;
  playerProfiles: Record<PlayerId, PlayerProfile>;
};

function progress(score: number) {
  return Math.round(((score + 1) / boardTiles.length) * 100);
}

export function ScoreHud({ scores, remainingQuestions, playerProfiles }: ScoreHudProps) {
  return (
    <div className="game-window pointer-events-none fixed left-1/2 top-4 z-10 w-[min(calc(100vw-2rem),22rem)] -translate-x-1/2 p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <CircleGauge className="h-4 w-4 text-primary" aria-hidden="true" />
          Placar
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          {remainingQuestions}
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        <div>
          <div className="flex justify-between">
            <span className="font-medium" style={{ color: playerProfiles.jogadorUm.color }}>
              {playerProfiles.jogadorUm.name}
            </span>
            <span>{scores.jogadorUm + 1}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full" style={{ width: `${progress(scores.jogadorUm)}%`, backgroundColor: playerProfiles.jogadorUm.color }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <span className="font-medium" style={{ color: playerProfiles.jogadorDois.color }}>
              {playerProfiles.jogadorDois.name}
            </span>
            <span>{scores.jogadorDois + 1}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full" style={{ width: `${progress(scores.jogadorDois)}%`, backgroundColor: playerProfiles.jogadorDois.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}
