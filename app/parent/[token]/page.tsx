import type { Metadata } from "next";
import Link from "next/link";
import { resolveParentToken } from "@/lib/parent-view-resolve";
import { PreparationOverview } from "@/components/parent/PreparationOverview";
import { timeAgo } from "@/lib/relative-time";
import { PublicPollRefresher } from "@/components/horizon/PublicPollRefresher";
import { BrandMark } from "@/components/ui/BrandMark";
import { PRICES, formatPrice } from "@/lib/pricing";
import { SUPPORT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Application progress — GetStamped",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

export default async function ParentPublicView({ params }: { params: Params }) {
  const { token } = await params;
  const res = await resolveParentToken(token);

  if (!res.ok) {
    return (
      <main className="flex-1 flex items-center justify-center px-5 py-32">
        <div className="max-w-md text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Inactive link
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-[var(--color-ink)] leading-snug">
            This link is no longer active.
          </h1>
          <p className="mt-4 text-sm text-[var(--color-ink-soft)] leading-relaxed">
            Ask the student for a new link. They can generate one from their
            Parent View settings.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex text-xs text-[var(--color-persimmon-deep)] hover:text-[var(--color-persimmon)] transition-colors"
          >
            ← Back to GetStamped
          </Link>
        </div>
      </main>
    );
  }

  const dashboard = res.profile;
  const { profile, currentPhaseName, currentPhase, nextStep, stepsComplete, percentComplete, daysToInterview, isInterviewImminent } = dashboard;
  const firstName = res.firstName;
  const isFree = profile.plan === "free";

  // Pricing (default to USD — parent visiting from anywhere)
  const soloP = PRICES.solo.USD;
  const familyP = PRICES.family.USD;

  return (
    <main className="flex-1 px-5 py-12 sm:py-16">
      <PublicPollRefresher intervalMs={30_000} />
      <div className="mx-auto max-w-3xl">
        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-ink)]">
            <BrandMark size={24} />
            <span className="font-display text-lg leading-none tracking-tight">
              GetStamped
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-paper-deep)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-persimmon)] animate-soft-pulse" />
            Read-only · Parent view
          </span>
        </header>

        {/* ── Hero ── */}
        <section className="mt-10 animate-hero-rise">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-persimmon-deep)]">
            {firstName}&rsquo;s F-1 visa application
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
            {percentComplete >= 100
              ? "Done. Every step complete."
              : isInterviewImminent
              ? `Interview in ${daysToInterview} days.`
              : currentPhaseName
              ? `Currently on ${currentPhaseName}.`
              : "Just getting started."}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
            This page updates live as {firstName} completes steps. No login required.
          </p>

          {/* Progress bar */}
          <div className="mt-6 h-1.5 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-persimmon)] transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between text-xs text-[var(--color-muted)] tabular-nums">
            <span>
              <span className="font-semibold text-[var(--color-ink)]">{stepsComplete}</span> of 47 complete
            </span>
            <span>{percentComplete}%</span>
          </div>
        </section>

        {/* ── Preparation overview (curated, parent-safe) ── */}
        <PreparationOverview studentUserId={res.studentUserId} />

        {/* ── Stat tiles ── */}
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            label="Current phase"
            value={currentPhase ? `${currentPhase} of 5` : "—"}
            hint={currentPhaseName ?? "—"}
          />
          <StatTile
            label="Days since last activity"
            value={String(dashboard.daysSinceActivity)}
            hint={timeAgo(profile.lastActivityAt)}
            warning={dashboard.daysSinceActivity >= 7}
          />
          <StatTile
            label="Mock interviews"
            value={`${profile.mockInterviewsCompleted}`}
            hint="practice sessions completed"
          />
          <StatTile
            label="Documents organized"
            value={`${profile.documentsOrganizedPct}%`}
            hint="ready for interview"
          />
        </section>

        {/* ── Two-column: Next step + Interview ── */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Next step */}
          {nextStep ? (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
                Next up · Step {String(nextStep.number).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
                {nextStep.title}
              </h2>
              <p className="mt-3 text-xs text-[var(--color-ink-soft)] leading-relaxed">
                {nextStep.shortDescription}
              </p>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                Last activity {timeAgo(profile.lastActivityAt)}
              </p>
            </section>
          ) : (
            <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
                Completed
              </p>
              <h2 className="mt-2 font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
                Every step is done.
              </h2>
            </section>
          )}

          {/* Interview */}
          <section className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
              Interview
            </p>
            {profile.interviewDate ? (
              <>
                <h2 className="mt-2 font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
                  {profile.interviewDate.toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  {profile.consulateLocation ?? "—"} ·{" "}
                  {profile.interviewTimeOfDay ?? "morning"}
                </p>
                {daysToInterview !== null && (
                  <p
                    className={[
                      "mt-3 text-xs font-medium",
                      isInterviewImminent ? "text-[var(--color-persimmon-deep)]" : "text-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    {daysToInterview === 0
                      ? "Today."
                      : daysToInterview > 0
                      ? `${daysToInterview} days away`
                      : `${Math.abs(daysToInterview)} days ago`}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Not yet scheduled. {firstName} will book after Phase 3.
              </p>
            )}
          </section>
        </div>

        {/* ── Phase progress checklist ── */}
        <section className="mt-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Journey · 5 phases
          </p>
          <ul className="mt-4 space-y-3">
            {[
              { n: 1, name: "Before your I-20" },
              { n: 2, name: "After I-20 arrival" },
              { n: 3, name: "DS-160 and fees" },
              { n: 4, name: "Interview preparation" },
              { n: 5, name: "Post-approval" },
            ].map((p) => {
              const done = currentPhase === null || p.n < (currentPhase ?? 6);
              const current = p.n === currentPhase;
              return (
                <li key={p.n} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={[
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      done
                        ? "bg-[var(--color-ink)] text-[var(--color-paper-soft)]"
                        : current
                        ? "bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon-deep)] ring-2 ring-[var(--color-persimmon)]"
                        : "bg-[var(--color-paper-deep)] text-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    {done ? "✓" : p.n}
                  </span>
                  <span
                    className={[
                      "text-sm",
                      done
                        ? "text-[var(--color-ink)] line-through decoration-[var(--color-border)]"
                        : current
                        ? "text-[var(--color-ink)] font-medium"
                        : "text-[var(--color-muted)]",
                    ].join(" ")}
                  >
                    Phase {p.n} · {p.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Payment CTA (only when child is on free plan) ── */}
        {isFree && (
          <section className="mt-6 relative overflow-hidden rounded-2xl border border-[var(--color-persimmon)] bg-[var(--color-paper-soft)] p-6 sm:p-8">
            <span
              aria-hidden
              className="absolute -right-20 -top-20 h-56 w-56 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, var(--color-persimmon-tint) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-persimmon-deep)]">
                Want to help?
              </p>
              <h2 className="mt-3 font-display text-2xl sm:text-[28px] tracking-tight text-[var(--color-ink)] leading-snug">
                Pay for {firstName}&rsquo;s plan in 60 seconds.
              </h2>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed max-w-[520px]">
                {firstName} is on the free plan, which covers the first 6 of 47 steps.
                Unlocking everything — voice mock interviews, document AI checks, the full
                47-step timeline — takes a single one-time payment. No subscription, no
                recurring charges. 14-day full refund if it doesn&rsquo;t help.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PlanCard
                  name="Solo"
                  current={formatPrice(soloP)}
                  original={soloP.originalAmount ? `${soloP.symbol}${soloP.originalAmount}` : null}
                  discountPct={soloP.discountPct ?? null}
                  perks={["All 47 steps", "Unlimited AI Q&A", "Unlimited voice mocks", "Document AI checks"]}
                  ctaHref={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Pay for ${firstName}'s Solo plan`)}&body=${encodeURIComponent(`Hi GetStamped team,\n\nI'd like to pay for ${firstName}'s Solo plan ($19, one-time).\n\nStudent's account email: \n\nThanks.`)}`}
                  ctaLabel={`Pay ${formatPrice(soloP)} for Solo`}
                  highlight
                />
                <PlanCard
                  name="Family"
                  current={formatPrice(familyP)}
                  original={familyP.originalAmount ? `${familyP.symbol}${familyP.originalAmount}` : null}
                  discountPct={familyP.discountPct ?? null}
                  perks={["Everything in Solo", "3 student seats", "Shared parent overview", "Best for siblings"]}
                  ctaHref={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Pay for ${firstName}'s Family plan`)}&body=${encodeURIComponent(`Hi GetStamped team,\n\nI'd like to pay for ${firstName}'s Family plan ($29, one-time, up to 3 students).\n\nStudent's account email: \n\nThanks.`)}`}
                  ctaLabel={`Pay ${formatPrice(familyP)} for Family`}
                />
              </div>

              <p className="mt-5 text-[11px] text-[var(--color-muted)] leading-relaxed">
                Email us with the student&rsquo;s account email — we send a secure payment
                link back to you within an hour. Or write directly to{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-persimmon-deep)] hover:text-[var(--color-persimmon)] transition-colors font-medium">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="mt-12 text-center text-xs text-[var(--color-muted)]">
          {isFree && <span className="block">GetStamped · Free plan</span>}
          Powered by{" "}
          <Link
            href="/"
            className="text-[var(--color-persimmon-deep)] hover:text-[var(--color-persimmon)] transition-colors"
          >
            GetStamped
          </Link>{" "}
          · Read-only view, no login required.
        </footer>
      </div>
    </main>
  );
}

/* ───── Atoms ───── */

function StatTile({
  label,
  value,
  hint,
  warning = false,
}: {
  label: string;
  value: string;
  hint?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border bg-[var(--color-paper-soft)] p-4",
        warning
          ? "border-[var(--color-persimmon)]"
          : "border-[var(--color-border-soft)]",
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--color-muted)]">
        {label}
      </p>
      <p
        className={[
          "mt-2 font-display text-2xl tabular-nums leading-none",
          warning ? "text-[var(--color-persimmon-deep)]" : "text-[var(--color-ink)]",
        ].join(" ")}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1.5 text-[11px] text-[var(--color-ink-soft)] leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name,
  current,
  original,
  discountPct,
  perks,
  ctaHref,
  ctaLabel,
  highlight = false,
}: {
  name: string;
  current: string;
  original: string | null;
  discountPct: number | null;
  perks: string[];
  ctaHref: string;
  ctaLabel: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border bg-[var(--color-paper)] p-5",
        highlight
          ? "border-[var(--color-persimmon)] shadow-[0_6px_20px_-8px_rgba(217,70,30,0.25)]"
          : "border-[var(--color-border)]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink)]">
          {name}
        </p>
        {discountPct && (
          <span className="rounded-full bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon-deep)] px-2 py-[2px] text-[10px] font-semibold uppercase">
            {discountPct}% off
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl tabular-nums text-[var(--color-ink)] leading-none">
          {current}
        </span>
        {original && (
          <span className="text-[15px] tabular-nums text-[var(--color-muted)] line-through leading-none">
            {original}
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-1.5">
        {perks.map((p) => (
          <li key={p} className="text-[13px] text-[var(--color-ink-soft)] leading-snug flex items-start gap-2">
            <span aria-hidden className="text-[var(--color-persimmon)] mt-[1px]">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={[
          "mt-5 inline-flex w-full items-center justify-center rounded-lg px-4 py-[10px] text-[13px] font-semibold transition-colors",
          highlight
            ? "bg-[var(--color-persimmon)] text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)]"
            : "border border-[var(--color-border)] bg-[var(--color-paper-soft)] text-[var(--color-ink)] hover:border-[var(--color-persimmon)] hover:text-[var(--color-persimmon-deep)]",
        ].join(" ")}
      >
        {ctaLabel} →
      </a>
    </div>
  );
}
