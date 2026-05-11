import type { MatchState, PlayerColor } from "../logic/types";

export type StartMatchPayload = {
  redCharacterId: string;
  blueCharacterId: string;
  redIsBot: boolean;
  blueIsBot: boolean;
};

export type SceneUiState = {
  match: MatchState;
  diceValue: number;
  canRoll: boolean;
  botThinking: boolean;
  statusText: string;
  turnProgress: number;
};

export type WinPayload = {
  winner: PlayerColor;
};

export const gameBus = new EventTarget();

export const GameEvents = {
  StartMatch: "game:start-match",
  RestartMatch: "game:restart-match",
  RollRequest: "game:roll-request",
  UiState: "scene:ui-state",
  Win: "scene:win",
  Ready: "scene:ready"
} as const;

export const emitSceneReady = () => {
  gameBus.dispatchEvent(new Event(GameEvents.Ready));
};

export const emitStartMatch = (payload: StartMatchPayload) => {
  gameBus.dispatchEvent(new CustomEvent(GameEvents.StartMatch, { detail: payload }));
};

export const emitRestartMatch = () => {
  gameBus.dispatchEvent(new Event(GameEvents.RestartMatch));
};

export const emitRollRequest = (auto = false) => {
  gameBus.dispatchEvent(new CustomEvent(GameEvents.RollRequest, { detail: { auto } }));
};

export const emitUiState = (payload: SceneUiState) => {
  gameBus.dispatchEvent(new CustomEvent(GameEvents.UiState, { detail: payload }));
};

export const emitWin = (payload: WinPayload) => {
  gameBus.dispatchEvent(new CustomEvent(GameEvents.Win, { detail: payload }));
};
