"use client";

/**
 * Section 3 — Voice mock interview demo.
 *
 * Glass card with an animated voice orb, rotating question text, and a
 * "Tap to try voice demo" button that lights up Web Speech API for a
 * 2-question demo. Recognition is graceful: if the browser doesn't
 * support it, the button reveals a fallback note.
 */

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

const QUESTIONS = [
  "Why this university?",
  "Who is funding your education?",
  "What are your plans after graduation?",
  "Have you been to the United States before?",
];

type DemoState =
  | { kind: "idle" }
  | { kind: "listening"; question: string }
  | { kind: "transcript"; question: string; transcript: string }
  | { kind: "scored"; question: string; transcript: string; feedback: string }
  | { kind: "unsupported" };

// Naive mock scorer — measures answer length + presence of specifics.
function scoreAnswer(transcript: string): string {
  const t = transcript.toLowerCase().trim();
  if (t.length < 12) {
    return "Too short. Officers prefer 2 confident sentences over a single word.";
  }
  const specifics = ["because", "research", "professor", "funded", "loan", "scholarship", "return", "job", "family"];
  const hits = specifics.filter((w) => t.includes(w)).length;
  if (hits === 0) {
    return "Add one concrete detail — funding source, faculty name, or post-grad plan.";
  }
  if (hits >= 2) {
    return "Strong. Specific and on-topic. Tighten by trimming filler words.";
  }
  return "Good direction. Try adding a second concrete detail.";
}

export function VoiceDemo() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [state, setState] = useState<DemoState>({ kind: "idle" });
  const recogRef = useRef<unknown>(null);

  // Rotate question every 4s when idle
  useEffect(() => {
    if (state.kind !== "idle") return;
    const id = setInterval(() => {
      setQuestionIndex((i) => (i + 1) % QUESTIONS.length);
    }, 4000);
    return () => clearInterval(id);
  }, [state.kind]);

  const tryDemo = () => {
    type SR = {
      new (): {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: (e: unknown) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
    };
    const w = typeof window !== "undefined" ? (window as unknown as Record<string, SR | undefined>) : {};
    const Ctor: SR | undefined =
      w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!Ctor) {
      setState({ kind: "unsupported" });
      return;
    }

    const question = QUESTIONS[questionIndex];
    const recog = new Ctor();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = false;
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setState({ kind: "transcript", question, transcript });
      setTimeout(() => {
        setState({
          kind: "scored",
          question,
          transcript,
          feedback: scoreAnswer(transcript),
        });
      }, 600);
    };
    recog.onerror = () => setState({ kind: "idle" });
    recog.onend = () => {
      setState((s) => (s.kind === "listening" ? { kind: "idle" } : s));
    };
    setState({ kind: "listening", question });
    recog.start();
    recogRef.current = recog;
  };

  const reset = () => setState({ kind: "idle" });
  const currentQuestion = QUESTIONS[questionIndex];
  const displayedQuestion =
    state.kind === "listening" || state.kind === "transcript" || state.kind === "scored"
      ? state.question
      : currentQuestion;

  return (
    <section
      id="voice"
      className="w-full bg-[var(--color-paper-soft)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Voice-based mock interview</Eyebrow>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl tracking-tight leading-snug text-[var(--color-ink)]">
            Practice your interview. Out loud.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--color-ink-soft)]">
            The visa officer asks the question. You answer with your voice.
            Our AI scores your clarity, confidence, and common red flags —
            like a real interview, just less scary.
          </p>
        </div>

        {/* Demo card — glass */}
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-white/40 bg-[var(--color-paper-soft)]/80 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_30px_80px_-30px_rgba(20,33,28,0.25)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-paper-deep)] px-2.5 py-1 text-[10px] font-medium tracking-wider text-[var(--color-muted)] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" />
              Demo · Mumbai consulate · Student visa
            </span>
            {state.kind !== "idle" && (
              <button
                type="button"
                onClick={reset}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Voice orb */}
          <div className="mt-10 flex flex-col items-center">
            <div className="relative">
              {state.kind === "listening" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/30 animate-voice-ring" />
                  <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20 animate-voice-ring" style={{ animationDelay: "0.8s" }} />
                </>
              )}
              <div className="relative h-24 w-24 rounded-full bg-[var(--color-accent)] animate-voice-orb shadow-[0_18px_40px_-15px_rgba(34,158,217,0.45)] flex items-center justify-center">
                {state.kind === "listening" ? (
                  <div className="flex items-end gap-1 h-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="block w-1 h-full rounded-full bg-[var(--color-paper-soft)]/90 origin-bottom animate-voice-bar"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-9 w-9 text-[var(--color-paper-soft)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                )}
              </div>
            </div>

            {/* Question text */}
            <div className="mt-7 min-h-[28px] text-center">
              <p
                key={displayedQuestion}
                className="animate-fade-up font-display text-xl sm:text-2xl text-[var(--color-ink)] tracking-tight"
              >
                {state.kind === "listening" ? `“${state.question}”` : `“${displayedQuestion}”`}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6">
              {state.kind === "idle" && (
                <button
                  type="button"
                  onClick={tryDemo}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-accent)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-accent-deep)] hover:bg-[var(--color-accent-tint)] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  Tap to try voice demo
                </button>
              )}
              {state.kind === "listening" && (
                <span className="text-sm text-[var(--color-muted)]">
                  Listening… speak your answer.
                </span>
              )}
              {state.kind === "unsupported" && (
                <p className="text-sm text-[var(--color-muted)] max-w-sm">
                  Your browser doesn&rsquo;t expose voice recognition.
                  Try Chrome or Safari on macOS / iOS, or sign up for the full
                  product where Twilio + ElevenLabs run server-side.
                </p>
              )}
            </div>
          </div>

          {/* Transcript + feedback */}
          {(state.kind === "transcript" || state.kind === "scored") && (
            <div className="mt-8 space-y-3">
              <div className="animate-bubble-in-right ml-auto max-w-md rounded-2xl rounded-tr-md bg-[var(--color-accent)] text-[var(--color-paper-soft)] px-4 py-3 text-sm leading-relaxed">
                {state.transcript}
              </div>
              {state.kind === "scored" && (
                <div className="animate-bubble-in-left max-w-md rounded-2xl rounded-tl-md bg-[var(--color-paper-deep)] text-[var(--color-ink)] px-4 py-3 text-sm leading-relaxed">
                  <span className="block text-[10px] uppercase tracking-[0.15em] text-[var(--color-muted)] mb-1.5">
                    AI feedback
                  </span>
                  {state.feedback}
                </div>
              )}
              {state.kind === "transcript" && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                  <span className="h-1 w-1 rounded-full bg-[var(--color-muted)] animate-typing-dot" />
                  <span className="h-1 w-1 rounded-full bg-[var(--color-muted)] animate-typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="h-1 w-1 rounded-full bg-[var(--color-muted)] animate-typing-dot" style={{ animationDelay: "0.3s" }} />
                  <span className="ml-1">Scoring…</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stat trio */}
        <div className="mt-10 mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: "200+", label: "Interview questions" },
            { value: "Real Q&A", label: "From consulate transcripts" },
            { value: "12s", label: "AI feedback latency" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-4 text-center"
            >
              <div className="font-display text-2xl tracking-tight text-[var(--color-ink)] tabular-nums leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[11px] text-[var(--color-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
