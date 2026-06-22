"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Shield, Skull } from "lucide-react";
import { GameSummary, GameTopBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { cn, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { MCItem } from "@/lib/game-utils";

const LIVES = 3;

export function SurvivalGame({
  items,
  source,
  onExit,
}: {
  items: MCItem[];
  source: string;
  onExit: () => void;
}) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const deck = useMemo(() => shuffleArr(items), [items]);

  const [pos, setPos] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [locked, setLocked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const current = deck[pos % deck.length];

  const restart = () => {
    setPos(0); setLives(LIVES); setCorrect(0); setStreak(0); setBest(0);
    setAnswered(0); setLocked(null); setDone(false);
    sfx.start();
  };

  const end = (finalCorrect: number, finalBest: number) => {
    recordPlay({ game: "Survival", source, score: finalCorrect, xp: 12 + finalCorrect * 5 });
    sfx.gameOver();
    setDone(true);
  };

  const pick = (i: number) => {
    if (locked !== null || done) return;
    setLocked(i);
    setAnswered((a) => a + 1);
    const right = i === current.correct;
    if (right) {
      sfx.correct();
      const ns = streak + 1;
      const nc = correct + 1;
      setCorrect(nc);
      setStreak(ns);
      setBest((b) => Math.max(b, ns));
      if (ns >= 3) sfx.streak(ns);
      setTimeout(() => { setLocked(null); setPos((p) => p + 1); }, 420);
    } else {
      sfx.wrong();
      setStreak(0);
      const nl = lives - 1;
      setLives(nl);
      setTimeout(() => {
        if (nl <= 0) end(correct, Math.max(best, streak));
        else { setLocked(null); setPos((p) => p + 1); }
      }, 600);
    }
  };

  if (deck.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <GameTopBar title="Survival" subtitle={source} onExit={onExit} />
        <div className="card p-8 text-center text-muted">Not enough material for Survival — add 4+ items.</div>
      </div>
    );
  }

  if (done) {
    return (
      <GameSummary
        score={correct}
        bigValue={correct}
        unit=" survived"
        xp={12 + correct * 5}
        headline={correct >= 15 ? "Unstoppable! 🔥" : "Wiped out"}
        lines={[
          { label: "Best streak", value: `${best}x` },
          { label: "Correct", value: `${correct} / ${answered}` },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar
        title="Survival"
        subtitle={source}
        onExit={onExit}
        right={
          <span className="flex items-center gap-1">
            {Array.from({ length: LIVES }).map((_, i) => (
              <Heart key={i} size={16} className={i < lives ? "text-bad" : "text-surface-3"} fill={i < lives ? "var(--bad)" : "transparent"} />
            ))}
          </span>
        }
      />

      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-muted">
          <Shield size={15} className="text-accent" /> {correct} survived
        </span>
        {streak >= 2 && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent">
            {streak} in a row
          </span>
        )}
      </div>

      <motion.div key={pos} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card p-6 text-center">
          <Skull size={18} className="mx-auto text-accent" />
          <p className="mt-2 text-xl font-bold">{current.prompt}</p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {current.options.map((opt, i) => {
            const isPick = locked === i;
            const showRight = locked !== null && i === current.correct;
            const showWrong = isPick && i !== current.correct;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={locked !== null}
                className={cn(
                  "rounded-[var(--radius-soft)] border-2 px-4 py-4 text-center font-medium transition-colors",
                  showRight ? "border-good bg-good/15 text-good" : showWrong ? "border-bad bg-bad/15 text-bad" : "border-line bg-surface-2 hover:border-accent",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-faint">No timer — just don't run out of lives. How far can you go?</p>
    </div>
  );
}
