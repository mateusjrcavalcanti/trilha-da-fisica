import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import type { RefObject, MutableRefObject } from "react";
import { RotateCcw } from "lucide-react";
import { OrthographicCamera as ThreeOrthographicCamera, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Button } from "@/components/ui/button";
import robotModel from "@/assets/models/RobotExpressive.glb";
import { Board } from "./Board";
import { LabEnvironment } from "./LabEnvironment";
import { RobotPiece } from "./RobotPiece";
import type { PlayerId, PlayerViewState } from "./types";
import type { Vector3Tuple } from "./board";

function facingVectorFromYaw(yaw: number) {
  return new Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
}

function isMovementAction(action: PlayerViewState["action"]) {
  return action === "Walking" || action === "Running" || action === "WalkJump";
}

function isReactionAction(action: PlayerViewState["action"]) {
  return action === "Jump" || action === "No" || action === "ThumbsUp" || action === "Wave" || action === "Yes";
}

function shouldUseCinematicCamera(activePlayer: PlayerId | null, jogadorUm: PlayerViewState, jogadorDois: PlayerViewState) {
  const activeState = activePlayer === "jogadorUm" ? jogadorUm : activePlayer === "jogadorDois" ? jogadorDois : null;

  return Boolean(
    activeState && (isMovementAction(activeState.action) || isReactionAction(activeState.action)) ||
      jogadorUm.action === "Punch" ||
      jogadorDois.action === "Punch" ||
      jogadorUm.expression === "Angry" ||
      jogadorDois.expression === "Angry" ||
      jogadorUm.action === "Dance" ||
      jogadorDois.action === "Dance",
  );
}

type GameSceneProps = {
  jogadorUm: PlayerViewState;
  jogadorDois: PlayerViewState;
  activePlayer: PlayerId | null;
  onJogadorUmArrive: () => void;
  onJogadorDoisArrive: () => void;
};

function CameraRig({
  activePlayer,
  jogadorUm,
  jogadorDois,
  controlsRef,
  playerPositionsRef,
  enabled,
}: {
  activePlayer: PlayerId | null;
  jogadorUm: PlayerViewState;
  jogadorDois: PlayerViewState;
  controlsRef: RefObject<OrbitControlsImpl>;
  playerPositionsRef: MutableRefObject<Record<PlayerId, Vector3>>;
  enabled: boolean;
}) {
  const { camera } = useThree();
  const overview = useMemo(() => new Vector3(34, 86, 42), []);
  const turnOffsetOne = useMemo(() => new Vector3(-23, 58, 25), []);
  const turnOffsetTwo = useMemo(() => new Vector3(23, 58, 25), []);
  const overviewTarget = useMemo(() => new Vector3(6, 0, 7), []);

  useFrame((_, delta) => {
    if (!enabled) return;

    const activeState = activePlayer === "jogadorUm" ? jogadorUm : activePlayer === "jogadorDois" ? jogadorDois : null;
    const playerOneFocus = isMovementAction(jogadorUm.action)
      ? playerPositionsRef.current.jogadorUm.clone()
      : new Vector3(...jogadorUm.targetPosition);
    const playerTwoFocus = isMovementAction(jogadorDois.action)
      ? playerPositionsRef.current.jogadorDois.clone()
      : new Vector3(...jogadorDois.targetPosition);
    const activeFocus = activePlayer === "jogadorUm" ? playerOneFocus : activePlayer === "jogadorDois" ? playerTwoFocus : null;
    const activeSide = activePlayer === "jogadorDois" ? "jogadorDois" : "jogadorUm";
    const isMovementClose = activeState ? isMovementAction(activeState.action) : false;
    const isReactionClose = activeState ? isReactionAction(activeState.action) : false;
    const isClashClose =
      jogadorUm.action === "Punch" ||
      jogadorDois.action === "Punch" ||
      jogadorUm.expression === "Angry" ||
      jogadorDois.expression === "Angry";
    const isVictoryClose = jogadorUm.action === "Dance" || jogadorDois.action === "Dance";
    const clashFocus = playerOneFocus.clone().add(playerTwoFocus).multiplyScalar(0.5);
    const playerOneToTwo = playerTwoFocus.clone().sub(playerOneFocus);
    const clashSide = new Vector3(-playerOneToTwo.z, 0, playerOneToTwo.x).normalize();
    const activeFacing = activeState ? facingVectorFromYaw(activeState.facingYaw ?? 0) : new Vector3(0, 0, 1);
    const frontCloseOffset = activeFacing.clone().multiplyScalar(11).add(new Vector3(0, 12.5, 0));
    const clashOffset = (clashSide.lengthSq() > 0.01 ? clashSide : new Vector3(0, 0, 1)).multiplyScalar(15).add(new Vector3(0, 14.5, 0));

    let targetLookAt = activeFocus ?? overviewTarget;
    let targetPosition = activeFocus
      ? activeFocus.clone().add(activeSide === "jogadorDois" ? turnOffsetTwo : turnOffsetOne)
      : overview;
    let targetZoom = activeFocus ? 14.5 : 10.5;
    let smoothingRate = 2.4;

    if (isMovementClose && activeFocus) {
      const movementOffset = activeSide === "jogadorDois" ? new Vector3(17, 42, 18) : new Vector3(-17, 42, 18);
      targetLookAt = activeFocus.clone().add(new Vector3(0, 1.2, 0));
      targetPosition = activeFocus.clone().add(movementOffset);
      targetZoom = 16.5;
      smoothingRate = 3.2;
    }

    if (isReactionClose && activeFocus) {
      targetLookAt = activeFocus.clone().add(new Vector3(0, 1.7, 0));
      targetPosition = activeFocus.clone().add(frontCloseOffset);
      targetZoom = 22;
      smoothingRate = 4.2;
    }

    if (isClashClose) {
      targetLookAt = clashFocus.clone().add(new Vector3(0, 1.2, 0));
      targetPosition = clashFocus.clone().add(clashOffset);
      targetZoom = 19;
      smoothingRate = 4.6;
    }

    if (isVictoryClose) {
      const winnerFocus = jogadorUm.action === "Dance" ? playerOneFocus : playerTwoFocus;
      const winnerState = jogadorUm.action === "Dance" ? jogadorUm : jogadorDois;
      const winnerFacing = facingVectorFromYaw(winnerState.facingYaw ?? 0);
      targetLookAt = winnerFocus.clone().add(new Vector3(0, 1.6, 0));
      targetPosition = winnerFocus.clone().add(winnerFacing.multiplyScalar(12)).add(new Vector3(0, 13, 0));
      targetZoom = 21;
      smoothingRate = 3.8;
    }

    const smoothing = 1 - Math.exp(-delta * smoothingRate);

    camera.position.lerp(targetPosition, smoothing);

    if (camera instanceof ThreeOrthographicCamera) {
      camera.zoom += (targetZoom - camera.zoom) * smoothing;
      camera.updateProjectionMatrix();
    }

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt, smoothing);
      controlsRef.current.update();
    } else {
      camera.lookAt(targetLookAt);
    }
  });

  return null;
}

export function GameScene({
  jogadorUm,
  jogadorDois,
  activePlayer,
  onJogadorUmArrive,
  onJogadorDoisArrive,
}: GameSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [manualCamera, setManualCamera] = useState(false);
  const playerPositionsRef = useRef<Record<PlayerId, Vector3>>({
    jogadorUm: new Vector3(...jogadorUm.targetPosition),
    jogadorDois: new Vector3(...jogadorDois.targetPosition),
  });

  const updateTrackedPosition = useCallback((player: PlayerId, position: Vector3Tuple) => {
    playerPositionsRef.current[player].set(...position);
  }, []);
  const cinematicCamera = shouldUseCinematicCamera(activePlayer, jogadorUm, jogadorDois);

  return (
    <div className="canvas-vignette absolute inset-0">
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        <OrthographicCamera makeDefault position={[34, 86, 42]} rotation={[-0.98, 0.36, 0.36]} zoom={10.5} />
        <CameraRig
          activePlayer={activePlayer}
          jogadorUm={jogadorUm}
          jogadorDois={jogadorDois}
          controlsRef={controlsRef}
          playerPositionsRef={playerPositionsRef}
          enabled={!manualCamera || cinematicCamera}
        />
        <ambientLight intensity={1.15} />
        <directionalLight position={[6, 18, -8]} intensity={1.25} />
        <LabEnvironment />
        <RobotPiece
          modelPath={robotModel}
          targetPosition={jogadorUm.targetPosition}
          path={jogadorUm.path}
          accentColor="#0f9f95"
          action={jogadorUm.action}
          expression={jogadorUm.expression}
          facingYaw={jogadorUm.facingYaw}
          resetToken={jogadorUm.resetToken}
          onPositionChange={(position) => updateTrackedPosition("jogadorUm", position)}
          onArrive={onJogadorUmArrive}
        />
        <RobotPiece
          modelPath={robotModel}
          targetPosition={jogadorDois.targetPosition}
          path={jogadorDois.path}
          accentColor="#e4564f"
          action={jogadorDois.action}
          expression={jogadorDois.expression}
          facingYaw={jogadorDois.facingYaw}
          resetToken={jogadorDois.resetToken}
          onPositionChange={(position) => updateTrackedPosition("jogadorDois", position)}
          onArrive={onJogadorDoisArrive}
        />
        <Board />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minZoom={12}
          maxZoom={30}
          minPolarAngle={0.55}
          maxPolarAngle={1.25}
          enableRotate
          enableZoom
          onStart={() => setManualCamera(true)}
        />
      </Canvas>
      {manualCamera ? (
        <Button
          className="fixed right-4 top-4 z-10 h-12 w-12 rounded-full shadow-xl"
          size="icon"
          variant="secondary"
          title="Retomar câmera automática"
          onClick={() => setManualCamera(false)}
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
