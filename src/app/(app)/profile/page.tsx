"use client";

import { Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, Field, Input } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { useProfile } from "@/store/profile";
import { useProgress, levelFromXp } from "@/store/progress";
import { useHydrated } from "@/lib/use-hydrated";
import { AVATAR_COLORS, EMBLEMS, FRAMES, isUnlocked } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const hydrated = useHydrated();
  const { displayName, avatar, setDisplayName, setAvatar } = useProfile();
  const xp = useProgress((s) => s.xp);
  const { level, into, need } = levelFromXp(xp);

  if (!hydrated) return <div className="skeleton h-64" />;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Customize your avatar and name. Unlock more by leveling up." />

      {/* preview */}
      <Card className="mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar avatar={avatar} size={84} />
        <div className="w-full flex-1">
          <Field label="Display name (shown on the leaderboard)">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={24}
            />
          </Field>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full fire-grad text-sm font-bold text-white">{level}</span>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full fire-grad" style={{ width: `${Math.round((into / need) * 100)}%` }} />
              </div>
              <p className="mt-1 text-xs text-faint">Level {level} · {need - into} XP to level {level + 1}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* emblem */}
      <Card className="mb-5">
        <CardHeader title="Emblem" />
        <div className="grid grid-cols-4 gap-3 p-5 pt-3 sm:grid-cols-7">
          {EMBLEMS.map((e) => {
            const unlocked = isUnlocked(level, e.unlock);
            const selected = avatar.emblem === e.id;
            return (
              <Option
                key={e.id}
                selected={selected}
                unlocked={unlocked}
                unlock={e.unlock}
                onClick={() => unlocked && setAvatar({ emblem: e.id })}
              >
                <Avatar avatar={{ emblem: e.id, color: avatar.color, frame: "none" }} size={44} />
              </Option>
            );
          })}
        </div>
      </Card>

      {/* color */}
      <Card className="mb-5">
        <CardHeader title="Color" />
        <div className="grid grid-cols-4 gap-3 p-5 pt-3 sm:grid-cols-7">
          {AVATAR_COLORS.map((c) => {
            const unlocked = isUnlocked(level, c.unlock);
            const selected = avatar.color === c.value;
            return (
              <Option
                key={c.id}
                selected={selected}
                unlocked={unlocked}
                unlock={c.unlock}
                onClick={() => unlocked && setAvatar({ color: c.value })}
              >
                <span className="h-11 w-11 rounded-full" style={{ background: c.value }} />
              </Option>
            );
          })}
        </div>
      </Card>

      {/* frame */}
      <Card>
        <CardHeader title="Frame" />
        <div className="grid grid-cols-4 gap-3 p-5 pt-3 sm:grid-cols-7">
          {FRAMES.map((f) => {
            const unlocked = isUnlocked(level, f.unlock);
            const selected = avatar.frame === f.id;
            return (
              <Option
                key={f.id}
                selected={selected}
                unlocked={unlocked}
                unlock={f.unlock}
                onClick={() => unlocked && setAvatar({ frame: f.id })}
              >
                <Avatar avatar={{ emblem: avatar.emblem, color: avatar.color, frame: f.id }} size={40} />
              </Option>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Option({
  selected,
  unlocked,
  unlock,
  onClick,
  children,
}: {
  selected: boolean;
  unlocked: boolean;
  unlock: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        "relative grid aspect-square place-items-center rounded-[var(--radius-soft)] border-2 p-2 transition",
        selected ? "border-accent bg-accent-soft" : "border-line hover:border-muted",
        !unlocked && "cursor-not-allowed",
      )}
    >
      <span className={cn(!unlocked && "opacity-30")}>{children}</span>
      {!unlocked && (
        <span className="absolute inset-0 grid place-items-center rounded-[var(--radius-soft)] bg-surface/70 text-center">
          <span className="flex flex-col items-center gap-0.5 text-faint">
            <Lock size={14} />
            <span className="text-[0.6rem] font-bold">Lvl {unlock}</span>
          </span>
        </span>
      )}
    </button>
  );
}
