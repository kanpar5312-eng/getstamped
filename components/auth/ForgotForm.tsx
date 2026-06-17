"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const r = await requestPasswordReset(fd);
      if (r.ok) setSent(true);
      else setError(r.error);
    });
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--color-ink)]/20 bg-[var(--color-persimmon)]/[0.06] p-4 text-sm text-[var(--color-ink)]">
        Check your email for the reset link. If you don&rsquo;t see it in 2 minutes, check spam.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-[var(--color-ink-soft)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
        />
      </label>

      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center rounded-xl bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
