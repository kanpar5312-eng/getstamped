"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, resendVerification } from "@/app/actions/auth";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

/**
 * Tiny zxcvbn-style password scorer. Returns { score 0-4, label, color, hint }.
 * Not as strict as zxcvbn (no 5MB dictionary bundled) but catches the obvious
 * weak cases: too short, all lowercase, no digits, common patterns.
 */
function scorePassword(p: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
  color: string;
} {
  if (!p) return { score: 0, label: "Empty",  hint: "8+ characters with a number or symbol.", color: "bg-[var(--color-paper-deep)]" };
  if (p.length < 8) return { score: 1, label: "Too short", hint: `${8 - p.length} more character${8 - p.length === 1 ? "" : "s"}.`, color: "bg-red-400" };

  let score = 1;
  const lengthBonus = p.length >= 12 ? 2 : p.length >= 10 ? 1 : 0;
  const hasLower  = /[a-z]/.test(p);
  const hasUpper  = /[A-Z]/.test(p);
  const hasDigit  = /\d/.test(p);
  const hasSymbol = /[^a-zA-Z0-9]/.test(p);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  const common = /^(password|qwerty|letmein|welcome|admin|123456|111111|abc123)/i.test(p);
  const repeats = /(.)\1\1/.test(p);

  score += classes - 1;
  score += lengthBonus;
  if (common) score = Math.min(score, 1);
  if (repeats) score = Math.max(0, score - 1);
  const finalScore = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;

  const tiers: Array<{ label: string; hint: string; color: string }> = [
    { label: "Very weak", hint: "Avoid common patterns.",              color: "bg-red-500"    },
    { label: "Weak",      hint: "Add a number or symbol.",              color: "bg-red-400"    },
    { label: "Fair",      hint: "Mix case + a number for stronger.",    color: "bg-amber-400"  },
    { label: "Strong",    hint: "Looks solid.",                          color: "bg-lime-500"   },
    { label: "Very strong", hint: "Excellent.",                          color: "bg-emerald-500"},
  ];
  return { score: finalScore, ...tiers[finalScore] };
}

/* ----------------------------- Icons ----------------------------- */
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.7-3.9 2.7-6.63z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26a5.4 5.4 0 0 1-3.04.86 5.4 5.4 0 0 1-5.07-3.73H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.93 10.69A5.4 5.4 0 0 1 3.64 9c0-.59.1-1.16.29-1.69V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l2.97-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.45 1.34l2.58-2.58A9 9 0 0 0 9 0a9 9 0 0 0-8.04 4.97l2.97 2.34A5.4 5.4 0 0 1 9 3.58z" />
    </svg>
  );
}

/* ----------------------------- Styles ----------------------------- */
const fieldWrap = "relative flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-tg)] focus-within:ring-4 focus-within:ring-[var(--color-tg)]/10 transition-colors";
const iconLeft = "absolute left-3 text-[var(--color-muted)]";
const baseInput = "w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 outline-none";

/* ----------------------------- Form ----------------------------- */
export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  // DPDP Act compliance — affirmative age confirmation. Separate from
  // the Terms/Privacy/DPA agreement so the user actively ticks both.
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<{ email: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);

  const nameValid = name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrength = scorePassword(password);
  const passwordValid = passwordStrength.score >= 2 && password.length >= 8;
  // CAPTCHA requirement: when the site key is set we wait for a token; when
  // it's absent (dev), we don't gate the submit on it.
  const captchaPassed = TURNSTILE_SITE_KEY ? Boolean(turnstileToken) : true;
  const canSubmit = nameValid && emailValid && passwordValid && agreed && ageConfirmed && captchaPassed && !pending;

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    const fd = new FormData(e.currentTarget);
    fd.set("fullName", name);
    fd.set("ageConfirmed", ageConfirmed ? "true" : "false");
    if (turnstileToken) fd.set("turnstileToken", turnstileToken);
    setError(null);
    startTransition(async () => {
      const r = await signUp(fd);
      if (r.ok) {
        // Navigate to the 6-digit OTP verification page. The action's
        // redirectTo is the canonical destination; fall back to a built
        // URL only if the action didn't provide one.
        const dest = r.redirectTo ?? `/sign-up/verify?email=${encodeURIComponent(email)}`;
        router.push(dest);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  };

  const onResend = async () => {
    if (!success) return;
    setResending(true);
    const r = await resendVerification(success.email);
    setResending(false);
    if (r.ok) {
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    }
  };

  const signUpWithGoogle = async () => {
    setError(null);
    setGooglePending(true);
    const sb = getBrowserSupabase();
    if (!sb) {
      setError("Sign-in is temporarily unavailable. Try email + password.");
      setGooglePending(false);
      return;
    }
    const origin = window.location.origin;
    const { error: oauthErr } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    // On success the browser is navigating away to Google — only clear
    // the pending flag on failure so the button isn't stuck disabled if
    // control does return here.
    if (oauthErr) {
      setError(oauthErr.message);
      setGooglePending(false);
    }
  };

  /* ------------------------- Success state ------------------------- */
  if (success) {
    return (
      <div className="text-center space-y-5 animate-fade-up">
        <span aria-hidden className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-11" /></svg>
        </span>
        <div>
          <h2 className="font-display text-xl tracking-tight text-[var(--color-ink)]">
            Check your inbox to confirm your email
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            We sent a verification link to{" "}
            <span className="font-medium text-[var(--color-ink)]">{success.email}</span>.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper)] p-4 text-left text-xs text-[var(--color-ink-soft)] leading-relaxed space-y-2">
          <p><strong className="text-[var(--color-ink)]">Can&rsquo;t find it?</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Check spam / promotions.</li>
            <li>Wait ~60 seconds — email can take a moment.</li>
            <li>Make sure {success.email} is the right address.</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onResend}
          disabled={resending || resent}
          className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-tg)] hover:text-[var(--color-tg-deep)] transition-colors disabled:opacity-60"
        >
          {resending ? "Sending…" : resent ? "Sent ✓" : "Resend verification email"}
        </button>

        <p className="text-[11px] text-[var(--color-muted)]">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => { setSuccess(null); router.refresh(); }}
            className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors"
          >
            Start over
          </button>
        </p>
      </div>
    );
  }

  /* --------------------------- Default form -------------------------- */
  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {/* Full legal name */}
      <div className="field-rise field-rise-1">
        <label htmlFor="su-name" className="text-xs font-medium text-[var(--color-ink)]">
          Full legal name
        </label>
        <div className={`mt-1 ${fieldWrap}`}>
          <span className={iconLeft}><UserIcon /></span>
          <input
            id="su-name" name="name" value={name} onChange={(e) => setName(e.target.value)}
            required autoComplete="name" autoFocus
            placeholder="Priya Sharma"
            className={baseInput}
          />
        </div>
      </div>

      {/* Email */}
      <div className="field-rise field-rise-2">
        <label htmlFor="su-email" className="text-xs font-medium text-[var(--color-ink)]">
          Email
        </label>
        <div className={`mt-1 ${fieldWrap}`}>
          <span className={iconLeft}><MailIcon /></span>
          <input
            id="su-email" name="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
            placeholder="you@email.com"
            className={baseInput}
          />
        </div>
      </div>

      {/* Password with eye toggle */}
      <div className="field-rise field-rise-3">
        <label htmlFor="su-pass" className="text-xs font-medium text-[var(--color-ink)]">
          Password
        </label>
        <div className={`mt-1 ${fieldWrap}`}>
          <span className={iconLeft}><LockIcon /></span>
          <input
            id="su-pass" name="password" type={showPassword ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            required autoComplete="new-password" minLength={8}
            placeholder="At least 8 characters"
            className={`${baseInput} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>

        {/* Strength meter — visible once the user starts typing */}
        {password.length > 0 && (
          <div className="mt-2" aria-live="polite">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={[
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= passwordStrength.score ? passwordStrength.color : "bg-[var(--color-paper-deep)]",
                  ].join(" ")}
                />
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-ink-soft)]">
                <strong className="text-[var(--color-ink)]">{passwordStrength.label}.</strong>{" "}
                {passwordStrength.hint}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-muted)] tabular-nums">
                {password.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Agreement checkbox with live name — single compact line */}
      <label className="field-rise field-rise-4 flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-tg)]/10 rounded shrink-0"
        />
        <span className="text-[11px] text-[var(--color-ink-soft)] leading-snug">
          I,{" "}
          <strong className="text-[var(--color-ink)]">
            {nameValid ? name.trim() : "[your full legal name]"}
          </strong>
          , accept GetStamped&rsquo;s{" "}
          <Link href="/terms" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors">Terms</Link>,{" "}
          <Link href="/privacy" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors">Privacy</Link>{" "}
          &amp;{" "}
          <Link href="/dpa" className="text-[var(--color-ink)] underline underline-offset-2 hover:text-[var(--color-tg-deep)] transition-colors">DPA</Link>.
        </span>
      </label>

      {/* Age confirmation — DPDP Act compliance. Required, separate from
          the Terms checkbox so the user explicitly affirms each. */}
      <label className="field-rise field-rise-4 flex items-start gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-ink)] focus:ring-4 focus:ring-[var(--color-tg)]/10 rounded shrink-0"
        />
        <span className="text-[11px] text-[var(--color-ink-soft)] leading-snug">
          I confirm that I am 18 years of age or older, or that I am using
          this service with the consent and supervision of a parent or
          guardian.
        </span>
      </label>

      {/* CAPTCHA — renders nothing in dev when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set */}
      {TURNSTILE_SITE_KEY && (
        <div className="field-rise field-rise-4-cap">
          <TurnstileWidget
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={onTurnstileVerify}
            onExpire={onTurnstileExpire}
          />
        </div>
      )}

      {/* Error strip */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="field-rise field-rise-5 w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-persimmon)] px-5 py-3 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-soft-pulse" />
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </button>

      {/* OAuth — tighter divider + buttons */}
      <div className="field-rise field-rise-6 relative pt-1">
        <div className="absolute inset-x-0 top-1/2 flex items-center" aria-hidden>
          <span className="w-full border-t border-[var(--color-border-soft)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--color-paper-soft)] px-3 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">or</span>
        </div>
      </div>

      <div className="field-rise field-rise-7">
        <button
          type="button"
          onClick={signUpWithGoogle}
          disabled={googlePending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-[13px] font-medium text-[var(--color-ink)] hover:border-[var(--color-tg)] transition-colors disabled:opacity-60"
        >
          {googlePending ? "Connecting…" : (<><GoogleMark /> Continue with Google</>)}
        </button>
      </div>
    </form>
  );
}
