import type { Vector3Tuple } from "./board";

export type PlayerId = "jogadorUm" | "jogadorDois";

export type RobotAction =
  | "Dance"
  | "Death"
  | "Idle"
  | "Jump"
  | "No"
  | "Punch"
  | "Running"
  | "Sitting"
  | "Standing"
  | "ThumbsUp"
  | "Walking"
  | "WalkJump"
  | "Wave"
  | "Yes";

export type RobotExpression = "neutral" | "Angry" | "Surprised" | "Sad";

export type PlayerViewState = {
  targetPosition: Vector3Tuple;
  path: Vector3Tuple[];
  action: RobotAction;
  expression: RobotExpression;
  facingYaw: number;
  resetToken: number;
};

export type Phase = "idle" | "question" | "feedback" | "moving" | "resolving" | "finished" | "draw";

export type Question = {
  pergunta: string;
  erradas: string[];
  correta: string;
};

export type CurrentQuestion = {
  question: Question;
  answers: Array<{
    label: string;
    isCorrect: boolean;
  }>;
};
