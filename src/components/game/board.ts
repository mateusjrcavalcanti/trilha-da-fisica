export type Vector3Tuple = [number, number, number];

export type TileKind = "normal" | "danger" | "finish";
export type Direction = "frente" | "tras" | "direita" | "esquerda";
export type PlayerLane = "jogadorUm" | "jogadorDois";

export type BoardTile = {
  index: number;
  position: Vector3Tuple;
  kind: TileKind;
  direction: Direction;
};

const STEP = 4.6;
const START: Vector3Tuple = [-5, -0.2, -25];
const ROBOT_Y = -0.1;
const LANE_OFFSET = 1.28;

function nextPosition(position: Vector3Tuple, direction: Direction): Vector3Tuple {
  if (direction === "frente") return [position[0], -0.2, position[2] + STEP];
  if (direction === "tras") return [position[0], -0.2, position[2] - STEP];
  if (direction === "direita") return [position[0] - STEP, -0.2, position[2]];
  return [position[0] + STEP, -0.2, position[2]];
}

function appendTiles(
  tiles: BoardTile[],
  cursor: Vector3Tuple,
  quantity: number,
  direction: Direction,
  kind: TileKind,
) {
  let current = cursor;
  for (let i = 0; i < quantity; i += 1) {
    current = nextPosition(current, direction);
    tiles.push({ index: tiles.length, position: current, kind, direction });
  }
  return current;
}

export function createBoardTiles() {
  const tiles: BoardTile[] = [];
  let cursor = START;

  cursor = appendTiles(tiles, cursor, 8, "frente", "normal");
  cursor = appendTiles(tiles, cursor, 1, "frente", "danger");
  cursor = appendTiles(tiles, cursor, 4, "frente", "normal");
  cursor = appendTiles(tiles, cursor, 1, "frente", "danger");
  cursor = appendTiles(tiles, cursor, 5, "esquerda", "normal");
  cursor = appendTiles(tiles, cursor, 5, "tras", "normal");
  cursor = appendTiles(tiles, cursor, 1, "tras", "danger");
  cursor = appendTiles(tiles, cursor, 6, "tras", "normal");
  appendTiles(tiles, cursor, 1, "tras", "finish");

  return tiles;
}

export const boardTiles = createBoardTiles();

function tileForScore(score: number) {
  const clampedScore = Math.min(score, boardTiles.length - 1);
  const tile = boardTiles[clampedScore];
  if (!tile) {
    throw new Error(`Invalid board score: ${score}`);
  }

  return tile;
}

function centerForScore(score: number): Vector3Tuple {
  return score < 0 ? START : tileForScore(score).position;
}

function laneOffset(direction: Direction, player: PlayerLane): [number, number] {
  const side = player === "jogadorUm" ? -LANE_OFFSET : LANE_OFFSET;

  if (direction === "frente" || direction === "tras") {
    return [side, 0];
  }

  return [0, side];
}

export function positionForPlayer(player: PlayerLane, score: number): Vector3Tuple {
  const reference =
    score < 0
      ? { position: START, direction: "frente" as Direction }
      : tileForScore(score);

  const [offsetX, offsetZ] = laneOffset(reference.direction, player);

  return [
    reference.position[0] + offsetX,
    ROBOT_Y,
    reference.position[2] + offsetZ,
  ];
}

function samePosition(a: Vector3Tuple, b: Vector3Tuple) {
  return Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[2] - b[2]) < 0.01;
}

function pushWaypoint(path: Vector3Tuple[], waypoint: Vector3Tuple) {
  const previous = path[path.length - 1];
  if (!previous || !samePosition(previous, waypoint)) {
    path.push(waypoint);
  }
}

function appendSegmentRoute(
  path: Vector3Tuple[],
  fromPosition: Vector3Tuple,
  toPosition: Vector3Tuple,
  fromScore: number,
  toScore: number,
  isForward: boolean,
) {
  const dx = toPosition[0] - fromPosition[0];
  const dz = toPosition[2] - fromPosition[2];
  const needsTurn = Math.abs(dx) > 0.01 && Math.abs(dz) > 0.01;

  if (!needsTurn) {
    pushWaypoint(path, toPosition);
    return;
  }

  const fromCenter = centerForScore(fromScore);
  const toCenter = centerForScore(toScore);
  const centerMovesOnX = Math.abs(toCenter[0] - fromCenter[0]) > Math.abs(toCenter[2] - fromCenter[2]);
  const firstAxis = isForward ? (centerMovesOnX ? "x" : "z") : centerMovesOnX ? "z" : "x";
  const corner: Vector3Tuple =
    firstAxis === "x"
      ? [toPosition[0], ROBOT_Y, fromPosition[2]]
      : [fromPosition[0], ROBOT_Y, toPosition[2]];

  pushWaypoint(path, corner);
  pushWaypoint(path, toPosition);
}

export function routeForPlayer(player: PlayerLane, fromScore: number, toScore: number) {
  const path: Vector3Tuple[] = [];
  if (fromScore === toScore) return path;

  const step = toScore > fromScore ? 1 : -1;
  const isForward = step > 0;
  let currentScore = fromScore;
  let currentPosition = positionForPlayer(player, fromScore);

  while (currentScore !== toScore) {
    const nextScore = currentScore + step;
    const nextPosition = positionForPlayer(player, nextScore);

    appendSegmentRoute(path, currentPosition, nextPosition, currentScore, nextScore, isForward);
    currentScore = nextScore;
    currentPosition = nextPosition;
  }

  return path;
}

export const startPositions = {
  jogadorUm: positionForPlayer("jogadorUm", -1),
  jogadorDois: positionForPlayer("jogadorDois", -1),
};
