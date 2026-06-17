import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard-state";
import { CountUp } from "@/components/dashboard/CountUp";

type Props = { data: DashboardData };

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Block1Greeting({ data }: Props) {
  const { state, profile, stepsComplete, percentComplete, currentPhaseName } = data;
  const isStateA = state === "A";
  const firstName = capitalize(profile.firstName);

  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": 1 } as React.CSSProperties}
    >
      <h1 className="animate-hero-rise font-display text-[28px] sm:text-[40px] tracking-tight text-[var(--ink)] leading-tight">
        {isStateA ? `Welcome, ${firstName}.` : `Hi, ${firstName}.`}
      </h1>

      <p
        className="animate-hero-rise mt-2 text-[15px] text-[var(--ink-soft)]"
        style={{ animationDelay: "80ms" }}
      >
        {isStateA ? (
          <>Let&rsquo;s set up your timeline.</>
        ) : currentPhaseName ? (
          <>
            You&rsquo;re on{" "}
            <span className="font-medium text-[var(--ink)]">{currentPhaseName}</span>.
          </>
        ) : (
          <>You&rsquo;ve completed every step.</>
        )}
      </p>

      {!isStateA && (
        <>
          <div
            className="animate-hero-rise mt-6 h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden"
            style={{ animationDelay: "160ms" }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={47}
            aria-valuenow={stepsComplete}
            aria-label="Overall progress"
          >
            <div
              className="progress-ember h-full rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div
            className="animate-hero-rise mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[13px] text-[var(--stone)]"
            style={{ animationDelay: "240ms" }}
          >
            <span>
              <CountUp value={stepsComplete} className="font-medium text-[var(--ink)]" />{" "}
              of 47 complete ·{" "}
              <CountUp
                value={percentComplete}
                className="font-medium text-[var(--ink)]"
                suffix="%"
              />{" "}
              done
            </span>
            <Link
              href="/dashboard/timeline"
              className="text-[var(--ember-hover)] hover:text-[var(--ember)] transition-colors"
            >
              View full timeline →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
