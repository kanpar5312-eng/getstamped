import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { getStudentFeedback } from "@/lib/feedback-data";

export const runtime = "nodejs";

/**
 * GET /api/feedback/priority-actions
 *
 * Returns exactly 3 prioritised actions for the signed-in student.
 *
 * Robustness contract — the UI must NEVER see fewer than 3 actions or
 * malformed shapes:
 *   1. Groq is called with response_format json_object.
 *   2. JSON.parse wrapped in try/catch.
 *   3. Shape validated (array of 3, every field present, types right).
 *   4. ANY failure path returns FALLBACK_ACTIONS verbatim.
 *
 * Errors are logged for diagnostics but never thrown to the client.
 */

export type PriorityAction = {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  estimated_minutes: number;
};

// Hardcoded safe defaults. Ordered so the most universally useful action
// is first. Used whenever Groq fails, returns junk, or is unavailable.
const FALLBACK_ACTIONS: PriorityAction[] = [
  {
    priority: 1,
    title: "Run a 5-question mock interview",
    description:
      "Pick any 5 questions from the bank and answer them out loud. Even one session sharpens delivery and exposes weak spots fast.",
    impact: "Interview readiness",
    effort: "low",
    estimated_minutes: 15,
  },
  {
    priority: 2,
    title: "Verify your top 3 financial documents",
    description:
      "Upload the latest bank statements, sponsor letter, and SEVIS receipt. The vault catches missing signatures and stale dates before the officer does.",
    impact: "Document health",
    effort: "low",
    estimated_minutes: 20,
  },
  {
    priority: 3,
    title: "Complete the next checklist step",
    description:
      "Open your playbook and check off the next ordered step. Small wins compound — completion is the largest weighted readiness factor.",
    impact: "Playbook progress",
    effort: "medium",
    estimated_minutes: 30,
  },
];

function isValidAction(a: unknown): a is PriorityAction {
  if (!a || typeof a !== "object") return false;
  const o = a as Record<string, unknown>;
  return (
    typeof o.title === "string" && o.title.length > 0 &&
    typeof o.description === "string" && o.description.length > 0 &&
    typeof o.impact === "string" &&
    (o.effort === "low" || o.effort === "medium" || o.effort === "high") &&
    typeof o.estimated_minutes === "number" &&
    (o.priority === 1 || o.priority === 2 || o.priority === 3)
  );
}

export async function GET() {
  const sb = await getServerSupabase();
  if (!sb) {
    return NextResponse.json({ actions: FALLBACK_ACTIONS });
  }
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ actions: FALLBACK_ACTIONS });
  }

  const feedback = await getStudentFeedback();
  if (!feedback) {
    return NextResponse.json({ actions: FALLBACK_ACTIONS });
  }

  // Resolve country / visa-type for the prompt
  const { data: sel } = await sb
    .from("user_country_selection")
    .select("country_code")
    .eq("user_id", user.id)
    .maybeSingle();
  let countryName = "United States";
  let visaType = "F-1 Student Visa";
  if (sel?.country_code) {
    const { data: c } = await sb
      .from("visa_countries")
      .select("name, visa_type")
      .eq("code", sel.country_code)
      .maybeSingle();
    if (c?.name) countryName = c.name as string;
    if (c?.visa_type) visaType = c.visa_type as string;
  }

  const groq = getGroq();
  if (!groq) {
    return NextResponse.json({ actions: FALLBACK_ACTIONS });
  }

  const { snapshot, docReviews, sessions } = feedback;
  const failedDocs = docReviews
    .filter((d) => !d.passed)
    .map((d) => d.document_display_name)
    .slice(0, 6);

  // Weakest interview category across all sessions
  let weakestCat = "n/a";
  let weakestScore = 100;
  for (const s of sessions) {
    const pairs: [string, number | null][] = [
      ["study_plan", s.study_plan_score ?? null],
      ["financials", s.financial_credibility_score ?? null],
      ["ties_to_home", s.ties_to_home_score ?? null],
      ["confidence", s.confidence_score ?? null],
    ];
    for (const [cat, score] of pairs) {
      if (score != null && score < weakestScore) {
        weakestCat = cat;
        weakestScore = score;
      }
    }
  }

  const system = `You are a visa preparation advisor for a student applying for a ${visaType} to ${countryName}.

Here is their current status:
- Steps completed: ${snapshot.steps_completed} of ${snapshot.steps_total}
- Documents passed: ${snapshot.documents_passed} of ${snapshot.documents_total}
- Failed documents: ${failedDocs.length ? failedDocs.join(", ") : "none"}
- Best interview score: ${snapshot.best_interview_score ?? "no sessions yet"} / 100
- Weakest interview category: ${weakestCat}${weakestScore < 100 ? ` at ${weakestScore}/100` : ""}
- Interview sessions completed: ${snapshot.interview_sessions_count}
- Readiness label: ${snapshot.readiness_label}

Generate exactly 3 priority actions they should take THIS WEEK to improve their visa approval chances. Each action must be specific, actionable, and reference their actual data above.

Respond ONLY in this JSON format, no preamble:
{
  "actions": [
    {
      "priority": 1,
      "title": "short action title",
      "description": "specific 2-sentence instruction",
      "impact": "which readiness component this improves",
      "effort": "low",
      "estimated_minutes": 20
    }
  ]
}
"effort" must be "low" | "medium" | "high". Provide exactly 3 actions.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch {
      console.error("[priority-actions] groq returned non-JSON:", raw.slice(0, 240));
      return NextResponse.json({ actions: FALLBACK_ACTIONS });
    }
    const actions = (parsed as { actions?: unknown }).actions;
    if (!Array.isArray(actions) || actions.length < 3 || !actions.slice(0, 3).every(isValidAction)) {
      console.error("[priority-actions] groq returned malformed actions:", actions);
      return NextResponse.json({ actions: FALLBACK_ACTIONS });
    }
    return NextResponse.json({
      actions: (actions.slice(0, 3) as PriorityAction[]).map((a, i) => ({
        ...a,
        priority: (i + 1) as 1 | 2 | 3,
      })),
    });
  } catch (e) {
    console.error("[priority-actions] groq error:", e);
    return NextResponse.json({ actions: FALLBACK_ACTIONS });
  }
}
