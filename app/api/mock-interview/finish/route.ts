import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { recomputeReadiness } from "@/lib/recompute-readiness";
import { pushNotification } from "@/lib/notifications";

type Turn = {
  question: string;
  answer: string;
  feedback?: { worked: string; fix: string; better: string };
};

type FinishPayload = {
  sessionId?: string;
  scenario?: string;
  difficulty?: "standard" | "tough";
  officerStyle?: "friendly" | "skeptical" | "rushed";
  turns: Turn[];
};

/**
 * POST /api/mock-interview/finish
 *
 * Computes the overall scorecard (clarity / confidence / red-flag) using
 * Groq across all turns, persists mock_interview_sessions row, returns scores.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<FinishPayload>;
  const turns = body.turns ?? [];
  if (turns.length === 0) {
    return NextResponse.json({ ok: false, error: "No turns to score." }, { status: 400 });
  }

  let userId: string | null = null;
  let plan: "free" | "solo" | "family" = "free";

  if (isSupabaseConfigured()) {
    const sb = await getServerSupabase();
    if (sb) {
      const { data: userData } = await sb.auth.getUser();
      if (userData.user) {
        userId = userData.user.id;
        const { data: profileRow } = await sb
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .maybeSingle();
        plan = (profileRow?.plan as "free" | "solo" | "family") ?? "free";
      }
    }
  }

  const rawScores = await computeOverall(turns, body.officerStyle, body.difficulty);
  // Strict-mode penalty: vague answers on financial / ties questions
  // take a measurable hit before the scores reach the client. Applied
  // here (not in Groq) so the deduction is deterministic and visible
  // in the DB row too.
  const scores =
    body.difficulty === "tough"
      ? applyStrictPenalty(rawScores, turns)
      : rawScores;

  if (userId && plan !== "free") {
    const sb = await getServerSupabase();
    if (sb) {
      // Legacy table — preserved for the existing dashboard surfaces.
      await sb.from("mock_interview_sessions").insert({
        user_id: userId,
        ended_at: new Date().toISOString(),
        overall_score: scores.overall,
        transcript: turns,
        feedback: scores,
      });

      // Resolve country for the new richer schema row.
      const { data: sel } = await sb
        .from("user_country_selection")
        .select("country_code")
        .eq("user_id", userId)
        .maybeSingle();
      const countryCode = (sel?.country_code as string | undefined) ?? "US";

      // Derive the four sub-category scores from the legacy three-axis
      // scorecard. TODO(post-launch): replace with a per-category prompt
      // that grades study_plan / financials / ties / confidence directly.
      const studyPlanScore = scores.clarity;
      const tiesScore = scores.redFlag;
      const financialsScore = Math.round((scores.clarity + scores.redFlag) / 2);
      const confidenceScore = scores.confidence;
      const verdict: "ready" | "almost_ready" | "needs_work" =
        scores.overall >= 80 ? "ready"
        : scores.overall >= 60 ? "almost_ready" : "needs_work";

      const { data: sessionRow } = await sb
        .from("interview_sessions")
        .insert({
          user_id: userId,
          country_code: countryCode,
          completed_at: new Date().toISOString(),
          total_questions: turns.length,
          questions_answered: turns.filter((t) => t.answer && t.answer.length > 0).length,
          overall_score: scores.overall,
          study_plan_score: studyPlanScore,
          financial_credibility_score: financialsScore,
          ties_to_home_score: tiesScore,
          confidence_score: confidenceScore,
          ai_summary: scores.summary,
          ai_verdict: verdict,
        })
        .select("id")
        .single();

      // Per-answer rows. Without per-question categorical scoring we
      // store the legacy feedback object's fix/worked text.
      if (sessionRow?.id) {
        const answerRows = turns.map((t) => ({
          session_id: sessionRow.id,
          question_text: t.question,
          answer_transcript: t.answer,
          score: null,
          category: null,
          ai_feedback: t.feedback?.fix ?? null,
          red_flags_triggered: [] as string[],
          strong_signals: t.feedback?.worked ? [t.feedback.worked] : [],
        }));
        if (answerRows.length > 0) {
          await sb.from("interview_answers").insert(answerRows);
        }
      }

      // Fire-and-forget readiness recompute.
      void recomputeReadiness();

      // Notify the user with their score. Tone follows the verdict so
      // a strong run reads as a win and a weak one reads as actionable.
      const verdictBody =
        verdict === "ready"
          ? "Officer-ready. Save this score and walk in."
          : verdict === "almost_ready"
            ? "Almost there. One more mock to lock it in."
            : "A few weak spots — review the fixes and run it again.";
      void pushNotification({
        userId,
        kind: verdict === "ready" ? "step_complete" : "doc_attention",
        title: `Mock interview · ${scores.overall}/100`,
        body: verdictBody,
        href: "/dashboard/mock-interview",
      });
    }
  }

  return NextResponse.json({ ok: true, scores });
}

async function computeOverall(
  turns: Turn[],
  officerStyle?: string,
  difficulty?: string,
): Promise<{
  clarity: number;
  confidence: number;
  redFlag: number;
  overall: number;
  summary: string;
  topStrength: string;
  topWeakness: string;
}> {
  const groq = getGroq();
  if (!groq) return heuristicOverall(turns);

  const transcript = turns
    .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
    .join("\n\n");

  const toneInstruction =
    difficulty === "tough"
      ? "You are a STRICT consular officer. Be direct and critical. Do not soften wording. Penalize vague answers on FINANCIAL story and TIES-TO-HOME especially heavily — lower the redFlag axis sharply when the user cannot name specific numbers, sponsors, or anchors."
      : "You are reviewing a mock interview constructively. Be encouraging where it's warranted, honest where it isn't.";

  const system = `You are a US F-1 visa officer reviewing a full mock interview.
Return STRICT JSON only:
{
  "clarity": <0-100>,
  "confidence": <0-100>,
  "redFlag": <0-100, where 100 = no red flags, 0 = severe red flags>,
  "overall": <0-100>,
  "summary": "1 sentence overall verdict, max 24 words",
  "topStrength": "1 sentence, max 18 words",
  "topWeakness": "1 sentence, max 18 words"
}
${toneInstruction}
Officer style: ${officerStyle ?? "friendly"}. Difficulty: ${difficulty ?? "standard"}.
Scoring guidance:
- Clarity: how directly each answer addressed the question, first-sentence anchoring.
- Confidence: definite verbs, no hedging, no filler.
- Red-flag: weak ties home, funding gaps, evasive answers — lower score = worse.
- Overall: weighted average, lean toward red-flag.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: transcript },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<{
      clarity: number;
      confidence: number;
      redFlag: number;
      overall: number;
      summary: string;
      topStrength: string;
      topWeakness: string;
    }>;
    const fallback = heuristicOverall(turns);
    return {
      clarity: clamp(parsed.clarity ?? fallback.clarity),
      confidence: clamp(parsed.confidence ?? fallback.confidence),
      redFlag: clamp(parsed.redFlag ?? fallback.redFlag),
      overall: clamp(parsed.overall ?? fallback.overall),
      summary: parsed.summary ?? fallback.summary,
      topStrength: parsed.topStrength ?? fallback.topStrength,
      topWeakness: parsed.topWeakness ?? fallback.topWeakness,
    };
  } catch (err) {
    console.error("[mock-interview/finish] groq error:", err);
    return heuristicOverall(turns);
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/* Strict-mode score adjustment.
   Walks the turns, finds financial- and ties-to-home-shaped questions
   whose answer reads vague (< 50 chars), and deducts a 10–15 pt penalty
   from the redFlag axis (which the client maps onto the "consistency" /
   "financial" surfaces) plus a smaller hit to overall. Caps each axis
   at one penalty event so a single vague turn can't tank the whole
   scorecard. */
function applyStrictPenalty<
  T extends {
    clarity: number;
    confidence: number;
    redFlag: number;
    overall: number;
    summary: string;
    topStrength: string;
    topWeakness: string;
  }
>(scores: T, turns: Turn[]): T {
  let financialHit = 0;
  let tiesHit = 0;
  for (const t of turns) {
    const q = (t.question ?? "").toLowerCase();
    const len = (t.answer ?? "").trim().length;
    if (len >= 50) continue;
    if (/fund|financ|sponsor|tuition|bank|loan|money|cost|salary/.test(q)) {
      financialHit = Math.max(financialHit, 13);
    }
    if (/\bties?\b|home country|return|parents|propert|family|relativ/.test(q)) {
      tiesHit = Math.max(tiesHit, 12);
    }
  }
  if (financialHit === 0 && tiesHit === 0) return scores;
  const flagPenalty = Math.max(financialHit, tiesHit);
  const overallPenalty = Math.round((financialHit + tiesHit) / 2);
  return {
    ...scores,
    redFlag: clamp(scores.redFlag - flagPenalty),
    overall: clamp(scores.overall - overallPenalty),
  };
}

function heuristicOverall(turns: Turn[]) {
  const lens = turns.map((t) => t.answer.length).filter((l) => l > 0);
  const avgLen = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const clarity = Math.min(95, Math.max(35, Math.round(avgLen / 3)));
  const confidence = Math.min(92, Math.max(40, clarity - 5));
  const redFlag = Math.min(94, Math.max(50, clarity + 8));
  const overall = Math.round((clarity + confidence + redFlag) / 3);
  return {
    clarity,
    confidence,
    redFlag,
    overall,
    summary: "Solid foundation. Tighten the funding story before interview day.",
    topStrength: "Direct first-sentence anchoring on most questions.",
    topWeakness: "Funding answers lacked specificity on amounts and sources.",
  };
}
