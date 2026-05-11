import { motion } from "framer-motion";
import { characters } from "../game/logic/pathFactory";
import type { PlayerColor } from "../game/logic/types";
import { buildFallbackAvatar } from "../game/utils/avatar";
import { useGameStore } from "../store/gameStore";

const findCharacter = (id: string) => characters.find((c) => c.id === id) ?? characters[0];
const shortName = (n: string) => n.split(" ")[0] ?? n;

export const OpponentBar = () => {
  const selections = useGameStore((s) => s.selections);
  const userColor = useGameStore((s) => s.userColor);
  const ui = useGameStore((s) => s.uiState);

  const botColor: PlayerColor = userColor === "red" ? "blue" : "red";
  const botCharacter = findCharacter(selections[botColor]);
  const isBotTurn = (ui?.match.currentTurn ?? "red") === botColor;
  const captures = ui?.match.players[botColor].captures ?? 0;

  const toneCls = botColor === "red"
    ? "shadow-glowRed border-campaign-red/55"
    : "shadow-glowBlue border-campaign-blue/55";

  const accentDot = botColor === "red" ? "bg-campaign-red" : "bg-campaign-blue";
  const botFirstName = shortName(botCharacter.name);

  return (
    <motion.div
      animate={{ scale: isBotTurn ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`flex items-center gap-3 border bg-white/5 p-3 ${isBotTurn ? toneCls : "border-white/20"}`}
    >
      <img
        src={botCharacter.image}
        alt={botCharacter.name}
        className="h-12 w-12 shrink-0 object-cover"
        onError={(event) => {
          event.currentTarget.src = buildFallbackAvatar(botCharacter.name, botCharacter.accent);
        }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 ${accentDot}`} aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Bot · {botFirstName}</p>
        </div>
        <h3 className="font-display text-sm leading-tight text-white">{botCharacter.name}</h3>
        <p className="mt-0.5 text-[11px] text-slate-300">Captures: {captures}</p>
      </div>

      {isBotTurn && (
        <span className="border border-campaign-blue/55 bg-campaign-blue/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-100">
          {ui?.botThinking ? "Thinking…" : "Their turn"}
        </span>
      )}
    </motion.div>
  );
};
