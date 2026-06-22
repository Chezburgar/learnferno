"use client";

import {
  BookOpen,
  Brain,
  Cat,
  Crown,
  Flame,
  Gem,
  Ghost,
  Rocket,
  Skull,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Avatar as AvatarConfig } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const EMBLEM_ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  star: Star,
  book: BookOpen,
  bolt: Zap,
  brain: Brain,
  cat: Cat,
  ghost: Ghost,
  rocket: Rocket,
  sparkles: Sparkles,
  skull: Skull,
  sun: Sun,
  crown: Crown,
  trophy: Trophy,
  gem: Gem,
};

export function Avatar({
  avatar,
  size = 40,
  className,
}: {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
}) {
  const Icon = EMBLEM_ICONS[avatar.emblem] ?? Flame;
  const frame = avatar.frame;

  const frameStyle: React.CSSProperties = {};
  if (frame === "ring") {
    frameStyle.boxShadow = `0 0 0 2px var(--surface), 0 0 0 4px ${avatar.color}`;
  } else if (frame === "glow") {
    frameStyle.boxShadow = `0 0 14px 2px ${avatar.color}`;
  } else if (frame === "gold") {
    frameStyle.boxShadow = `0 0 0 2px var(--surface), 0 0 0 4px #f5b301`;
  } else if (frame === "inferno") {
    frameStyle.boxShadow = `0 0 0 2px var(--surface), 0 0 0 4px #ff3d00, 0 0 16px 3px #ff7a18`;
  }

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full text-white",
        frame === "inferno" && "flame-flicker",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: avatar.color,
        ...frameStyle,
      }}
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={2.2} />
    </span>
  );
}
