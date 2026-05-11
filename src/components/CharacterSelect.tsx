import { motion } from "framer-motion";
import { characters } from "../game/logic/pathFactory";
import type { Character, PlayerColor } from "../game/logic/types";
import { buildFallbackAvatar } from "../game/utils/avatar";
import { useGameStore } from "../store/gameStore";

const findCharacter = (id: string) => characters.find((c) => c.id === id) ?? characters[0];

const toneCls: Record<PlayerColor, { selected: string; idle: string }> = {
  red: {
    selected: "border-campaign-red shadow-glowRed",
    idle: "border-campaign-red/30 hover:border-campaign-red/70"
  },
  blue: {
    selected: "border-campaign-blue shadow-glowBlue",
    idle: "border-campaign-blue/30 hover:border-campaign-blue/70"
  }
};

const CandidateCard = ({
  color,
  character,
  selected,
  onSelect
}: {
  color: PlayerColor;
  character: Character;
  selected: boolean;
  onSelect: () => void;
}) => {
  const tone = toneCls[color];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full flex-col items-center gap-2.5 border-2 bg-slate-900/60 p-3 text-left transition md:gap-3 md:p-4 ${
        selected ? tone.selected : tone.idle
      }`}
    >
      <img
        src={character.image}
        alt={character.name}
        className="h-20 w-20 shrink-0 object-cover md:h-24 md:w-24"
        onError={(event) => {
          event.currentTarget.src = buildFallbackAvatar(character.name, character.accent);
        }}
      />
      <div className="w-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
          {selected ? "You" : "Tap to play"}
        </p>
        <h3 className="font-display text-base leading-tight text-white md:text-lg">{character.name}</h3>
        <p className="text-[11px] text-slate-300">{selected ? "Campaign Face" : "Bot opponent"}</p>
      </div>
    </motion.button>
  );
};

export const CharacterSelect = () => {
  const userColor = useGameStore((s) => s.userColor);
  const setUserColor = useGameStore((s) => s.setUserColor);
  const startMatch = useGameStore((s) => s.startMatch);
  const selections = useGameStore((s) => s.selections);

  const red = findCharacter(selections.red);
  const blue = findCharacter(selections.blue);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/20 bg-white/5 p-4 md:p-5"
    >
      <div>
        <h2 className="font-display text-xl text-white md:text-2xl">Pick Your Candidate</h2>
        <p className="mt-1 text-xs text-slate-300 md:text-sm">The other one plays as the bot.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 items-stretch gap-3 md:mt-5">
        <CandidateCard
          color="red"
          character={red}
          selected={userColor === "red"}
          onSelect={() => setUserColor("red")}
        />
        <CandidateCard
          color="blue"
          character={blue}
          selected={userColor === "blue"}
          onSelect={() => setUserColor("blue")}
        />
      </div>

      <div className="mt-4 md:mt-5">
        <button
          type="button"
          onClick={startMatch}
          className="w-full bg-white px-6 py-3 font-display text-base font-bold text-slate-900 transition hover:-translate-y-0.5 md:w-auto md:text-lg"
        >
          Start Match
        </button>
      </div>
    </motion.section>
  );
};
