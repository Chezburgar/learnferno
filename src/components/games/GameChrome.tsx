"use client";

import { motion } from "framer-motion";
import { Flame, RotateCcw, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui";
import { scoreVar } from "@/lib/utils";

export function GameTopBar({
  title,
  subtitle,
  right,
  onExit,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onExit: () => void;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <button
        onClick={onExit}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
        title="Exit game"
      >
        <X size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-3">
      <motion.div
        className="h-full fire-grad"
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ ease: "easeOut", duration: 0.35 }}
      />
    </div>
  );
}

export function GameSummary({
  score,
  xp,
  lines,
  onReplay,
  onExit,
  headline,
  unit = "%",
  bigValue,
}: {
  score: number; // 0..100 when unit is "%"
  xp: number;
  lines: { label: string; value: React.ReactNode }[];
  onReplay: () => void;
  onExit: () => void;
  headline?: string;
  unit?: string;
  /** Override the big number (e.g. raw Blitz points). Falls back to `score`. */
  bigValue?: number;
}) {
  const isPct = unit === "%";
  const color = isPct ? scoreVar(score) : "var(--accent)";
  const cheer =
    headline ??
    (score >= 90 ? "Blazing! 🔥" : score >= 70 ? "Nicely done!" : score >= 50 ? "Good effort" : "Keep practicing");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card mx-auto max-w-md overflow-hidden p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
      >
        <Trophy size={36} />
      </motion.div>
      <h2 className="mt-4 text-2xl font-extrabold">{cheer}</h2>
      <p className="mt-1 text-5xl font-black tracking-tight" style={{ color }}>
        {bigValue ?? score}{unit}
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent">
        <Flame size={15} className="flame-flicker" /> +{xp} XP earned
      </div>

      <div className="mt-6 space-y-2 text-left">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center justify-between rounded-[var(--radius-soft)] bg-surface-2 px-4 py-2.5 text-sm">
            <span className="text-muted">{l.label}</span>
            <span className="font-semibold">{l.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onExit}>Done</Button>
        <Button variant="fire" className="flex-1" onClick={onReplay}>
          <RotateCcw size={16} /> Play again
        </Button>
      </div>
    </motion.div>
  );
}
