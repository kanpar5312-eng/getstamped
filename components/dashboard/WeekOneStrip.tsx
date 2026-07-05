import Link from "next/link";
import { STEPS } from "@/lib/steps";
import type { StepProgress, Plan } from "@/lib/dashboard-state";

type StripItem = {
  day: string;
  title: string;
  icon: "user" | "doc" | "money" | "mic";
  locked?: boolean;
  completed?: boolean;
  href?: string;
};

function Icon({ kind }: { kind: StripItem["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    width: 16,
    height: 16,
    "aria-hidden": true,
  };
  switch (kind) {
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M8 13h7M8 17h5" />
        </svg>
      );
    case "money":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 9v6M18 9v6" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M6 11a6 6 0 0 0 12 0" />
          <path d="M12 17v4" />
        </svg>
      );
  }
}

function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={10}
      height={10}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* Rough keyword match so a real step title gets a sensible icon instead of
   a hand-picked one per hardcoded item. */
function iconFor(title: string): StripItem["icon"] {
  const t = title.toLowerCase();
  if (t.includes("mock") || t.includes("interview")) return "mic";
  if (t.includes("financ") || t.includes("fee") || t.includes("sevis") || t.includes("bank") || t.includes("fund")) return "money";
  if (t.includes("document") || t.includes("upload") || t.includes("form") || t.includes("photo") || t.includes("i-20") || t.includes("ds-160") || t.includes("passport")) return "doc";
  return "user";
}

type BuiltItem = StripItem & { phaseName: string };

/* Real upcoming steps for this user — the four steps right after
   whatever step they're actually on, pulled from lib/steps.ts. Starts
   at nextStepNumber + 1 (not nextStepNumber itself) since the current
   step already gets its own full card above this strip; repeating it
   here read as a duplicate, not a preview. "Locked" reflects the
   product's real gate (Phase 2+ requires a paid plan), not a fictional
   day-by-day unlock. */
function buildFromProgress(
  progress: StepProgress[],
  nextStepNumber: number,
  plan: Plan,
): BuiltItem[] {
  const completeSet = new Set(
    progress.filter((p) => p.status === "complete").map((p) => p.stepNumber),
  );
  const startIndex = Math.max(
    STEPS.findIndex((s) => s.number === nextStepNumber),
    0,
  ) + 1;
  return STEPS.slice(startIndex, startIndex + 4).map((s) => ({
    day: `Step ${s.number}`,
    title: s.title,
    icon: iconFor(s.title),
    completed: completeSet.has(s.number),
    locked: plan === "free" && !s.isFree,
    href: `/dashboard/timeline?step=${s.number}`,
    phaseName: s.phaseName,
  }));
}

export function WeekOneStrip({
  progress,
  nextStepNumber,
  plan,
  items,
  staggerIndex = 4,
}: {
  /** Real per-step completion data — combined with nextStepNumber to
   *  derive the default (unset `items`) view. */
  progress?: StepProgress[];
  /** The user's current step number (DashboardData.nextStep?.number). */
  nextStepNumber?: number;
  /** Determines the real Phase-2+ paywall lock, not a fictional one. */
  plan?: Plan;
  items?: (StripItem & { phaseName?: string })[];
  staggerIndex?: number;
}) {
  const data = items ?? buildFromProgress(progress ?? [], nextStepNumber ?? 1, plan ?? "free");

  return (
    <section
      data-stagger=""
      style={{ "--stagger-index": staggerIndex } as React.CSSProperties}
      className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
    >
      <div className="flex items-baseline justify-between">
        <p data-eyebrow="">Up next</p>
        <p className="text-[11px] text-[var(--stone)]">After your current step</p>
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((it) => {
          const clickable = Boolean(it.href) && !it.locked;
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--stone)]">
                  {it.day}
                </span>
                {it.locked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-sunken)] px-1.5 py-[3px] text-[var(--stone)]">
                    <LockGlyph />
                  </span>
                ) : it.completed ? (
                  <span className="inline-flex items-center rounded-full bg-[var(--success)]/15 px-1.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.06em] text-[var(--success)]">
                    Done
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-start gap-2.5">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: it.locked ? "var(--surface-sunken)" : "var(--ember-soft)",
                    color: it.locked ? "var(--stone)" : "var(--ember-hover)",
                  }}
                >
                  <Icon kind={it.icon} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium leading-snug text-[var(--ink)]">
                    {it.title}
                  </div>
                  {it.phaseName && (
                    <div className="mt-0.5 text-[11px] text-[var(--stone)]">
                      {it.phaseName}
                    </div>
                  )}
                </div>
              </div>
            </>
          );
          const sharedClassName =
            "relative flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 transition-colors";
          return (
            <li key={it.day} style={{ opacity: it.locked ? 0.65 : 1 }}>
              {clickable ? (
                <Link
                  href={it.href!}
                  className={`${sharedClassName} hover:border-[var(--line-hover)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`}
                >
                  {inner}
                </Link>
              ) : (
                <div className={sharedClassName} style={{ cursor: "default" }}>
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
