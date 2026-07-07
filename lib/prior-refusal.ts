import "server-only";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Best-effort read/write for the prior-refusal flag (migration
 * 0013_prior_refusal.sql). Mirrors lib/recompute-readiness.ts: every call
 * is wrapped so a missing column (migration not yet applied) degrades to
 * a safe default instead of throwing and breaking the calling page.
 *
 * Deliberately isolated from app/actions/profile.ts's updateProfile() —
 * that helper does one multi-column `.update()` per section, and a single
 * missing column in that payload would fail the whole write (Country,
 * University, etc. included). Keeping this on its own query means a
 * not-yet-migrated database only ever affects this one feature.
 */

export type PriorRefusalState = {
  priorRefusal: boolean;
  reason: string | null;
  date: string | null;
  count: number;
};

const DEFAULT_STATE: PriorRefusalState = {
  priorRefusal: false,
  reason: null,
  date: null,
  count: 0,
};

export async function getPriorRefusal(userId: string): Promise<PriorRefusalState> {
  if (!isSupabaseConfigured()) return DEFAULT_STATE;
  try {
    const sb = await getServerSupabase();
    if (!sb) return DEFAULT_STATE;
    const { data, error } = await sb
      .from("profiles")
      .select("prior_refusal, prior_refusal_reason, prior_refusal_date, prior_refusal_count")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) {
      if (error) console.warn("[prior-refusal] read not available yet:", error.message);
      return DEFAULT_STATE;
    }
    return {
      priorRefusal: Boolean(data.prior_refusal),
      reason: (data.prior_refusal_reason as string | null) ?? null,
      date: (data.prior_refusal_date as string | null) ?? null,
      count: (data.prior_refusal_count as number | null) ?? 0,
    };
  } catch (e) {
    console.warn("[prior-refusal] read threw:", e);
    return DEFAULT_STATE;
  }
}
