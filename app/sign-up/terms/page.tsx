import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { TOS_VERSION } from "@/lib/legal/tos";
import { TermsConsentClient } from "./TermsConsentClient";

export const metadata: Metadata = {
  title: "Confirm the Terms — GetStamped",
};

/* ════════════════════════════════════════════════════════════════════════
   /sign-up/terms — forced-scroll Terms of Service confirmation step.
   Sits between auth (signUp / verify / signIn) and the rest of the app.

   Gate logic:
     • No session → bounce to /sign-in (no consent without a user row).
     • Session AND tos_consent_version === current → skip the step and
       send the user where they were trying to go (onboarding by
       default, dashboard if onboarding is done).
     • Session AND mismatch → render the consent client.
   ════════════════════════════════════════════════════════════════════════ */
export default async function TermsConsentPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const sb = await getServerSupabase();
  if (sb) {
    const { data: profile } = await sb
      .from("profiles")
      .select("tos_consent_version, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tos_consent_version === TOS_VERSION) {
      redirect(profile.onboarding_completed ? "/dashboard" : "/onboarding");
    }
  }

  return <TermsConsentClient />;
}
