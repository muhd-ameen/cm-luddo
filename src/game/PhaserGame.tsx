import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { PoliticalLudoScene } from "./scenes/PoliticalLudoScene";
import { GameEvents, gameBus } from "./utils/gameBus";

export const PhaserGame = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onReady = () => setIsReady(true);
    gameBus.addEventListener(GameEvents.Ready, onReady);
    return () => gameBus.removeEventListener(GameEvents.Ready, onReady);
  }, []);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;

    const scene = new PoliticalLudoScene();

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 720,
      height: 720,
      transparent: true,
      backgroundColor: "#000000",
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="h-full w-full" />
      {!isReady && (
        <div
          role="status"
          aria-label="Loading board"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span className="font-display text-sm tracking-wide text-white/70">
            Loading board…
          </span>
        </div>
      )}
    </div>
  );
};
