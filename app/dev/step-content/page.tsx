import { notFound } from "next/navigation";
import { STEPS } from "@/lib/steps";
import { resolveStepContent } from "@/lib/resolveStepContent";
import { ALL_HOME_COUNTRIES, HOME_COUNTRY_LABEL } from "@/lib/home-countries";

export const dynamic = "force-dynamic";

export default async function DevStepContentPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-12">
      <header>
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-muted)]">
          Dev only · localhost
        </p>
        <h1 className="mt-3 font-display text-[32px] tracking-tight text-[var(--color-ink)] leading-tight">
          Playbook content status
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
          Per-step, per-country content status. &ldquo;Verified&rdquo; means real,
          researched content exists for that country. Everything else falls
          back to the universal step text. Internal tracking only — never
          shown to users.
        </p>
        <p className="mt-3 text-[12px] text-[var(--color-muted)]">
          This page returns 404 in production builds.
        </p>
      </header>

      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-paper-soft)]">
              <th className="sticky left-0 bg-[var(--color-paper-soft)] px-3 py-2 text-left font-medium text-[var(--color-ink)]">
                Step
              </th>
              {ALL_HOME_COUNTRIES.map((code) => (
                <th key={code} className="px-3 py-2 text-left font-medium text-[var(--color-ink)]" title={HOME_COUNTRY_LABEL[code]}>
                  {code === "CA_ORIGIN" ? "CA" : code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STEPS.map((step) => (
              <tr key={step.number} className="border-b border-[var(--color-border-soft)] last:border-0">
                <td className="sticky left-0 bg-[var(--color-paper)] px-3 py-2 text-[var(--color-ink)]">
                  <span className="tabular-nums text-[var(--color-muted)]">{String(step.number).padStart(2, "0")}</span>{" "}
                  {step.title}
                </td>
                {ALL_HOME_COUNTRIES.map((code) => {
                  const status = resolveStepContent(step, code).contentStatus;
                  const verified = status === "verified";
                  return (
                    <td key={code} className="px-3 py-2">
                      <span
                        className={
                          verified
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800"
                            : "inline-flex rounded-full bg-[var(--color-paper-soft)] px-2 py-0.5 text-[var(--color-muted)]"
                        }
                      >
                        {status}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
