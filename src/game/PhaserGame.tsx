import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { PoliticalLudoScene } from "./scenes/PoliticalLudoScene";

export const PhaserGame = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

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

  return <div ref={hostRef} className="h-full w-full" />;
};
