import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { computeDashboard } from "@/lib/dashboard-state";
import { getCurrentUser } from "@/lib/current-user";
import { Block1Greeting } from "@/components/dashboard/Block1Greeting";
import { Block2NextStep } from "@/components/dashboard/Block2NextStep";
import { Block3Interview } from "@/components/dashboard/Block3Interview";
import { Block4QuickActions } from "@/components/dashboard/Block4QuickActions";
import { PhaseStepper } from "@/components/dashboard/PhaseStepper";

export const metadata: Metadata = {
  title: "Dashboard — GetStamped",
};

type SearchParams = Promise<{ state?: string }>;

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { profile, progress } = await getCurrentUser(params.state);
  const data = computeDashboard(profile, progress);

  // State E: visa stamped → redirect to celebration
  if (data.state === "E") {
    redirect("/celebration");
  }

  const isImminent = data.state === "D";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]"
      >
        <span className="text-[var(--color-ink-soft)]">Dashboard</span>
      </nav>

      {/* Phase stepper — always visible, "you know where you are" */}
      <div className="mt-6">
        <PhaseStepper
          currentPhase={data.currentPhase}
          stepsComplete={data.stepsComplete}
        />
      </div>

      {/* Block 1 */}
      <div className="mt-10">
        <Block1Greeting data={data} />
      </div>

      {/* Block 2 and Block 3 — order swaps in State D */}
      {isImminent ? (
        <>
          <Block3Interview data={data} />
          <Block2NextStep data={data} />
        </>
      ) : (
        <>
          <Block2NextStep data={data} />
          <Block3Interview data={data} />
        </>
      )}

      {/* Block 4 — quick actions */}
      <Block4QuickActions />

      {/* Dev-only state switcher (kept for now; remove once auth lands) */}
      <DevStateSwitcher current={data.state} />
    </div>
  );
}

function DevStateSwitcher({ current }: { current: string }) {
  return (
    <aside className="mt-12 mx-auto max-w-md rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-cream-soft)] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
        Dev preview · dashboard states
      </p>
      <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
        Currently rendering state{" "}
        <span className="font-mono font-medium text-[var(--color-ink)]">
          {current}
        </span>
        . Click to switch:
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(["A", "B", "C", "D", "E", "F"] as const).map((s) => (
          <Link
            key={s}
            href={`/dashboard?state=${s}`}
            className={[
              "rounded-md border px-2.5 py-1 text-xs font-mono transition-colors",
              s === current
                ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-[var(--color-cream-soft)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)]",
            ].join(" ")}
          >
            {s}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[var(--color-muted)] leading-relaxed">
        A = just signed up · B = standard · C = stuck 9d · D = interview in 5d
        · E = visa stamped (redirects) · F = free-tier paywall hit
      </p>
    </aside>
  );
}
