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
        className="mx-auto flex w-full max-w-lg flex-col gap-3 px-3 pt-3 md:pt-6"
        style={{
          paddingBottom: isPlaying
            ? "calc(8.5rem + env(safe-area-inset-bottom))"
            : "calc(2rem + env(safe-area-inset-bottom))"
        }}
      >
        <header className="flex items-center justify-between gap-3 border border-white/20 bg-white/5 p-3 md:p-4">
          <h1 className="font-display text-2xl md:text-3xl">Find Next Kerala CM</h1>
          <HeaderMenu />
        </header>

        {isPlaying && <OpponentBar />}

        <div className="border border-white/20 bg-white/5 p-2 md:p-3">
          <div className="aspect-square w-full overflow-hidden">
            <PhaserGame />
          </div>
        </div>

        {isPlaying ? <PlayerBar /> : <CharacterSelect />}
      </main>

      {isPlaying && <DiceDock />}

      <HowToModal />
      <VictoryModal />
    </div>
  );
}

export default App;
