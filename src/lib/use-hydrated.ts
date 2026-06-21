"use client";

import { useEffect, useState } from "react";

/** True only after the first client render — guards against SSR/localStorage hydration mismatches. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
