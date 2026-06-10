import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard-state";

type Props = {
  data: DashboardData;
};

export function Block1Greeting({ data }: Props) {
  const {
    state,
    profile,
    stepsComplete,
    percentComplete,
    currentPhaseName,
  } = data;

  const isStateA = state === "A";

  return (
    <section>
      <h1
        className="animate-hero-rise font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight"
      >
        {isStateA ? `Welcome, ${profile.firstName}.` : `Hi, ${profile.firstName}.`}
      </h1>

      <p
        className="animate-hero-rise mt-2 text-sm text-[var(--color-ink-soft)]"
        style={{ animationDelay: "80ms" }}
      >
        {isStateA ? (
          <>Let&rsquo;s set up your timeline.</>
        ) : currentPhaseName ? (
          <>
            You&rsquo;re on{" "}
            <span className="font-medium text-[var(--color-forest)]">
              {currentPhaseName}
            </span>
            .
          </>
        ) : (
          <>You&rsquo;ve completed every step.</>
        )}
      </p>

      {!isStateA && (
        <>
          <div
            className="animate-hero-rise mt-6 h-1.5 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden"
            style={{ animationDelay: "160ms" }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={47}
            aria-valuenow={stepsComplete}
            aria-label="Overall progress"
          >
            <div
              className="progress-ember h-full rounded-full bg-[var(--color-accent)] transition-all duration-700 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div
            className="animate-hero-rise mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--color-muted)]"
            style={{ animationDelay: "240ms" }}
          >
            <span>
              <span className="font-medium text-[var(--color-ink)] tabular-nums">
                {stepsComplete}
              </span>{" "}
              of 47 complete ·{" "}
              <span className="font-medium text-[var(--color-ink)] tabular-nums">
                {percentComplete}%
              </span>{" "}
              done
            </span>
            <Link
              href="/dashboard/timeline"
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
            >
              View full timeline →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
