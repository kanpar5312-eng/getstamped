"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";

type Variant = "light" | "dark";

type Props = {
  variant?: Variant;
  source?: string;
};

/**
 * Inline waitlist signup — email input + submit button.
 *
 * Server action returns { ok, position, isEarlyBird } from `joinWaitlist`.
 * On success, button morphs into a success state showing position.
 * Errors render inline below the input.
 */
export function WaitlistForm({ variant = "light", source }: Props) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    | { kind: "idle" }
    | { kind: "error"; message: string }
    | { kind: "success"; position: number; isEarlyBird: boolean }
  >({ kind: "idle" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await joinWaitlist(email);
      if (r.ok) {
        setResult({
          kind: "success",
          position: r.position,
          isEarlyBird: r.isEarlyBird,
        });
        setEmail("");
      } else {
        setResult({ kind: "error", message: r.error });
      }
    });
  };

  const isDark = variant === "dark";
  const inputStyles = isDark
    ? "bg-transparent border-white/25 text-[var(--color-cream-soft)] placeholder:text-[var(--color-cream-soft)]/50 focus:border-[var(--color-cream-soft)]/60"
    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-accent)]";

  const btnStyles = isDark
    ? "bg-[var(--color-cream-soft)] text-[var(--color-forest)] hover:bg-[var(--color-cream)]"
    : "bg-[var(--color-forest)] text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)]";

  if (result.kind === "success") {
    return (
      <div
        className={
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm animate-fade-up " +
          (isDark
            ? "bg-[var(--color-cream-soft)]/10 border border-[var(--color-cream-soft)]/30 text-[var(--color-cream-soft)]"
            : "bg-[var(--color-forest)]/[0.08] border border-[var(--color-forest)]/20 text-[var(--color-forest)]")
        }
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-current text-[var(--color-cream-soft)]">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5 9-11" />
          </svg>
        </span>
        <span>
          You&rsquo;re #{result.position} on the list.
          {result.isEarlyBird
            ? " Early-bird price locked in."
            : ""}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`waitlist-${source ?? "default"}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-${source ?? "default"}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className={[
            "flex-1 w-full rounded-xl border px-4 py-2.5 text-sm",
            "outline-none focus:ring-4 focus:ring-[var(--color-accent)]/15",
            "transition-colors duration-200",
            inputStyles,
          ].join(" ")}
        />
        <button
          type="submit"
          disabled={pending}
          className={[
            "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5",
            "text-sm font-medium tracking-tight transition-colors duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            btnStyles,
          ].join(" ")}
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-soft-pulse" />
              Securing your spot…
            </span>
          ) : (
            "Join the waitlist"
          )}
        </button>
      </div>
      {result.kind === "error" && (
        <p className="mt-2 text-xs text-red-600">{result.message}</p>
      )}
    </form>
  );
}
