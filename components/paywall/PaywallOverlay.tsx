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

type Plan = "free" | "solo" | "family";

type Props =
  | { type: "upgrade"; feature: string; resetAt?: string }
  | {
      type: "limit_reached";
      feature: string;
      resetAt: string;
      /** Cadence the limit resets on — controls the headline copy.
       *  Most limit_reached usages are daily (ai_question); mock
       *  interview is weekly. Defaults to "day" so existing callers
       *  that don't pass this keep their current copy. */
      period?: "day" | "week";
      /** The user's current plan. When it's "solo" or "family" — i.e.
       *  they're already paying for the plan the old hardcoded CTA
       *  pitched them ("Remove all limits — $39 →") — that CTA is
       *  wrong: they'd be asked to buy something they already own. Omit
       *  entirely (falls back to "free") to keep the old free-tier
       *  upsell behavior for callers that don't pass this. */
      plan?: Plan;
    };

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
  // Already paying for a plan means the old "$39 → Solo" CTA would be
  // pitching them the plan they're already on. Only free-tier users (or
  // callers that don't pass `plan` at all — kept backward-compatible)
  // get the upsell CTA; solo/family just wait out the reset.
  const plan: Plan = (isLimit && props.plan) || "free";
  const alreadyPaid = isLimit && plan !== "free";
  const period = (isLimit && props.period) || "day";

  const title = isLimit
    ? alreadyPaid
      ? `You've used this ${period}'s mock interviews.`
      : `You've reached ${period === "week" ? "this week's" : "today's"} limit.`
    : `${props.feature} is part of Solo.`;
  const cta = isLimit
    ? alreadyPaid
      ? (plan === "solo" ? "See Family plan (more sessions) →" : null)
      : "Remove all limits — $39 →"
    : "Unlock Solo — $39 →";

  return (
    <div
      role="region"
      aria-label={isLimit ? "Limit reached" : "Upgrade required"}
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
          {alreadyPaid
            ? `You're on ${plan === "family" ? "Family" : "Solo"} — this refills automatically. Resets in ${formatResetIn(props.resetAt)}.`
            : `Resets in ${formatResetIn(props.resetAt)}.`}
        </p>
      )}

      {cta && (
        <Link
          href="/dashboard/upgrade"
          className="gs-btn-primary mt-5 inline-flex w-full items-center justify-center px-5 py-3 text-sm font-medium"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
