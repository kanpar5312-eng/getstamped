"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SetupScreen, type Difficulty, type Interviewer, type Length } from "./SetupScreen";
import { InterviewRoom, type RoomState } from "./InterviewRoom";
import { FeedbackScreen, type Scores, type TurnSummary } from "./FeedbackScreen";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

// Three.js (~600KB gz) only needs to load when the user actually starts an
// interview. Keeping it out of the dashboard's shared chunk shaves a huge
// chunk off every other route's first paint.
const FirstPersonEntry = dynamic(() => import("./FirstPersonEntry"), {
  ssr: false,
  loading: () => null,
});

type Plan = "free" | "solo" | "family";
type Phase = "setup" | "cinematic" | "room" | "feedback";

type Props = { plan: Plan; consulate?: string | null };

// Short interstitial lines the officer says after a turn finishes, before
// the next question fires. Kept conversational + brief — most of the
// monthly char budget should go to the questions themselves, not filler.
const TRANSITION_LINES = [
  "Okay. Good. Let's head to the next question.",
  "Got it. Let's continue.",
  "Alright, next question.",
  "Mm-hmm. Moving on.",
  "Thank you. One more thing.",
];

const QUESTIONS = [
  "Why this university over others that admitted you?",
  "Who is funding your education?",
  "What's your major and why?",
  "What ties you to your home country?",
  "What do you plan to do after graduation?",
  "Walk me through your funding plan for the full duration.",
  "Why study in the United States instead of your home country?",
  "How will your degree help your career back home?",
  "Tell me about your high school grades.",
  "What's your post-graduation backup if the visa is denied?",
  "Have you been to the United States before?",
  "Who else in your family has studied abroad?",
  "How did you choose your major specifically?",
  "What's your monthly tuition cost and how is it covered?",
  "Describe your campus's strengths in one sentence.",
];

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

export function MockInterviewClient({ plan, consulate }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [interviewer, setInterviewer] = useState<Interviewer>("female");
  const [length, setLength] = useState<Length>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [paywallHit, setPaywallHit] = useState(false);
  /* When /api/mock-interview/start returns 429, we render the
     <PaywallOverlay type="limit_reached"/> with this reset timestamp. */
  const [limitResetAt, setLimitResetAt] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [roomState, setRoomState] = useState<RoomState>("officer-speaking");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveLevel, setLiveLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);

  const totalQuestions = Math.min(QUESTIONS.length, length);
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const tickRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);
  const lastTranscriptRef = useRef<string>("");

  // ─── ElevenLabs TTS state ────────────────────────────────────────────
  // ttsAvail flips false the first time /api/mock-interview/tts errors,
  // so a missing API key or quota exhaustion silently falls back to the
  // original length-heuristic timer (the session keeps working).
  const [ttsAvail, setTtsAvail] = useState(true);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  // Pre-fetched MP3 blob URL keyed by `${interviewer}:${text-hash}`. We
  // prefetch the *next* question while the user is answering the current
  // one, so playback starts instantly when the turn flips.
  const prefetchRef = useRef<Map<string, string>>(new Map());

  /** Hit the TTS route, return an object-URL the <audio> tag can play. */
  const fetchTtsUrl = useCallback(
    async (text: string): Promise<string | null> => {
      const cacheKey = `${interviewer}:${text}`;
      const cached = prefetchRef.current.get(cacheKey);
      if (cached) return cached;
      try {
        const r = await fetch("/api/mock-interview/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, interviewer }),
        });
        if (!r.ok) {
          if (r.status === 503) setTtsAvail(false); // not configured
          return null;
        }
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        prefetchRef.current.set(cacheKey, url);
        return url;
      } catch (err) {
        console.error("[mock-interview] tts fetch failed:", err);
        return null;
      }
    },
    [interviewer],
  );

  /**
   * Play `text` through the officer voice. Resolves when audio ends or
   * playback fails — caller can treat the resolution as "officer done
   * speaking" regardless of whether TTS actually worked. If the user is
   * muted, resolves after a sensible read-along delay so the visual
   * pacing of the interview is preserved.
   */
  const speak = useCallback(
    async (text: string): Promise<void> => {
      const readDelay = Math.max(1500, Math.min(5000, text.split(/\s+/).length * 220));

      if (mutedRef.current || !ttsAvail) {
        await new Promise((r) => setTimeout(r, readDelay));
        return;
      }

      const url = await fetchTtsUrl(text);
      if (!url) {
        await new Promise((r) => setTimeout(r, readDelay));
        return;
      }

      await new Promise<void>((resolve) => {
        const audio = new Audio(url);
        audioElRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    },
    [fetchTtsUrl, ttsAvail],
  );

  // On unmount: pause any playing audio + revoke prefetched object URLs.
  useEffect(() => () => {
    audioElRef.current?.pause();
    prefetchRef.current.forEach((url) => URL.revokeObjectURL(url));
    prefetchRef.current.clear();
  }, []);

  useEffect(() => () => {
    audioCleanupRef.current?.();
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    recogRef.current?.stop();
  }, []);

  // -------- session lifecycle --------
  const startSession = async () => {
    if (starting) return;
    setStarting(true);
    try {
      // Server-authoritative quota check. logUsage runs inside the
      // route on success, so failing here never burns the user's slot.
      const r = await fetch("/api/mock-interview/start", { method: "POST" });
      if (r.status === 429) {
        const data = await r.json().catch(() => ({}));
        setLimitResetAt(typeof data.reset_at === "string" ? data.reset_at : null);
        setPaywallHit(true);
        return;
      }
      if (!r.ok) {
        // Unauthenticated or transient — fall back to the legacy local
        // session flag so a flaky network never bricks the page.
        if (plan === "free" && hasUsedFreeMock()) {
          setPaywallHit(true);
          return;
        }
      }
      setPhase("cinematic");
    } finally {
      setStarting(false);
    }
  };

  const enterRoom = () => {
    setQuestionIdx(0);
    setTranscripts([]);
    setElapsedSec(0);
    startTsRef.current = Date.now();
    tickRef.current = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTsRef.current) / 1000));
    }, 1000);
    setPhase("room");
    runQuestion(0);
    void startAudioMonitor();
  };

  const runQuestion = async (idx: number) => {
    setQuestionIdx(idx);
    setRoomState("officer-speaking");
    const q = QUESTIONS[idx] ?? "";

    // Speak the question, then start listening for the answer. If TTS is
    // available, this waits on the actual audio's `ended` event; if it
    // isn't (no API key / quota out), `speak` falls back to a read-along
    // timer so the visual pacing still feels right.
    await speak(q);

    // Prefetch the NEXT question's audio while the user is answering this
    // one — by the time they finish, the next mp3 blob is already in the
    // cache and playback starts instantly.
    const nextQ = QUESTIONS[idx + 1];
    if (nextQ) void fetchTtsUrl(nextQ);

    setRoomState("listening");
    startRecognition(idx);
  };

  const startRecognition = (idx: number) => {
    type SR = { new (): SpeechRecognitionLike };
    const w = window as unknown as Record<string, SR | undefined>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      // No recognition support — give the user 8s, then advance.
      advanceTimerRef.current = window.setTimeout(() => finishTurn(idx, ""), 8000);
      return;
    }
    const recog = new Ctor();
    recog.lang = "en-US";
    recog.continuous = false;
    recog.interimResults = true;
    lastTranscriptRef.current = "";
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      lastTranscriptRef.current = text;
    };
    recog.onerror = () => finishTurn(idx, lastTranscriptRef.current);
    recog.onend = () => finishTurn(idx, lastTranscriptRef.current);
    recogRef.current = recog;
    recog.start();
  };

  const finishTurn = async (idx: number, answer: string) => {
    setTranscripts((arr) => {
      const next = [...arr];
      next[idx] = answer;
      return next;
    });
    setRoomState("considering");

    const nextIdx = idx + 1;
    const isLast = nextIdx >= totalQuestions;

    // Speak a short transition line — only between questions, not after
    // the very last answer (that ends with a closing line or the
    // feedback screen). Picked deterministically by idx so a session
    // doesn't repeat the same line twice.
    if (!isLast) {
      const line = TRANSITION_LINES[idx % TRANSITION_LINES.length];
      // Brief beat before the officer responds so it doesn't feel
      // robot-quick on the heels of the user's last word.
      await new Promise((r) => setTimeout(r, 700));
      setRoomState("officer-speaking");
      await speak(line);
    } else {
      // Last question — keep the original 1.6s think pause.
      await new Promise((r) => setTimeout(r, 1600));
    }

    if (isLast) {
      endSession();
    } else {
      runQuestion(nextIdx);
    }
  };

  const endSession = () => {
    recogRef.current?.stop();
    audioCleanupRef.current?.();
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (plan === "free") markFreeMockUsed();
    setPhase("feedback");
  };

  // -------- live mic level for the room --------
  const startAudioMonitor = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        setLiveLevel(Math.min(1, rms * 5));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      audioCleanupRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
      };
    } catch {
      // Setup already verified mic; ignore here.
    }
  };

  // -------- feedback synthesis --------
  const buildFeedback = (): {
    verdict: string;
    scores: Scores;
    turns: TurnSummary[];
    durationSec: number;
  } => {
    const answered = transcripts.filter((t) => (t ?? "").trim().length > 12).length;
    const ratio = totalQuestions ? answered / totalQuestions : 0;
    const base = Math.round(48 + ratio * 38);

    const scores: Scores = {
      clarity: clamp(base + 6),
      confidence: clamp(base - 2),
      consistency: clamp(base + 2),
      financial: clamp(base - 6),
      overall: clamp(base + 2),
    };

    const verdict =
      scores.overall >= 78
        ? "You'd likely be approved."
        : scores.overall >= 62
        ? "You'd likely be approved — with hesitation."
        : "An officer would push back on several answers.";

    // Pick the shortest non-empty answer as the weakest moment
    let weakestIdx = -1;
    let weakestLen = Infinity;
    transcripts.forEach((t, i) => {
      const len = (t ?? "").trim().length || 0;
      if (len < weakestLen) {
        weakestLen = len;
        weakestIdx = i;
      }
    });

    const turns: TurnSummary[] = Array.from({ length: totalQuestions }).map((_, i) => {
      const ans = (transcripts[i] ?? "").trim();
      const t = Math.min(elapsedSec, Math.round((i + 1) * (elapsedSec / Math.max(1, totalQuestions))));
      const isWeakest = i === weakestIdx;
      const note = !ans
        ? "Silence reads as unprepared. Aim for two sentences minimum."
        : ans.length < 40
        ? "Too short. Name the program, sponsor, or specific reason."
        : "Direct and on-topic. Tighten the second half for crispness.";
      return {
        question: QUESTIONS[i] ?? "—",
        answer: ans || "(no audio captured)",
        timestampSec: t,
        note,
        isWeakest,
      };
    });

    return { verdict, scores, turns, durationSec: elapsedSec };
  };

  const onRetryWeak = () => {
    setPhase("setup");
  };

  // -------- render --------
  // Weekly-limit hit (server said 429) → full-screen paywall, no setup UI.
  // Falls through to the normal SetupScreen otherwise; SetupScreen's
  // own `paywallHit` prop is kept as the in-screen banner fallback for
  // the rare local-flag path.
  if (paywallHit && limitResetAt) {
    return (
      <div className="mx-auto max-w-md py-20 px-4">
        <PaywallOverlay
          type="limit_reached"
          feature="Mock interview"
          resetAt={limitResetAt}
        />
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <SetupScreen
        interviewer={interviewer}
        setInterviewer={setInterviewer}
        length={length}
        setLength={setLength}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={startSession}
        paywallHit={paywallHit}
      />
    );
  }

  if (phase === "cinematic") {
    const consulateLabel = consulate
      ? `U.S. CONSULATE · ${consulate.toUpperCase()}`
      : "U.S. CONSULATE · MUMBAI";
    return (
      <FirstPersonEntry
        consulate={consulateLabel}
        onComplete={enterRoom}
      />
    );
  }

  if (phase === "room") {
    return (
      <InterviewRoom
        interviewer={interviewer}
        difficulty={difficulty}
        totalQuestions={totalQuestions}
        questionIdx={questionIdx}
        question={QUESTIONS[questionIdx] ?? ""}
        state={roomState}
        liveLevel={liveLevel}
        elapsedSec={elapsedSec}
        onEnd={endSession}
        muted={muted}
        onToggleMute={() => {
          // If the user mutes mid-question, immediately pause whatever is
          // playing. Unmuting doesn't replay — they just hear the next
          // turn onwards.
          if (!muted) audioElRef.current?.pause();
          setMuted((m) => !m);
        }}
      />
    );
  }

  const fb = buildFeedback();
  return (
    <FeedbackScreen
      verdict={fb.verdict}
      scores={fb.scores}
      turns={fb.turns}
      durationSec={fb.durationSec}
      blurredPaywall={plan === "free"}
      onRetryWeak={onRetryWeak}
    />
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hasUsedFreeMock(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem("gs-mock-free-used") === "1";
  } catch {
    return false;
  }
}
function markFreeMockUsed() {
  try {
    window.sessionStorage.setItem("gs-mock-free-used", "1");
  } catch {
    /* ignore */
  }
}
