"use client";

import Link from "next/link";

/* ════════════════════════════════════════════════════════════════════════
   PaywallOverlay — the single UI surface for "you can't do this yet"
   moments. Two modes:

     • upgrade        Feature is paywalled (document review, parent share,
                      feedback, locked phases). Persimmon lock + "$39 →".
     • limit_reached  Free quota hit (AI Qs, mock interview). Persimmon
                      clock + "Resets in [X]h" + "$39 →".

   Inline element, not a portal — caller positions it. For blurred
   contexts (locked playbook phases), wrap the locked content in a
   `position: relative` parent and absolutely center this overlay over it.
   ════════════════════════════════════════════════════════════════════════ */

type Props =
  | { type: "upgrade"; feature: string; resetAt?: string }
  | { type: "limit_reached"; feature: string; resetAt: string };

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function formatResetIn(resetAt: string): string {
  const ms = new Date(resetAt).getTime() - Date.now();
  if (!isFinite(ms) || ms <= 0) return "now";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function PaywallOverlay(props: Props) {
  const isLimit = props.type === "limit_reached";
  const title = isLimit
    ? "You've reached today's limit."
    : `${props.feature} is part of Solo.`;
  const cta = isLimit ? "Remove all limits — $39 →" : "Unlock Solo — $39 →";

  return (
    <div
      role="region"
      aria-label={isLimit ? "Daily limit reached" : "Upgrade required"}
      className="gs-card mx-auto max-w-md text-center p-7"
      style={{ borderRadius: "var(--gs-radius-xl)" }}
    >
      <span
        aria-hidden
        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon)]"
      >
        {isLimit ? <ClockIcon /> : <LockIcon />}
      </span>

      <h3
        className="mt-4 text-[18px] leading-snug text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-display-stack)" }}
      >
        {title}
      </h3>

      {isLimit && (
        <p
          className="mt-2 text-[13px] text-[var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-sans-stack)" }}
        >
          Resets in {formatResetIn(props.resetAt)}.
        </p>
      )}

      <Link
        href="/dashboard/upgrade"
        className="gs-btn-primary mt-5 inline-flex w-full items-center justify-center px-5 py-3 text-sm font-medium"
      >
        {cta}
      </Link>
    </div>
  );
}
