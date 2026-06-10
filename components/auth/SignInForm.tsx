"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";

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
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="field-rise field-rise-3 w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
