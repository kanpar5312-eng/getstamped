"use server";

import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type PriorRefusalPatch = {
  priorRefusal: boolean;
  reason?: string | null;
  date?: string | null;
};

export type PriorRefusalResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Isolated write for the prior-refusal flag — see lib/prior-refusal.ts for
 * why this doesn't go through app/actions/profile.ts's updateProfile().
 * Fails soft with a clear error message (rather than throwing) if
 * migration 0013_prior_refusal.sql hasn't been applied yet, so a stale
 * database degrades this one Settings field instead of crashing the page.
 */
export async function updatePriorRefusal(patch: PriorRefusalPatch): Promise<PriorRefusalResult> {
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
        prior_refusal: patch.priorRefusal,
        prior_refusal_reason: patch.reason ?? null,
        prior_refusal_date: patch.date || null,
      })
      .eq("id", userData.user.id);

    if (error) {
      console.warn("[prior-refusal] write not available yet:", error.message);
      return { ok: false, error: "Couldn't save yet — this feature is still rolling out. Try again shortly." };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[prior-refusal] write threw:", e);
    return { ok: false, error: "Couldn't save yet — this feature is still rolling out. Try again shortly." };
  }
}
