"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Flame, Medal, Timer, Trophy } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, EmptyState, Segmented } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/store/auth";
import { fetchLeaderboard, type ProfileRow } from "@/lib/cloud";
import { sanitizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";

type Sort = "xp" | "blitz";

export default function LeaderboardPage() {
  const myId = useAuth((s) => s.user?.id);
  const [rows, setRows] = useState<ProfileRow[] | null>(null);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<Sort>("xp");

  useEffect(() => {
    let alive = true;
    fetchLeaderboard(100)
      .then((r) => alive && setRows(r))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const sorted = rows
    ? [...rows].sort((a, b) => (sort === "xp" ? b.xp - a.xp : b.best_blitz - a.best_blitz))
    : [];

  const rankColor = (i: number) =>
    i === 0 ? "#f5b301" : i === 1 ? "#cbd5e1" : i === 2 ? "#d8853f" : "var(--muted)";

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Every LearnFerno player, ranked. Earn XP to climb."
        action={
          <Segmented<Sort>
            value={sort}
            onChange={setSort}
            options={[
              { value: "xp", label: "XP" },
              { value: "blitz", label: "Best Blitz" },
            ]}
          />
        }
      />

      {error ? (
        <Card>
          <EmptyState icon={<Trophy size={22} />} title="Couldn't load the leaderboard" hint="Check your connection and try again." />
        </Card>
      ) : !rows ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState icon={<Flame size={22} />} title="No players yet" hint="Play a game to put yourself on the board!" />
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((p, i) => {
            const me = p.user_id === myId;
            return (
              <motion.div
                key={p.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <Card className={cn("flex items-center gap-3 p-3.5", me && "border-accent")}>
                  <div className="grid w-9 shrink-0 place-items-center">
                    {i < 3 ? (
                      <Medal size={22} style={{ color: rankColor(i) }} />
                    ) : (
                      <span className="text-sm font-bold text-faint">{i + 1}</span>
                    )}
                  </div>
                  <Avatar avatar={sanitizeAvatar(p.avatar)} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                      {p.display_name}
                      {i === 0 && <Crown size={14} className="text-accent" />}
                      {me && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.65rem] font-bold text-accent">YOU</span>}
                    </p>
                    <p className="text-xs text-muted">Level {p.level}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {sort === "xp" ? (
                      <>
                        <p className="font-bold tabular-nums">{p.xp.toLocaleString()}</p>
                        <p className="text-xs text-muted">XP</p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-1 font-bold tabular-nums">
                          <Timer size={13} className="text-accent" /> {p.best_blitz.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted">pts</p>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
