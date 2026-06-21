"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  Check,
  Cloud,
  Flame,
  Gamepad2,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useProgress, levelFromXp } from "@/store/progress";
import { useAuth } from "@/store/auth";
import { useSync } from "@/store/sync";
import { useHydrated } from "@/lib/use-hydrated";
import { asset, cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decks", label: "Flashcards", icon: Layers },
  { href: "/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/transfer", label: "Import / Export", icon: ArrowLeftRight },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/decks", "/quizzes", "/play", "/settings"].includes(n.href),
);

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/icon.svg")} alt="" className="h-9 w-9 rounded-xl" />
      <span className="text-lg font-bold tracking-tight">
        Learn<span className="text-grad">Ferno</span>
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-[var(--radius-soft)] px-3.5 py-2.5 text-sm font-medium transition-colors",
        active ? "text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 -z-0 rounded-[var(--radius-soft)] bg-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon size={19} className="relative z-10 shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

function LevelChip() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const { level, into, need } = levelFromXp(hydrated ? xp : 0);
  const pct = Math.round((into / need) * 100);
  return (
    <div className="rounded-[var(--radius-soft)] bg-surface-2 p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full fire-grad text-xs font-bold text-white">
            {level}
          </span>
          Level {level}
        </span>
        <span className="flex items-center gap-1 text-xs text-accent">
          <Flame size={13} className="flame-flicker" /> {streak}d
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full fire-grad" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[0.7rem] text-faint">
        {into} / {need} XP to next level
      </p>
    </div>
  );
}

function SyncStatus() {
  const inflight = useSync((s) => s.inflight);
  const error = useSync((s) => s.error);
  if (error && inflight === 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-bad" title={error}>
        <Cloud size={12} /> offline
      </span>
    );
  }
  if (inflight > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted">
        <RefreshCw size={12} className="animate-spin" /> saving
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-accent">
      <Check size={12} /> saved
    </span>
  );
}

function UserChip() {
  const router = useRouter();
  const email = useAuth((s) => s.user?.email);
  const signOut = useAuth((s) => s.signOut);
  const initials = (email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-soft)] bg-surface-2 px-3 py-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{email ?? "Account"}</p>
        <SyncStatus />
      </div>
      <button
        onClick={async () => {
          await signOut();
          router.replace("/login");
        }}
        title="Sign out"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-3 hover:text-text"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const SidebarBody = (
    <>
      <div className="px-4 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <NavLink key={n.href} {...n} active={isActive(n.href)} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>
      <div className="space-y-2 p-3">
        <LevelChip />
        <UserChip />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* desktop sidebar */}
      <aside className="glassable sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line lg:flex">
        {SidebarBody}
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="card fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-none rounded-r-[var(--radius-card)] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {SidebarBody}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glassable sticky top-0 z-30 flex items-center gap-3 border-b border-line px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-soft)] text-muted hover:bg-surface-2"
          >
            <Menu size={20} />
          </button>
          <Logo />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="glassable fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line px-2 py-2 lg:hidden">
        {MOBILE_NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-soft)] py-1.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-accent" : "text-muted",
              )}
            >
              <n.icon size={20} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
