"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Palette, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useProgress } from "@/store/progress";
import { unlocksBetween } from "@/lib/avatar";

export function LevelUpModal() {
  const levelUp = useProgress((s) => s.levelUp);
  const clearLevelUp = useProgress((s) => s.clearLevelUp);

  return (
    <AnimatePresence>
      {levelUp && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={clearLevelUp}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="card relative z-10 w-full max-w-sm overflow-hidden p-7 text-center"
          >
            <button
              onClick={clearLevelUp}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
            >
              <X size={18} />
            </button>

            <div className="absolute inset-x-0 top-0 h-28 fire-grad opacity-30" style={{ filter: "blur(36px)" }} />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="relative mx-auto grid h-20 w-20 place-items-center rounded-full fire-grad text-3xl font-black text-white shadow-lg"
            >
              {levelUp.to}
            </motion.div>

            <p className="relative mt-4 text-xs font-bold uppercase tracking-widest text-accent">Level up!</p>
            <h2 className="relative mt-1 text-2xl font-extrabold">You reached level {levelUp.to}</h2>

            <Rewards from={levelUp.from} to={levelUp.to} />

            <div className="relative mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearLevelUp}>
                Nice!
              </Button>
              <Link href="/profile" className="flex-1" onClick={clearLevelUp}>
                <Button variant="fire" className="w-full">
                  <Palette size={16} /> Customize
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Rewards({ from, to }: { from: number; to: number }) {
  const unlocks = unlocksBetween(from, to);
  if (unlocks.length === 0) {
    return <p className="relative mt-3 text-sm text-muted">Keep the streak burning. 🔥</p>;
  }
  return (
    <div className="relative mt-4">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-accent">
        <Sparkles size={15} /> Unlocked
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {unlocks.map((u, i) => (
          <span key={i} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            {u.kind}: {u.label}
          </span>
        ))}
      </div>
    </div>
  );
}
