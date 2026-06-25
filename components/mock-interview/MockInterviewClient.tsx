"use client";

import { useCallback, useEffect, useRef, useState } from "react";
/* (useCallback already in the imports above; no extra import needed.) */
import dynamic from "next/dynamic";
import { SetupScreen, type Difficulty, type Interviewer, type Length } from "./SetupScreen";
import { InterviewRoom, type RoomState } from "./InterviewRoom";
import { FeedbackScreen, type Scores, type TurnSummary } from "./FeedbackScreen";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import { notifyNetworkError } from "@/components/NetworkToast";
import { selectQuestions } from "@/lib/mock-interview/questions";

// Three.js (~600KB gz) only needs to load when the user actually starts an
// interview. Keeping it out of the dashboard's shared chunk shaves a huge
// chunk off every other route's first paint.
const FirstPersonEntry = dynamic(() => import("./FirstPersonEntry"), {
  ssr: false,
  loading: () => null,
});

type Plan = "free" | "solo" | "family";
type Phase = "setup" | "cinematic" | "room" | "finishing" | "feedback";

type Props = { plan: Plan; consulate?: string | null };

// Speech-recognition pacing for a turn.
//   MIN_ANSWER_MS  — turn cannot end before this regardless of silence.
//   SILENCE_MAX_MS — auto-end after this much silence past the min window.
//   COUNTDOWN_MS   — visible "3…2…1" before auto-end.
const MIN_ANSWER_MS = 4000;
const SILENCE_MAX_MS = 8000;
const COUNTDOWN_MS = 3000;

// What /api/mock-interview/finish returns on the success path. Mirrors
// the shape declared inside that route.
type GroqFinishResult = {
  clarity: number;
  confidence: number;
  redFlag: number;
  overall: number;
  summary: string;
  topStrength: string;
  topWeakness: string;
};

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

/* Question pool now lives in lib/mock-interview/questions.ts so it can
   be shuffled, weighted by difficulty + consulate, and grown without
   editing this file. The selection runs once per session in
   startSession() and is stored in the `questions` state below. */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  onspeechstart?: () => void;
  onspeechend?: () => void;
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
  /* Mic permission gate. We ask getUserMedia *before* starting the
     session so the user lands on a clear blocker (with iPhone fix
     instructions) instead of silently producing a no-audio session. */
  const [micDenied, setMicDenied] = useState(false);

  // The shuffled, weighted question list for THIS session. Filled in
  // by selectQuestions() at the moment startSession() succeeds, before
  // the cinematic intro renders.
  const [questions, setQuestions] = useState<string[]>([]);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [roomState, setRoomState] = useState<RoomState>("officer-speaking");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveLevel, setLiveLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  // 3 | 2 | 1 during the visible silence countdown; null otherwise.
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  // True when SpeechRecognition isn't available in this browser.
  const [noMic, setNoMic] = useState(false);
  // Set when /finish responds; FeedbackScreen renders from this.
  const [finalFeedback, setFinalFeedback] = useState<{
    verdict: string;
    scores: Scores;
    turns: TurnSummary[];
    durationSec: number;
    summary: string;
  } | null>(null);

  // After selectQuestions runs, totalQuestions tracks the actual
  // dynamic list length — strict mode injects financial follow-ups
  // so this can exceed `length`.
  const totalQuestions = questions.length || length;
  const audioCleanupRef = useRef<(() => void) | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  const tickRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);
  const lastTranscriptRef = useRef<string>("");
  // Per-turn pacing state.
  const turnStartTsRef = useRef<number>(0);
  const lastSpeechAtRef = useRef<number>(0);
  const silenceTickRef = useRef<number | null>(null);
  // Guards against finishTurn() running twice for the same turn (e.g. the
  // Done button + recog.onend racing).
  const turnFinishedRef = useRef<boolean>(false);
  // Mirror of silenceCountdown state to compare inside the interval
  // without rebinding it every tick.
  const silenceCountdownRef = useRef<number | null>(null);

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
  const requestMic = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release the tracks immediately; startAudioMonitor reopens its
      // own stream when the room mounts. Holding them across the
      // cinematic intro confuses iOS Safari.
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  };

  const startSession = async () => {
    if (starting) return;
    setStarting(true);
    try {
      // Mic gate runs BEFORE the quota check so a denied permission
      // doesn't burn the user's weekly slot.
      const granted = await requestMic();
      if (!granted) {
        setMicDenied(true);
        return;
      }
      // Server-authoritative quota check. logUsage runs inside the
      // route on success, so failing here never burns the user's slot.
      let r: Response;
      try {
        r = await fetch("/api/mock-interview/start", { method: "POST" });
      } catch {
        // Transport-level failure (offline, DNS, etc.). Toast + fall
        // through so the user can still attempt the local session.
        notifyNetworkError();
        if (plan === "free" && hasUsedFreeMock()) {
          setPaywallHit(true);
          return;
        }
        const picked = selectQuestions({
          count: length,
          difficulty,
          consulate,
        });
        setQuestions(picked);
        setPhase("cinematic");
        return;
      }
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
      const picked = selectQuestions({
        count: length,
        difficulty,
        consulate,
      });
      setQuestions(picked);
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
    const q = questions[idx] ?? "";

    // Speak the question, then start listening for the answer. If TTS is
    // available, this waits on the actual audio's `ended` event; if it
    // isn't (no API key / quota out), `speak` falls back to a read-along
    // timer so the visual pacing still feels right.
    await speak(q);

    // Prefetch the NEXT question's audio while the user is answering this
    // one — by the time they finish, the next mp3 blob is already in the
    // cache and playback starts instantly.
    const nextQ = questions[idx + 1];
    if (nextQ) void fetchTtsUrl(nextQ);

    setRoomState("listening");
    startRecognition(idx);
  };

  const clearTurnPacing = useCallback(() => {
    if (silenceTickRef.current) {
      window.clearInterval(silenceTickRef.current);
      silenceTickRef.current = null;
    }
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setSilenceCountdown(null);
  }, []);

  /** Finishes the current turn at most once, even if the Done button and
   *  the silence auto-end race. Used by the Done button, the silence
   *  watcher, and the no-mic fallback. */
  const finishCurrentTurn = useCallback(
    (idx: number) => {
      if (turnFinishedRef.current) return;
      turnFinishedRef.current = true;
      clearTurnPacing();
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
      void finishTurn(idx, lastTranscriptRef.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearTurnPacing],
  );

  const startRecognition = (idx: number) => {
    // Reset per-turn state.
    turnFinishedRef.current = false;
    turnStartTsRef.current = performance.now();
    lastSpeechAtRef.current = performance.now();
    lastTranscriptRef.current = "";
    setSilenceCountdown(null);

    type SR = { new (): SpeechRecognitionLike };
    const w = window as unknown as Record<string, SR | undefined>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      // No recognition support — surface a "no mic detected" warning and
      // fall back to the 8s timer the user can read along with.
      setNoMic(true);
      advanceTimerRef.current = window.setTimeout(
        () => finishCurrentTurn(idx),
        SILENCE_MAX_MS,
      );
      return;
    }
    setNoMic(false);

    const recog = new Ctor();
    recog.lang = "en-US";
    recog.continuous = true; // stays open across pauses
    recog.interimResults = true;
    recog.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      lastTranscriptRef.current = text;
      lastSpeechAtRef.current = performance.now();
    };
    if ("onspeechstart" in recog) {
      recog.onspeechstart = () => {
        lastSpeechAtRef.current = performance.now();
      };
    }
    if ("onspeechend" in recog) {
      recog.onspeechend = () => {
        // Counted as activity boundary, not a turn end.
        lastSpeechAtRef.current = performance.now();
      };
    }
    recog.onerror = () => finishCurrentTurn(idx);
    // onend fires when continuous recog is stopped externally OR when
    // the engine itself decides to stop (some browsers do this after
    // ~minute of silence). Treat it as a finish either way.
    recog.onend = () => finishCurrentTurn(idx);
    recogRef.current = recog;
    try {
      recog.start();
    } catch {
      // Some browsers throw if recog is already running. Fall through.
    }

    // Silence watcher: only decides to end after the 4s minimum window.
    silenceTickRef.current = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - turnStartTsRef.current;
      const silentFor = now - lastSpeechAtRef.current;

      if (elapsed < MIN_ANSWER_MS) {
        if (silenceCountdownRef.current !== null) setSilenceCountdown(null);
        silenceCountdownRef.current = null;
        return;
      }

      if (silentFor >= SILENCE_MAX_MS) {
        finishCurrentTurn(idx);
        return;
      }

      // Show the visible 3 / 2 / 1 countdown for the last COUNTDOWN_MS
      // of the silence window.
      const remaining = SILENCE_MAX_MS - silentFor;
      if (remaining <= COUNTDOWN_MS) {
        const next = Math.max(1, Math.ceil(remaining / 1000));
        if (next !== silenceCountdownRef.current) {
          silenceCountdownRef.current = next;
          setSilenceCountdown(next);
        }
      } else if (silenceCountdownRef.current !== null) {
        silenceCountdownRef.current = null;
        setSilenceCountdown(null);
      }
    }, 200);
  };

  const finishTurn = async (idx: number, answer: string) => {
    clearTurnPacing();
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

  const endSession = async () => {
    try {
      recogRef.current?.stop();
    } catch {
      /* ignore */
    }
    clearTurnPacing();
    audioCleanupRef.current?.();
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    // Snap the final duration from the session start timestamp so very
    // short runs don't show "0 min" — the 1s interval can lag by up to
    // a second otherwise, which rounded down to zero for quick sessions.
    let durationSec = elapsedSec;
    if (startTsRef.current > 0) {
      durationSec = Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000));
      setElapsedSec(durationSec);
    }
    if (plan === "free") markFreeMockUsed();

    // Switch into the loading state immediately so the user isn't
    // staring at a frozen room while we wait on Groq.
    setPhase("finishing");

    // Build the turns payload for /finish from the same transcripts +
    // QUESTIONS the room ran with. We keep one final read of transcripts
    // via the closure here since setTranscripts above already flushed.
    const turnsPayload: { question: string; answer: string }[] = Array.from({
      length: totalQuestions,
    }).map((_, i) => ({
      question: questions[i] ?? "",
      answer: (transcripts[i] ?? "").trim(),
    }));

    const officerStyle: "friendly" | "skeptical" | "rushed" =
      difficulty === "strict" ? "skeptical" : "friendly";
    const finishDifficulty: "standard" | "tough" =
      difficulty === "strict" ? "tough" : "standard";

    let groqResult: GroqFinishResult | null = null;
    try {
      const r = await fetch("/api/mock-interview/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: turnsPayload,
          difficulty: finishDifficulty,
          officerStyle,
          scenario: consulate ?? undefined,
        }),
      });
      if (r.ok) {
        const data = (await r.json()) as { ok: boolean; scores?: GroqFinishResult };
        if (data.ok && data.scores) groqResult = data.scores;
      } else {
        notifyNetworkError();
      }
    } catch (err) {
      console.error("[mock-interview] /finish failed:", err);
      notifyNetworkError();
    }

    // Build the FeedbackScreen payload from the Groq result if we got
    // one, otherwise fall back to the existing heuristic so a failed
    // /finish doesn't block the user from seeing their session.
    const built = buildFeedback(durationSec, groqResult);
    setFinalFeedback(built);
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
  // `groq` is the result of /api/mock-interview/finish when it succeeded;
  // when it's null we fall back to the prior heuristic so a failed
  // network call doesn't strand the user without any feedback.
  const buildFeedback = (
    durationSecArg: number,
    groq: GroqFinishResult | null,
  ): {
    verdict: string;
    scores: Scores;
    turns: TurnSummary[];
    durationSec: number;
    summary: string;
  } => {
    const answered = transcripts.filter((t) => (t ?? "").trim().length > 12).length;
    const ratio = totalQuestions ? answered / totalQuestions : 0;
    const base = Math.round(48 + ratio * 38);

    const scores: Scores = groq
      ? {
          clarity: clamp(groq.clarity),
          confidence: clamp(groq.confidence),
          // Map Groq's red-flag axis onto FeedbackScreen's "consistency"
          // slot (both measure cross-answer credibility).
          consistency: clamp(groq.redFlag),
          // No direct financial axis from Groq; average clarity + red-flag
          // as a proxy until /finish gains per-category scoring.
          financial: clamp(Math.round((groq.clarity + groq.redFlag) / 2)),
          overall: clamp(groq.overall),
        }
      : {
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
      const t = Math.min(durationSecArg, Math.round((i + 1) * (durationSecArg / Math.max(1, totalQuestions))));
      const isWeakest = i === weakestIdx;
      const noAudio = ans.length === 0;
      const question = questions[i] ?? "—";
      // Per-question notes: each picks an angle that matches what the
      // question is actually probing. The blanket "silence reads as
      // unprepared" repetition is gone — no-audio turns have a
      // dedicated UI state in FeedbackScreen and don't show a note.
      const note = noAudio
        ? ""
        : ans.length < 40
        ? shortAnswerHint(question)
        : decentAnswerHint(question);
      // Crude per-turn score derived from answer length × overall band.
      const lenScore = noAudio ? 0 : ans.length < 25 ? 35 : ans.length < 80 ? 60 : 82;
      const score = Math.round((lenScore + scores.overall) / 2);
      return {
        question,
        answer: noAudio ? "" : ans,
        timestampSec: t,
        note,
        isWeakest,
        noAudio,
        score,
        category: categoryFor(question),
      };
    });

    // Prefer Groq's one-sentence verdict summary when available; fall
    // back to the local heuristic so we never render an empty summary.
    const summary = groq?.summary?.trim() || buildSummary(scores.overall, turns);

    return { verdict, scores, turns, durationSec: durationSecArg, summary };
  };

  // Per-question hints used when the user answered but the answer was
  // short. The point is to be specific to what each question probes — no
  // copy-paste lines across cards.
  const shortAnswerHint = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("fund"))
      return "Name the sponsor and the dollar figure. Vague funding is the #1 reason for 221(g).";
    if (lower.includes("major") || lower.includes("program"))
      return "Tie the program to a concrete career outcome — one job title, one industry.";
    if (lower.includes("home") || lower.includes("ties"))
      return "Name a specific anchor: family business, job offer, property. Generic 'family' isn't enough.";
    if (lower.includes("after graduation") || lower.includes("post"))
      return "State the country and the role you're targeting. Officers read vagueness as immigrant intent.";
    if (lower.includes("backup") || lower.includes("denied"))
      return "Don't downplay it — show you've thought about it. One sentence on the realistic plan B.";
    return "Add one specific name, number, or date. Specifics move the needle more than confidence does.";
  };

  const decentAnswerHint = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("fund"))
      return "Strong shape. Add the source's relationship to you (parent, scholarship body) for full credibility.";
    if (lower.includes("major") || lower.includes("program"))
      return "Good. Tighten the second sentence — one fewer adjective, one more concrete detail.";
    if (lower.includes("home") || lower.includes("ties"))
      return "Solid. Lead with the most concrete anchor first; emotional ties come second.";
    return "Direct and on-topic. Cut filler words; an officer hears confidence in compression.";
  };

  const categoryFor = (q: string): string | undefined => {
    const lower = q.toLowerCase();
    if (lower.includes("fund")) return "Financial";
    if (lower.includes("home") || lower.includes("ties")) return "Ties";
    if (lower.includes("major") || lower.includes("program") || lower.includes("university") || lower.includes("graduation")) return "Study plan";
    return undefined;
  };

  const buildSummary = (overall: number, turns: TurnSummary[]): string => {
    const strong = turns.filter((t) => !t.noAudio && (t.score ?? 0) >= 75).length;
    const weak = turns.filter((t) => t.noAudio || (t.score ?? 100) < 50).length;
    if (overall >= 86) {
      return `Confident, specific, consistent. ${strong} of your answers would land cleanly with an officer. Keep the pace — you're rehearsing for poise now, not new content.`;
    }
    if (overall >= 66) {
      return `The shape of a good interview is here. ${strong} answers landed cleanly. Tighten the ${weak} weak ones — specifics over generalities, names over categories.`;
    }
    if (overall >= 41) {
      return `The basics are forming but the answers lean general. Officers read general as unprepared. Name the program, the sponsor, the city. Specifics build credibility faster than confidence does.`;
    }
    return `Most answers wouldn't pass an officer's "specifics" bar yet — and that's fine at this stage. Pick the two weakest topics, rehearse one specific sentence for each, and run another session.`;
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

  if (micDenied) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <span
          aria-hidden
          className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-persimmon-tint)] text-[var(--color-persimmon)]"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        </span>
        <h2
          className="mt-4 text-[20px] leading-snug text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-display-stack)" }}
        >
          Microphone access is required for mock interviews.
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
          On iPhone: <strong>Settings → Safari → Microphone → Allow</strong>, then return here.
          <br />
          On Mac/Chrome: click the camera/mic icon in the address bar and choose Allow.
        </p>
        <button
          type="button"
          onClick={() => { setMicDenied(false); void startSession(); }}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-persimmon)] px-5 text-sm font-medium text-[var(--color-paper-soft)] hover:bg-[var(--color-persimmon-deep)] transition-colors"
        >
          I've allowed it — try again
        </button>
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
        question={questions[questionIdx] ?? ""}
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
        onDoneAnswering={() => {
          if (roomState !== "listening") return;
          // The Done button must respect the 4s minimum window so users
          // can't accidentally tap immediately after the question ends.
          const elapsed = performance.now() - turnStartTsRef.current;
          if (elapsed < MIN_ANSWER_MS) return;
          finishCurrentTurn(questionIdx);
        }}
        silenceCountdown={silenceCountdown}
        noMic={noMic}
      />
    );
  }

  if (phase === "finishing") {
    return <FinishingScreen />;
  }

  // phase === "feedback"
  if (!finalFeedback) {
    // Shouldn't happen — endSession sets finalFeedback before flipping
    // to "feedback" — but render the loading state defensively.
    return <FinishingScreen />;
  }
  return (
    <FeedbackScreen
      verdict={finalFeedback.verdict}
      scores={finalFeedback.scores}
      turns={finalFeedback.turns}
      durationSec={finalFeedback.durationSec}
      summary={finalFeedback.summary}
      blurredPaywall={plan === "free"}
      onRetryWeak={onRetryWeak}
    />
  );
}

/** Loading screen shown while /api/mock-interview/finish is grading
 *  the session with Groq. Replaces the instant fake-feedback flash. */
function FinishingScreen() {
  return (
    <div className="mx-auto max-w-md py-24 px-4 text-center">
      <div
        aria-hidden
        className="mx-auto h-10 w-10 rounded-full"
        style={{
          border: "3px solid rgba(28,25,23,0.15)",
          borderTopColor: "var(--color-persimmon)",
          animation: "gs-spin 0.9s linear infinite",
        }}
      />
      <h2
        className="mt-6 text-[20px] leading-snug text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-display-stack)" }}
      >
        The officer is reviewing your answers.
      </h2>
      <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
        Scoring clarity, confidence, and your financial story. Usually 10–20 seconds.
      </p>
      <style>{`@keyframes gs-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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
