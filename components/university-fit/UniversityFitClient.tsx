"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { saveUniversityFitQuiz } from "@/app/actions/university-fit";
import type { UniversityFitQuiz } from "@/lib/university-fit";

type Props = {
  initial: UniversityFitQuiz;
};

type FitFramework = {
  summary: string;
  reachTier: string;
  targetTier: string;
  safetyTier: string;
  factorsToVerify: string[];
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
      <div className="mt-1.5 min-w-0">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</p>}
    </label>
  );
}

const input = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors";

export function UniversityFitClient({ initial }: Props) {
  const [targetDegreeLevel, setTargetDegreeLevel] = useState(initial.targetDegreeLevel ?? "Master's");
  const [intendedField, setIntendedField] = useState(initial.intendedField ?? "");
  const [budgetCeilingUsd, setBudgetCeilingUsd] = useState(
    initial.budgetCeilingUsd != null ? String(initial.budgetCeilingUsd) : "",
  );
  const [academicScores, setAcademicScores] = useState(initial.academicScores ?? "");
  const [careerGoal, setCareerGoal] = useState(initial.careerGoal ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitFramework | null>(null);

  const canSubmit = intendedField.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    setResult(null);

    const budget = budgetCeilingUsd.trim() ? parseInt(budgetCeilingUsd, 10) : null;
    const saveRes = await saveUniversityFitQuiz({
      intendedField,
      targetDegreeLevel,
      budgetCeilingUsd: Number.isFinite(budget as number) ? budget : null,
      academicScores,
      careerGoal,
    });

    if (!saveRes.ok) {
      setSaving(false);
      setError(saveRes.error);
      return;
    }

    try {
      const res = await fetch("/api/university-fit/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Couldn't generate your framework. Try again.");
      } else {
        setResult(json.result as FitFramework);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-10">
      <Eyebrow>University &amp; course fit</Eyebrow>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
        Two minutes, then a shortlist framework
      </h1>
      <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
        This gives you a reasoning framework for your reach/target/safety tiers based on your
        profile — not a list of exact schools with guaranteed numbers. Every specific requirement
        (deadlines, GPA cutoffs, fees) can change, so treat those as things to verify on each
        program&rsquo;s official page, not facts to take on faith.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Target degree level">
            <select className={input} value={targetDegreeLevel} onChange={(e) => setTargetDegreeLevel(e.target.value)}>
              <option value="Undergrad">Undergrad</option>
              <option value="Master's">Master&rsquo;s</option>
              <option value="PhD">PhD</option>
            </select>
          </Field>
          <Field label="Intended field / major">
            <input
              className={input}
              value={intendedField}
              onChange={(e) => setIntendedField(e.target.value)}
              placeholder="e.g. Computer Science, Data Analytics"
            />
          </Field>
          <Field label="Budget ceiling (USD/year)" hint="Total cost, including living expenses.">
            <input
              type="number"
              min={0}
              className={input}
              value={budgetCeilingUsd}
              onChange={(e) => setBudgetCeilingUsd(e.target.value)}
              placeholder="e.g. 45000"
            />
          </Field>
          <Field label="Academic scores" hint="Whatever you have — GPA, GRE, TOEFL, etc.">
            <input
              className={input}
              value={academicScores}
              onChange={(e) => setAcademicScores(e.target.value)}
              placeholder="e.g. 3.6 GPA, 320 GRE, 105 TOEFL"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="What do you want to do after graduating?" hint="One or two sentences is enough.">
              <input
                className={input}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Work in data science in the US for a few years, then return home"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-muted)]">
            {canSubmit ? "Takes a few seconds to generate." : "Intended field is required to generate a framework."}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-persimmon)] px-5 py-2.5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {saving ? "Generating…" : "Get my shortlist framework"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-[var(--color-danger,#B4432A)]">{error}</p>
        )}
      </div>

      {result && (
        <div className="mt-8 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-6 sm:p-7">
          <Eyebrow>Your framework</Eyebrow>
          <p className="mt-3 text-base leading-relaxed text-[var(--color-ink)]">{result.summary}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--color-border-soft)] p-4">
              <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-persimmon-deep)]">Reach</span>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed">{result.reachTier}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border-soft)] p-4">
              <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-persimmon-deep)]">Target</span>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed">{result.targetTier}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border-soft)] p-4">
              <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-persimmon-deep)]">Safety</span>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed">{result.safetyTier}</p>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-xs font-medium text-[var(--color-ink-soft)]">Verify these before you apply anywhere</span>
            <ul className="mt-2 space-y-2">
              {result.factorsToVerify.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[var(--color-ink)]">
                  <span aria-hidden className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-persimmon)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 text-xs text-[var(--color-muted)]">
            This is a reasoning framework, not verified data about specific schools — every
            number here can change. Cross-check with{" "}
            <a
              href="https://studyinthestates.dhs.gov/school-search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
            >
              the SEVP school finder
            </a>{" "}
            and each program&rsquo;s official page before applying, and revisit{" "}
            <Link href="/dashboard/timeline/1" className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
              Step 1
            </Link>{" "}
            for the full shortlist checklist.
          </p>
        </div>
      )}
    </div>
  );
}
