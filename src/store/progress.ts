"use client";

import { create } from "zustand";
import { todayKey } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { pushProgress, upsertProfileStats } from "@/lib/cloud";
import { sfx } from "@/lib/sfx";

export interface PlayResult {
  game: string;
  source: string;
  score: number;
  xp: number;
  at: number;
}

export interface ProgressData {
  xp: number;
  plays: number;
  streak: number;
  lastDay: string | null;
  bestBlitz: number;
  history: PlayResult[];
}

interface ProgressState extends ProgressData {
  loaded: boolean;
  levelUp: { from: number; to: number } | null;
  hydrate: (data: Partial<ProgressData>) => void;
  clear: () => void;
  recordPlay: (r: Omit<PlayResult, "at">) => void;
  clearLevelUp: () => void;
  reset: () => void;
}

const EMPTY: ProgressData = {
  xp: 0,
  plays: 0,
  streak: 0,
  lastDay: null,
  bestBlitz: 0,
  history: [],
};

const uidOf = () => useAuth.getState().user?.id;

function snapshot(s: ProgressData): ProgressData {
  return {
    xp: s.xp,
    plays: s.plays,
    streak: s.streak,
    lastDay: s.lastDay,
    bestBlitz: s.bestBlitz,
    history: s.history,
  };
}

export const useProgress = create<ProgressState>()((set, get) => ({
  ...EMPTY,
  loaded: false,
  levelUp: null,

  hydrate: (data) => set({ ...EMPTY, ...data, loaded: true }),
  clear: () => set({ ...EMPTY, loaded: false, levelUp: null }),

  recordPlay: (r) => {
    const today = todayKey();
    const prev = get();
    const oldLevel = levelFromXp(prev.xp).level;

    let nextStreak = prev.streak;
    if (prev.lastDay !== today) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yKey = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
      nextStreak = prev.lastDay === yKey ? prev.streak + 1 : 1;
    }

    const newXp = prev.xp + Math.max(0, Math.round(r.xp));
    const newLevel = levelFromXp(newXp).level;
    const entry: PlayResult = { ...r, at: Date.now() };

    set({
      xp: newXp,
      plays: prev.plays + 1,
      streak: nextStreak,
      lastDay: today,
      bestBlitz:
        r.game === "Inferno Blitz" ? Math.max(prev.bestBlitz, Math.round(r.score)) : prev.bestBlitz,
      history: [entry, ...prev.history].slice(0, 50),
      levelUp: newLevel > oldLevel ? { from: oldLevel, to: newLevel } : get().levelUp,
    });

    if (newLevel > oldLevel) setTimeout(() => sfx.levelUp(), 350);

    const u = uidOf();
    if (u) {
      const s = get();
      pushProgress(u, snapshot(s));
      upsertProfileStats(u, { xp: s.xp, level: newLevel, best_blitz: s.bestBlitz });
    }
  },

  clearLevelUp: () => set({ levelUp: null }),

  reset: () => {
    set({ ...EMPTY, loaded: true, levelUp: null });
    const u = uidOf();
    if (u) {
      pushProgress(u, EMPTY);
      upsertProfileStats(u, { xp: 0, level: 1, best_blitz: 0 });
    }
  },
}));

/** XP level curve: each level needs a bit more than the last. */
export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.round(need * 1.35);
  }
  return { level, into: remaining, need };
}
