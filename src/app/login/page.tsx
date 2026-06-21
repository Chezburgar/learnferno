"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Loader2, Mail } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { asset } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  // already signed in → go to the app
  useEffect(() => {
    if (status === "authed") router.replace("/dashboard");
  }, [status, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error);
        else router.replace("/dashboard");
      } else {
        const { error, needsConfirm } = await signUp(email.trim(), password);
        if (error) setError(error);
        else if (needsConfirm) setConfirmSent(true);
        else router.replace("/dashboard");
      }
    } finally {
      setBusy(false);
    }
  };

  if (confirmSent) {
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Mail size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
          </p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => { setConfirmSent(false); setMode("signin"); }}>
            Back to sign in
          </Button>
        </motion.div>
      </Shell>
    );
  }

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "signin"
            ? "Sign in to pick up your decks, quizzes and streak."
            : "Sign up to save your flashcards and quizzes to the cloud."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" hint={mode === "signup" ? "At least 6 characters." : undefined}>
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <div className="rounded-[var(--radius-soft)] bg-bad/15 px-3 py-2 text-sm text-bad">{error}</div>
          )}

          <Button type="submit" variant="fire" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
            {mode === "signin" ? "Sign in" : "Create account"}
            {!busy && <ArrowRight size={18} />}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="font-semibold text-accent hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/icon.svg")} alt="" className="h-10 w-10 rounded-xl" />
          <span className="text-xl font-bold tracking-tight">
            Learn<span className="text-grad">Ferno</span>
          </span>
        </Link>
        <div className="card p-7">{children}</div>
        <p className="mt-5 text-center text-xs text-faint">
          Your decks and quizzes sync securely to your account.
        </p>
      </div>
    </div>
  );
}
