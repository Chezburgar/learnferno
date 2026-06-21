"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Gamepad2,
  Layers,
  ListChecks,
  Plus,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader, Stagger, StaggerItem } from "@/components/PageHeader";
import { Card, EmptyState, Ring } from "@/components/ui";
import { useLibrary } from "@/store/library";
import { useProgress, levelFromXp } from "@/store/progress";
import { useHydrated } from "@/lib/use-hydrated";
import { relativeTime } from "@/lib/utils";

export default function Dashboard() {
  const hydrated = useHydrated();
  const decks = useLibrary((s) => s.decks);
  const quizzes = useLibrary((s) => s.quizzes);
  const progress = useProgress();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      </div>
    );
  }

  const { level, into, need } = levelFromXp(progress.xp);
  const cardCount = decks.reduce((n, d) => n + d.cards.length, 0);
  const questionCount = quizzes.reduce((n, q) => n + q.questions.length, 0);

  const stats = [
    { label: "Flashcards", value: cardCount, sub: `${decks.length} decks`, icon: Layers, href: "/decks" },
    { label: "Quiz questions", value: questionCount, sub: `${quizzes.length} quizzes`, icon: ListChecks, href: "/quizzes" },
    { label: "Games played", value: progress.plays, sub: `${progress.xp} XP earned`, icon: Gamepad2, href: "/play" },
  ];

  return (
    <div>
      <PageHeader
        title={
          <span>
            {greeting} <Flame size={26} className="ml-1 inline text-accent flame-flicker" />
          </span>
        }
        subtitle="Pick up where you left off, or start something new."
        action={
          <Link
            href="/play"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-soft)] fire-grad px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <Zap size={16} /> Quick play
          </Link>
        }
      />

      {/* level + streak banner */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <Ring
            value={Math.round((into / need) * 100)}
            label={level}
            sublabel="LEVEL"
            size={108}
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{progress.xp} XP</h2>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                {need - into} XP to level {level + 1}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full fire-grad"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((into / need) * 100)}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span className="flex items-center gap-2">
                <Flame size={16} className="text-accent flame-flicker" />
                <strong>{progress.streak}</strong>
                <span className="text-muted">day streak</span>
              </span>
              <span className="flex items-center gap-2">
                <Timer size={16} className="text-accent" />
                <strong>{progress.bestBlitz}</strong>
                <span className="text-muted">best Blitz</span>
              </span>
              <span className="flex items-center gap-2">
                <Trophy size={16} className="text-accent" />
                <strong>{progress.plays}</strong>
                <span className="text-muted">sessions</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* stat tiles */}
      <Stagger>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <Link href={s.href}>
                <Card className="group p-5 transition hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                      <s.icon size={20} />
                    </div>
                    <ArrowRight size={16} className="text-faint transition group-hover:translate-x-1 group-hover:text-accent" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className="text-xs text-faint">{s.sub}</p>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* quick actions */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Link href="/decks">
          <Card className="flex items-center gap-3 p-5 transition hover:-translate-y-0.5">
            <Plus size={18} className="text-accent" />
            <div>
              <p className="font-semibold">New flashcard deck</p>
              <p className="text-xs text-muted">Add cards with a front and back</p>
            </div>
          </Card>
        </Link>
        <Link href="/quizzes">
          <Card className="flex items-center gap-3 p-5 transition hover:-translate-y-0.5">
            <Plus size={18} className="text-accent" />
            <div>
              <p className="font-semibold">New quiz</p>
              <p className="text-xs text-muted">MC, true/false & short answer</p>
            </div>
          </Card>
        </Link>
        <Link href="/transfer">
          <Card className="flex items-center gap-3 p-5 transition hover:-translate-y-0.5">
            <Sparkles size={18} className="text-accent" />
            <div>
              <p className="font-semibold">Import a set</p>
              <p className="text-xs text-muted">From a file or pasted text</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* recent activity */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Recent sessions</h2>
        {progress.history.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Gamepad2 size={22} />}
              title="No games played yet"
              hint="Play a game and your scores will show up here."
              action={
                <Link
                  href="/play"
                  className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-soft)] bg-accent px-4 text-sm font-semibold text-accent-fg"
                >
                  <Zap size={16} /> Play now
                </Link>
              }
            />
          </Card>
        ) : (
          <Card className="divide-y divide-line">
            {progress.history.slice(0, 6).map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.game}</p>
                  <p className="truncate text-xs text-muted">
                    {h.source} · {relativeTime(h.at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <span className="font-semibold">{h.score}%</span>
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                    +{h.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
