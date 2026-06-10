"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AskPanel } from "@/components/dashboard/AskPanel";
import { UpgradeModal } from "@/components/timeline/UpgradeModal";
import { markStep } from "@/app/actions/step-progress";
import type { Step } from "@/lib/steps";
import type { StepRichContent } from "@/lib/step-content";
import type { StepStatus } from "@/lib/timeline-data";

type DocState = { name: string; description: string; required: boolean; uploadedAt: Date | null };

type Props = {
  step: Step;
  content: StepRichContent;
  initialStatus: StepStatus;
  prevStep: Step | null;
  nextStep: Step | null;
  phaseCompleted: number;
  phaseTotal: number;
};

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-11" /></svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
}
function ArrowLeft() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5" /><path d="M11 5l-7 7 7 7" /></svg>;
}
function ArrowRight() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></svg>;
}
function ExternalLinkIcon() {
  return <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M21 14v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7" /></svg>;
}
function AmberWarning() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2L2 21h20L12 2z" /><line x1="12" y1="10" x2="12" y2="15" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
}
function MessageIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
function UploadIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}

function StatusPill({ status }: { status: StepStatus }) {
  if (status === "complete")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest)]/[0.08] border border-[var(--color-forest)]/20 px-2.5 py-1 text-[10px] font-medium text-[var(--color-forest)] uppercase tracking-wider">
        <CheckIcon className="h-3 w-3" /> Complete
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/30 px-2.5 py-1 text-[10px] font-medium text-[var(--color-accent-deep)] uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" /> In progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cream-deep)] border border-[var(--color-border-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wider">
      Not started
    </span>
  );
}

export function StepDetailClient({
  step,
  content,
  initialStatus,
  prevStep,
  nextStep,
  phaseCompleted,
  phaseTotal,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<StepStatus>(initialStatus);
  const [docs, setDocs] = useState<DocState[]>(() =>
    content.documents.map((d) => ({ ...d, uploadedAt: null })),
  );
  const [askOpen, setAskOpen] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [, startTransition] = useTransition();
  const instructionsRef = useRef<HTMLElement>(null);

  // Locked detection
  const isLocked = initialStatus === "locked";

  // Auto in_progress on 60% scroll past instructions
  useEffect(() => {
    if (status !== "available" || isLocked) return;
    const el = instructionsRef.current;
    if (!el) return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const rect = el.getBoundingClientRect();
      const viewportPct = 1 - Math.max(0, rect.bottom) / window.innerHeight;
      if (viewportPct > 0.6) {
        fired = true;
        setStatus("in_progress");
        void markStep(step.number, "in_progress");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [status, isLocked, step.number]);

  const uploadedCount = docs.filter((d) => d.uploadedAt).length;
  const docPercent = docs.length ? Math.round((uploadedCount / docs.length) * 100) : 0;

  const handleUpload = (i: number) => {
    setDocs((d) =>
      d.map((doc, idx) =>
        idx === i ? { ...doc, uploadedAt: new Date() } : doc,
      ),
    );
  };

  const markComplete = () => {
    setStatus("complete");
    setShowCelebrate(true);
    void markStep(step.number, "complete");
    setTimeout(() => {
      setShowCelebrate(false);
      startTransition(() => {
        if (step.number === 47) {
          router.push("/celebration");
        } else if (nextStep) {
          router.push(`/dashboard/timeline/${nextStep.number}`);
        } else {
          router.refresh();
        }
      });
    }, 800);
  };

  const reopen = () => {
    setStatus("in_progress");
    void markStep(step.number, "in_progress");
  };

  // ------------------------- Paywall variant -------------------------
  if (isLocked) {
    return (
      <div className="relative">
        <div className="pointer-events-none" style={{ filter: "blur(8px)", opacity: 0.5 }}>
          <StepDetailMain
            step={step}
            content={content}
            status="available"
            docs={docs}
            uploadedCount={uploadedCount}
            docPercent={docPercent}
            instructionsRef={instructionsRef}
            onUpload={() => {}}
            onMarkComplete={() => {}}
            onReopen={() => {}}
            showCelebrate={false}
            prevStep={prevStep}
            nextStep={nextStep}
            askOpen={false}
            setAskOpen={() => {}}
            phaseCompleted={phaseCompleted}
            phaseTotal={phaseTotal}
          />
        </div>

        {/* Centered upgrade card */}
        <div className="fixed inset-0 z-30 flex items-center justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto max-w-md rounded-2xl border border-white/40 bg-[var(--color-cream-soft)]/95 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_40px_100px_-30px_rgba(20,33,28,0.5)] p-6 sm:p-7 text-center animate-fade-up">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-forest)] text-[var(--color-cream-soft)] mx-auto">
              <LockIcon />
            </span>
            <h2 className="mt-4 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">
              This step is beyond Phase 1
            </h2>
            <p className="mt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">
              Unlock all 47 steps, voice mock interviews, AI Q&amp;A, and the
              document organizer for $19 lifetime.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/dashboard/timeline" className="block">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors"
                >
                  Back to timeline
                </button>
              </Link>
              <Link href="/dashboard/upgrade" className="block">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors"
                >
                  Unlock all 47 steps →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------- Standard variant ------------------------
  return (
    <>
      <StepDetailMain
        step={step}
        content={content}
        status={status}
        docs={docs}
        uploadedCount={uploadedCount}
        docPercent={docPercent}
        instructionsRef={instructionsRef}
        onUpload={handleUpload}
        onMarkComplete={markComplete}
        onReopen={reopen}
        showCelebrate={showCelebrate}
        prevStep={prevStep}
        nextStep={nextStep}
        askOpen={askOpen}
        setAskOpen={setAskOpen}
        phaseCompleted={phaseCompleted}
        phaseTotal={phaseTotal}
      />
      <AskPanel
        open={askOpen}
        onClose={() => setAskOpen(false)}
        stepNumber={step.number}
      />
    </>
  );
}

/* ============================== Main shell ============================== */

type MainProps = {
  step: Step;
  content: StepRichContent;
  status: StepStatus;
  docs: DocState[];
  uploadedCount: number;
  docPercent: number;
  instructionsRef: React.RefObject<HTMLElement | null>;
  onUpload: (i: number) => void;
  onMarkComplete: () => void;
  onReopen: () => void;
  showCelebrate: boolean;
  prevStep: Step | null;
  nextStep: Step | null;
  askOpen: boolean;
  setAskOpen: (b: boolean) => void;
  phaseCompleted: number;
  phaseTotal: number;
};

function StepDetailMain({
  step,
  content,
  status,
  docs,
  uploadedCount,
  docPercent,
  instructionsRef,
  onUpload,
  onMarkComplete,
  onReopen,
  showCelebrate,
  prevStep,
  nextStep,
  askOpen,
  setAskOpen,
  phaseCompleted,
  phaseTotal,
}: MainProps) {
  return (
    <>
      {/* Celebration overlay */}
      {showCelebrate && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-fade-up">
          <div className="inline-flex items-center gap-3 rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-medium text-[var(--color-cream-soft)] shadow-[0_18px_40px_-15px_rgba(20,33,28,0.45)]">
            <CheckIcon className="h-4 w-4" /> Step {step.number} complete
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
        <span aria-hidden>→</span>
        <Link href="/dashboard/timeline" className="hover:text-[var(--color-ink)] transition-colors">Timeline</Link>
        <span aria-hidden>→</span>
        <span className="text-[var(--color-ink-soft)]">Step {step.number}</span>
      </nav>

      {/* Header */}
      <header className="mt-6 animate-hero-rise">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusPill status={status} />
          <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
            Step {String(step.number).padStart(2, "0")} of 47 · Phase {step.phase}
          </span>
        </div>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          {step.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
          {step.shortDescription}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
          <span>{step.estimatedMinutes} min estimated</span>
          <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
          <span>{step.documentsNeeded} document{step.documentsNeeded === 1 ? "" : "s"}</span>
          <span aria-hidden className="h-0.5 w-0.5 rounded-full bg-[var(--color-border)]" />
          <span>{step.phaseName}</span>
        </div>
      </header>

      <div className="mt-8 flex flex-col lg:flex-row lg:gap-10">
        {/* Main column */}
        <div className="flex-1 min-w-0 lg:max-w-3xl">
          {/* Instructions */}
          <section ref={instructionsRef} className="pb-10 border-b border-[var(--color-border-soft)] animate-fade-up">
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Instructions</span>
            <h2 className="mt-3 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">What to do</h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ink)]">{content.intro}</p>

            <ol className="mt-8 space-y-6">
              {content.subSteps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] text-sm font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-[var(--color-ink)] leading-snug">{s.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-ink-soft)] leading-relaxed">{s.body}</p>
                    {s.link && (
                      <a href={s.link.href} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
                        {s.link.label} <ExternalLinkIcon />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {content.outro && (
              <p className="mt-8 text-sm text-[var(--color-ink-soft)] leading-relaxed italic">
                {content.outro}
              </p>
            )}
          </section>

          {/* Documents */}
          {docs.length > 0 && (
            <section className="py-10 border-b border-[var(--color-border-soft)] animate-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Documents</span>
                  <h2 className="mt-3 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">What to gather</h2>
                </div>
                <span className="text-xs text-[var(--color-muted)] tabular-nums">
                  {uploadedCount}/{docs.length} uploaded · {docPercent}%
                </span>
              </div>
              <div className="mt-4 h-1 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden">
                <div className="h-full bg-[var(--color-forest)] transition-all duration-700" style={{ width: `${docPercent}%` }} />
              </div>

              <ul className="mt-6 divide-y divide-[var(--color-border-soft)] rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] overflow-hidden">
                {docs.map((d, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 sm:px-5 py-4">
                    <span aria-hidden className={[
                      "inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                      d.uploadedAt ? "bg-[var(--color-forest)] text-[var(--color-cream-soft)]" : "border border-[var(--color-border)] bg-[var(--color-surface)]",
                    ].join(" ")}>
                      {d.uploadedAt && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[var(--color-ink)]">{d.name}</span>
                        {d.required && <span className="text-[9px] uppercase tracking-wider text-[var(--color-accent-deep)] font-medium">Required</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)] leading-relaxed">{d.description}</p>
                    </div>
                    {d.uploadedAt ? (
                      <span className="text-[11px] text-[var(--color-forest)] shrink-0">Uploaded</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpload(i)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors shrink-0"
                      >
                        <UploadIcon /> Upload
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Common mistakes */}
          {content.mistakes.length > 0 && (
            <section className="py-10 border-b border-[var(--color-border-soft)] animate-fade-up" style={{ animationDelay: "120ms" }}>
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Common mistakes</span>
              <h2 className="mt-3 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">What to avoid</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.mistakes.map((m, i) => (
                  <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-2.5">
                      <AmberWarning />
                      <div>
                        <h3 className="text-sm font-medium text-amber-900">{m.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-amber-900/80">{m.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Why this matters */}
          <section className="py-10 border-b border-[var(--color-border-soft)] animate-fade-up" style={{ animationDelay: "180ms" }}>
            <div className="rounded-2xl bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 p-5 sm:p-6">
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-deep)]">Why this step matters</span>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]">{content.whyItMatters}</p>
            </div>
          </section>

          {/* Mark complete CTA */}
          <section className="py-10 border-b border-[var(--color-border-soft)] animate-fade-up" style={{ animationDelay: "240ms" }}>
            {status === "complete" ? (
              <div className="rounded-2xl border border-[var(--color-forest)]/30 bg-[var(--color-forest)]/[0.06] p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-forest)] text-[var(--color-cream-soft)]">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg tracking-tight text-[var(--color-ink)]">Step complete</h3>
                    <p className="text-xs text-[var(--color-muted)]">Nice work. Keep going.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={onReopen} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors">
                    Reopen
                  </button>
                  {nextStep && (
                    <Link href={`/dashboard/timeline/${nextStep.number}`}>
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors">
                        Next step <ArrowRight />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-display text-lg tracking-tight text-[var(--color-ink)]">Done with this step?</h3>
                  <p className="text-xs text-[var(--color-muted)]">Marking complete updates your dashboard and unlocks the next step.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors">
                    Save for later
                  </button>
                  <button type="button" onClick={onMarkComplete} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors">
                    <CheckIcon className="h-3.5 w-3.5" /> Mark complete
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Step nav footer */}
          <section className="py-10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
            {prevStep ? (
              <Link href={`/dashboard/timeline/${prevStep.number}`} className="block">
                <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4 hover:border-[var(--color-border)] transition-colors group">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)] group-hover:text-[var(--color-accent-deep)] transition-colors">
                    <ArrowLeft /> Previous · step {prevStep.number}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)] leading-snug">{prevStep.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextStep ? (
              <Link href={`/dashboard/timeline/${nextStep.number}`} className="block">
                <div className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4 hover:border-[var(--color-border)] transition-colors text-right group">
                  <div className="flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)] group-hover:text-[var(--color-accent-deep)] transition-colors">
                    Next · step {nextStep.number} <ArrowRight />
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)] leading-snug">{nextStep.title}</p>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl border border-[var(--color-forest)] bg-[var(--color-forest)] text-[var(--color-cream-soft)] p-4 text-right">
                <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-cream-soft)]/70">Final step</div>
                <p className="mt-1.5 text-sm font-medium">Finish your visa journey →</p>
              </div>
            )}
          </section>
        </div>

        {/* Right rail */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 self-start sticky top-24">
          <div className="space-y-3">
            {/* Phase progress */}
            <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4">
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Phase progress</span>
              <div className="mt-2 font-display text-2xl tracking-tight text-[var(--color-forest)] tabular-nums">
                {phaseCompleted}/{phaseTotal}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">{step.phaseName}</div>
              <div className="mt-3 h-1 w-full rounded-full bg-[var(--color-border-soft)] overflow-hidden">
                <div className="h-full bg-[var(--color-forest)]" style={{ width: `${(phaseCompleted / phaseTotal) * 100}%` }} />
              </div>
            </div>

            {/* Ask about this step */}
            <button
              type="button"
              onClick={() => setAskOpen(true)}
              className="w-full text-left rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4 hover:border-[var(--color-border)] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)]">
                  <MessageIcon />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent-deep)] transition-colors">Ask about this step</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">Get an AI answer scoped to this step.</p>
                </div>
              </div>
            </button>

            {/* Related steps */}
            {content.relatedSteps.length > 0 && (
              <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4">
                <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Related steps</span>
                <ul className="mt-3 space-y-2">
                  {content.relatedSteps.map((n) => {
                    return (
                      <li key={n}>
                        <Link href={`/dashboard/timeline/${n}`} className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-accent-deep)] transition-colors">
                          <span className="font-mono text-[10px] text-[var(--color-muted)] tabular-nums">{String(n).padStart(2, "0")}</span>
                          <span className="truncate">Step {n}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Storage stat */}
            {docs.length > 0 && (
              <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4">
                <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Documents on file</span>
                <div className="mt-2 font-display text-2xl tracking-tight text-[var(--color-forest)] tabular-nums">
                  {uploadedCount}/{docs.length}
                </div>
                <Link href="/dashboard/documents" className="mt-1 inline-block text-xs text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">
                  Manage all →
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border-soft)] bg-[var(--color-cream-soft)]/95 backdrop-blur-2xl backdrop-saturate-150 px-4 py-3 flex items-center gap-3">
        {prevStep ? (
          <Link href={`/dashboard/timeline/${prevStep.number}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]">
            <ArrowLeft />
          </Link>
        ) : <div className="w-10" />}
        {status === "complete" ? (
          nextStep ? (
            <Link href={`/dashboard/timeline/${nextStep.number}`} className="flex-1">
              <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2.5 text-sm font-medium text-[var(--color-cream-soft)]">
                Next step <ArrowRight />
              </button>
            </Link>
          ) : (
            <button type="button" disabled className="flex-1 rounded-lg bg-[var(--color-forest)] px-4 py-2.5 text-sm font-medium text-[var(--color-cream-soft)]">
              Final step
            </button>
          )
        ) : (
          <button type="button" onClick={onMarkComplete} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2.5 text-sm font-medium text-[var(--color-cream-soft)]">
            <CheckIcon className="h-3.5 w-3.5" /> Mark complete
          </button>
        )}
        {nextStep ? (
          <Link href={`/dashboard/timeline/${nextStep.number}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)]">
            <ArrowRight />
          </Link>
        ) : <div className="w-10" />}
      </div>
      <div className="lg:hidden h-20" aria-hidden />
    </>
  );
}
