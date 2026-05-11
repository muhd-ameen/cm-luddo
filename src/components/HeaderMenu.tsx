import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";

export const HeaderMenu = () => {
  const phase = useGameStore((s) => s.phase);
  const openHowTo = useGameStore((s) => s.openHowTo);
  const restartMatch = useGameStore((s) => s.restartMatch);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items: { label: string; onSelect: () => void }[] = [
    {
      label: "How to Play",
      onSelect: () => {
        openHowTo();
        setOpen(false);
      }
    }
  ];

  if (phase === "playing" || phase === "finished") {
    items.push({
      label: "Restart Match",
      onSelect: () => {
        restartMatch();
        setOpen(false);
      }
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center border border-white/25 bg-white/5 text-slate-100"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="5" r="1.8" fill="currentColor" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          <circle cx="12" cy="19" r="1.8" fill="currentColor" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 min-w-[180px] border border-white/20 bg-slate-950/95 py-1 text-sm shadow-2xl"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={item.onSelect}
                className="block w-full px-4 py-3 text-left text-slate-100 transition hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
