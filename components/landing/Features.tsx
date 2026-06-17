import { Eyebrow } from "@/components/ui/Eyebrow";
import { PHASES } from "@/lib/constants";
import {
  STEPS_SOURCE_DOMAIN,
  stepsLastUpdatedLabel,
  stepsLastUpdatedRelative,
} from "@/lib/steps-meta";

function MiniTimeline() {
  return (
    <div className="mt-5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4">
      <ul className="divide-y divide-[var(--color-border-soft)]">
        {PHASES.map((p, i) => {
          const done = i <= 2;
          return (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <span
                className={
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-paper-soft)] " +
                  (done
                    ? "bg-[var(--color-persimmon)]"
                    : "bg-[var(--color-paper-deep)] text-[var(--color-muted)] border border-[var(--color-border)]")
                }
              >
                {done ? (
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                ) : (
                  <span className="text-[9px] font-mono">{i + 1}</span>
                )}
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {p.label}
              </span>
              <span className="ml-auto text-sm text-[var(--color-ink)] truncate">
                {p.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocStack() {
  // Tightly bounded — overflow-hidden so papers never escape the box,
  // and pt-4 keeps the checkmark badge inside the wrapper instead of
  // bleeding up into the heading on narrow screens.
  return (
    <div className="mt-5 relative h-[160px] sm:h-[180px] overflow-hidden pt-4 px-2">
      <div className="relative mx-auto w-[120px] sm:w-[132px] h-[140px] sm:h-[152px]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            style={{
              transform: `rotate(${(i - 1) * 5}deg) translateY(${i * 4}px)`,
              zIndex: 3 - i,
            }}
          >
            <div className="h-1 w-2/3 rounded-full bg-[var(--color-paper-deep)]" />
            <div className="mt-2 h-1 w-1/2 rounded-full bg-[var(--color-paper-deep)]" />
            <div className="mt-4 space-y-1">
              <div className="h-1 w-full rounded-full bg-[var(--color-paper-deep)]" />
              <div className="h-1 w-full rounded-full bg-[var(--color-paper-deep)]" />
              <div className="h-1 w-4/5 rounded-full bg-[var(--color-paper-deep)]" />
            </div>
            {i === 0 && (
              <span
                className="absolute inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]"
                style={{ top: 6, right: 6 }}
              >
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12l5 5 9-11" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VoiceOrbMini() {
  return (
    <div className="mt-5 flex items-center justify-center h-[120px]">
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/30 animate-voice-ring" />
        <div className="relative h-16 w-16 rounded-full bg-[var(--color-accent)] animate-voice-orb shadow-[0_18px_40px_-15px_rgba(34,158,217,0.45)] flex items-center justify-center">
          <div className="flex items-end gap-0.5 h-5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="block w-0.5 h-full rounded-full bg-[var(--color-paper-soft)]/90 origin-bottom animate-voice-bar"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble() {
  return (
    <div className="mt-5 space-y-2 h-[120px] flex flex-col justify-center">
      <div className="self-end max-w-[80%] rounded-2xl rounded-tr-md bg-[var(--color-paper-deep)] text-[var(--color-ink)] px-3 py-2 text-xs">
        Do I need a US bank statement?
      </div>
      <div className="self-start inline-flex items-center gap-1.5 max-w-[80%] rounded-2xl rounded-tl-md bg-[var(--color-accent)] text-[var(--color-paper-soft)] px-3 py-2.5">
        <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" />
        <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" style={{ animationDelay: "0.15s" }} />
        <span className="h-1 w-1 rounded-full bg-current animate-typing-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}

function ParentMini() {
  return (
    <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
          Parent view
        </span>
        <span className="inline-flex items-center gap-1 text-[9px] text-[var(--color-ink)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-persimmon)] animate-soft-pulse" />
          Live
        </span>
      </div>
      <div className="mt-2 text-xs font-display text-[var(--color-ink)] leading-snug">
        Aarav · Phase 4
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
        <div className="h-full bg-[var(--color-persimmon)]" style={{ width: "68%" }} />
      </div>
      <div className="mt-1.5 text-[10px] font-mono text-[var(--color-muted)]">
        32 of 47 complete
      </div>
    </div>
  );
}

function Card({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl p-6 sm:p-7 transition-colors",
        dark
          ? "border border-[var(--color-ink-deep)] bg-[var(--color-persimmon)] text-[var(--color-paper-soft)]"
          : "border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] hover:border-[var(--color-border)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="w-full bg-[var(--color-paper)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <Eyebrow>What&rsquo;s inside</Eyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-snug text-[var(--color-ink)]">
            Everything you need. Nothing you don&rsquo;t.
          </h2>
        </div>

        {/* Bento grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Row 1: headliner [2] + tall [1] */}
          <Card className="lg:col-span-2">
            <h3 className="font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">
              A timeline you actually follow.
            </h3>
            <MiniTimeline />
            <p className="mt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed max-w-xl">
              All 47 steps. Personalized to your intake date. Updated as the
              State Department updates its rules.
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
              Documents, organized.
            </h3>
            <DocStack />
            <p className="mt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed">
              Upload once. Auto-categorized by step. Auto-generated
              interview-day checklist PDF.
            </p>
          </Card>

          {/* Row 2: 1 + 1 + (col 3 is the tall card above) */}
          <Card>
            <h3 className="font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
              Voice mock interview.
            </h3>
            <VoiceOrbMini />
            <p className="mt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed">
              Practice out loud. Get scored. Improve.
            </p>
          </Card>

          <Card>
            <h3 className="font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
              AI answers, instantly.
            </h3>
            <ChatBubble />
            <p className="mt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed">
              Ask anything about your F-1. Trained on the actual process, not
              generic advice.
            </p>
          </Card>

          {/* Row 3: 1 (parents) + dark headliner [2] */}
          <Card>
            <h3 className="font-display text-xl tracking-tight text-[var(--color-ink)] leading-snug">
              Parents stay in the loop.
            </h3>
            <ParentMini />
            <p className="mt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed">
              One shareable link. No login. Live progress updates.
            </p>
          </Card>

          <Card dark className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-paper-soft)]/65">
                  And one more thing
                </span>
                <h3 className="mt-3 font-display text-2xl sm:text-[28px] tracking-tight leading-snug">
                  We update the playbook every time the State Department
                  changes the rules.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-paper-soft)]/75">
                  F-1 policy shifts constantly. Manual checklists go stale.
                  We don&rsquo;t.
                </p>
              </div>

              <div
                className="shrink-0 hidden sm:flex flex-col items-end gap-2 rounded-xl border border-[var(--color-paper-soft)]/20 bg-[var(--color-paper-soft)]/[0.06] px-3 py-2.5"
                title={`Last updated ${stepsLastUpdatedLabel()}`}
              >
                <span className="text-[9px] uppercase tracking-[0.18em] text-[var(--color-paper-soft)]/55">
                  Last updated
                </span>
                <span className="font-display text-base tracking-tight">
                  {stepsLastUpdatedRelative()}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-paper-soft)]/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ink-soft)] animate-soft-pulse" />
                  Watching {STEPS_SOURCE_DOMAIN}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
