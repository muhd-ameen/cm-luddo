import { AnimatePresence, motion } from "framer-motion";
import { characters } from "../game/logic/pathFactory";
import type { PlayerColor } from "../game/logic/types";
import { useGameStore } from "../store/gameStore";

const findCharacter = (id: string) => characters.find((c) => c.id === id) ?? characters[0];
const shortName = (n: string) => n.split(" ")[0] ?? n;

// Pip slots map to a 3x3 grid:
// 1 2 3
// 4 5 6
// 7 8 9
const PIP_LAYOUT: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
};

const DiceFace = ({ value }: { value: number }) => {
  const clamped = Math.min(6, Math.max(1, value));
  const slots = new Set(PIP_LAYOUT[clamped]);

  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-3 place-items-center p-2.5">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((slot) => (
        <span
          key={slot}
          aria-hidden
          className={
            slots.has(slot)
              ? "h-2.5 w-2.5 rounded-full bg-slate-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(0,0,0,0.5)]"
              : "h-2.5 w-2.5"
          }
        />
      ))}
    </div>
  );
};

export const DiceDock = () => {
  const selections = useGameStore((s) => s.selections);
  const userColor = useGameStore((s) => s.userColor);
  const ui = useGameStore((s) => s.uiState);
  const requestRoll = useGameStore((s) => s.requestRoll);

  const botColor: PlayerColor = userColor === "red" ? "blue" : "red";
  const botCharacter = findCharacter(selections[botColor]);
  const botName = shortName(botCharacter.name);

  const eyebrow = ui?.canRoll
    ? "Tap dice to roll"
    : ui?.botThinking
      ? `${botName} thinking…`
      : "Hold on…";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-black/95 backdrop-blur lg:static lg:inset-auto lg:border lg:border-white/20 lg:bg-white/5 lg:backdrop-blur-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3 md:py-4 lg:max-w-none lg:px-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92, rotate: -8 }}
          whileHover={{ y: -2 }}
          disabled={!ui?.canRoll}
          onClick={() => requestRoll(false)}
          aria-label={`Roll dice. Current value ${ui?.diceValue ?? 1}.`}
          className="relative h-20 w-20 shrink-0 overflow-hidden border border-slate-300/60 bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50 md:h-24 md:w-24"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={ui?.diceValue ?? 1}
              initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="absolute inset-0"
            >
              <DiceFace value={ui?.diceValue ?? 1} />
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{eyebrow}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-100">
            {ui?.statusText ?? "Waiting for match..."}
          </p>
        </div>
      </div>
    </div>
  );
};
