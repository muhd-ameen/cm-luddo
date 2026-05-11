import { CharacterSelect } from "./components/CharacterSelect";
import { GameHUD } from "./components/GameHUD";
import { HeaderMenu } from "./components/HeaderMenu";
import { HowToModal } from "./components/HowToModal";
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
        className="mx-auto w-full max-w-7xl px-3 pt-3 md:px-4 md:pt-6"
        style={{
          paddingBottom: isPlaying
            ? "calc(11rem + env(safe-area-inset-bottom))"
            : "calc(2rem + env(safe-area-inset-bottom))"
        }}
      >
        <header className="border border-white/20 bg-white/5 p-3 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-2xl md:text-4xl">Find Next CM</h1>
            <HeaderMenu />
          </div>
        </header>

        <section className="mt-3 grid gap-3 md:mt-4 md:gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="border border-white/20 bg-white/5 p-2 md:p-3">
            <div className="aspect-square w-full overflow-hidden">
              <PhaserGame />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            {phase === "setup" ? <CharacterSelect /> : <GameHUD />}
          </div>
        </section>
      </main>

      <HowToModal />
      <VictoryModal />
    </div>
  );
}

export default App;
