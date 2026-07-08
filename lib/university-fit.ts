import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Best-effort read for the university-fit quiz (migration
 * 0014_university_fit.sql). Same isolation pattern as
 * lib/prior-refusal.ts / lib/recompute-readiness.ts: never throws,
 * degrades to "no quiz answers yet" if the migration hasn't run.
 */

export type UniversityFitQuiz = {
  intendedField: string | null;
  targetDegreeLevel: string | null;
  budgetCeilingUsd: number | null;
  academicScores: string | null;
  careerGoal: string | null;
  completedAt: string | null;
};

const EMPTY_QUIZ: UniversityFitQuiz = {
  intendedField: null,
  targetDegreeLevel: null,
  budgetCeilingUsd: null,
  academicScores: null,
  careerGoal: null,
  completedAt: null,
};

export async function getUniversityFitQuiz(userId: string): Promise<UniversityFitQuiz> {
  if (!isSupabaseConfigured()) return EMPTY_QUIZ;
  try {
    const sb = await getServerSupabase();
    if (!sb) return EMPTY_QUIZ;
    const { data, error } = await sb
      .from("profiles")
      .select("uf_intended_field, uf_target_degree_level, uf_budget_ceiling_usd, uf_academic_scores, uf_career_goal, uf_completed_at")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      if (error) console.warn("[university-fit] read not available yet:", error.message);
      return EMPTY_QUIZ;
    }
    return {
      intendedField: (data.uf_intended_field as string | null) ?? null,
      targetDegreeLevel: (data.uf_target_degree_level as string | null) ?? null,
      budgetCeilingUsd: (data.uf_budget_ceiling_usd as number | null) ?? null,
      academicScores: (data.uf_academic_scores as string | null) ?? null,
      careerGoal: (data.uf_career_goal as string | null) ?? null,
      completedAt: (data.uf_completed_at as string | null) ?? null,
    };
  } catch (e) {
    console.warn("[university-fit] read threw:", e);
    return EMPTY_QUIZ;
  }
}
