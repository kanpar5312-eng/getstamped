"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ThreadRow = {
  id: string;
  title: string;
  stepNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageRow[];
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  helpful: boolean | null;
  saved: boolean;
};

async function requireUser() {
  if (!isSupabaseConfigured()) return { ok: false as const };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false as const };
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false as const };
  return { ok: true as const, sb, userId: data.user.id };
}

/** Returns all of the signed-in user's threads, newest first, with messages. */
export async function listThreads(): Promise<ThreadRow[]> {
  const u = await requireUser();
  if (!u.ok) return [];

  // Explicit user_id filter (defense in depth — RLS should already enforce
  // this, but if the policy was dropped or never applied in prod, this
  // keeps us from silently showing nothing or, worse, someone else's data).
  const { data: threads, error: threadErr } = await u.sb
    .from("ai_threads")
    .select("id, title, step_number, created_at, updated_at")
    .eq("user_id", u.userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (threadErr) {
    console.error("[listThreads] threads query failed:", threadErr);
    return [];
  }
  if (!threads || threads.length === 0) return [];

  const ids = threads.map((t) => t.id);
  // helpful + saved were added in migration 0004. Older deployments may
  // not have them yet, so we try the rich SELECT first and fall back to
  // the base columns if Postgres reports an unknown column.
  let msgs:
    | Array<{
        id: string;
        thread_id: string;
        role: "user" | "assistant" | "system";
        content: string;
        created_at: string;
        helpful?: boolean | null;
        saved?: boolean | null;
      }>
    | null = null;

  const rich = await u.sb
    .from("ai_messages")
    .select("id, thread_id, role, content, created_at, helpful, saved")
    .eq("user_id", u.userId)
    .in("thread_id", ids)
    .order("created_at", { ascending: true });

  if (rich.error) {
    if (/column|does not exist/i.test(rich.error.message)) {
      const base = await u.sb
        .from("ai_messages")
        .select("id, thread_id, role, content, created_at")
        .eq("user_id", u.userId)
        .in("thread_id", ids)
        .order("created_at", { ascending: true });
      if (base.error) {
        console.error("[listThreads] messages query failed:", base.error);
      } else {
        msgs = base.data;
      }
    } else {
      console.error("[listThreads] messages query failed:", rich.error);
    }
  } else {
    msgs = rich.data;
  }

  const byThread = new Map<string, MessageRow[]>();
  (msgs ?? []).forEach((m) => {
    const arr = byThread.get(m.thread_id) ?? [];
    arr.push({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: new Date(m.created_at),
      helpful: m.helpful ?? null,
      saved: !!m.saved,
    });
    byThread.set(m.thread_id, arr);
  });

  return threads.map((t) => ({
    id: t.id,
    title: t.title,
    stepNumber: t.step_number,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
    messages: byThread.get(t.id) ?? [],
  }));
}

export async function deleteThread(threadId: string): Promise<{ ok: boolean; error?: string }> {
  const u = await requireUser();
  if (!u.ok) return { ok: false, error: "Not signed in." };
  const { error } = await u.sb.from("ai_threads").delete().eq("id", threadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/ask");
  return { ok: true };
}

export async function setMessageHelpful(messageId: string, helpful: boolean | null) {
  const u = await requireUser();
  if (!u.ok) return { ok: false };
  const r = await u.sb.from("ai_messages").update({ helpful }).eq("id", messageId);
  // If the column doesn't exist yet (pre-migration-0004 deployments),
  // silently degrade — the UI optimism already stuck on the client.
  if (r.error && !/column|does not exist/i.test(r.error.message)) {
    console.error("[setMessageHelpful]", r.error);
  }
  return { ok: true };
}

export async function setMessageSaved(messageId: string, saved: boolean) {
  const u = await requireUser();
  if (!u.ok) return { ok: false };
  const r = await u.sb.from("ai_messages").update({ saved }).eq("id", messageId);
  if (r.error && !/column|does not exist/i.test(r.error.message)) {
    console.error("[setMessageSaved]", r.error);
  }
  return { ok: true };
}
