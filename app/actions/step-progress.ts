"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { STEPS, TOTAL_STEPS } from "@/lib/steps";
import { pushNotification } from "@/lib/notifications";
import { recomputeReadiness } from "@/lib/recompute-readiness";

export type StepStatusValue = "not_started" | "in_progress" | "complete";

export type StepProgressResult =
  | { ok: true; status: StepStatusValue }
  | { ok: false; error: string; paywall?: boolean };

/**
 * Marks a step's status for the signed-in user.
 * Upserts step_progress and appends a step_activity event.
 */
export async function markStep(
  stepNumber: number,
  status: StepStatusValue,
): Promise<StepProgressResult> {
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > TOTAL_STEPS) {
    return { ok: false, error: "Invalid step number." };
  }
  if (!["not_started", "in_progress", "complete"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  if (!isSupabaseConfigured()) {
    // Dev mock mode — return ok so the UI can still flip; nothing to persist.
    return { ok: true, status };
  }

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "You're not signed in." };
  }
  const userId = userData.user.id;

  // Paywall enforcement — free plan can only complete free steps.
  // We check the user's plan + the step's isFree flag server-side so the
  // UI can't bypass it by calling markStep directly with a paid step.
  if (status === "complete" || status === "in_progress") {
    const step = STEPS.find((s) => s.number === stepNumber);
    if (step && !step.isFree) {
      const { data: profile } = await sb
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .maybeSingle();
      const plan = profile?.plan ?? "free";
      if (plan === "free") {
        return {
          ok: false,
          error: "This step is locked. Upgrade to unlock every phase.",
          paywall: true,
        };
      }
    }
  }

  const now = new Date().toISOString();
  const row: Record<string, string | number> = {
    user_id: userId,
    // supabase/migrations/0002_country_aware.sql dropped the old
    // (user_id, step_number) unique constraint and replaced it with
    // (user_id, country_code, step_number) for the multi-country
    // groundwork. This F-1 (US) playbook always writes country_code
    // "US" — every write here was silently failing the upsert (wrong
    // onConflict target = no matching constraint = Postgres error)
    // until country_code was added below.
    country_code: "US",
    step_number: stepNumber,
    status,
    updated_at: now,
  };
  if (status === "in_progress") row.started_at = now;
  if (status === "complete") {
    row.completed_at = now;
    row.started_at = now;
  }

  const { error: upsertErr } = await sb
    .from("step_progress")
    .upsert(row, { onConflict: "user_id,country_code,step_number" });

  if (upsertErr) return { ok: false, error: upsertErr.message };

  // Best-effort activity log; ignore failure
  await sb.from("step_activity").insert({
    user_id: userId,
    step_number: stepNumber,
    action: status === "complete" ? "completed" : status === "in_progress" ? "started" : "reopened",
  });

  await sb
    .from("profiles")
    .update({ last_active_at: now })
    .eq("id", userId);

  // Fire a real-time notification for the popup. Best-effort, non-blocking.
  if (status === "complete") {
    const step = STEPS.find((s) => s.number === stepNumber);
    void pushNotification({
      userId,
      kind: "step_complete",
      title: `Step ${stepNumber} complete`,
      body: step ? step.title : undefined,
      href: `/dashboard/timeline/${stepNumber}`,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  revalidatePath(`/dashboard/timeline/${stepNumber}`);
  revalidatePath("/dashboard/feedback");

  // Fire-and-forget readiness recompute. Safe before the Edge Function
  // is deployed — the helper swallows the error.
  void recomputeReadiness();

  return { ok: true, status };
}
