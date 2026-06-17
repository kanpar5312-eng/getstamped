// =====================================================================
// compute_readiness — Supabase Edge Function (Deno runtime).
// ---------------------------------------------------------------------
// Recomputes the caller's preparation_snapshots row from live data.
// Invoked from app code on: step completion, document review, mock
// interview finish. Idempotent — every call upserts the latest snapshot.
//
// Local dev:
//   supabase functions serve compute_readiness --no-verify-jwt
//
// Deploy:
//   supabase functions deploy compute_readiness
//
// Invoke from app:
//   supabase.functions.invoke("compute_readiness")
// =====================================================================

// deno-lint-ignore-file no-explicit-any
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ReadinessLabel =
  | "not_started" | "early" | "in_progress" | "almost_ready" | "ready";

function labelFor(score: number): ReadinessLabel {
  if (score <= 15) return "not_started";
  if (score <= 40) return "early";
  if (score <= 65) return "in_progress";
  if (score <= 85) return "almost_ready";
  return "ready";
}

// Total steps per country — mirrors the counts seeded in 0002.
// TODO(verify-before-launch: 2026-06-17): keep in sync with visa_steps rows.
const STEPS_BY_COUNTRY: Record<string, number> = {
  US: 47, UK: 38, CA: 35, AU: 32, DE: 30,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return json({ ok: false, error: "Missing Authorization header." }, 401);
    }

    // Resolve the caller from the JWT (verify_jwt is on for this function).
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ ok: false, error: "Not signed in." }, 401);
    }

    // Service-role client for the actual writes (bypasses RLS for the
    // service role; we still scope every read/write by user_id).
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Resolve the destination country ────────────────────────────
    const { data: sel } = await admin
      .from("user_country_selection")
      .select("country_code")
      .eq("user_id", user.id)
      .maybeSingle();
    const countryCode = (sel?.country_code as string | undefined) ?? "US";
    const stepsTotal = STEPS_BY_COUNTRY[countryCode] ?? 47;

    // ── Steps completed ────────────────────────────────────────────
    // step_progress uses status='complete' as the "done" sentinel.
    const { count: stepsCompletedCount } = await admin
      .from("step_progress")
      .select("step_number", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("country_code", countryCode)
      .eq("status", "complete");
    const stepsCompleted = stepsCompletedCount ?? 0;

    // ── Documents ──────────────────────────────────────────────────
    const { count: docsTotalCount } = await admin
      .from("visa_documents")
      .select("id", { count: "exact", head: true })
      .eq("country_code", countryCode);
    const docsTotal = docsTotalCount ?? 0;

    // For "documents_passed" we want the latest review row per
    // document_key for the user; count those where passed = true.
    const { data: reviews } = await admin
      .from("document_review_results")
      .select("document_key, passed, reviewed_at")
      .eq("user_id", user.id)
      .order("reviewed_at", { ascending: false });
    const latestPerKey = new Map<string, boolean>();
    for (const r of reviews ?? []) {
      if (!latestPerKey.has(r.document_key as string)) {
        latestPerKey.set(r.document_key as string, Boolean(r.passed));
      }
    }
    let docsPassed = 0;
    for (const passed of latestPerKey.values()) if (passed) docsPassed++;

    // ── Interview sessions ────────────────────────────────────────
    const { data: sessions } = await admin
      .from("interview_sessions")
      .select("overall_score")
      .eq("user_id", user.id)
      .not("overall_score", "is", null);
    const interviewCount = sessions?.length ?? 0;
    const bestScore = (sessions ?? [])
      .map((s) => Number(s.overall_score ?? 0))
      .reduce((m, v) => Math.max(m, v), 0);

    // ── Weighted score ─────────────────────────────────────────────
    const stepsPart = stepsTotal > 0
      ? (stepsCompleted / stepsTotal) * 40 : 0;
    const docsPart = docsTotal > 0
      ? (docsPassed / docsTotal) * 35 : 0;
    const interviewPart = (bestScore / 100) * 25;
    const overall = Math.round(stepsPart + docsPart + interviewPart);
    const label = labelFor(overall);

    // ── Upsert snapshot (insert each time keeps history) ──────────
    const { error: insertErr } = await admin
      .from("preparation_snapshots")
      .insert({
        user_id: user.id,
        steps_completed: stepsCompleted,
        steps_total: stepsTotal,
        documents_passed: docsPassed,
        documents_total: docsTotal,
        best_interview_score: bestScore || null,
        interview_sessions_count: interviewCount,
        overall_readiness_score: overall,
        readiness_label: label,
      });
    if (insertErr) {
      return json({ ok: false, error: insertErr.message }, 500);
    }

    return json({
      ok: true,
      snapshot: {
        steps_completed: stepsCompleted,
        steps_total: stepsTotal,
        documents_passed: docsPassed,
        documents_total: docsTotal,
        best_interview_score: bestScore || null,
        interview_sessions_count: interviewCount,
        overall_readiness_score: overall,
        readiness_label: label,
      },
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
