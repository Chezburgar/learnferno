"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, Zap } from "lucide-react";
import { GameSummary, GameTopBar } from "./GameChrome";
import { useProgress } from "@/store/progress";
import { cn, shuffle as shuffleArr } from "@/lib/utils";
import { sfx } from "@/lib/sfx";
import type { MCItem } from "@/lib/game-utils";

const ROUND_SECONDS = 60;
const LIVES = 3;

export function BlitzGame({
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

  const [queue, setQueue] = useState<number[]>(() => deck.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [flash, setFlash] = useState<null | "right" | "wrong">(null);
  const [lockedPick, setLockedPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const startedRef = useRef(Date.now());

  const current = deck[queue[pos % queue.length]];
  const multiplier = 1 + Math.floor(streak / 3);

  // countdown
  useEffect(() => {
    if (done) return;
    if (timeLeft <= 0) {
      end();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => Math.max(0, +(s - 0.1).toFixed(1))), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, done]);

  const end = () => {
    if (done) return;
    recordPlay({
      game: "Inferno Blitz",
      source,
      score, // points
      xp: 15 + correctCount * 5,
    });
    sfx.gameOver();
    setDone(true);
  };

  const restart = () => {
    setQueue(shuffleArr(deck.map((_, i) => i)));
    setPos(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(LIVES);
    setCorrectCount(0);
    setAnswered(0);
    setTimeLeft(ROUND_SECONDS);
    setFlash(null);
    setLockedPick(null);
    setDone(false);
    startedRef.current = Date.now();
  };

  const pick = (i: number) => {
    if (lockedPick !== null || done) return;
    setLockedPick(i);
    setAnswered((a) => a + 1);
    const right = i === current.correct;
    if (right) {
      const gained = 10 * multiplier + Math.ceil(timeLeft / 6);
      setScore((s) => s + gained);
      setCorrectCount((c) => c + 1);
      const ns = streak + 1;
      setStreak(ns);
      setBestStreak((b) => Math.max(b, ns));
      setTimeLeft((s) => Math.min(ROUND_SECONDS, s + 1)); // small time reward
      setFlash("right");
      if (ns >= 3 && ns % 3 === 0) sfx.streak(ns); else sfx.correct();
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      setFlash("wrong");
      sfx.wrong();
    }
    setTimeout(() => {
      setFlash(null);
      setLockedPick(null);
      if (!right && lives - 1 <= 0) {
        end();
        return;
      }
      setPos((p) => p + 1);
    }, 480);
  };

  if (deck.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <GameTopBar title="Inferno Blitz" subtitle={source} onExit={onExit} />
        <div className="card p-8 text-center text-muted">
          Not enough material for Blitz. Add more cards/questions (4+ recommended).
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <GameSummary
        score={score}
        bigValue={score}
        unit=" pts"
        xp={15 + correctCount * 5}
        headline={lives <= 0 ? "Burned out!" : "Time's up! 🔥"}
        lines={[
          { label: "Best heat streak", value: `${bestStreak}x` },
          { label: "Correct", value: `${correctCount} / ${answered}` },
          { label: "Lives left", value: lives },
        ]}
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const timePct = (timeLeft / ROUND_SECONDS) * 100;

  return (
    <div className="mx-auto max-w-xl">
      <GameTopBar
        title="Inferno Blitz"
        subtitle={source}
        onExit={onExit}
        right={
          <span className="flex items-center gap-1 text-sm">
            {Array.from({ length: LIVES }).map((_, i) => (
              <Heart
                key={i}
                size={16}
                className={i < lives ? "text-bad" : "text-surface-3"}
                fill={i < lives ? "var(--bad)" : "transparent"}
              />
            ))}
          </span>
        }
      />

      {/* score + heat */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tabular-nums">{score}</span>
          <span className="text-sm text-muted">pts</span>
        </div>
        <AnimatePresence>
          {streak >= 2 && (
            <motion.span
              key={multiplier}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent"
            >
              <Flame size={15} className="flame-flicker" /> {streak} streak · {multiplier}x
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* time bar */}
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${timePct}%`,
            background: timePct < 25 ? "var(--bad)" : "linear-gradient(90deg, #ff2d00, var(--accent), #ffc400)",
          }}
        />
      </div>
      <p className="mt-1 text-right text-xs tabular-nums text-faint">{timeLeft.toFixed(1)}s</p>

      {/* question */}
      <motion.div
        key={pos}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-3 overflow-hidden rounded-[var(--radius-card)]"
      >
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10"
              style={{ background: flash === "right" ? "color-mix(in srgb, var(--good) 20%, transparent)" : "color-mix(in srgb, var(--bad) 22%, transparent)" }}
            />
          )}
        </AnimatePresence>

        <div className="card p-6 text-center">
          <Zap size={18} className="mx-auto text-accent" />
          <p className="mt-2 text-xl font-bold">{current.prompt}</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {current.options.map((opt, i) => {
            const isPick = lockedPick === i;
            const showRight = lockedPick !== null && i === current.correct;
            const showWrong = isPick && i !== current.correct;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={lockedPick !== null}
                className={cn(
                  "rounded-[var(--radius-soft)] border-2 px-4 py-4 text-center font-medium transition-colors",
                  showRight
                    ? "border-good bg-good/15 text-good"
                    : showWrong
                      ? "border-bad bg-bad/15 text-bad"
                      : "border-line bg-surface-2 hover:border-accent",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-faint">
        Answer fast to keep your heat up — every 3 in a row bumps your multiplier.
      </p>
    </div>
  );
}
