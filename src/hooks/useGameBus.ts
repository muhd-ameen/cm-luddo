import { useEffect } from "react";
import { GameEvents, gameBus, type SceneUiState } from "../game/utils/gameBus";
import { useGameStore } from "../store/gameStore";
import type { PlayerColor } from "../game/logic/types";

export const useGameBus = () => {
  const applyUiState = useGameStore((s) => s.applyUiState);
  const setWinner = useGameStore((s) => s.setWinner);

  useEffect(() => {
    const onUiState = (event: Event) => {
      const detail = (event as CustomEvent<SceneUiState>).detail;
      applyUiState(detail);
    };

    const onWin = (event: Event) => {
      const detail = (event as CustomEvent<{ winner: PlayerColor }>).detail;
      setWinner(detail.winner);
    };

    gameBus.addEventListener(GameEvents.UiState, onUiState);
    gameBus.addEventListener(GameEvents.Win, onWin);

    return () => {
      gameBus.removeEventListener(GameEvents.UiState, onUiState);
      gameBus.removeEventListener(GameEvents.Win, onWin);
    };
  }, [applyUiState, setWinner]);
};
