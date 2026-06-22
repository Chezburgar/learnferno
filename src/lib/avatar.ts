/* ------------------------------------------------------------------ */
/*  Avatar cosmetics — emblems, colors and frames unlocked by level.   */
/* ------------------------------------------------------------------ */

export interface Avatar {
  emblem: string; // emblem id (see EMBLEMS)
  color: string; // hex background color
  frame: string; // frame id (see FRAMES)
}

export const DEFAULT_AVATAR: Avatar = {
  emblem: "flame",
  color: "#ff5a1f",
  frame: "none",
};

export interface Cosmetic {
  id: string;
  label: string;
  unlock: number; // level required
}

/** Emblem ids map to lucide icons in components/Avatar.tsx. */
export const EMBLEMS: Cosmetic[] = [
  { id: "flame", label: "Flame", unlock: 1 },
  { id: "star", label: "Star", unlock: 1 },
  { id: "book", label: "Book", unlock: 1 },
  { id: "bolt", label: "Bolt", unlock: 2 },
  { id: "brain", label: "Brain", unlock: 2 },
  { id: "cat", label: "Cat", unlock: 3 },
  { id: "ghost", label: "Ghost", unlock: 3 },
  { id: "rocket", label: "Rocket", unlock: 4 },
  { id: "sparkles", label: "Sparkles", unlock: 5 },
  { id: "skull", label: "Skull", unlock: 5 },
  { id: "sun", label: "Sun", unlock: 6 },
  { id: "crown", label: "Crown", unlock: 7 },
  { id: "trophy", label: "Trophy", unlock: 8 },
  { id: "gem", label: "Gem", unlock: 10 },
];

export const AVATAR_COLORS: (Cosmetic & { value: string })[] = [
  { id: "flame", label: "Flame", value: "#ff5a1f", unlock: 1 },
  { id: "inferno", label: "Inferno", value: "#ef4444", unlock: 1 },
  { id: "ember", label: "Ember", value: "#f97316", unlock: 2 },
  { id: "gold", label: "Gold", value: "#f5b301", unlock: 2 },
  { id: "cyan", label: "Cyan", value: "#22d3ee", unlock: 3 },
  { id: "mint", label: "Mint", value: "#34d399", unlock: 4 },
  { id: "plasma", label: "Plasma", value: "#a855f7", unlock: 5 },
  { id: "coral", label: "Coral", value: "#fb7185", unlock: 6 },
  { id: "crimson", label: "Crimson", value: "#e11d48", unlock: 7 },
  { id: "teal", label: "Teal", value: "#14b8a6", unlock: 9 },
];

export const FRAMES: Cosmetic[] = [
  { id: "none", label: "None", unlock: 1 },
  { id: "ring", label: "Ring", unlock: 2 },
  { id: "glow", label: "Glow", unlock: 4 },
  { id: "gold", label: "Gold", unlock: 6 },
  { id: "inferno", label: "Inferno", unlock: 9 },
];

export function isUnlocked(level: number, unlock: number): boolean {
  return level >= unlock;
}

/** Cosmetics unlocked when crossing from `from` to `to` (exclusive→inclusive). */
export function unlocksBetween(from: number, to: number): { kind: string; label: string }[] {
  const out: { kind: string; label: string }[] = [];
  const inRange = (u: number) => u > from && u <= to;
  EMBLEMS.filter((e) => inRange(e.unlock)).forEach((e) => out.push({ kind: "Emblem", label: e.label }));
  AVATAR_COLORS.filter((c) => inRange(c.unlock)).forEach((c) => out.push({ kind: "Color", label: c.label }));
  FRAMES.filter((f) => inRange(f.unlock)).forEach((f) => out.push({ kind: "Frame", label: f.label }));
  return out;
}

export function sanitizeAvatar(raw: unknown): Avatar {
  const a = (raw && typeof raw === "object" ? raw : {}) as Partial<Avatar>;
  return {
    emblem: EMBLEMS.some((e) => e.id === a.emblem) ? (a.emblem as string) : DEFAULT_AVATAR.emblem,
    color: typeof a.color === "string" ? a.color : DEFAULT_AVATAR.color,
    frame: FRAMES.some((f) => f.id === a.frame) ? (a.frame as string) : DEFAULT_AVATAR.frame,
  };
}
