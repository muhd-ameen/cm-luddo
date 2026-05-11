import { CharacterSelect } from "./components/CharacterSelect";
import { DiceDock } from "./components/DiceDock";
import { HeaderMenu } from "./components/HeaderMenu";
import { HowToModal } from "./components/HowToModal";
import { OpponentBar } from "./components/OpponentBar";
import { PlayerBar } from "./components/PlayerBar";
import { VictoryModal } from "./components/VictoryModal";
import { PhaserGame } from "./game/PhaserGame";
import { useGameBus } from "./hooks/useGameBus";
import { useGameStore } from "./store/gameStore";

function App() {
  useGameBus();

  const phase = useGameStore((s) => s.phase);
  const isPlaying = phase !== "setup";

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <main
        className={[
          // Mobile: phone-style single centered column with bottom space for the fixed dock
          "mx-auto flex w-full max-w-lg flex-col gap-3 px-3 pt-3",
          isPlaying
            ? "pb-[calc(8.5rem+env(safe-area-inset-bottom))]"
            : "pb-[calc(2rem+env(safe-area-inset-bottom))]",
          // Desktop (lg+): wider container, two columns, no extra bottom padding (dock is inline)
          "lg:grid lg:max-w-7xl lg:auto-rows-min lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4 lg:px-4 lg:pb-8 lg:pt-6"
        ].join(" ")}
      >
        <header className="flex items-center justify-between gap-3 border border-white/20 bg-white/5 p-3 md:p-4 lg:col-span-2">
          <h1 className="font-display text-2xl md:text-3xl">Find Next Kerala CM</h1>
          <HeaderMenu />
        </header>

        {/*
          Desktop column placement:
            row 2 col 1 → Board (spans rows 2-4)
            row 2 col 2 → OpponentBar
            row 3 col 2 → PlayerBar / CharacterSelect
            row 4 col 2 → DiceDock (inline)
        */}
        {isPlaying && (
          <div className="lg:col-start-2 lg:row-start-2">
            <OpponentBar />
          </div>
        )}

        <div className="border border-white/20 bg-white/5 p-2 md:p-3 lg:col-start-1 lg:row-start-2 lg:row-span-3 lg:self-start">
          <div className="aspect-square w-full overflow-hidden">
            <PhaserGame />
          </div>
        </div>

        {isPlaying ? (
          <div className="lg:col-start-2 lg:row-start-3">
            <PlayerBar />
          </div>
        ) : (
          <div className="lg:col-start-2 lg:row-start-2 lg:row-span-3 lg:self-start">
            <CharacterSelect />
          </div>
        )}

        {isPlaying && (
          <div className="lg:col-start-2 lg:row-start-4">
            <DiceDock />
          </div>
        )}
      </main>

      <HowToModal />
      <VictoryModal />
    </div>
  );
}

export default App;
