"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { GameSummary, GameTopBar, ProgressBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { cn, sample, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { Deck, Flashcard } from "@/lib/types";

const MAX_ROUND = 10;

function letterCount(s: string) {
  return s.replace(/\s/g, "").length;
}

export function ScrambleGame({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const usable = useMemo(
    () =>
      deck.cards.filter(
        (c) => c.front.trim() && c.back.trim() && letterCount(c.front) >= 3 && letterCount(c.front) <= 14,
      ),
    [deck],
  );

  const [order, setOrder] = useState<Flashcard[]>(() => sample(usable, Math.min(MAX_ROUND, usable.length)));
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const restart = () => {
    setOrder(sample(usable, Math.min(MAX_ROUND, usable.length)));
    setIdx(0);
    setCorrect(0);
    setDone(false);
  };

  const next = (wasCorrect: boolean) => {
    const nc = wasCorrect ? correct + 1 : correct;
    if (idx + 1 >= order.length) {
      const score = Math.round((nc / order.length) * 100);
      recordPlay({ game: "Scramble", source: deck.name, score, xp: 12 + nc * 7 });
      sfx.finish();
      setCorrect(nc);
      setDone(true);
      return;
    }
    setCorrect(nc);
    setIdx((i) => i + 1);
  };

  if (usable.length < 1) {
    return (
      <div className="mx-auto max-w-xl">
        <GameTopBar title="Scramble" subtitle={deck.name} onExit={onExit} />
        <div className="card p-8 text-center text-muted">
          This deck needs cards whose term is 3–14 letters to play Scramble.
        </div>
      </div>
    );
  }

  if (done) {
    const score = Math.round((correct / order.length) * 100);
    return (
      <GameSummary
        score={score}
        xp={12 + correct * 7}
        lines={[
          { label: "Solved", value: `${correct} / ${order.length}` },
          { label: "Accuracy", value: `${score}%` },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar
        title="Scramble"
        subtitle={deck.name}
        onExit={onExit}
        right={<span className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold">{idx + 1}/{order.length}</span>}
      />
      <ProgressBar value={(idx / order.length) * 100} />
      <ScrambleRound key={order[idx].id} card={order[idx]} onResult={next} />
    </div>
  );
}

function ScrambleRound({ card, onResult }: { card: Flashcard; onResult: (correct: boolean) => void }) {
  const term = card.front;
  // tiles = every non-space character, shuffled with stable ids
  const tiles = useMemo(() => {
    const chars = [...term].filter((c) => c !== " ").map((ch, i) => ({ id: i, ch: ch.toUpperCase() }));
    return shuffleArr(chars);
  }, [term]);

  const slotCount = tiles.length;
  const [placed, setPlaced] = useState<number[]>([]);
  const [phase, setPhase] = useState<"playing" | "wrong" | "solved" | "revealed">("playing");

  const placeChar = (k: number) => tiles.find((t) => t.id === placed[k])?.ch ?? "";

  const assemble = (ids: number[]) => {
    let k = 0;
    let out = "";
    for (const ch of term) {
      if (ch === " ") {
        out += " ";
      } else {
        const id = ids[k++];
        out += tiles.find((t) => t.id === id)?.ch ?? "";
      }
    }
    return out;
  };

  const onTile = (id: number) => {
    if (phase === "solved" || phase === "revealed") return;
    if (placed.includes(id)) return;
    const next = [...placed, id];
    setPlaced(next);
    setPhase("playing");
    if (next.length === slotCount) {
      const correct = assemble(next).toUpperCase() === term.toUpperCase();
      if (correct) {
        sfx.correct();
        setPhase("solved");
        setTimeout(() => onResult(true), 750);
      } else {
        sfx.wrong();
        setPhase("wrong");
      }
    }
  };

  const removeAt = (k: number) => {
    if (phase === "solved" || phase === "revealed") return;
    setPlaced((p) => p.filter((_, i) => i !== k));
    setPhase("playing");
  };

  const clear = () => { setPlaced([]); setPhase("playing"); };

  const reveal = () => {
    setPhase("revealed");
    setTimeout(() => onResult(false), 1100);
  };

  // build slot views (with spaces preserved)
  const slots: React.ReactNode[] = [];
  let slotIdx = 0;
  for (let i = 0; i < term.length; i++) {
    if (term[i] === " ") {
      slots.push(<span key={`sp-${i}`} className="w-3" />);
    } else {
      const k = slotIdx++;
      const filled = k < placed.length;
      const letter = phase === "revealed" ? [...term].filter((c) => c !== " ")[k]?.toUpperCase() : placeChar(k);
      slots.push(
        <button
          key={`slot-${i}`}
          onClick={() => filled && removeAt(k)}
          className={cn(
            "grid h-11 w-9 place-items-center rounded-[var(--radius-soft)] border-2 text-lg font-bold transition-colors",
            phase === "solved" ? "border-good bg-good/15 text-good"
              : phase === "revealed" ? "border-accent bg-accent-soft text-accent"
              : phase === "wrong" && filled ? "border-bad bg-bad/15 text-bad"
              : filled ? "border-accent bg-surface-2"
              : "border-dashed border-line bg-surface",
          )}
        >
          {letter || ""}
        </button>,
      );
    }
  }

  return (
    <div className="mt-5">
      <div className="card p-5 text-center">
        <span className="text-xs uppercase tracking-widest text-faint">Unscramble the term for</span>
        <p className="mt-2 text-lg font-semibold">{card.back}</p>
      </div>

      <motion.div
        animate={phase === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-5 flex flex-wrap items-center justify-center gap-1.5"
      >
        {slots}
      </motion.div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tiles.map((t) => {
          const used = placed.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onTile(t.id)}
              disabled={used || phase === "solved" || phase === "revealed"}
              className={cn(
                "h-11 w-10 rounded-[var(--radius-soft)] border-2 text-lg font-bold transition-all",
                used ? "border-line bg-surface text-faint opacity-40" : "border-line bg-surface-2 hover:border-accent active:scale-95",
              )}
            >
              {t.ch}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={clear} disabled={phase === "solved" || phase === "revealed" || placed.length === 0}>
          <RotateCcw size={15} /> Clear
        </Button>
        <Button variant="outline" size="sm" onClick={reveal} disabled={phase === "solved" || phase === "revealed"}>
          <Eye size={15} /> Reveal
        </Button>
      </div>

      {phase === "wrong" && <p className="mt-3 text-center text-sm text-bad">Not quite — tap a letter to send it back.</p>}
      {phase === "solved" && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-good">
          <Check size={16} /> {card.front}
        </p>
      )}
      {phase === "revealed" && <p className="mt-3 text-center text-sm text-muted">Answer: <strong>{card.front}</strong></p>}
    </div>
  );
}
