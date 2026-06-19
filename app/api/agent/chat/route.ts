/* ════════════════════════════════════════════════════════════════════════════
   POST /api/agent/chat

   Conversational endpoint for the dashboard AskPanel that can EITHER answer
   with text OR propose an action for the user to confirm.

   Flow:
   1. Auth-check the user. Anonymous users fall back to the read-only ask
      endpoint's behavior (text only, no actions).
   2. Build the system prompt from lib/groq and append agent-specific
      instructions (use tools, ask only when needed).
   3. Call Groq with AGENT_TOOLS available.
   4. If the model returns a tool_call, validate the args via buildAction.
      Valid → respond { kind: "action", action }.
      Invalid → respond with a text fallback explaining the misfire.
   5. Otherwise return { kind: "text", text }.

   Mutations DO NOT happen here. Confirmation lives at /api/agent/confirm.
   ═════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { buildSystemPrompt, getGroq } from "@/lib/groq";
import { stepByNumber } from "@/lib/steps";
import { AGENT_TOOLS, buildAction, type AgentAction } from "@/lib/agent/tools";

type Msg = { role: "user" | "assistant"; content: string };

type ChatPayload = {
  messages: Msg[];
  pageContext?: {
    pathname?: string;
    stepNumber?: number;
  };
};

// Tool-calling needs a larger model than the 8b used for plain Q&A. Llama 3.3
// 70B on Groq is still ~sub-second and reliable about emitting valid args.
const AGENT_MODEL = "llama-3.3-70b-versatile";

const AGENT_INSTRUCTIONS = `You are Vera, in your hands-on dashboard mode. You have THREE tools you can call:

• navigate — take the user to a part of their dashboard.
• mark_step_done — mark one of the 47 F-1 prep steps complete after they confirm they did it.
• set_interview_date — save the visa interview date to their profile.

Rules:
- Use a tool only when the user's intent is unambiguous. If they say "I finished the DS-160", call mark_step_done with the right step number. If they ask "what's the DS-160?", answer in plain text instead.
- Never invent step numbers. The 47 steps are fixed; if unsure which step they mean, ask one short clarifying question instead of guessing.
- Don't chain tools. Propose one action; the user confirms; you can propose another next turn.
- For mark_step_done and set_interview_date you must NOT confirm in text — the UI shows a Yes/Cancel card after you propose. Just say what you're about to do in one sentence.
- For navigation, never explain how to click — just call navigate.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<ChatPayload>;
  const inputMessages = Array.isArray(body.messages) ? body.messages : [];
  if (inputMessages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "messages required" },
      { status: 400 },
    );
  }

  const groq = getGroq();
  if (!groq) {
    return NextResponse.json({
      ok: true,
      kind: "text",
      text: "The AI engine is offline. Try again in a moment.",
    });
  }

  // Optional auth — we still answer for signed-out users, just without tools
  // that would write to their profile. The client never shows AskPanel to
  // anonymous users, but defense in depth costs us nothing here.
  let profileRow: {
    plan?: string;
    country?: string;
    university?: string;
    consulate?: string;
    program_type?: string;
    intake_term?: string;
  } | null = null;
  let authed = false;
  if (isSupabaseConfigured()) {
    const sb = await getServerSupabase();
    if (sb) {
      const { data: u } = await sb.auth.getUser();
      if (u.user) {
        authed = true;
        const { data: p } = await sb
          .from("profiles")
          .select("plan, country, university, consulate, program_type, intake_term")
          .eq("id", u.user.id)
          .maybeSingle();
        profileRow = p ?? null;
      }
    }
  }

  const step = body.pageContext?.stepNumber
    ? stepByNumber(body.pageContext.stepNumber)
    : null;
  const baseSystem = buildSystemPrompt({
    scope: body.pageContext?.stepNumber ? "step" : "general",
    stepNumber: body.pageContext?.stepNumber,
    stepTitle: step?.title,
    profile: profileRow ?? undefined,
  });

  const pageHint = body.pageContext?.pathname
    ? `\n\nThe user is currently on: ${body.pageContext.pathname}`
    : "";

  const messages = [
    { role: "system" as const, content: `${baseSystem}\n\n${AGENT_INSTRUCTIONS}${pageHint}` },
    ...inputMessages.slice(-12), // last 12 exchanges is plenty
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: AGENT_MODEL,
      temperature: 0.3,
      max_tokens: 500,
      messages,
      tools: authed ? [...AGENT_TOOLS] : [AGENT_TOOLS[0]], // anon can only navigate
      tool_choice: "auto",
    });

    const choice = completion.choices[0]?.message;
    const toolCalls = choice?.tool_calls ?? [];

    if (toolCalls.length > 0) {
      const call = toolCalls[0];
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }
      const action: AgentAction | null = buildAction(call.function.name, args);
      if (action) {
        return NextResponse.json({ ok: true, kind: "action", action });
      }
      return NextResponse.json({
        ok: true,
        kind: "text",
        text: "I almost did that — but I need one more detail. Could you rephrase?",
      });
    }

    const text = (choice?.content ?? "").trim();
    return NextResponse.json({
      ok: true,
      kind: "text",
      text: text || "I'm not sure how to help with that yet. Try rephrasing?",
    });
  } catch (err) {
    console.error("[agent/chat] groq error:", err);
    return NextResponse.json({
      ok: true,
      kind: "text",
      text: "I hit a snag reaching my reasoning engine. Try again in a moment.",
    });
  }
}
