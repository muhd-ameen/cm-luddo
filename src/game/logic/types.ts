export type PlayerColor = "red" | "blue";

export type Character = {
  id: string;
  name: string;
  image: string;
  accent: string;
};

export type PlayerState = {
  color: PlayerColor;
  progress: number;
  characterId: string;
  isBot: boolean;
  captures: number;
};

export type MatchState = {
  status: "idle" | "playing" | "finished";
  currentTurn: PlayerColor;
  winner: PlayerColor | null;
  lastRoll: number | null;
  players: Record<PlayerColor, PlayerState>;
};

export type RollResult = {
  roll: number;
  player: PlayerColor;
  moved: boolean;
  movedProgresses: number[];
  capture: boolean;
  winner: PlayerColor | null;
  extraTurn: boolean;
  nextTurn: PlayerColor;
};

export type CellCoord = { r: number; c: number };

export type BoardConfig = {
  size: number;
  track: CellCoord[];
  routes: Record<PlayerColor, CellCoord[]>;
  homeLanes: Record<PlayerColor, CellCoord[]>;
  bases: Record<PlayerColor, CellCoord>;
  turnSeconds: number;
};
