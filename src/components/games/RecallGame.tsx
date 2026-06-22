"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { GameSummary, GameTopBar, ProgressBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { answersMatch, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { Deck } from "@/lib/types";

type Phase = "input" | "feedback";

export function RecallGame({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const cards = useMemo(
    () => deck.cards.filter((c) => c.front.trim() && c.back.trim()),
    [deck],
  );

  const [order, setOrder] = useState(() => shuffleArr(cards));
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [correct, setCorrect] = useState(0);
  const [lastRight, setLastRight] = useState(false);
  const [done, setDone] = useState(false);

  const restart = () => {
    setOrder(shuffleArr(cards));
    setIdx(0);
    setValue("");
    setPhase("input");
    setCorrect(0);
    setDone(false);
  };

  const check = () => {
    if (phase === "feedback") return next();
    const right = answersMatch(value, order[idx].back);
    setLastRight(right);
    if (right) { setCorrect((c) => c + 1); sfx.correct(); } else sfx.wrong();
    setPhase("feedback");
  };

  const next = () => {
    if (idx + 1 >= order.length) {
      const score = Math.round((correct / order.length) * 100);
      recordPlay({ game: "Recall", source: deck.name, score, xp: 12 + correct * 8 });
      sfx.finish();
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setValue("");
    setPhase("input");
  };

  const override = () => {
    // "I was right" — let the user count a near-miss
    if (!lastRight) {
      setCorrect((c) => c + 1);
      setLastRight(true);
    }
  };

  if (done) {
    const score = Math.round((correct / order.length) * 100);
    return (
      <GameSummary
        score={score}
        xp={12 + correct * 8}
        lines={[
          { label: "Correct", value: `${correct} / ${order.length}` },
          { label: "Accuracy", value: `${score}%` },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const card = order[idx];

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar title="Type Recall" subtitle={deck.name} onExit={onExit} />

      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>{idx + 1} / {order.length}</span>
        <span className="text-good">✓ {correct}</span>
      </div>
      <ProgressBar value={(idx / order.length) * 100} />

      <div className="mt-5 card p-8 text-center">
        <span className="text-xs uppercase tracking-widest text-faint">Type the answer for</span>
        <p className="mt-3 text-3xl font-bold">{card.front}</p>
      </div>

      <div className="mt-5">
        <Input
          key={idx}
          autoFocus
          value={value}
          disabled={phase === "feedback"}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Your answer…"
          className="h-14 text-center text-lg"
        />
      </div>

      <AnimatePresence>
        {phase === "feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-[var(--radius-soft)] p-4 text-center"
            style={{
              background: lastRight ? "color-mix(in srgb, var(--good) 14%, transparent)" : "color-mix(in srgb, var(--bad) 14%, transparent)",
            }}
          >
            <div className="flex items-center justify-center gap-2 font-semibold" style={{ color: lastRight ? "var(--good)" : "var(--bad)" }}>
              {lastRight ? <Check size={18} /> : <X size={18} />}
              {lastRight ? "Correct!" : "Not quite"}
            </div>
            {!lastRight && (
              <p className="mt-1 text-sm">
                Answer: <strong>{card.back}</strong>
              </p>
            )}
            {!lastRight && (
              <button onClick={override} className="mt-2 text-xs text-accent underline">
                I was actually right — count it
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button variant="fire" size="lg" className="mt-5 w-full" onClick={check}>
        {phase === "input" ? (<>Check <ArrowRight size={18} /></>) : (<>Next <ArrowRight size={18} /></>)}
      </Button>
    </div>
  );
}
