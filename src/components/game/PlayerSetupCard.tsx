import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { RotateCcw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import robotModel from "@/assets/models/RobotExpressive.glb";
import { RobotPiece } from "./RobotPiece";
import type { PlayerId, PlayerProfile, RobotAction } from "./types";

type PlayerSetupCardProps = {
  defaultProfiles: Record<PlayerId, PlayerProfile>;
  initialProfiles?: Record<PlayerId, PlayerProfile>;
  onClose?: () => void;
  onSave: (profiles: Record<PlayerId, PlayerProfile>) => void;
};

function normalizeProfile(profile: PlayerProfile, fallback: PlayerProfile) {
  return {
    name: profile.name.trim() || fallback.name,
    color: profile.color || fallback.color,
  };
}

const previewActions: RobotAction[] = ["Dance", "Wave", "ThumbsUp", "Jump"];

function randomPreviewAction(currentAction: RobotAction) {
  const availableActions = previewActions.filter((action) => action !== currentAction);
  return availableActions[Math.floor(Math.random() * availableActions.length)] ?? "Dance";
}

function PlayerPreview({
  player,
  profile,
  onChange,
}: {
  player: PlayerId;
  profile: PlayerProfile;
  onChange: (patch: Partial<PlayerProfile>) => void;
}) {
  const label = player === "jogadorUm" ? "Primeiro Jogador" : "Segundo Jogador";
  const initialAction = useMemo(() => randomPreviewAction("Idle"), []);
  const [action, setAction] = useState<RobotAction>(initialAction);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAction((currentAction) => randomPreviewAction(currentAction));
    }, 4200 + Math.random() * 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="grid min-h-[24rem] grid-rows-[auto_1fr] overflow-hidden rounded-lg border bg-card/70 shadow-sm">
      <div className="z-10 grid grid-cols-[minmax(0,1fr)_3rem] gap-2 p-3">
        <label className="min-w-0 text-xs font-medium text-muted-foreground">
          {label}
          <input
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={28}
            value={profile.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Cor
          <input
            className="mt-1 h-10 w-12 cursor-pointer rounded-md border border-input bg-background p-1"
            type="color"
            value={profile.color}
            onChange={(event) => onChange({ color: event.target.value })}
          />
        </label>
      </div>
      <div className="relative min-h-0">
        <Canvas style={{ height: "100%", width: "100%" }}>
          <OrthographicCamera makeDefault position={[0, 0.75, 8]} zoom={44} />
          <ambientLight intensity={1.15} />
          <directionalLight position={[3, 5, 5]} intensity={1.45} />
          <RobotPiece
            modelPath={robotModel}
            targetPosition={[0, -1.2, 0]}
            path={[]}
            accentColor={profile.color}
            action={action}
            expression="neutral"
            facingYaw={0.15}
            resetToken={0}
          />
          <mesh position={[0, -1.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.35, 48]} />
            <meshStandardMaterial color={profile.color} roughness={0.42} />
          </mesh>
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
}

export function PlayerSetupCard({
  defaultProfiles,
  initialProfiles = defaultProfiles,
  onClose,
  onSave,
}: PlayerSetupCardProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const cardRef = useRef<HTMLDivElement>(null);

  const updateProfile = (player: PlayerId, patch: Partial<PlayerProfile>) => {
    setProfiles((current) => ({
      ...current,
      [player]: {
        ...current[player],
        ...patch,
      },
    }));
  };

  const saveProfiles = useCallback(() => {
    onSave({
      jogadorUm: normalizeProfile(profiles.jogadorUm, defaultProfiles.jogadorUm),
      jogadorDois: normalizeProfile(profiles.jogadorDois, defaultProfiles.jogadorDois),
    });
  }, [defaultProfiles, onSave, profiles]);

  const resetProfiles = () => {
    setProfiles(defaultProfiles);
  };

  const closeSetup = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    onSave(defaultProfiles);
  }, [defaultProfiles, onClose, onSave]);

  useEffect(() => {
    if (!onClose) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || cardRef.current?.contains(target)) return;
      closeSetup();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [closeSetup, onClose]);

  return (
    <Card
      ref={cardRef}
      className="game-window fixed left-1/2 top-1/2 z-30 max-h-[calc(100vh-1rem)] w-[min(calc(100vw-1rem),52rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-card/95"
    >
      <CardHeader className="relative pr-36 text-center">
        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            className="h-12 w-12 rounded-full shadow-sm"
            size="icon"
            variant="ghost"
            title="Restaurar valores padrão"
            aria-label="Restaurar valores padrão"
            onClick={resetProfiles}
          >
            <RotateCcw className="h-6 w-6" aria-hidden="true" />
          </Button>
          <Button
            className="h-12 w-12 rounded-full shadow-sm"
            size="icon"
            variant="ghost"
            title="Salvar jogadores"
            aria-label="Salvar jogadores"
            onClick={saveProfiles}
          >
            <Save className="h-6 w-6" aria-hidden="true" />
          </Button>
          <Button
            className="h-12 w-12 rounded-full shadow-sm"
            size="icon"
            variant="ghost"
            title="Fechar configuração de jogadores"
            aria-label="Fechar configuração de jogadores"
            onClick={closeSetup}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        <CardTitle>Configurar jogadores</CardTitle>
        <CardDescription className="text-base text-foreground/78">
          Escolha nomes e cores para diferenciar a partida.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          {(["jogadorUm", "jogadorDois"] as const).map((player) => (
            <PlayerPreview
              key={player}
              player={player}
              profile={profiles[player]}
              onChange={(patch) => updateProfile(player, patch)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
