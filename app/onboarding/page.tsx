import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser, getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { OnboardingClient } from "@/components/onboarding/OnboardingClient";
import { TOS_VERSION } from "@/lib/legal/tos";

export const metadata: Metadata = {
  title: "Set up your timeline — GetStamped",
};

export default async function OnboardingPage() {
  // No auth → bounce to sign-in (proxy already handles dashboard; this is a soft second check)
  if (!isSupabaseConfigured()) redirect("/sign-in");
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  // DPDP Act compliance — forced-scroll ToS gate. A user who lands on
  // /onboarding without consent goes back through /sign-up/terms first
  // so onboarding's final router.push(/dashboard) never gets bounced
  // mid-curtain (the blank-screen bug).
  const sb = await getServerSupabase();
  let firstName = user.email?.split("@")[0] ?? "Student";
  if (sb) {
    const { data } = await sb
      .from("profiles")
      .select("first_name, country, onboarding_completed, tos_consent_version")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.tos_consent_version !== TOS_VERSION) redirect("/sign-up/terms");
    if (data?.onboarding_completed) redirect("/dashboard");
    if (data?.first_name) firstName = data.first_name;
  }

  // Geo-derived currency cookie tells us their country, roughly
  const c = await cookies();
  const currency = c.get("gs_currency")?.value;
  const initialCountry = currency === "INR" ? "India" : undefined;

  return <OnboardingClient firstName={firstName} initialCountry={initialCountry} />;
}
