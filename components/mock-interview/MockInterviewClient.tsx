"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Plan = "free" | "solo" | "family";

type Scenario = {
  id: string;
  title: string;
  description: string;
  recommended?: boolean;
};

const SCENARIOS: Scenario[] = [
  { id: "bachelors", title: "First-time F-1 (Bachelor's)", description: "Undergraduate applicant, fresh out of secondary school.", recommended: true },
  { id: "masters", title: "Master's program", description: "Grad student with work or research experience." },
  { id: "phd", title: "PhD applicant", description: "Doctoral candidate with funding stories to defend." },
  { id: "returning", title: "Returning student", description: "Visa renewal or change of program." },
];

const QUESTION_BANK: Record<string, string[]> = {
  bachelors: [
    "Why this university over others that admitted you?",
    "Who is funding your education?",
    "What's your major and why?",
    "What do you plan to do after graduation?",
    "Why study in the United States instead of your home country?",
    "Have you been to the United States before?",
    "What ties you to your home country?",
    "How will your degree help your career back home?",
    "Tell me about your high school grades.",
    "What if your visa is denied — what's your backup?",
  ],
  masters: [
    "Why this Master's program specifically?",
    "Walk me through your funding plan for the full duration.",
    "What's your post-grad career goal?",
    "How does this degree fit your experience so far?",
    "Why this university over others in your shortlist?",
  ],
  phd: [
    "Who's your prospective advisor and what's their work?",
    "What's the funding structure of your offer?",
    "Where do you see yourself 5 years after the PhD?",
    "How does your research align with your home country's needs?",
    "Why a PhD instead of going straight to industry?",
  ],
  returning: [
    "Why did you apply for a visa renewal?",
    "Has anything changed since your last interview?",
    "What's your current immigration status?",
    "Walk me through your continuing study plan.",
    "What's your post-completion plan?",
  ],
};

type Length = 5 | 10 | 15;
type Difficulty = "standard" | "tough";
type OfficerStyle = "friendly" | "skeptical" | "rushed";

type Phase = "pre" | "active" | "feedback";

type SessionTurn = {
  question: string;
  answer: string;
  feedback?: { worked: string; fix: string; better: string };
};

function ScoreCard({ label, value, note, accent }: { label: string; value: number; note: string; accent: "forest" | "amber" | "red" }) {
  const color =
    accent === "forest"
      ? "text-[var(--color-forest)]"
      : accent === "amber"
      ? "text-amber-600"
      : "text-red-600";
  return (
    <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] font-medium">{label}</div>
      <div className={`mt-2 font-display text-3xl tracking-tight tabular-nums leading-none ${color}`}>
        {value}
        <span className="text-[var(--color-muted)] text-lg">/100</span>
      </div>
      <div className="mt-2 text-[11px] text-[var(--color-muted)] leading-relaxed">{note}</div>
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

type Props = {
  plan: Plan;
};

export function MockInterviewClient({ plan }: Props) {
  const [phase, setPhase] = useState<Phase>("pre");
  const [scenarioId, setScenarioId] = useState<string>("bachelors");
  const [length, setLength] = useState<Length>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [officerStyle, setOfficerStyle] = useState<OfficerStyle>("friendly");

  const [browserSupported, setBrowserSupported] = useState(true);
  const [paywallHit, setPaywallHit] = useState(false);

  // Active session state
  const [questionIdx, setQuestionIdx] = useState(0);
  const [turns, setTurns] = useState<SessionTurn[]>([]);
  const [recState, setRecState] = useState<"idle" | "speaking" | "listening" | "thinking">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [overallScores, setOverallScores] = useState<{
    clarity: number; confidence: number; redFlag: number; overall: number;
    summary: string; topStrength: string; topWeakness: string;
  } | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const turnsRef = useRef<SessionTurn[]>([]);

  async function fetchFeedback(question: string, answer: string): Promise<SessionTurn["feedback"]> {
    try {
      const r = await fetch("/api/mock-interview/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, scenario: scenarioId, difficulty, officerStyle }),
      });
      if (!r.ok) return undefined;
      const data = (await r.json()) as { ok: boolean; feedback?: SessionTurn["feedback"] };
      return data.feedback;
    } catch {
      return undefined;
    }
  }

  useEffect(() => {
    const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : {};
    setBrowserSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const startSession = () => {
    if (plan === "free") {
      setPaywallHit(true);
      return;
    }
    setQuestionIdx(0);
    setTurns([]);
    setRecState("speaking");
    setElapsedSec(0);
    startTimeRef.current = Date.now();
    tickRef.current = window.setInterval(
      () => setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000)),
      1000,
    );
    setPhase("active");
    // Simulate officer asking → start listening shortly after
    setTimeout(() => beginListening(0), 1400);
  };

  const beginListening = (idx: number) => {
    setLiveTranscript("");
    setRecState("listening");
    type SR = { new (): SpeechRecognitionLike };
    const w = window as unknown as Record<string, SR | undefined>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      // Not supported — surface text fallback
      setRecState("idle");
      return;
    }
    const recog = new Ctor();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = true;
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setLiveTranscript(text);
    };
    recog.onerror = () => setRecState("idle");
    recog.onend = () => {
      const question = QUESTION_BANK[scenarioId][idx] ?? "—";
      const answer = liveTranscript || "(no audio captured)";
      setRecState("thinking");
      void (async () => {
        const feedback = (await fetchFeedback(question, answer)) ?? mockFeedback(answer);
        const turn: SessionTurn = { question, answer, feedback };
        setTurns((t) => {
          const next = [...t, turn];
          turnsRef.current = next;
          return next;
        });
        const next = idx + 1;
        if (next >= length) {
          endSession();
        } else {
          setQuestionIdx(next);
          setRecState("speaking");
          setTimeout(() => beginListening(next), 1200);
        }
      })();
    };
    recogRef.current = recog;
    recog.start();
  };

  const skipQuestion = () => {
    recogRef.current?.stop();
    setRecState("thinking");
    const idx = questionIdx;
    const turn: SessionTurn = { question: QUESTION_BANK[scenarioId][idx] ?? "—", answer: "(skipped)" };
    setTurns((t) => {
      const next = [...t, turn];
      turnsRef.current = next;
      return next;
    });
    const next = idx + 1;
    if (next >= length) {
      endSession();
    } else {
      setQuestionIdx(next);
      setRecState("speaking");
      setTimeout(() => beginListening(next), 1200);
    }
  };

  const endSession = () => {
    recogRef.current?.stop();
    if (tickRef.current) window.clearInterval(tickRef.current);
    setPhase("feedback");
    void (async () => {
      try {
        const r = await fetch("/api/mock-interview/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario: scenarioId,
            difficulty,
            officerStyle,
            turns: turnsRef.current.length ? turnsRef.current : turns,
          }),
        });
        if (!r.ok) return;
        const data = (await r.json()) as { ok: boolean; scores?: typeof overallScores };
        if (data.ok && data.scores) setOverallScores(data.scores);
      } catch { /* fall back to local scoring */ }
    })();
  };

  const resetSession = () => {
    setPhase("pre");
    setTurns([]);
    setQuestionIdx(0);
    setLiveTranscript("");
    setElapsedSec(0);
    if (tickRef.current) window.clearInterval(tickRef.current);
  };

  // ---------------------------- Pre-session ----------------------------
  if (phase === "pre") {
    return (
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
          <span aria-hidden>→</span>
          <span className="text-[var(--color-ink-soft)]">Mock Interview</span>
        </nav>

        <header className="mt-6 animate-hero-rise text-center max-w-2xl mx-auto">
          <Eyebrow>Mock interview</Eyebrow>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
            Practice out loud.
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--color-ink-soft)]">
            The visa officer asks the question. You answer with your voice. Our
            AI scores your clarity, confidence, and common red flags.
          </p>
        </header>

        {!browserSupported && (
          <div className="mt-6 mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Voice mock interview needs Chrome, Edge, or Safari. Text-based version coming soon.
          </div>
        )}

        {paywallHit && (
          <div className="mt-6 mx-auto max-w-2xl rounded-2xl border border-[var(--color-forest)] bg-[var(--color-forest)] text-[var(--color-cream-soft)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-display text-lg leading-snug">Voice interviews are part of paid plans.</p>
              <p className="mt-1 text-sm text-[var(--color-cream-soft)]/80">$19 lifetime · unlimited voice sessions.</p>
            </div>
            <Link href="/dashboard/upgrade">
              <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-cream-soft)] px-5 py-2.5 text-sm font-medium text-[var(--color-forest)]">
                Unlock →
              </button>
            </Link>
          </div>
        )}

        {/* Scenario picker */}
        <section className="mt-10 max-w-2xl mx-auto">
          <Eyebrow>Ready?</Eyebrow>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-[var(--color-ink)] leading-snug">
            Pick your scenario
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((s) => {
              const isActive = scenarioId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenarioId(s.id)}
                  className={[
                    "relative text-left rounded-2xl border p-5 transition-colors",
                    isActive
                      ? "border-[var(--color-forest)] bg-[var(--color-cream-soft)] ring-1 ring-[var(--color-forest)]/30"
                      : "border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] hover:border-[var(--color-border)]",
                  ].join(" ")}
                >
                  {s.recommended && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium">
                      Recommended
                    </span>
                  )}
                  <h3 className="font-display text-lg tracking-tight text-[var(--color-ink)] leading-snug">{s.title}</h3>
                  <p className="mt-2 text-xs text-[var(--color-ink-soft)] leading-relaxed">{s.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Settings */}
        <section className="mt-8 max-w-2xl mx-auto rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] p-5 sm:p-6 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-muted)]">Length</div>
            <div className="mt-2 flex gap-2">
              {([5, 10, 15] as Length[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLength(n)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    length === n
                      ? "bg-[var(--color-forest)] text-[var(--color-cream-soft)]"
                      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]",
                  ].join(" ")}
                >
                  {n} questions
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-muted)]">Difficulty</div>
            <div className="mt-2 flex gap-2">
              {(["standard", "tough"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize",
                    difficulty === d
                      ? "bg-[var(--color-forest)] text-[var(--color-cream-soft)]"
                      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]",
                  ].join(" ")}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-[var(--color-muted)]">Officer style</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["friendly", "skeptical", "rushed"] as OfficerStyle[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOfficerStyle(o)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize",
                    officerStyle === o
                      ? "bg-[var(--color-forest)] text-[var(--color-cream-soft)]"
                      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)]",
                  ].join(" ")}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 max-w-2xl mx-auto text-center">
          <button
            type="button"
            onClick={startSession}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-8 py-3.5 text-base font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors animate-soft-pulse"
          >
            Start interview →
          </button>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Uses your browser&rsquo;s mic. We don&rsquo;t record audio — only the text transcript.
          </p>
        </div>

        {/* Session history (mock) */}
        <section className="mt-12 max-w-2xl mx-auto">
          <Eyebrow>Recent sessions</Eyebrow>
          <ul className="mt-4 divide-y divide-[var(--color-border-soft)] rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] overflow-hidden">
            {[
              { date: "2 days ago", scenario: "Bachelor's", score: 78, verdict: "Strong session" },
              { date: "5 days ago", scenario: "Bachelor's", score: 62, verdict: "Needs work" },
            ].map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{s.scenario}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{s.date}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-display text-lg text-[var(--color-forest)] tabular-nums">{s.score}<span className="text-[var(--color-muted)] text-xs">/100</span></span>
                  <span className="text-xs text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors">Review →</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  // ---------------------------- Active session ----------------------------
  if (phase === "active") {
    const question = QUESTION_BANK[scenarioId][questionIdx] ?? "—";
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cream-deep)] px-2.5 py-1 text-[10px] font-medium tracking-wider text-[var(--color-muted)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" />
            Mumbai consulate · F-1 · {scenarioId}
          </span>
          <span className="font-mono text-xs text-[var(--color-ink-soft)] tabular-nums">
            Question {questionIdx + 1} of {length} · {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-10 flex flex-col items-center">
          <div className="relative">
            {(recState === "listening" || recState === "thinking") && (
              <>
                <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/30 animate-voice-ring" />
                <span className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20 animate-voice-ring" style={{ animationDelay: "0.8s" }} />
              </>
            )}
            <div className="relative h-[200px] w-[200px] rounded-full bg-[var(--color-accent)] animate-voice-orb shadow-[0_30px_80px_-30px_rgba(34,158,217,0.45)] flex items-center justify-center">
              {recState === "listening" ? (
                <div className="flex items-end gap-1 h-12">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="block w-1.5 h-full rounded-full bg-[var(--color-cream-soft)]/90 origin-bottom animate-voice-bar"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : recState === "thinking" ? (
                <div className="flex items-center gap-1.5 h-5">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-cream-soft)] animate-typing-dot" />
                  <span className="h-2 w-2 rounded-full bg-[var(--color-cream-soft)] animate-typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="h-2 w-2 rounded-full bg-[var(--color-cream-soft)] animate-typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              ) : (
                <svg viewBox="0 0 24 24" className="h-12 w-12 text-[var(--color-cream-soft)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              )}
            </div>
          </div>

          <div className="mt-8 min-h-[40px] text-center">
            <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
              {recState === "speaking" ? "Officer asking…" : recState === "listening" ? "Listening…" : recState === "thinking" ? "Reviewing…" : "Ready"}
            </p>
            <p key={question} className="animate-fade-up mt-3 font-display text-xl sm:text-2xl text-[var(--color-ink)] tracking-tight max-w-2xl">
              &ldquo;{question}&rdquo;
            </p>
          </div>

          {liveTranscript && (
            <div className="mt-8 w-full max-w-2xl rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Your answer (live)</p>
              <p className="mt-2 font-mono text-sm text-[var(--color-ink)] leading-relaxed">{liveTranscript}</p>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={skipQuestion} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors">
            Skip question
          </button>
          <button type="button" onClick={endSession} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-transparent px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
            End session
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------- Feedback ----------------------------
  // Prefer Groq-evaluated scores; fall back to a heuristic so the UI is never empty.
  const scores = overallScores
    ? {
        clarity:     overallScores.clarity,
        confidence:  overallScores.confidence,
        specificity: overallScores.redFlag,
        concern:     100 - overallScores.redFlag,
      }
    : {
        clarity:     78 - (turns.filter((t) => t.answer === "(skipped)").length * 8),
        confidence:  74,
        specificity: 71,
        concern:     28,
      };
  const overall = overallScores?.overall ??
    (scores.clarity + scores.confidence + scores.specificity + (100 - scores.concern)) / 4;
  const verdict =
    overall >= 70 ? { label: "Strong session", color: "forest" as const } :
    overall >= 50 ? { label: "Needs work", color: "amber" as const } :
    { label: "Concerning answers", color: "red" as const };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="text-center animate-hero-rise">
        <Eyebrow>Feedback</Eyebrow>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl tracking-tight text-[var(--color-ink)] leading-tight">
          Session complete
        </h1>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
          {turns.length} questions · {Math.floor(elapsedSec / 60)} min
        </p>
        <div className="mt-5">
          <span className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            verdict.color === "forest" ? "bg-[var(--color-forest)]/[0.08] text-[var(--color-forest)] border border-[var(--color-forest)]/20" :
            verdict.color === "amber" ? "bg-amber-50 text-amber-800 border border-amber-200" :
            "bg-red-50 text-red-700 border border-red-200",
          ].join(" ")}>
            {verdict.label}
          </span>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ScoreCard label="Clarity" value={scores.clarity} note="Sentences are short and direct." accent={scores.clarity >= 70 ? "forest" : scores.clarity >= 50 ? "amber" : "red"} />
        <ScoreCard label="Confidence" value={scores.confidence} note="Watch for filler words." accent={scores.confidence >= 70 ? "forest" : scores.confidence >= 50 ? "amber" : "red"} />
        <ScoreCard label="Specificity" value={scores.specificity} note="Name the program, faculty, role." accent={scores.specificity >= 70 ? "forest" : "amber"} />
        <ScoreCard label="Officer concern" value={scores.concern} note="Lower is better. Below 30 is strong." accent={scores.concern <= 30 ? "forest" : scores.concern <= 50 ? "amber" : "red"} />
      </section>

      <section className="mt-10">
        <Eyebrow>Question-by-question</Eyebrow>
        <ul className="mt-4 space-y-2">
          {turns.map((t, i) => (
            <li key={i}>
              <details className="group rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-cream-soft)] open:border-[var(--color-border)] transition-colors">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-4 select-none">
                  <span className="text-sm font-medium text-[var(--color-ink)] leading-snug">
                    Q{i + 1}. {t.question}
                  </span>
                  <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 text-[var(--color-muted)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
                </summary>
                <div className="px-4 pb-4 -mt-1 space-y-3 text-sm">
                  <div className="rounded-lg bg-[var(--color-cream-deep)]/40 p-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">Your answer</span>
                    <p className="mt-1.5 text-[var(--color-ink)] font-mono leading-relaxed">{t.answer}</p>
                  </div>
                  {t.feedback && (
                    <>
                      <div className="rounded-lg bg-[var(--color-forest)]/[0.06] p-3 border border-[var(--color-forest)]/20">
                        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-forest)]">What worked</span>
                        <p className="mt-1.5 text-[var(--color-ink)] leading-relaxed">{t.feedback.worked}</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-amber-700">What to fix</span>
                        <p className="mt-1.5 text-amber-900 leading-relaxed">{t.feedback.fix}</p>
                      </div>
                      <div className="rounded-lg bg-[var(--color-accent-tint)] p-3 border border-[var(--color-accent)]/20">
                        <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-accent-deep)]">Suggested better answer</span>
                        <p className="mt-1.5 text-[var(--color-ink)] leading-relaxed">{t.feedback.better}</p>
                      </div>
                    </>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex flex-wrap items-center gap-3 justify-center">
        <button type="button" onClick={resetSession} className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream-soft)] hover:bg-[var(--color-forest-deep)] transition-colors">
          New session
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-deep)] transition-colors">
          Save to history
        </button>
        <Link href="/dashboard">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors">
            Back to dashboard
          </button>
        </Link>
      </section>
    </div>
  );
}

function mockFeedback(answer: string): { worked: string; fix: string; better: string } {
  const length = answer.length;
  if (length < 30 || answer.includes("(skipped)") || answer.includes("(no audio")) {
    return {
      worked: "You didn't ramble.",
      fix: "Officers expect at least 2 sentences. Silence reads as unprepared.",
      better:
        "I'm pursuing this program because it's the strongest fit for my career goal in renewable energy systems engineering. Funding is fully covered by my parents, with documented bank statements covering year-1 expenses.",
    };
  }
  return {
    worked: "Direct and on-topic. The first sentence answered the question.",
    fix: "Trim filler words (\"basically\", \"you know\") and tighten the second half of the answer.",
    better:
      "I chose this program for the faculty's work on microgrid systems and the on-campus capstone with regional utilities. My parents are sponsoring me, and our bank statements show consistent year-over-year balances.",
  };
}
