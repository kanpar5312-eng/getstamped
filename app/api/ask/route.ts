import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildSystemPrompt, getGroq, GROQ_MODEL } from "@/lib/groq";
import { stepByNumber } from "@/lib/steps";

type AskPayload = {
  question: string;
  threadId?: string | null;
  scope?: "general" | "step" | "documents" | "interview";
  stepNumber?: number;
};

const FREE_DAILY_LIMIT = 3;

/**
 * POST /api/ask
 *
 *  1. Auth check — must be signed in (otherwise falls back to a canned answer).
 *  2. Plan check — free tier capped at 3 questions per UTC day.
 *  3. Either reuses the provided threadId or creates a new ai_threads row.
 *  4. Inserts the user message into ai_messages.
 *  5. Pulls last 10 messages of context, builds Groq system prompt scoped to
 *     the step/document/interview area, calls llama-3.1-8b-instant.
 *  6. Inserts the assistant reply into ai_messages.
 *  7. Increments today's ai_quota row.
 *  8. Returns { ok, threadId, userMessage, assistantMessage }.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<AskPayload>;
  const q = (body.question ?? "").trim();
  if (!q) {
    return NextResponse.json({ ok: false, error: "Question required." }, { status: 400 });
  }
  if (q.length > 2000) {
    return NextResponse.json({ ok: false, error: "Question too long." }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, answer: fallback(), unauthenticated: true });
  }
  const sb = await getServerSupabase();
  if (!sb) {
    return NextResponse.json({ ok: true, answer: fallback(), unauthenticated: true });
  }

  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ ok: true, answer: fallback(), unauthenticated: true });
  }
  const userId = user.id;

  /* ---------- Quota check ---------- */
  const today = new Date().toISOString().slice(0, 10);
  const { data: profileRow } = await sb
    .from("profiles")
    .select("plan, country, university, consulate, program_type, intake_term")
    .eq("id", userId)
    .maybeSingle();

  const plan = (profileRow?.plan as "free" | "solo" | "family" | undefined) ?? "free";

  if (plan === "free") {
    const { data: quotaRow } = await sb
      .from("ai_quota")
      .select("count")
      .eq("user_id", userId)
      .eq("day", today)
      .maybeSingle();
    const used = quotaRow?.count ?? 0;
    if (used >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          ok: false,
          error: "Free tier limit reached. Upgrade for unlimited.",
          quota: { used, limit: FREE_DAILY_LIMIT },
        },
        { status: 429 },
      );
    }
  }

  /* ---------- Resolve or create thread ---------- */
  let threadId: string | null = body.threadId ?? null;
  const stepNumber = body.stepNumber ?? null;

  if (!threadId) {
    const title = q.length > 60 ? q.slice(0, 60).trim() + "…" : q;
    const { data: newThread, error: threadErr } = await sb
      .from("ai_threads")
      .insert({ user_id: userId, title, step_number: stepNumber })
      .select("id")
      .single();
    if (threadErr || !newThread) {
      return NextResponse.json(
        { ok: false, error: threadErr?.message ?? "Could not create thread." },
        { status: 500 },
      );
    }
    threadId = newThread.id as string;
  } else {
    await sb.from("ai_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
  }

  /* ---------- Persist user message ---------- */
  const { data: userMsg, error: userMsgErr } = await sb
    .from("ai_messages")
    .insert({ thread_id: threadId, user_id: userId, role: "user", content: q })
    .select("id, created_at")
    .single();
  if (userMsgErr || !userMsg) {
    return NextResponse.json(
      { ok: false, error: userMsgErr?.message ?? "Could not save message." },
      { status: 500 },
    );
  }

  /* ---------- Pull recent context (last 10 messages in thread) ---------- */
  const { data: contextRows } = await sb
    .from("ai_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(10);
  const contextMsgs = (contextRows ?? []).reverse().map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  /* ---------- Call Groq ---------- */
  const step = stepNumber ? stepByNumber(stepNumber) : null;
  const system = buildSystemPrompt({
    scope: body.scope,
    stepNumber: stepNumber ?? undefined,
    stepTitle: step?.title,
    profile: profileRow ?? undefined,
  });

  const groq = getGroq();
  let answer = "";
  if (!groq) {
    answer = fallback();
  } else {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 600,
        messages: [
          { role: "system", content: system },
          ...contextMsgs.map((m) => ({ role: m.role, content: m.content })),
        ],
      });
      answer = completion.choices[0]?.message?.content?.trim() || fallback();
    } catch (err) {
      console.error("[ask] groq error:", err);
      answer = fallback();
    }
  }

  /* ---------- Persist assistant message ---------- */
  const { data: aiMsg } = await sb
    .from("ai_messages")
    .insert({ thread_id: threadId, user_id: userId, role: "assistant", content: answer })
    .select("id, created_at")
    .single();

  /* ---------- Bump quota (manual upsert; no RPC required) ---------- */
  const { data: existing } = await sb
    .from("ai_quota")
    .select("count")
    .eq("user_id", userId)
    .eq("day", today)
    .maybeSingle();
  if (existing) {
    await sb
      .from("ai_quota")
      .update({ count: (existing.count ?? 0) + 1 })
      .eq("user_id", userId)
      .eq("day", today);
  } else {
    await sb.from("ai_quota").insert({ user_id: userId, day: today, count: 1 });
  }

  return NextResponse.json({
    ok: true,
    threadId,
    userMessage: { id: userMsg.id, createdAt: userMsg.created_at },
    assistantMessage: {
      id: aiMsg?.id ?? null,
      content: answer,
      createdAt: aiMsg?.created_at ?? null,
    },
  });
}

function fallback(): string {
  return (
    "I can't reach my reasoning engine right now — please try again in a moment. " +
    "In the meantime, the most reliable place for visa-specific timing and fees is **travel.state.gov** and the consulate's own website."
  );
}
