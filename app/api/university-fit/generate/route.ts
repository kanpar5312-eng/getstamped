import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { getUniversityFitQuiz } from "@/lib/university-fit";

/**
 * POST /api/university-fit/generate
 *
 * Reads the signed-in user's saved quiz answers (lib/university-fit.ts)
 * and returns a personalized shortlist FRAMEWORK — reasoning about
 * program tiers and characteristics, not asserted live facts about named
 * schools. Deliberately does not claim to know current deadlines, exact
 * GPA cutoffs, or fees for any specific university: those change, this
 * has no live data source, and getting one wrong on a $20-60k decision
 * is a real harm, not a UX nitpick. Every specific claim gets pushed to
 * "verify on the official page" instead.
 */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured." }, { status: 400 });
  }
  const sb = await getServerSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "Unavailable." }, { status: 400 });

  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ ok: false, error: "You're not signed in." }, { status: 401 });
  }

  const quiz = await getUniversityFitQuiz(userData.user.id);
  if (!quiz.completedAt) {
    return NextResponse.json(
      { ok: false, error: "Complete the quiz first." },
      { status: 400 },
    );
  }

  const { data: profileRow } = await sb
    .from("profiles")
    .select("country")
    .eq("id", userData.user.id)
    .maybeSingle();
  const homeCountry = (profileRow?.country as string | null) ?? null;

  const result = await generateFramework(quiz, homeCountry);
  return NextResponse.json({ ok: true, result });
}

type FitFramework = {
  summary: string;
  reachTier: string;
  targetTier: string;
  safetyTier: string;
  factorsToVerify: string[];
};

async function generateFramework(
  quiz: Awaited<ReturnType<typeof getUniversityFitQuiz>>,
  homeCountry: string | null,
): Promise<FitFramework> {
  const groq = getGroq();
  if (!groq) return heuristicFramework(quiz);

  const profileLines = [
    quiz.targetDegreeLevel ? `Target degree: ${quiz.targetDegreeLevel}` : null,
    quiz.intendedField ? `Intended field: ${quiz.intendedField}` : null,
    quiz.budgetCeilingUsd ? `Budget ceiling: $${quiz.budgetCeilingUsd}/year` : null,
    quiz.academicScores ? `Academic scores: ${quiz.academicScores}` : null,
    quiz.careerGoal ? `Career goal: ${quiz.careerGoal}` : null,
    homeCountry ? `Home country: ${homeCountry}` : null,
  ].filter(Boolean).join("\n");

  const system = `You are helping an international student build a reach/target/safety university shortlist FRAMEWORK for a US F-1 student visa application.

STRICT RULES — these are not stylistic preferences, they are hard constraints:
- NEVER state a specific admission requirement (exact GPA cutoff, test score cutoff, application deadline, tuition figure, acceptance rate) as a current fact, even for real named universities. These change yearly and you cannot verify them right now.
- You MAY mention real university names as EXAMPLES of a category ("schools like X are known for strong Y programs"), but always frame specifics as "verify on the program's official page," never as confirmed fact.
- Focus on REASONING: what tier of school/program characteristics fit this student's profile, and why — not a definitive list of exact schools to apply to.
- Never imply a specific school will accept this student. Never mention visa approval odds — this tool is about admissions fit, not visa outcome.

Return STRICT JSON only:
{
  "summary": "2-3 sentence overview of this student's realistic positioning, max 50 words",
  "reachTier": "1-2 sentences describing the characteristics of reach-tier programs for this profile, max 45 words",
  "targetTier": "1-2 sentences describing target-tier programs, max 45 words",
  "safetyTier": "1-2 sentences describing safety-tier programs, max 45 words",
  "factorsToVerify": ["3-5 short items, each a specific thing to check on official pages given THIS student's stated budget/field/scores — not generic advice"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: profileLines || "No profile details provided." },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as Partial<FitFramework>;
    const fallback = heuristicFramework(quiz);
    return {
      summary: parsed.summary ?? fallback.summary,
      reachTier: parsed.reachTier ?? fallback.reachTier,
      targetTier: parsed.targetTier ?? fallback.targetTier,
      safetyTier: parsed.safetyTier ?? fallback.safetyTier,
      factorsToVerify: Array.isArray(parsed.factorsToVerify) && parsed.factorsToVerify.length > 0
        ? parsed.factorsToVerify.slice(0, 5)
        : fallback.factorsToVerify,
    };
  } catch (err) {
    console.error("[university-fit/generate] groq error:", err);
    return heuristicFramework(quiz);
  }
}

/** No-Groq / parse-failure fallback — generic but never wrong, since it
 * asserts nothing specific about any school or the student's odds. */
function heuristicFramework(quiz: Awaited<ReturnType<typeof getUniversityFitQuiz>>): FitFramework {
  const field = quiz.intendedField || "your intended field";
  return {
    summary: `Based on what you've shared, build your shortlist across three tiers rather than clustering around name-recognition schools alone. Verify every specific number against each program's official page before applying.`,
    reachTier: `Programs where your profile is below the typical admitted range for ${field} — worth 1-2 slots, not the bulk of your list.`,
    targetTier: `Programs where your scores and budget realistically align with recent admits — this should be the largest tier on your list.`,
    safetyTier: `Programs where you're comfortably above the typical admitted range — include 4-5 here so a bad cycle doesn't leave you with zero offers.`,
    factorsToVerify: [
      "SEVP certification for every school (studyinthestates.dhs.gov)",
      "STEM OPT designation for the specific program, not just the school",
      "Total cost including living expenses against your budget ceiling",
      "Current application deadline and required test scores on the official program page",
      "I-20 issuance timeline from the international student office",
    ],
  };
}
