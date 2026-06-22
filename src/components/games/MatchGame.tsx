"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Timer, Shuffle } from "lucide-react";
import { Button } from "@/components/ui";
import { GameSummary, GameTopBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { cn, sample, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { Deck } from "@/lib/types";

interface Tile {
  key: string;
  cardId: string;
  text: string;
}

const PAIRS = 6;

export function MatchGame({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const recordPlay = useProgress((s) => s.recordPlay);
  const usable = useMemo(
    () => deck.cards.filter((c) => c.front.trim() && c.back.trim()),
    [deck],
  );

  const build = () => {
    const chosen = sample(usable, Math.min(PAIRS, usable.length));
    const tiles: Tile[] = [];
    for (const c of chosen) {
      tiles.push({ key: c.id + "-f", cardId: c.id, text: c.front });
      tiles.push({ key: c.id + "-b", cardId: c.id, text: c.back });
    }
    return shuffleArr(tiles);
  };

  const [tiles, setTiles] = useState<Tile[]>(build);
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const totalPairs = tiles.length / 2;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(t);
  }, [done]);

  const restart = () => {
    setTiles(build());
    setSelected([]);
    setMatched(new Set());
    setWrongKeys([]);
    setMistakes(0);
    setElapsed(0);
    setDone(false);
  };

  const finish = (finalMistakes: number, finalTime: number) => {
    const score = Math.max(20, Math.round(100 - finalMistakes * 8 - finalTime * 0.5));
    const xp = 14 + totalPairs * 5 + Math.max(0, 30 - Math.round(finalTime));
    recordPlay({ game: "Match", source: deck.name, score: Math.min(100, score), xp });
    setDone(true);
  };

  const onTile = (tile: Tile) => {
    if (done || matched.has(tile.key) || selected.includes(tile.key) || selected.length === 2) return;
    const next = [...selected, tile.key];
    setSelected(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => tiles.find((t) => t.key === k)!);
      if (a.cardId === b.cardId) {
        const nm = new Set(matched);
        nm.add(a.key);
        nm.add(b.key);
        setMatched(nm);
        setSelected([]);
        sfx.match();
        if (nm.size === tiles.length) { sfx.finish(); finish(mistakes, elapsed); }
      } else {
        setMistakes((m) => m + 1);
        setWrongKeys(next);
        sfx.wrong();
        setTimeout(() => {
          setSelected([]);
          setWrongKeys([]);
        }, 700);
      }
    }
  };

  if (usable.length < 2) {
    return (
      <div className="mx-auto max-w-xl">
        <GameTopBar title="Match" subtitle={deck.name} onExit={onExit} />
        <div className="card p-8 text-center text-muted">This deck needs at least 2 complete cards to play Match.</div>
      </div>
    );
  }

  if (done) {
    const score = Math.max(20, Math.min(100, Math.round(100 - mistakes * 8 - elapsed * 0.5)));
    return (
      <GameSummary
        score={score}
        xp={14 + totalPairs * 5 + Math.max(0, 30 - Math.round(elapsed))}
        headline={mistakes === 0 ? "Flawless match! 🔥" : undefined}
        lines={[
          { label: "Time", value: `${elapsed.toFixed(1)}s` },
          { label: "Mistakes", value: mistakes },
          { label: "Pairs", value: totalPairs },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <GameTopBar
        title="Match"
        subtitle={deck.name}
        onExit={onExit}
        right={
          <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold tabular-nums">
            <Timer size={15} className="text-accent" /> {elapsed.toFixed(1)}s
          </span>
        }
      />
      <p className="mb-4 text-sm text-muted">
        Tap a term, then its match. Clear the board as fast as you can — mistakes cost points.
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.key);
          const isSel = selected.includes(tile.key);
          const isWrong = wrongKeys.includes(tile.key);
          return (
            <motion.button
              key={tile.key}
              layout
              onClick={() => onTile(tile)}
              animate={isMatched ? { opacity: 0.25, scale: 0.95 } : { opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "grid min-h-24 place-items-center rounded-[var(--radius-soft)] border-2 p-3 text-center text-sm font-medium transition-colors",
                isMatched
                  ? "border-good/40 bg-good/10 text-good"
                  : isWrong
                    ? "border-bad bg-bad/15 text-bad"
                    : isSel
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-surface-2 hover:border-accent/60",
              )}
              disabled={isMatched}
            >
              {tile.text}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <span>{matched.size / 2} / {totalPairs} matched</span>
        <Button variant="ghost" size="sm" onClick={restart}><Shuffle size={15} /> Reshuffle</Button>
      </div>
    </div>
  );
}
