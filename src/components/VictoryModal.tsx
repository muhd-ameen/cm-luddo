import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ConfettiCanvas } from "./ConfettiCanvas";
import { soundEngine } from "../game/utils/sound";
import { buildFallbackAvatar } from "../game/utils/avatar";
import { useGameStore } from "../store/gameStore";

export const VictoryModal = () => {
  const winner = useGameStore((s) => s.winner);
  const userColor = useGameStore((s) => s.userColor);
  const playAgain = useGameStore((s) => s.playAgain);

  useEffect(() => {
    if (winner) {
      soundEngine.playWin();
    }
  }, [winner]);

  return (
    <>
      <ConfettiCanvas active={Boolean(winner)} />
      <AnimatePresence>
        {winner && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-md border border-white/25 bg-white/5 p-6 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300">Next CM is</p>
              <img
                src={winner.image}
                alt={winner.name}
                className="mx-auto mt-3 h-24 w-24 object-cover ring-2 ring-white/70"
                onError={(event) => {
                  event.currentTarget.src = buildFallbackAvatar(
                    winner.name,
                    winner.color === "red" ? "#ef4a57" : "#3c8dff"
                  );
                }}
              />
              <h2 className="mt-3 font-display text-3xl text-white">{winner.name}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {winner.color === userColor ? "You win the race!" : "Bot wins the race!"}
              </p>

              <button
                type="button"
                onClick={playAgain}
                className="mt-5 bg-white px-6 py-2 font-display text-lg font-bold text-slate-900"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
