"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ProfileSection = "profile" | "application";

export type ProfileUpdate = {
  // Profile section
  first_name?: string;
  last_name?: string;
  country?: string;
  // Application section
  university?: string;
  intake_term?: string;
  intake_date?: string | null;
  interview_date?: string | null;
  consulate?: string;
  program_type?: string;
  funding_source?: string;
  // Onboarding
  onboarding_completed?: boolean;
};

export type ProfileResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Updates the signed-in user's profile row. Only the fields present in
 * `patch` are written — undefined keys are skipped, so each Settings
 * section can save just its own subset without clobbering others.
 */
export async function updateProfile(patch: ProfileUpdate): Promise<ProfileResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured. Add Supabase keys to enable saving." };
  }

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "You're not signed in." };
  }

  // Strip undefined so we don't null-out existing columns
  const clean: Record<string, string | boolean | null> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    clean[k] = typeof v === "string" && v === "" ? null : v;
  }
  if (Object.keys(clean).length === 0) return { ok: true };

  clean.last_active_at = new Date().toISOString();

  const { error } = await sb
    .from("profiles")
    .update(clean)
    .eq("id", userData.user.id);

  if (error) return { ok: false, error: error.message };

  // Refresh the layout so the avatar, greeting, etc. pick up the new name
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Mark onboarding complete + persist whatever the user filled in. */
export async function completeOnboarding(patch: ProfileUpdate): Promise<ProfileResult> {
  return updateProfile({ ...patch, onboarding_completed: true });
}

/** Quick read for callback / layout routing. Returns false on any error. */
export async function isOnboardingComplete(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // dev mode: no gate
  const sb = await getServerSupabase();
  if (!sb) return true;
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) return true;

  const { data } = await sb
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userData.user.id)
    .maybeSingle();

  return Boolean(data?.onboarding_completed);
}
