import type { Metadata } from "next";
import Link from "next/link";
import { resolveParentToken } from "@/lib/parent-view-resolve";
import { timeAgo } from "@/lib/relative-time";
import { PublicPollRefresher } from "@/components/horizon/PublicPollRefresher";

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
            className="mt-6 inline-flex text-xs text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
          >
            ← Back to GetStamped
          </Link>
        </div>
      </main>
    );
  }

  const dashboard = res.profile;
  const { profile, currentPhaseName, nextStep, stepsComplete, percentComplete, daysToInterview } = dashboard;
  const firstName = res.firstName;

  return (
    <main className="flex-1 px-5 py-12 sm:py-16">
      <PublicPollRefresher intervalMs={30_000} />
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span aria-hidden className="block h-3 w-3 rounded-sm bg-[var(--color-forest)]" />
            <span className="font-display text-lg leading-none tracking-tight text-[var(--color-ink)]">
              GetStamped
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cream-deep)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-forest)] animate-soft-pulse" />
            Read-only view
          </span>
        </header>

        <section className="mt-10 animate-hero-rise">
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
            {firstName}&rsquo;s F-1 Application
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            Currently on{" "}
            <span className="font-medium text-[var(--color-forest)]">
              {currentPhaseName ?? "—"}
            </span>
            .
          </p>

          <div className="mt-6 h-1.5 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-[var(--color-muted)] tabular-nums">
            {stepsComplete} of 47 complete · {percentComplete}%
          </div>
        </section>

        {nextStep && (
          <section className="mt-8 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
              Next up · Step {String(nextStep.number).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
              {nextStep.title}
            </h2>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Started {timeAgo(profile.lastActivityAt)}
            </p>
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5">
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
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {profile.consulateLocation ?? "—"} ·{" "}
                {profile.interviewTimeOfDay ?? "morning"} ·{" "}
                {daysToInterview !== null ? `${daysToInterview} days away` : "—"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Not yet scheduled.
            </p>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-[var(--color-muted)]">
          {profile.plan === "free" && (
            <span className="block">GetStamped · Free Plan</span>
          )}
          Powered by{" "}
          <Link href="/" className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
            GetStamped
          </Link>
        </footer>
      </div>
    </main>
  );
}
