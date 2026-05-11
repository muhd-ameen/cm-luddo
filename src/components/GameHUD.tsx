import { AnimatePresence, motion } from "framer-motion";
import { characters } from "../game/logic/pathFactory";
import { buildFallbackAvatar } from "../game/utils/avatar";
import { useGameStore } from "../store/gameStore";

const profileFor = (id: string) => characters.find((c) => c.id === id) ?? characters[0];

const shortName = (fullName: string) => fullName.split(" ")[0] ?? fullName;

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

export const GameHUD = () => {
  const selections = useGameStore((s) => s.selections);
  const userColor = useGameStore((s) => s.userColor);
  const ui = useGameStore((s) => s.uiState);
  const requestRoll = useGameStore((s) => s.requestRoll);

  const red = profileFor(selections.red);
  const blue = profileFor(selections.blue);

  const turn = ui?.match.currentTurn ?? "red";
  const turnTone = turn === "red"
    ? "border-campaign-red/70 bg-campaign-red/20"
    : "border-campaign-blue/70 bg-campaign-blue/20";
  const activeName = turn === "red" ? shortName(red.name) : shortName(blue.name);

  const redActive = turn === "red";
  const blueActive = turn === "blue";

  const redIsUser = userColor === "red";
  const blueIsUser = userColor === "blue";

  const botName = redIsUser ? shortName(blue.name) : shortName(red.name);

  return (
    <>
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 border border-white/20 bg-white/5 p-3 md:p-4">
          <div className={`border px-3 py-1.5 font-display text-xs font-bold md:text-sm ${turnTone}`}>
            {activeName.toUpperCase()}&apos;S TURN
          </div>

          <div className="min-w-[140px] grow">
            <p className="text-[10px] uppercase tracking-wider text-slate-300">Turn Timer</p>
            <div className="mt-1 h-2 overflow-hidden bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 to-campaign-gold transition-all"
                style={{ width: `${Math.max(0, (ui?.turnProgress ?? 1) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid items-start gap-2.5 md:grid-cols-2 md:gap-3">
          <ProfileCard
            name={red.name}
            image={red.image}
            sideLabel={redIsUser ? "You" : "Bot"}
            active={redActive}
            tone="red"
            captures={ui?.match.players.red.captures ?? 0}
          />
          <ProfileCard
            name={blue.name}
            image={blue.image}
            sideLabel={blueIsUser ? "You" : "Bot"}
            active={blueActive}
            tone="blue"
            captures={ui?.match.players.blue.captures ?? 0}
          />
        </div>
      </div>

      {/* Dice dock: fixed at the viewport bottom on mobile, inline inside the HUD column on desktop. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-black/95 backdrop-blur lg:static lg:border lg:border-white/20 lg:bg-white/5 lg:backdrop-blur-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:py-4 lg:max-w-none lg:gap-4 lg:px-4">
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {ui?.canRoll ? "Tap dice to roll" : ui?.botThinking ? `${botName} thinking…` : "Hold on…"}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-100">
              {ui?.statusText ?? "Waiting for match..."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const ProfileCard = ({
  name,
  image,
  sideLabel,
  active,
  tone,
  captures
}: {
  name: string;
  image: string;
  sideLabel: string;
  active: boolean;
  tone: "red" | "blue";
  captures: number;
}) => {
  const toneCls = tone === "red" ? "shadow-glowRed border-campaign-red/45" : "shadow-glowBlue border-campaign-blue/45";

  return (
    <motion.article
      animate={{ y: active ? -2 : 0 }}
      className={`border bg-white/5 p-2.5 md:p-3 ${active ? toneCls : "border-white/20"}`}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={image}
          alt={name}
          className="h-10 w-10 shrink-0 object-cover md:h-11 md:w-11"
          onError={(event) => {
            event.currentTarget.src = buildFallbackAvatar(name, tone === "red" ? "#ef4a57" : "#3c8dff");
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{sideLabel}</p>
          <h3 className="font-display text-sm leading-tight text-white">{name}</h3>
          <p className="mt-0.5 text-[11px] text-slate-300">Captures: {captures}</p>
        </div>
      </div>
    </motion.article>
  );
};
