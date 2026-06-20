import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import { AskClient } from "@/components/ask/AskClient";
import { listThreads } from "@/app/actions/ai-threads";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ask — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function AskPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  // Parallel + cache-deduped session. listThreads is wrapped so a transient
  // DB error (or an unmigrated schema) renders the empty Ask page instead
  // of throwing the entire route into a 500.
  const [{ profile }, sessionUser] = await Promise.all([
    getCurrentUser(sp.state),
    getSessionUser(),
  ]);
  const isReal = isSupabaseConfigured() && Boolean(sessionUser);
  let initialThreads: Awaited<ReturnType<typeof listThreads>> = [];
  if (isReal) {
    try {
      initialThreads = await listThreads();
    } catch (err) {
      console.error("[AskPage] listThreads failed:", err);
    }
  }

  return (
    <AskClient
      plan={profile.plan}
      isReal={isReal}
      initialThreads={initialThreads.map((t) => ({
        id: t.id,
        title: t.title,
        scope: t.stepNumber ? ("step" as const) : ("general" as const),
        stepNumber: t.stepNumber ?? undefined,
        createdAt: t.createdAt,
        messages: t.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: m.createdAt,
            helpful: m.helpful,
            saved: m.saved,
          })),
      }))}
    />
  );
}
