import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGroq, GROQ_MODEL } from "@/lib/groq";

type ScorePayload = {
  question: string;
  answer: string;
  scenario?: string;
  officerStyle?: "friendly" | "skeptical" | "rushed";
  difficulty?: "standard" | "tough";
};

/**
 * POST /api/mock-interview/score
 *
 * Returns per-answer feedback as { worked, fix, better } using Groq.
 * Free tier denied (paywalled).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<ScorePayload>;
  const question = (body.question ?? "").trim();
  const answer = (body.answer ?? "").trim();
  if (!question) {
    return NextResponse.json({ ok: false, error: "Question required." }, { status: 400 });
  }

  // Quick degenerate cases (skip / silence) — bypass Groq
  if (
    !answer ||
    answer.length < 8 ||
    answer.includes("(skipped)") ||
    answer.includes("(no audio")
  ) {
    return NextResponse.json({
      ok: true,
      feedback: {
        worked: "You didn't ramble.",
        fix: "Officers expect at least 2 sentences. Silence reads as unprepared.",
        better:
          "I'm pursuing this program because it's the strongest fit for my career goal. My funding is fully documented, and I have a clear plan to return home after graduation.",
      },
    });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Auth not configured." }, { status: 503 });
  }
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "Supabase unavailable." }, { status: 503 });

  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  const { data: profileRow } = await sb
    .from("profiles")
    .select("plan, country, university, consulate, program_type")
    .eq("id", user.id)
    .maybeSingle();
  const plan = (profileRow?.plan as "free" | "solo" | "family") ?? "free";
  if (plan === "free") {
    return NextResponse.json({ ok: false, error: "Mock interview scoring is a paid-plan feature." }, { status: 402 });
  }

  const groq = getGroq();
  if (!groq) {
    return NextResponse.json({
      ok: true,
      feedback: heuristicFeedback(answer),
    });
  }

  const system = `You are a US F-1 visa officer evaluating a mock interview answer.
Be brutal but constructive. Return STRICT JSON with three fields, no prose, no markdown:
{
  "worked": "what was strong (1 sentence, max 18 words)",
  "fix":    "what was weak (1 sentence, max 18 words)",
  "better": "a stronger answer the student should rehearse (2 sentences, max 50 words)"
}
Rules:
- Officers care about: clarity in first sentence, specific program/funding/return-home story, no rambling.
- Penalize vague fluff ("I think", "kind of", "you know"), unsubstantiated funding claims, weak ties home.
- Reward: a one-sentence direct answer, a concrete fact, then a why.
- The "better" rewrite must be in the student's voice, not generic.`;

  const userMsg = `Scenario: ${body.scenario ?? "bachelors"} · Officer style: ${body.officerStyle ?? "friendly"} · Difficulty: ${body.difficulty ?? "standard"}.

QUESTION: ${question}

STUDENT'S ANSWER: ${answer}

Respond with the JSON object only.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 350,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<{ worked: string; fix: string; better: string }>;
    return NextResponse.json({
      ok: true,
      feedback: {
        worked: parsed.worked ?? "Direct and on-topic.",
        fix: parsed.fix ?? "Tighten the second half.",
        better: parsed.better ?? heuristicFeedback(answer).better,
      },
    });
  } catch (err) {
    console.error("[mock-interview/score] groq error:", err);
    return NextResponse.json({ ok: true, feedback: heuristicFeedback(answer) });
  }
}

function heuristicFeedback(answer: string): { worked: string; fix: string; better: string } {
  return {
    worked: "Direct and on-topic. The first sentence answered the question.",
    fix: "Trim filler words and tighten the second half.",
    better:
      "I chose this program for the faculty's work in my field and a specific capstone opportunity. My parents are sponsoring me, with documented bank statements covering year-1 expenses.",
  };
}
