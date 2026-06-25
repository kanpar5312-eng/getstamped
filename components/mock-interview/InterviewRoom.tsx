"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Interviewer, Difficulty } from "./SetupScreen";

export type RoomState =
  | "officer-speaking"   // officer is asking a question
  | "listening"          // user mic open
  | "considering"        // user just finished; officer is "deliberating"
  | "paused";            // connection issue overlay

const SRC: Record<Interviewer, string> = {
  female: "/female.svg",
  male: "/male.png",
};

const NAME: Record<Interviewer, string> = {
  female: "Officer Reyes",
  male: "Officer Walsh",
};

type Props = {
  interviewer: Interviewer;
  difficulty: Difficulty;
  totalQuestions: number;
  questionIdx: number;
  question: string;
  state: RoomState;
  liveLevel: number; // 0..1, user mic amplitude
  elapsedSec: number;
  onEnd: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
  /** Fired when the user taps "Done answering". The parent decides
   *  whether the call actually advances the turn (it enforces the
   *  4s minimum window). */
  onDoneAnswering?: () => void;
  /** 3 | 2 | 1 while the silence countdown is visible, null otherwise. */
  silenceCountdown?: number | null;
  /** True when SpeechRecognition isn't supported — surface a warning so
   *  the user knows we're falling back to a fixed 8s window. */
  noMic?: boolean;
};

export function InterviewRoom({
  interviewer,
  difficulty,
  totalQuestions,
  questionIdx,
  question,
  state,
  liveLevel,
  elapsedSec,
  onEnd,
  muted,
  onToggleMute,
  onDoneAnswering,
  silenceCountdown,
  noMic,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const captionStartedRef = useRef(0);

  // Lock body scroll while the room is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Animate caption word-by-word when a NEW question arrives. We
  // deliberately exclude `state` from the deps so the captions don't
  // re-animate the previous question's text when the room flips back
  // to "officer-speaking" for transition lines / strict-mode probes.
  useEffect(() => {
    if (!question) return;
    captionStartedRef.current = performance.now();
    const words = question.split(/\s+/);
    let idx = 0;
    setCaption("");
    const id = window.setInterval(() => {
      idx += 1;
      setCaption(words.slice(0, idx).join(" "));
      if (idx >= words.length) window.clearInterval(id);
    }, Math.max(120, 1900 / Math.max(1, words.length)));
    return () => window.clearInterval(id);
  }, [question]);

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "#141312", color: "rgba(255,255,255,0.92)" }}>
      {/* Top meta strip */}
      <div className="flex items-center justify-between px-6 py-4 text-[11px] tracking-[0.14em] uppercase text-white/55">
        <span>U.S. Consulate · F-1 mock · {difficulty === "strict" ? "Strict officer" : "Standard"}</span>
        <span className="tabular-nums">
          Question {questionIdx + 1} of {totalQuestions}
        </span>
      </div>
      {noMic && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto -mt-1 mb-1 inline-flex items-center gap-2 self-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
          style={{
            background: "rgba(232,96,44,0.16)",
            color: "rgba(255,200,120,0.95)",
          }}
        >
          No mic detected — answering on an 8s timer
        </div>
      )}

      {/* Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            maxWidth: 880,
            aspectRatio: "16 / 9",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className={[
              "absolute inset-0 transition-opacity duration-200",
              state === "officer-speaking" ? "opacity-100" : "opacity-95",
            ].join(" ")}
          >
            <div
              className="absolute inset-0"
              style={{
                animation: "ken-burns 18s ease-in-out infinite alternate",
              }}
            >
              <Image
                src={SRC[interviewer]}
                alt={NAME[interviewer]}
                fill
                sizes="880px"
                className="object-cover"
                priority
              />
            </div>
            {/* Vignette + considering darken */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                opacity: state === "considering" ? 1 : 0.7,
              }}
            />
            {/* Speaking shimmer — faint top-light brightening */}
            {state === "officer-speaking" && (
              <div
                className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(245,168,107,0.10) 0%, transparent 100%)",
                }}
              />
            )}
          </div>

          {/* Lower-left officer label */}
          <div className="absolute left-4 bottom-3 text-[12px] tracking-wide text-white/70">
            {NAME[interviewer]} · Consular Officer
          </div>
        </div>

        {/* Considering indicator OR captions */}
        <div className="mt-7 w-full max-w-[760px] min-h-[64px] text-center">
          {state === "considering" ? (
            <ConsideringDots />
          ) : (
            <p
              key={question + state}
              className="font-display italic text-[20px] sm:text-[22px] leading-snug text-white/90 transition-opacity duration-300"
              style={{ animation: "caption-fade 300ms ease-out both" }}
            >
              {state === "officer-speaking" ? caption : question}
            </p>
          )}
        </div>
      </div>

      {/* Bottom user strip */}
      <div className="px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[880px] flex items-center justify-between gap-4">
          {/* Mic state */}
          <div className="flex items-center gap-3">
            <div
              className="relative inline-flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {state === "listening" && (
                <span
                  aria-hidden
                  className="absolute inset-[-6px] rounded-full"
                  style={{
                    border: "1px solid rgba(232,96,44,0.45)",
                    transform: `scale(${1 + liveLevel * 0.35})`,
                    transition: "transform 80ms linear",
                    boxShadow: "0 0 24px rgba(232,96,44,0.25)",
                  }}
                />
              )}
              <MicGlyph
                color={state === "listening" ? "var(--ember)" : "rgba(255,255,255,0.7)"}
              />
            </div>
            <div className="text-[12px] text-white/60 leading-tight">
              <div className="uppercase tracking-[0.14em] text-[10px]">
                {state === "officer-speaking"
                  ? "Officer asking"
                  : state === "listening"
                  ? "Your turn"
                  : state === "considering"
                  ? "Officer reviewing"
                  : "Paused"}
              </div>
              <div className="mt-1 tabular-nums text-white/80">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Center: silence countdown + Done button — only meaningful
              while the user's turn is open. */}
          <div className="flex items-center gap-3">
            {state === "listening" && silenceCountdown != null && (
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "rgba(232,96,44,0.95)" }}
              >
                Ending in
                <span
                  style={{
                    fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                    fontSize: 22,
                    lineHeight: 1,
                    color: "#fff",
                  }}
                >
                  {silenceCountdown}
                </span>
              </span>
            )}
            {state === "listening" && onDoneAnswering && (
              <button
                type="button"
                onClick={onDoneAnswering}
                className="btn-ember rounded-full px-4 py-[8px] text-[12px] font-semibold"
                style={{ background: "var(--ember)", color: "#fff" }}
              >
                Done answering
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? "Unmute officer voice" : "Mute officer voice"}
                title={muted ? "Unmute officer" : "Mute officer"}
                className="text-white/55 hover:text-white/85 transition-colors p-2 rounded-md"
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-[13px] text-white/55 hover:text-white/85 transition-colors px-3 py-2 rounded-md"
            >
              End interview
            </button>
          </div>
        </div>
      </div>

      {/* Paused overlay */}
      {state === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(20,19,18,0.85)" }}>
          <div className="text-center max-w-md px-6">
            <p className="font-display italic text-[22px] text-white/90">
              The officer has stepped away.
            </p>
            <p className="mt-3 text-[14px] text-white/60">Reconnecting…</p>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{ background: "rgba(20,19,18,0.7)" }}
        >
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#1F1E1C", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-display text-[22px] leading-snug text-white/95">
              Leave the interview?
            </p>
            <p className="mt-2 text-[13px] text-white/60 leading-relaxed">
              Your feedback will be ready based on the questions completed so far.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-[13px] text-white/70 hover:text-white rounded-md transition-colors"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={onEnd}
                className="btn-ember rounded-lg px-4 py-2 text-[13px] font-semibold"
                style={{ background: "var(--ember)", color: "#fff" }}
              >
                End interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MicGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
    </svg>
  );
}

function ConsideringDots() {
  return (
    <span
      className="inline-flex items-end gap-[6px] text-white/55"
      role="status"
      aria-label="Officer is reviewing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block rounded-full"
          style={{
            width: 6,
            height: 6,
            background: "currentColor",
            animation: `considering-pulse 1400ms ease-in-out ${i * 220}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}
