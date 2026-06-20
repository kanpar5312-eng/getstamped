"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SetupScreen, type Difficulty, type Interviewer, type Length } from "./SetupScreen";
import { InterviewRoom, type RoomState } from "./InterviewRoom";
import { FeedbackScreen, type Scores, type TurnSummary } from "./FeedbackScreen";

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

  useEffect(() => () => {
    audioCleanupRef.current?.();
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    recogRef.current?.stop();
  }, []);

  // -------- session lifecycle --------
  const startSession = () => {
    if (plan === "free" && hasUsedFreeMock()) {
      setPaywallHit(true);
      return;
    }
    setPhase("cinematic");
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

  const runQuestion = (idx: number) => {
    setQuestionIdx(idx);
    setRoomState("officer-speaking");
    const q = QUESTIONS[idx] ?? "";
    const speakMs = Math.max(1800, Math.min(4500, q.split(/\s+/).length * 220));
    advanceTimerRef.current = window.setTimeout(() => {
      setRoomState("listening");
      startRecognition(idx);
    }, speakMs);
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

  const finishTurn = (idx: number, answer: string) => {
    setTranscripts((arr) => {
      const next = [...arr];
      next[idx] = answer;
      return next;
    });
    setRoomState("considering");
    advanceTimerRef.current = window.setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= totalQuestions) {
        endSession();
      } else {
        runQuestion(nextIdx);
      }
    }, 1600);
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
