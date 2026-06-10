"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions/profile";

type Props = {
  firstName: string;
  initialCountry?: string;
};

type Answers = {
  country: string;
  university: string;
  intake_term: string;
  program_type: string;
  funding_source: string;
};

const COUNTRIES = [
  "India", "China", "Vietnam", "Nigeria", "Brazil", "South Korea",
  "Bangladesh", "Mexico", "Iran", "Saudi Arabia", "Pakistan", "Indonesia",
  "Turkey", "Egypt", "Philippines", "Thailand", "Japan", "Taiwan",
  "Colombia", "Kazakhstan", "Ghana", "Kenya", "United Kingdom", "Other",
];

const INTAKES = ["Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028", "Not sure yet"];

const PROGRAMS = [
  { id: "Undergrad", label: "Undergrad", desc: "Bachelor's degree, 4 years." },
  { id: "Master's",  label: "Master's",  desc: "1–2 year graduate program." },
  { id: "PhD",       label: "PhD",       desc: "Doctoral, research-focused." },
];

const FUNDING = [
  { id: "family",      label: "My family is paying",       desc: "Parents or relatives covering tuition + living." },
  { id: "loan",        label: "Education loan",            desc: "Bank or government-backed student loan." },
  { id: "scholarship", label: "Scholarship or assistantship", desc: "School-funded — partial or full." },
  { id: "mix",         label: "A mix of the above",        desc: "Family + loan + aid combined." },
  { id: "later",       label: "I'll figure this out later",desc: "Funding plan still in progress." },
];

const TOTAL_STEPS = 4;

export function OnboardingClient({ firstName, initialCountry }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = welcome, 1..4 = questions, 5 = done
  const [answers, setAnswers] = useState<Answers>({
    country: initialCountry ?? "",
    university: "",
    intake_term: "",
    program_type: "",
    funding_source: "",
  });
  const [saving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const finish = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        country: answers.country || undefined,
        university: answers.university || undefined,
        intake_term: answers.intake_term || undefined,
        program_type: answers.program_type || undefined,
        funding_source: answers.funding_source || undefined,
      });
      if (result.ok) {
        setStep(5);
      } else {
        setError(result.error);
      }
    });
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const skipThis = () => setStep((s) => Math.min(s + 1, 5));

  return (
    <main className="relative min-h-screen flex flex-col bg-[var(--color-cream)] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-[40%] mesh-layer-1 animate-mesh-slow opacity-70" />
        <div className="absolute -inset-[40%] mesh-layer-2 animate-mesh-medium opacity-60" />
      </div>

      {/* Top bar */}
      <div className="relative px-5 sm:px-6 py-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span aria-hidden className="block h-3 w-3 rounded-sm bg-[var(--color-forest)]" />
          <span className="font-display text-[19px] leading-none tracking-tight text-[var(--color-ink)]">
            GetStamped
          </span>
        </div>
        {step > 0 && step <= TOTAL_STEPS && (
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Finish later
          </button>
        )}
      </div>

      {/* Progress dots */}
      {step > 0 && step <= TOTAL_STEPS && (
        <div className="relative px-5 sm:px-6">
          <div className="mx-auto max-w-md flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={[
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i < step
                    ? "bg-[var(--color-forest)]"
                    : "bg-[var(--color-border-soft)]",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="mx-auto max-w-md mt-2 text-[11px] text-[var(--color-muted)] tabular-nums">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      )}

      {/* Card */}
      <div className="relative flex-1 flex items-center justify-center px-5 py-8">
        <div key={step} className="w-full max-w-xl animate-fade-up">
          {step === 0 && (
            <WelcomeStep firstName={firstName} onStart={() => setStep(1)} />
          )}

          {step === 1 && (
            <CountryStep
              value={answers.country}
              onChange={(v) => setAnswers((a) => ({ ...a, country: v }))}
              onNext={next}
              onBack={null}
              onSkip={skipThis}
            />
          )}

          {step === 2 && (
            <SchoolStep
              university={answers.university}
              intake={answers.intake_term}
              onChange={(u, i) => setAnswers((a) => ({ ...a, university: u, intake_term: i }))}
              onNext={next}
              onBack={prev}
              onSkip={skipThis}
            />
          )}

          {step === 3 && (
            <ProgramStep
              value={answers.program_type}
              onChange={(v) => setAnswers((a) => ({ ...a, program_type: v }))}
              onNext={next}
              onBack={prev}
              onSkip={skipThis}
            />
          )}

          {step === 4 && (
            <FundingStep
              value={answers.funding_source}
              onChange={(v) => setAnswers((a) => ({ ...a, funding_source: v }))}
              onNext={finish}
              onBack={prev}
              onSkip={finish}
              saving={saving}
              error={error}
            />
          )}

          {step === 5 && (
            <DoneStep
              firstName={firstName}
              onContinue={() => router.push("/dashboard")}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* ============================== Step shell ============================== */

function StepCard({
  eyebrow,
  title,
  why,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  why?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-[var(--color-cream-soft)]/90 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-6 sm:p-8">
      <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-2xl sm:text-[28px] tracking-tight text-[var(--color-ink)] leading-snug">
        {title}
      </h1>
      <div className="mt-6">{children}</div>
      {why && (
        <p className="mt-6 text-[11px] text-[var(--color-muted)] leading-relaxed flex items-start gap-2">
          <span aria-hidden className="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] text-[8px] font-medium shrink-0">i</span>
          <span>{why}</span>
        </p>
      )}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        {footer}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
    >
      {children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
    >
      ← Back
    </button>
  );
}

/* ============================= Step 0: Welcome ============================ */

function WelcomeStep({ firstName, onStart }: { firstName: string; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-[var(--color-cream-soft)]/90 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-8 sm:p-10 text-center">
      <span aria-hidden className="mx-auto block h-4 w-4 rounded-sm bg-[var(--color-forest)]" />
      <h1 className="mt-6 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-snug">
        Welcome, <span className="text-[var(--color-forest)]">{firstName}</span>.
      </h1>
      <p className="mt-4 max-w-md mx-auto text-sm sm:text-base text-[var(--color-ink-soft)] leading-relaxed">
        Four short questions so we can personalize your 47-step timeline.
        About 60 seconds. You can skip anything.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <PrimaryBtn onClick={onStart}>Let&rsquo;s go →</PrimaryBtn>
      </div>
      <p className="mt-6 text-[11px] text-[var(--color-muted)]">
        We never share your answers. Used only to personalize your steps.
      </p>
    </div>
  );
}

/* ============================ Step 1: Country ============================= */

function CountryStep({
  value, onChange, onNext, onBack, onSkip,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: null | (() => void);
  onSkip: () => void;
}) {
  return (
    <StepCard
      eyebrow="Question 1 of 4"
      title="Where are you applying from?"
      why="We adjust document requirements per consulate — Mumbai's financial proof list differs from Lagos's."
      footer={
        <>
          <div className="flex items-center gap-3">
            {onBack && <BackBtn onClick={onBack} />}
            <GhostBtn onClick={onSkip}>Skip</GhostBtn>
          </div>
          <PrimaryBtn onClick={onNext} disabled={!value}>Continue →</PrimaryBtn>
        </>
      }
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
      >
        <option value="" disabled>Pick your country…</option>
        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </StepCard>
  );
}

/* ============================ Step 2: School ============================== */

function SchoolStep({
  university, intake, onChange, onNext, onBack, onSkip,
}: {
  university: string;
  intake: string;
  onChange: (u: string, i: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <StepCard
      eyebrow="Question 2 of 4"
      title="Where are you going?"
      why="Drives every deadline in your timeline. You can fill these in later if you're still deciding."
      footer={
        <>
          <div className="flex items-center gap-3">
            <BackBtn onClick={onBack} />
            <GhostBtn onClick={onSkip}>Skip</GhostBtn>
          </div>
          <PrimaryBtn onClick={onNext}>Continue →</PrimaryBtn>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">University</span>
          <input
            value={university}
            onChange={(e) => onChange(e.target.value, intake)}
            placeholder="e.g. North Carolina State University"
            className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-colors"
          />
          <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">Leave blank if you haven&rsquo;t picked yet.</p>
        </label>

        <fieldset>
          <legend className="text-xs font-medium text-[var(--color-ink-soft)]">When do you start?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTAKES.map((opt) => {
              const active = intake === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(university, opt)}
                  className={[
                    "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors",
                    active
                      ? "bg-[var(--color-forest)] border-[var(--color-forest)] text-[var(--color-cream-soft)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]/60",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </StepCard>
  );
}

/* ============================ Step 3: Program ============================= */

function ProgramStep({
  value, onChange, onNext, onBack, onSkip,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <StepCard
      eyebrow="Question 3 of 4"
      title="What kind of program?"
      why="Mock interview questions adjust to your level. PhD applicants get research-funding questions; undergrads don't."
      footer={
        <>
          <div className="flex items-center gap-3">
            <BackBtn onClick={onBack} />
            <GhostBtn onClick={onSkip}>Skip</GhostBtn>
          </div>
          <PrimaryBtn onClick={onNext} disabled={!value}>Continue →</PrimaryBtn>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PROGRAMS.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={[
                "text-left rounded-xl border p-4 transition-colors",
                active
                  ? "border-[var(--color-forest)] bg-[var(--color-cream-soft)] ring-1 ring-[var(--color-forest)]/30"
                  : "border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] hover:border-[var(--color-border)]",
              ].join(" ")}
            >
              <p className="font-display text-lg tracking-tight text-[var(--color-ink)] leading-snug">{p.label}</p>
              <p className="mt-1.5 text-xs text-[var(--color-ink-soft)] leading-relaxed">{p.desc}</p>
            </button>
          );
        })}
      </div>
    </StepCard>
  );
}

/* ============================ Step 4: Funding ============================= */

function FundingStep({
  value, onChange, onNext, onBack, onSkip, saving, error,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <StepCard
      eyebrow="Question 4 of 4 · Last one"
      title="Funding plan?"
      why="Officers always ask. Different sources need different paperwork — we tailor your document checklist to match. No dollar amounts needed."
      footer={
        <>
          <div className="flex items-center gap-3">
            <BackBtn onClick={onBack} />
            <GhostBtn onClick={onSkip}>{saving ? "Saving…" : "Skip and finish"}</GhostBtn>
          </div>
          <PrimaryBtn onClick={onNext} disabled={!value || saving}>
            {saving ? "Saving…" : "Finish setup →"}
          </PrimaryBtn>
        </>
      }
    >
      <div className="space-y-2">
        {FUNDING.map((f) => {
          const active = value === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange(f.id)}
              className={[
                "w-full text-left rounded-xl border p-3.5 transition-colors flex items-start gap-3",
                active
                  ? "border-[var(--color-forest)] bg-[var(--color-cream-soft)] ring-1 ring-[var(--color-forest)]/30"
                  : "border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] hover:border-[var(--color-border)]",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  active ? "border-[var(--color-forest)] bg-[var(--color-forest)]" : "border-[var(--color-border)]",
                ].join(" ")}
              >
                {active && <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-cream-soft)]" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-ink)]">{f.label}</p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)] leading-relaxed">{f.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
      <p className="mt-4 text-[11px] text-[var(--color-muted)]">
        Only you can see this. We never share with universities, sponsors, or anyone else.
      </p>
    </StepCard>
  );
}

/* ============================ Step 5: Done ================================ */

function DoneStep({ firstName, onContinue }: { firstName: string; onContinue: () => void }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-[var(--color-cream-soft)]/90 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-8 sm:p-10 text-center">
      <span aria-hidden className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-forest)] text-[var(--color-cream-soft)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-11" /></svg>
      </span>
      <h1 className="mt-6 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-snug">
        You&rsquo;re set up.
      </h1>
      <p className="mt-4 max-w-md mx-auto text-sm sm:text-base text-[var(--color-ink-soft)] leading-relaxed">
        Forty-seven steps. Let&rsquo;s start with Phase 1, {firstName}.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <PrimaryBtn onClick={onContinue}>Open my timeline →</PrimaryBtn>
      </div>
    </div>
  );
}
