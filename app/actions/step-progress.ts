"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { TOTAL_STEPS } from "@/lib/steps";

export type StepStatusValue = "not_started" | "in_progress" | "complete";

export type StepProgressResult =
  | { ok: true; status: StepStatusValue }
  | { ok: false; error: string };

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

  const now = new Date().toISOString();
  const row: Record<string, string | number> = {
    user_id: userId,
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
    .upsert(row, { onConflict: "user_id,step_number" });

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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timeline");
  revalidatePath(`/dashboard/timeline/${stepNumber}`);

  return { ok: true, status };
}
