"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { verifyTurnstile } from "@/lib/turnstile";
import { attachReferralFromCookie } from "@/lib/referrals";
import { getAdminSupabase } from "@/lib/documents/admin";
import { TOS_VERSION } from "@/lib/legal/tos";

export type AuthResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string };

function reasonableEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Sign-up with email + password. Sends a verification email. */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const turnstileToken = String(formData.get("turnstileToken") ?? "");
  const ageConfirmed = String(formData.get("ageConfirmed") ?? "") === "true";

  if (!reasonableEmail(email)) return { ok: false, error: "Enter a valid email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (fullName.length < 2) return { ok: false, error: "Tell us your full legal name." };
  // DPDP Act compliance — affirmative age confirmation is required at
  // signup. The client checkbox already gates submit, but a manually
  // crafted POST must not bypass it.
  if (!ageConfirmed) {
    return { ok: false, error: "Please confirm you are 18+ or using the service with parental consent." };
  }

  // CAPTCHA gate — accepts all submissions in dev (no TURNSTILE_SECRET_KEY)
  const human = await verifyTurnstile(turnstileToken);
  if (!human) return { ok: false, error: "Please complete the CAPTCHA challenge." };

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured yet. Add Supabase env keys to enable signup." };
  }

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const origin = (await headers()).get("origin")
    ?? process.env.NEXT_PUBLIC_SITE_ORIGIN
    ?? "http://localhost:3030";

  // First word of full legal name → first_name for greeting / avatar initials.
  const firstName = fullName.split(/\s+/)[0];

  const { data: signUpData, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        full_name: fullName,
        legal_signatory_name: fullName,           // frozen legal record, never overwritten
        dpa_accepted_at: new Date().toISOString(),
      },
    },
  });

  if (error) return { ok: false, error: error.message };

  // If a /r/<code> cookie is on the request, attribute the new user to
  // their referrer. Best-effort — never fail signup over a broken link.
  if (signUpData.user?.id) {
    try {
      await attachReferralFromCookie(signUpData.user.id);
    } catch (err) {
      console.error("[signUp] referral attach failed:", err);
    }

    // DPDP Act compliance — append-only record of the affirmative age
    // confirmation that gated this signup. Best-effort: a failure here
    // must not block account creation, but it WILL be logged loudly so
    // a missed write is recoverable in operations.
    try {
      const admin = getAdminSupabase();
      if (admin) {
        const h = await headers();
        const xff = h.get("x-forwarded-for");
        const ip = xff ? xff.split(",")[0]?.trim() : h.get("x-real-ip");
        await admin.from("age_confirmation_log").insert({
          user_id: signUpData.user.id,
          ip_address: ip ?? null,
        });
      }
    } catch (err) {
      console.error("[signUp] age_confirmation_log insert failed:", err);
    }
  }

  // If Supabase's "Confirm email" toggle is OFF, signUp returns a live
  // session already — drop the user straight into onboarding, no OTP
  // detour. If the toggle is ON (current state, pending email-template
  // fix), session is null and we fall through to the verify page.
  if (signUpData.session) {
    return { ok: true, redirectTo: "/sign-up/terms" };
  }

  // Fallback: try a password sign-in to obtain a session anyway. Works
  // whenever Supabase doesn't strictly require email confirmation. If
  // it fails (email-confirm-required policy), we send them to verify.
  const signIn = await sb.auth.signInWithPassword({ email, password });
  if (signIn.data.session) {
    return { ok: true, redirectTo: "/sign-up/terms" };
  }

  return { ok: true, redirectTo: `/sign-up/verify?email=${encodeURIComponent(email)}` };
}

/**
 * Verifies the 6-digit OTP code Supabase emails after signUp.
 *
 * Supabase prerequisite: the "Confirm signup" email template must include
 * `{{ .Token }}` (the 6-digit code). Otherwise the email will only contain
 * a confirmation link and this verify action has nothing to validate.
 */
export async function verifyEmailCode(
  email: string,
  token: string,
): Promise<AuthResult> {
  if (!reasonableEmail(email)) return { ok: false, error: "Enter a valid email." };
  const code = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code from your email." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured yet." };
  }
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const { error } = await sb.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (error) {
    // Common cases: expired (1h default), wrong code, already used.
    if (/expired/i.test(error.message)) {
      return { ok: false, error: "That code expired. Tap “Resend” for a fresh one." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, redirectTo: "/onboarding" };
}

/** Re-send the verification email for an unconfirmed account. */
export async function resendVerification(email: string): Promise<AuthResult> {
  if (!reasonableEmail(email)) return { ok: false, error: "Enter a valid email." };
  if (!isSupabaseConfigured()) return { ok: false, error: "Auth is not configured yet." };
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const origin = (await headers()).get("origin")
    ?? process.env.NEXT_PUBLIC_SITE_ORIGIN
    ?? "http://localhost:3030";
  const { error } = await sb.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Sign in with email + password. */
export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!reasonableEmail(email)) return { ok: false, error: "Enter a valid email." };
  if (!password) return { ok: false, error: "Enter your password." };

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured yet." };
  }

  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const { error, data } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    // Supabase returns "Email not confirmed" verbatim for unverified accounts
    if (/not confirmed/i.test(error.message)) {
      return { ok: false, error: "Please verify your email first. Check your inbox for the link." };
    }
    return { ok: false, error: "Email or password is incorrect." };
  }

  // Send users without ToS consent through the forced-scroll step,
  // then incomplete profiles into onboarding, otherwise dashboard.
  if (data.user) {
    const { data: profile } = await sb
      .from("profiles")
      .select("onboarding_completed, tos_consent_version")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.tos_consent_version !== TOS_VERSION) {
      return { ok: true, redirectTo: "/sign-up/terms" };
    }
    if (!profile?.onboarding_completed) {
      return { ok: true, redirectTo: "/onboarding" };
    }
  }

  return { ok: true, redirectTo: "/dashboard" };
}

/** Trigger a password-reset email. */
export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!reasonableEmail(email)) return { ok: false, error: "Enter a valid email." };
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Auth is not configured yet." };
  }
  const sb = await getServerSupabase();
  if (!sb) return { ok: false, error: "Supabase client unavailable." };

  const origin = (await headers()).get("origin")
    ?? process.env.NEXT_PUBLIC_SITE_ORIGIN
    ?? "http://localhost:3030";

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset`,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Sign out and bounce to /. */
export async function signOut(): Promise<never> {
  const sb = await getServerSupabase();
  if (sb) await sb.auth.signOut();
  redirect("/");
}
