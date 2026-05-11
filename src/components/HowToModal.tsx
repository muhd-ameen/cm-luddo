import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export const HowToModal = () => {
  const show = useGameStore((s) => s.showHowTo);
  const close = useGameStore((s) => s.closeHowTo);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-xl border border-white/20 bg-slate-900/85 p-6 text-slate-100 shadow-glass"
          >
            <h2 className="font-display text-2xl">How Find Next Kerala CM Works</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200">
              <li>Pick your candidate. The bot plays the other.</li>
              <li>Roll 6 to enter the track from base.</li>
              <li>Landing on the opponent sends them back to base.</li>
              <li>Roll 6 to earn an extra turn.</li>
              <li>First to reach the center wins the election.</li>
              <li>Turn timer auto-rolls if you stall.</li>
            </ul>
            <button
              type="button"
              onClick={close}
              className="mt-5 bg-white px-5 py-2 font-semibold text-slate-900"
            >
              Let&apos;s Play
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
