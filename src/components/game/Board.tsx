import { Text } from "@react-three/drei";
import { boardTiles, positionForPlayer, type BoardTile, type PlayerLane } from "./board";
import type { PlayerId } from "./types";

type BoardProps = {
  playerColors: Record<PlayerId, string>;
};

function tileColor(tile: BoardTile) {
  if (tile.kind === "danger") return "#d8443a";
  if (tile.kind === "finish") return "#f6c85f";
  return "#2b3032";
}

function laneColor(player: PlayerLane, playerColors: Record<PlayerId, string>) {
  return playerColors[player];
}

function LaneStrip({ tile, player, playerColors }: { tile: BoardTile; player: PlayerLane; playerColors: Record<PlayerId, string> }) {
  const [x, y, z] = positionForPlayer(player, tile.index);
  const isVertical = tile.direction === "frente" || tile.direction === "tras";

  return (
    <mesh position={[x, y - 0.03, z]}>
      <boxGeometry args={isVertical ? [0.34, 0.035, 3.22] : [3.22, 0.035, 0.34]} />
      <meshStandardMaterial color={laneColor(player, playerColors)} roughness={0.48} />
    </mesh>
  );
}

function StopMarker({ tile, player, playerColors }: { tile: BoardTile; player: PlayerLane; playerColors: Record<PlayerId, string> }) {
  const [x, y, z] = positionForPlayer(player, tile.index);

  return (
    <mesh position={[x, y + 0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.54, 0.54, 0.04, 32]} />
      <meshStandardMaterial color={laneColor(player, playerColors)} roughness={0.42} />
    </mesh>
  );
}

function TileLabel({ tile }: { tile: BoardTile }) {
  const label = tile.kind === "danger" ? "!" : tile.kind === "finish" ? "FIM" : String(tile.index + 1);
  const color = tile.kind === "normal" ? "#f8efe0" : "#2a2420";

  return (
    <Text
      position={[tile.position[0], 0.06, tile.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={tile.kind === "finish" ? 0.42 : 0.52}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  );
}

export function Board({ playerColors }: BoardProps) {
  return (
    <group>
      {boardTiles.map((tile) => (
        <group key={tile.index}>
          <mesh position={[tile.position[0], tile.position[1] - 0.08, tile.position[2]]}>
            <boxGeometry args={[4.82, 0.22, 4.82]} />
            <meshStandardMaterial color="#d7e6df" roughness={0.78} />
          </mesh>
          <mesh position={tile.position}>
            <boxGeometry args={[4.28, 0.2, 4.28]} />
            <meshStandardMaterial color={tileColor(tile)} roughness={0.58} />
          </mesh>
          <LaneStrip tile={tile} player="jogadorUm" playerColors={playerColors} />
          <LaneStrip tile={tile} player="jogadorDois" playerColors={playerColors} />
          <StopMarker tile={tile} player="jogadorUm" playerColors={playerColors} />
          <StopMarker tile={tile} player="jogadorDois" playerColors={playerColors} />
          <TileLabel tile={tile} />
        </group>
      ))}
    </group>
  );
}
