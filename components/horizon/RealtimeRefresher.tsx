"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Props = {
  userId: string | null;
  /** Tables to subscribe to. Each insert/update/delete triggers a router.refresh(). */
  tables?: ("step_progress" | "step_activity" | "documents" | "profiles")[];
  /** Min ms between consecutive refreshes (debounced). */
  debounceMs?: number;
};

/**
 * Mount-once realtime listener that calls router.refresh() whenever the
 * signed-in user's rows in any subscribed table change.
 *
 * Mac-safe: one Supabase channel per page, debounced refreshes, cleanup on
 * unmount. Skips entirely when no userId is provided (anonymous / mock mode).
 */
export function RealtimeRefresher({
  userId,
  tables = ["step_progress"],
  debounceMs = 600,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const sb = getBrowserSupabase();
    if (!sb) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const queueRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        router.refresh();
      }, debounceMs);
    };

    const channelName = `rt:${userId}:${tables.join("+")}`;
    const channel = sb.channel(channelName);

    for (const table of tables) {
      const filter =
        table === "profiles" ? `id=eq.${userId}` : `user_id=eq.${userId}`;
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        queueRefresh,
      );
    }
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void sb.removeChannel(channel);
    };
  }, [userId, tables, debounceMs, router]);

  return null;
}
