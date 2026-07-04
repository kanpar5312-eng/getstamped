"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { getBrowserSupabase } from "@/lib/supabase/client";

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

const fieldWrap = "relative flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:border-[var(--color-tg)] focus-within:ring-4 focus-within:ring-[var(--color-tg)]/10 transition-colors";
const iconLeft = "absolute left-3 text-[var(--color-muted)]";
const baseInput = "w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 outline-none";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const r = await signIn(fd);
      if (r.ok && r.redirectTo) router.push(r.redirectTo);
      else if (!r.ok) setError(r.error);
    });
  };

  const signInWithGoogle = async () => {
    setError(null);
    const sb = getBrowserSupabase();
    if (!sb) {
      setError("Sign-in is temporarily unavailable. Try email + password.");
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
    if (oauthErr) setError(oauthErr.message);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="field-rise field-rise-1">
        <label htmlFor="si-email" className="text-xs font-medium text-[var(--color-ink)]">
          Email
        </label>
        <div className={`mt-1.5 ${fieldWrap}`}>
          <span className={iconLeft}><MailIcon /></span>
          <input
            id="si-email" name="email" type="email" required
            autoComplete="email" autoFocus
            placeholder="you@email.com"
            className={baseInput}
          />
        </div>
      </div>

      <div className="field-rise field-rise-2">
        <div className="flex items-center justify-between">
          <label htmlFor="si-pass" className="text-xs font-medium text-[var(--color-ink)]">
            Password
          </label>
          <Link href="/forgot-password" className="text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
            Forgot?
          </Link>
        </div>
        <div className={`mt-1.5 ${fieldWrap}`}>
          <span className={iconLeft}><LockIcon /></span>
          <input
            id="si-pass" name="password" type={showPassword ? "text" : "password"}
            required autoComplete="current-password" minLength={8}
            placeholder="Your password"
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
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="field-rise field-rise-3 w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-persimmon)] px-5 py-3 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="relative flex items-center py-1">
        <span className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="px-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
          or
        </span>
        <span className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-tg)] transition-colors"
      >
        <GoogleMark /> Continue with Google
      </button>
    </form>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
