"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeftRight,
  Flame,
  Gamepad2,
  Layers,
  ListChecks,
  Shuffle,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { asset } from "@/lib/utils";

const features = [
  {
    name: "Build flashcard decks",
    icon: <Layers size={24} />,
    description: "Whip up decks of cards with a term on the front and the answer on the back.",
  },
  {
    name: "Write your own quizzes",
    icon: <ListChecks size={24} />,
    description: "Multiple choice, true / false, and short answer — mix and match in one quiz.",
  },
  {
    name: "Study as games",
    icon: <Gamepad2 size={24} />,
    description: "Flip, type-recall, memory match, quiz test, and the timed Inferno Blitz.",
  },
  {
    name: "Inferno Blitz",
    icon: <Timer size={24} />,
    description: "Race the clock, keep your heat streak alive, and rack up a high score.",
  },
  {
    name: "Earn XP & streaks",
    icon: <Trophy size={24} />,
    description: "Every session earns XP and levels you up. Keep a daily streak burning.",
  },
  {
    name: "Import & export",
    icon: <ArrowLeftRight size={24} />,
    description: "Back up everything to a file, or import decks from plain text in seconds.",
  },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
      {/* nav */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/icon.svg")} alt="" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-bold tracking-tight">
            Learn<span className="text-grad">Ferno</span>
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-soft)] bg-surface-2 px-4 text-sm font-medium text-text transition hover:bg-surface-3"
        >
          Open app <ArrowRight size={16} />
        </Link>
      </header>

      {/* hero */}
      <section className="grid items-center gap-10 py-8 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent"
          >
            <Flame size={13} className="flame-flicker" /> Study like it's on fire
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl"
          >
            Turn your notes into a{" "}
            <span className="text-grad">blazing</span> study game.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-xl text-lg text-muted"
          >
            LearnFerno lets you build flashcards and quizzes, then drill them with fast,
            fun games — flip, match, type-recall, and the timed Inferno Blitz. Everything
            syncs to your free account, and you can import or export it anytime.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <Link
              href="/login"
              className="group inline-flex h-12 items-center gap-2 rounded-[var(--radius-soft)] fire-grad px-6 font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Start studying
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/play"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-soft)] border border-line px-6 font-semibold text-text transition hover:bg-surface-2"
            >
              <Zap size={18} className="text-accent" /> Play a game
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 16 }}
          className="lg:col-span-5"
        >
          <div className="card relative mx-auto max-w-sm overflow-hidden p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shuffle size={16} className="text-accent" /> World Capitals
            </div>
            <div className="mt-4 grid place-items-center rounded-[var(--radius-soft)] bg-surface-2 px-6 py-12 text-center">
              <span className="text-xs uppercase tracking-wide text-faint">Term</span>
              <span className="mt-2 text-3xl font-bold">Japan</span>
              <span className="mt-6 text-xs uppercase tracking-wide text-faint">tap to flip</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-accent">
                <Flame size={15} className="flame-flicker" /> 7-day streak
              </span>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                +120 XP
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section className="py-12">
        <h2 className="text-3xl font-extrabold tracking-tight">Everything you need to cram</h2>
        <p className="mt-2 text-muted">Sign in once — your sets sync to your account across every device.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-6 transition hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="my-8">
        <div className="card relative overflow-hidden px-8 py-14 text-center">
          <div className="absolute inset-0 -z-0 opacity-60 fire-grad" style={{ filter: "blur(60px)" }} />
          <div className="relative z-10">
            <Flame size={40} className="mx-auto text-white flame-flicker" />
            <h2 className="mt-4 text-3xl font-extrabold text-white drop-shadow">Ready to light it up?</h2>
            <p className="mx-auto mt-2 max-w-md text-white/90">
              Build your first deck in under a minute and play your way to a perfect score.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-[var(--radius-soft)] bg-white px-7 font-bold text-[#1a0a04] transition hover:scale-105"
            >
              Get started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-faint">
        LearnFerno · a fiery study companion · saves locally in your browser
      </footer>
    </div>
  );
}
