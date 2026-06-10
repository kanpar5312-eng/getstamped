"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** Polling cadence. Defaults to 30 seconds — safe for the parent view. */
  intervalMs?: number;
};

/**
 * Lightweight polling refresher for unauthenticated pages where Supabase
 * Realtime is gated by RLS. Mounts once, calls router.refresh() on every tick,
 * pauses when the tab is hidden, and clears the interval on unmount.
 *
 * Mac-safe: a single 30s interval that does nothing while the tab is hidden.
 */
export function PublicPollRefresher({ intervalMs = 30_000 }: Props) {
  const router = useRouter();

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id) return;
      id = setInterval(() => router.refresh(), intervalMs);
    };
    const stop = () => {
      if (id) {
        clearInterval(id);
        id = null;
      }
    };

    if (!document.hidden) start();
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [intervalMs, router]);

  return null;
}
