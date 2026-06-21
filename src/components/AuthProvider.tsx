"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";

/** Bootstraps the Supabase session listener once on app load. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return <>{children}</>;
}
