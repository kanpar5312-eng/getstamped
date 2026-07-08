"use server";

import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type UniversityFitPatch = {
  intendedField: string;
  targetDegreeLevel: string;
  budgetCeilingUsd: number | null;
  academicScores: string;
  careerGoal: string;
};

export type UniversityFitResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Isolated write for the university-fit quiz — same reasoning as
 * app/actions/prior-refusal.ts: its own query against its own migration
 * (0014_university_fit.sql), so a database that hasn't been migrated yet
 * fails just this one save, not the rest of Settings/onboarding.
 */
export async function saveUniversityFitQuiz(patch: UniversityFitPatch): Promise<UniversityFitResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured. Add Supabase keys to enable saving." };
  }

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "You're not signed in." };
  }

  try {
    const { error } = await sb
      .from("profiles")
      .update({
        uf_intended_field: patch.intendedField || null,
        uf_target_degree_level: patch.targetDegreeLevel || null,
        uf_budget_ceiling_usd: patch.budgetCeilingUsd,
        uf_academic_scores: patch.academicScores || null,
        uf_career_goal: patch.careerGoal || null,
        uf_completed_at: new Date().toISOString(),
      })
      .eq("id", userData.user.id);

    if (error) {
      console.warn("[university-fit] write not available yet:", error.message);
      return { ok: false, error: "Couldn't save yet — this feature is still rolling out. Try again shortly." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[university-fit] write threw:", e);
    return { ok: false, error: "Couldn't save yet — this feature is still rolling out. Try again shortly." };
  }
}
