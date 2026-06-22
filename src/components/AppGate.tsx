"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useLibrary } from "@/store/library";
import { useProgress } from "@/store/progress";
import { useProfile } from "@/store/profile";
import { bootstrapUser } from "@/lib/bootstrap";

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Flame size={32} className="text-accent flame-flicker" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

/** Requires a signed-in user and loads their cloud data before rendering the app. */
export function AppGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const userId = useAuth((s) => s.user?.id);
  const loaded = useLibrary((s) => s.loaded);
  const bootstrappedFor = useRef<string | null>(null);

  // redirect anonymous visitors to the login screen
  useEffect(() => {
    if (status === "anon") router.replace("/login");
  }, [status, router]);

  // load cloud data once we know who the user is
  useEffect(() => {
    if (status === "authed" && userId && bootstrappedFor.current !== userId) {
      bootstrappedFor.current = userId;
      bootstrapUser(userId).catch((e) => console.error("[learnferno bootstrap]", e));
    }
    if (status === "anon") {
      bootstrappedFor.current = null;
      useLibrary.getState().clear();
      useProgress.getState().clear();
      useProfile.getState().clear();
    }
  }, [status, userId]);

  if (status === "loading") return <FullScreenLoader label="Loading…" />;
  if (status === "anon") return <FullScreenLoader label="Redirecting to sign in…" />;
  if (!loaded) return <FullScreenLoader label="Syncing your library…" />;

  return <>{children}</>;
}
