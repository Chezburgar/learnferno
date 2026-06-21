"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui";
import { GameSummary, GameTopBar, ProgressBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { shuffle as shuffleArr } from "@/lib/utils";
import type { Deck } from "@/lib/types";

export function FlipGame({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const cards = useMemo(() => deck.cards.filter((c) => c.front.trim() || c.back.trim()), [deck]);

  const [order, setOrder] = useState(() => shuffleArr(cards));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [learning, setLearning] = useState(0);
  const [done, setDone] = useState(false);

  const restart = () => {
    setOrder(shuffleArr(cards));
    setIdx(0);
    setFlipped(false);
    setKnown(0);
    setLearning(0);
    setDone(false);
  };

  const advance = (gotIt: boolean) => {
    if (gotIt) setKnown((k) => k + 1);
    else setLearning((l) => l + 1);
    if (idx + 1 >= order.length) {
      const score = Math.round((((gotIt ? known + 1 : known)) / order.length) * 100);
      const xp = 10 + (gotIt ? known + 1 : known) * 6;
      recordPlay({ game: "Flip", source: deck.name, score, xp });
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  };

  if (done) {
    const score = Math.round((known / order.length) * 100);
    return (
      <GameSummary
        score={score}
        xp={10 + known * 6}
        lines={[
          { label: "Knew it", value: known },
          { label: "Still learning", value: learning },
          { label: "Cards", value: order.length },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const card = order[idx];

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar
        title="Flip"
        subtitle={deck.name}
        onExit={onExit}
        right={
          <Button variant="ghost" size="sm" onClick={restart} title="Reshuffle">
            <Shuffle size={16} />
          </Button>
        }
      />

      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>{idx + 1} / {order.length}</span>
        <span className="flex items-center gap-3">
          <span className="text-good">✓ {known}</span>
          <span className="text-warn">↻ {learning}</span>
        </span>
      </div>
      <ProgressBar value={(idx / order.length) * 100} />

      <div className="mt-5 flip-scene h-72 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="h-full"
          >
            <div
              className={`flip-inner ${flipped ? "is-flipped" : ""} cursor-pointer`}
              onClick={() => setFlipped((f) => !f)}
            >
              <div className="flip-face card p-8 text-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-faint">Term</span>
                  <p className="mt-3 text-3xl font-bold">{card.front || "—"}</p>
                  <span className="mt-6 block text-xs text-faint">tap to flip</span>
                </div>
              </div>
              <div className="flip-face back card p-8 text-center" style={{ background: "var(--accent-soft)" }}>
                <div>
                  <span className="text-xs uppercase tracking-widest text-accent">Answer</span>
                  <p className="mt-3 text-3xl font-bold">{card.back || "—"}</p>
                  <span className="mt-6 block text-xs text-faint">tap to flip back</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={() => advance(false)}>
          <RotateCcw size={18} className="text-warn" /> Still learning
        </Button>
        <Button variant="outline" size="lg" onClick={() => advance(true)}>
          <Check size={18} className="text-good" /> Knew it
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-faint">Flip the card, then mark whether you knew it.</p>
    </div>
  );
}
