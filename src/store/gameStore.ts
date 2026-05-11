import { create } from "zustand";
import { characters } from "../game/logic/pathFactory";
import type { MatchState, PlayerColor } from "../game/logic/types";
import {
  emitRestartMatch,
  emitRollRequest,
  emitStartMatch,
  type SceneUiState
} from "../game/utils/gameBus";

type Phase = "setup" | "playing" | "finished";

type WinnerState = {
  color: PlayerColor;
  name: string;
  image: string;
};

type Store = {
  phase: Phase;
  userColor: PlayerColor;
  selections: Record<PlayerColor, string>;
  uiState: SceneUiState | null;
  winner: WinnerState | null;
  showHowTo: boolean;
  setUserColor: (color: PlayerColor) => void;
  openHowTo: () => void;
  closeHowTo: () => void;
  startMatch: () => void;
  restartMatch: () => void;
  requestRoll: (auto?: boolean) => void;
  applyUiState: (uiState: SceneUiState) => void;
  setWinner: (color: PlayerColor) => void;
  playAgain: () => void;
};

const RED_CANDIDATE_ID = "satheeshan";
const BLUE_CANDIDATE_ID = "venugopal";

const findCharacter = (id: string) => characters.find((c) => c.id === id) ?? characters[0];

export const useGameStore = create<Store>((set, get) => ({
  phase: "setup",
  userColor: "red",
  selections: {
    red: RED_CANDIDATE_ID,
    blue: BLUE_CANDIDATE_ID
  },
  uiState: null,
  winner: null,
  showHowTo: true,

  setUserColor: (color) => set({ userColor: color }),

  openHowTo: () => set({ showHowTo: true }),

  closeHowTo: () => set({ showHowTo: false }),

  startMatch: () => {
    const { selections, userColor } = get();
    emitStartMatch({
      redCharacterId: selections.red,
      blueCharacterId: selections.blue,
      redIsBot: userColor !== "red",
      blueIsBot: userColor !== "blue"
    });

    set({
      phase: "playing",
      winner: null,
      uiState: null,
      showHowTo: false
    });
  },

  restartMatch: () => {
    emitRestartMatch();
    set({ phase: "playing", winner: null });
  },

  requestRoll: (auto = false) => emitRollRequest(auto),

  applyUiState: (uiState) => set({ uiState, phase: uiState.match.status === "finished" ? "finished" : "playing" }),

  setWinner: (color) => {
    const selectedId = get().selections[color];
    const character = findCharacter(selectedId);

    set({
      winner: {
        color,
        name: character.name,
        image: character.image
      },
      phase: "finished"
    });
  },

  playAgain: () => {
    emitRestartMatch();
    set({
      phase: "playing",
      winner: null
    });
  }
}));

export const selectMatch = (state: Store): MatchState | null => state.uiState?.match ?? null;
