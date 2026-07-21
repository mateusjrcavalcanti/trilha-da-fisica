import type { MusicTrack } from "@/lib/useGameAudio";
import { startPositions } from "@/components/game/board";
import type { Phase, PlayerId, PlayerProfile, PlayerViewState } from "@/components/game/types";

export const initialPlayerState: Record<PlayerId, PlayerViewState> = {
  jogadorUm: {
    targetPosition: startPositions.jogadorUm,
    path: [],
    action: "Sitting",
    expression: "neutral",
    facingYaw: 0,
    resetToken: 0,
  },
  jogadorDois: {
    targetPosition: startPositions.jogadorDois,
    path: [],
    action: "Sitting",
    expression: "neutral",
    facingYaw: 0,
    resetToken: 0,
  },
};

export const defaultPlayerProfiles: Record<PlayerId, PlayerProfile> = {
  jogadorUm: {
    name: "Primeiro Jogador",
    color: "#0f9f95",
  },
  jogadorDois: {
    name: "Segundo Jogador",
    color: "#e4564f",
  },
};

export const otherPlayer: Record<PlayerId, PlayerId> = {
  jogadorUm: "jogadorDois",
  jogadorDois: "jogadorUm",
};

export function musicTrackForPhase(phase: Phase): MusicTrack {
  return phase === "question" || phase === "feedback" || phase === "moving" || phase === "resolving" ? "game" : "menu";
}

export function yawBetween(from: [number, number, number], to: [number, number, number]) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  if (Math.abs(dx) > 0.08) return dx > 0 ? Math.PI / 2 : -Math.PI / 2;
  if (Math.abs(dz) > 0.08) return dz > 0 ? 0 : Math.PI;
  return 0;
}

export function yawForPath(from: [number, number, number], path: Array<[number, number, number]>) {
  const next = path[0];
  if (!next) return 0;
  return yawBetween(from, next);
}
