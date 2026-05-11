import { motion } from "framer-motion";
import { characters } from "../game/logic/pathFactory";
import type { PlayerColor } from "../game/logic/types";
import { buildFallbackAvatar } from "../game/utils/avatar";
import { useGameStore } from "../store/gameStore";

const findCharacter = (id: string) => characters.find((c) => c.id === id) ?? characters[0];
const shortName = (n: string) => n.split(" ")[0] ?? n;

export const PlayerBar = () => {
  const selections = useGameStore((s) => s.selections);
  const userColor = useGameStore((s) => s.userColor);
  const ui = useGameStore((s) => s.uiState);

  const userCharacter = findCharacter(selections[userColor as PlayerColor]);
  const isYourTurn = (ui?.match.currentTurn ?? "red") === userColor;
  const captures = ui?.match.players[userColor].captures ?? 0;

  const toneCls = userColor === "red"
    ? "shadow-glowRed border-campaign-red/55"
    : "shadow-glowBlue border-campaign-blue/55";

  const accentDot = userColor === "red" ? "bg-campaign-red" : "bg-campaign-blue";
  const userFirstName = shortName(userCharacter.name);
  const turnProgress = Math.max(0, (ui?.turnProgress ?? 1) * 100);

  return (
    <motion.div
      animate={{ scale: isYourTurn ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`flex flex-col gap-2 border bg-white/5 p-3 ${isYourTurn ? toneCls : "border-white/20"}`}
    >
      <div className="flex items-center gap-3">
        <img
          src={userCharacter.image}
          alt={userCharacter.name}
          className="h-12 w-12 shrink-0 object-cover"
          onError={(event) => {
            event.currentTarget.src = buildFallbackAvatar(userCharacter.name, userCharacter.accent);
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-1.5 w-1.5 ${accentDot}`} aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">You · {userFirstName}</p>
          </div>
          <h3 className="font-display text-sm leading-tight text-white">{userCharacter.name}</h3>
          <p className="mt-0.5 text-[11px] text-slate-300">Captures: {captures}</p>
        </div>

        {isYourTurn && (
          <span className="border border-emerald-400/55 bg-emerald-400/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
            Your turn
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
          <span>Turn timer</span>
          <span>{Math.ceil(turnProgress)}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-300 to-campaign-gold transition-all"
            style={{ width: `${turnProgress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};
