import "server-only";

/**
 * Feedback / readiness server data accessors.
 *
 * Two surfaces consume this:
 *   - /dashboard/feedback  (full data — student's eyes only)
 *   - /parent/[token]      (curated summary via getParentSummary)
 *
 * The parent summary intentionally lives in this file too so the leak-
 * prevention boundary is enforced by an explicit allowlist function
 * rather than by hoping the consumer asks for the right fields.
 */

import { getServerSupabase } from "@/lib/supabase/server";
import { STEPS, PHASE_META } from "@/lib/steps";

export type ReadinessLabel =
  | "not_started" | "early" | "in_progress" | "almost_ready" | "ready";

export type ReadinessSnapshot = {
  steps_completed: number;
  steps_total: number;
  documents_passed: number;
  documents_total: number;
  best_interview_score: number | null;
  interview_sessions_count: number;
  overall_readiness_score: number;
  readiness_label: ReadinessLabel;
  snapshot_at: string | null;
};

export type DocReview = {
  document_key: string;
  document_display_name: string;
  passed: boolean;
  issues: string[];
  suggestions: string[];
  reviewed_at: string;
};

export type SessionSummary = {
  id: string;
  created_at: string;
  overall_score: number | null;
  study_plan_score: number | null;
  financial_credibility_score: number | null;
  ties_to_home_score: number | null;
  confidence_score: number | null;
  ai_summary: string | null;
  ai_verdict: "ready" | "almost_ready" | "needs_work" | null;
};

export type SessionAnswer = {
  id: string;
  question_text: string;
  answer_transcript: string | null;
  category: string | null;
  score: number | null;
  ai_feedback: string | null;
  red_flags_triggered: string[];
  strong_signals: string[];
};

export type DocStatus = {
  display_name: string;
  document_key: string;
  status: "passed" | "failed" | "not_reviewed";
};

export type NextStep = { number: number; title: string; phaseName: string; phase: number };

export type StudentFeedback = {
  snapshot: ReadinessSnapshot;
  docReviews: DocReview[];
  documents: DocStatus[];
  sessions: SessionSummary[];
  nextStep: NextStep | null;
  phaseName: string;
  phaseNumber: number;
};

function labelFor(score: number): ReadinessLabel {
  if (score <= 15) return "not_started";
  if (score <= 40) return "early";
  if (score <= 65) return "in_progress";
  if (score <= 85) return "almost_ready";
  return "ready";
}

const STEPS_BY_COUNTRY: Record<string, number> = {
  US: 47, UK: 38, CA: 35, AU: 32, DE: 30,
};

/** Latest snapshot or a zero baseline if none exists yet. */
export async function getStudentFeedback(): Promise<StudentFeedback | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // Resolve country
  const { data: sel } = await sb
    .from("user_country_selection")
    .select("country_code")
    .eq("user_id", user.id)
    .maybeSingle();
  const countryCode = (sel?.country_code as string | undefined) ?? "US";
  const stepsTotal = STEPS_BY_COUNTRY[countryCode] ?? 47;

  // Most recent snapshot
  const { data: snapRow } = await sb
    .from("preparation_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Live counts as a fallback when no snapshot exists yet
  const { count: completedCount } = await sb
    .from("step_progress")
    .select("step_number", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "complete");
  const stepsCompleted = completedCount ?? 0;

  const { data: docList } = await sb
    .from("visa_documents")
    .select("document_key, display_name")
    .eq("country_code", countryCode);
  const docsTotal = docList?.length ?? 0;

  const { data: rawReviews } = await sb
    .from("document_review_results")
    .select("document_key, document_display_name, passed, issues, suggestions, reviewed_at")
    .eq("user_id", user.id)
    .order("reviewed_at", { ascending: false });

  // Collapse to latest review per document_key
  const latestByKey = new Map<string, DocReview>();
  for (const r of rawReviews ?? []) {
    const key = r.document_key as string;
    if (!latestByKey.has(key)) {
      latestByKey.set(key, {
        document_key: key,
        document_display_name: (r.document_display_name as string) ?? key,
        passed: Boolean(r.passed),
        issues: (r.issues as string[] | null) ?? [],
        suggestions: (r.suggestions as string[] | null) ?? [],
        reviewed_at: (r.reviewed_at as string) ?? new Date().toISOString(),
      });
    }
  }
  const docReviews = Array.from(latestByKey.values());
  const docsPassed = docReviews.filter((d) => d.passed).length;

  // Document checklist row union: known countries' docs + their review state
  const documents: DocStatus[] = (docList ?? []).map((d) => {
    const review = latestByKey.get(d.document_key as string);
    return {
      document_key: d.document_key as string,
      display_name: (d.display_name as string) ?? (d.document_key as string),
      status: review ? (review.passed ? "passed" : "failed") : "not_reviewed",
    };
  });

  // Interview sessions (latest 25)
  const { data: sessionRows } = await sb
    .from("interview_sessions")
    .select(
      "id, created_at, overall_score, study_plan_score, financial_credibility_score, ties_to_home_score, confidence_score, ai_summary, ai_verdict",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);
  const sessions: SessionSummary[] = (sessionRows ?? []) as SessionSummary[];
  const interviewCount = sessions.length;
  const bestScore = sessions
    .map((s) => s.overall_score ?? 0)
    .reduce((m, v) => Math.max(m, v), 0);

  // Snapshot, with fallback baseline if Edge Function hasn't run yet.
  const overall =
    (snapRow?.overall_readiness_score as number | undefined) ??
    Math.round(
      (stepsTotal > 0 ? (stepsCompleted / stepsTotal) * 40 : 0) +
      (docsTotal > 0 ? (docsPassed / docsTotal) * 35 : 0) +
      (bestScore / 100) * 25,
    );

  const snapshot: ReadinessSnapshot = {
    steps_completed: (snapRow?.steps_completed as number | undefined) ?? stepsCompleted,
    steps_total: (snapRow?.steps_total as number | undefined) ?? stepsTotal,
    documents_passed: (snapRow?.documents_passed as number | undefined) ?? docsPassed,
    documents_total: (snapRow?.documents_total as number | undefined) ?? docsTotal,
    best_interview_score:
      (snapRow?.best_interview_score as number | null | undefined) ??
      (bestScore || null),
    interview_sessions_count:
      (snapRow?.interview_sessions_count as number | undefined) ?? interviewCount,
    overall_readiness_score: overall,
    readiness_label:
      (snapRow?.readiness_label as ReadinessLabel | undefined) ?? labelFor(overall),
    snapshot_at: (snapRow?.snapshot_at as string | undefined) ?? null,
  };

  // Next incomplete step — uses the US canonical list as a UI hint. For non-US
  // we still show "Phase X" labels but skip the specific step title.
  let nextStep: NextStep | null = null;
  let phaseName: string = PHASE_META[0].name;
  let phaseNumber = 1;
  if (countryCode === "US") {
    const { data: completedRows } = await sb
      .from("step_progress")
      .select("step_number")
      .eq("user_id", user.id)
      .eq("status", "complete");
    const done = new Set((completedRows ?? []).map((r) => r.step_number as number));
    const candidate = STEPS.find((s) => !done.has(s.number));
    if (candidate) {
      nextStep = {
        number: candidate.number,
        title: candidate.title,
        phaseName: candidate.phaseName,
        phase: candidate.phase,
      };
      phaseName = candidate.phaseName;
      phaseNumber = candidate.phase;
    }
  }

  return {
    snapshot,
    docReviews,
    documents,
    sessions,
    nextStep,
    phaseName,
    phaseNumber,
  };
}

/** Per-session answer details — only the session owner can fetch via RLS. */
export async function getSessionAnswers(sessionId: string): Promise<SessionAnswer[]> {
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("interview_answers")
    .select("id, question_text, answer_transcript, category, score, ai_feedback, red_flags_triggered, strong_signals")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return (data as SessionAnswer[] | null) ?? [];
}

/* ─────────────────────────────────────────────────────────────────────
   PARENT VIEW — zero-leak boundary.
   This is the ONLY function that returns parent-visible data. Do NOT
   add a raw text field here without auditing. Specifically forbidden:
     - answer_transcript     (raw what-the-student-said)
     - ai_feedback           (raw rubric feedback)
     - red_flags_triggered   (specific failures)
     - strong_signals        (specific praise)
     - issues / suggestions  (raw doc review text)
     - category sub-scores   (study_plan_score, etc.)
   The parent gets aggregates, traffic-light colors, and one
   *separately-generated* one-line summary.
   ───────────────────────────────────────────────────────────────────── */

export type TrafficLight = "green" | "amber" | "red";

export type ParentSummary = {
  studentFirstName: string;
  overall_readiness_score: number;
  readiness_label: ReadinessLabel;
  steps_done: number;
  steps_total: number;
  docs_done: number;
  docs_total: number;
  interview_sessions: number;
  best_interview_score: number | null;
  steps_light: TrafficLight;
  documents_light: TrafficLight;
  interview_light: TrafficLight;
  updated_at: string;
};

/**
 * Returns the parent-safe summary for a given student user_id.
 * The /parent/[token] route validates the token, resolves student_id,
 * then calls this. No raw text is ever returned.
 */
export async function getParentSummary(
  studentUserId: string,
): Promise<ParentSummary | null> {
  const sb = await getServerSupabase();
  if (!sb) return null;

  // Profile — only first name
  const { data: profile } = await sb
    .from("profiles")
    .select("first_name")
    .eq("id", studentUserId)
    .maybeSingle();

  // Country
  const { data: sel } = await sb
    .from("user_country_selection")
    .select("country_code")
    .eq("user_id", studentUserId)
    .maybeSingle();
  const countryCode = (sel?.country_code as string | undefined) ?? "US";
  const stepsTotal = STEPS_BY_COUNTRY[countryCode] ?? 47;

  // Latest snapshot (canonical when present)
  const { data: snap } = await sb
    .from("preparation_snapshots")
    .select(
      "snapshot_at, steps_completed, steps_total, documents_passed, documents_total, best_interview_score, interview_sessions_count, overall_readiness_score, readiness_label",
    )
    .eq("user_id", studentUserId)
    .order("snapshot_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Live fallbacks
  const stepsDone = (snap?.steps_completed as number | undefined) ?? 0;
  const docsTotal = (snap?.documents_total as number | undefined) ?? 0;
  const docsDone = (snap?.documents_passed as number | undefined) ?? 0;
  const interviewCount = (snap?.interview_sessions_count as number | undefined) ?? 0;
  const bestScore = (snap?.best_interview_score as number | null | undefined) ?? null;
  const overall = (snap?.overall_readiness_score as number | undefined) ?? 0;
  const label =
    (snap?.readiness_label as ReadinessLabel | undefined) ?? labelFor(overall);

  // Traffic lights — never expose category breakdowns, just colors.
  const stepsPct = stepsTotal > 0 ? stepsDone / stepsTotal : 0;
  const stepsLight: TrafficLight =
    stepsPct >= 0.66 ? "green" : stepsPct >= 0.33 ? "amber" : "red";

  const docsLight: TrafficLight =
    docsTotal === 0 ? "red"
    : docsDone === docsTotal ? "green"
    : docsDone > 0 ? "amber"
    : "red";

  const intLight: TrafficLight =
    (bestScore ?? 0) > 79 ? "green"
    : (bestScore ?? 0) > 59 ? "amber"
    : "red";

  return {
    studentFirstName: (profile?.first_name as string) ?? "your child",
    overall_readiness_score: overall,
    readiness_label: label,
    steps_done: stepsDone,
    steps_total: (snap?.steps_total as number | undefined) ?? stepsTotal,
    docs_done: docsDone,
    docs_total: docsTotal,
    interview_sessions: interviewCount,
    best_interview_score: bestScore,
    steps_light: stepsLight,
    documents_light: docsLight,
    interview_light: intLight,
    updated_at: (snap?.snapshot_at as string | undefined) ?? new Date().toISOString(),
  };
}
