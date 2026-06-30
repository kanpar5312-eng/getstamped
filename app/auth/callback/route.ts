import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email";
import { buildSignupWelcome } from "@/lib/email-templates";
import { TOS_VERSION } from "@/lib/legal/tos";

/**
 * Supabase email-verification + password-recovery landing.
 *
 * Behaviour:
 *  - ?code=...  → exchange for a session, then route to /onboarding if the
 *                 user hasn't finished setup, otherwise /dashboard (or ?next=).
 *  - No code    → bounce to /sign-in with a friendly error.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const explicitNext = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=verification_failed", url.origin),
    );
  }

  const sb = await getServerSupabase();
  if (!sb) {
    return NextResponse.redirect(
      new URL("/sign-in?error=verification_failed", url.origin),
    );
  }

  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/sign-in?error=verification_failed", url.origin),
    );
  }

  // Where to go after verification?
  // - explicit ?next overrides everything
  // - otherwise: onboarding if profile isn't complete, else dashboard
  if (explicitNext) {
    return NextResponse.redirect(new URL(explicitNext, url.origin));
  }

  const { data: userData } = await sb.auth.getUser();
  if (userData.user) {
    const { data: profile } = await sb
      .from("profiles")
      .select("first_name, onboarding_completed, welcome_sent_at, tos_consent_version")
      .eq("id", userData.user.id)
      .maybeSingle();

    // First-time verified visit → fire welcome email once. Best-effort, never blocking.
    if (userData.user.email && !profile?.welcome_sent_at) {
      const { subject, text, html } = buildSignupWelcome({
        firstName: profile?.first_name ?? userData.user.email.split("@")[0],
      });
      void sendMail({ to: userData.user.email, subject, text, html }).then(async () => {
        await sb
          .from("profiles")
          .update({ welcome_sent_at: new Date().toISOString() })
          .eq("id", userData.user!.id);
      });
    }

    // DPDP Act compliance — forced-scroll ToS gate. Every fresh
    // verification / OAuth callback must pass through the consent
    // step before reaching the rest of the app.
    if (profile?.tos_consent_version !== TOS_VERSION) {
      return NextResponse.redirect(new URL("/sign-up/terms", url.origin));
    }

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL("/onboarding", url.origin));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
