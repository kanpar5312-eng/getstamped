"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Interviewer = "female" | "male";
export type Length = 5 | 10 | 15;
export type Difficulty = "standard" | "strict";

const INTERVIEWERS: { id: Interviewer; name: string; src: string }[] = [
  { id: "female", name: "Officer Reyes", src: "/reyes.png" },
  { id: "male", name: "Officer Walsh", src: "/walsh.png" },
];

type Props = {
  interviewer: Interviewer;
  setInterviewer: (i: Interviewer) => void;
  length: Length;
  setLength: (l: Length) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onStart: () => void;
  paywallHit: boolean;
};

export function SetupScreen({
  interviewer,
  setInterviewer,
  length,
  setLength,
  difficulty,
  setDifficulty,
  onStart,
  paywallHit,
}: Props) {
  const [micState, setMicState] = useState<"idle" | "live" | "passed" | "denied">("idle");
  const [levels, setLevels] = useState<number[]>(new Array(14).fill(0));
  const cleanupRef = useRef<(() => void) | null>(null);
  const passedRef = useRef(false);

  useEffect(() => () => cleanupRef.current?.(), []);

  const startMicCheck = async () => {
    setMicState("live");
    passedRef.current = false;
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
      let aboveSince = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const next = levels.slice(1);
        next.push(Math.min(1, rms * 4));
        setLevels(next);

        if (rms > 0.04) {
          if (!aboveSince) aboveSince = performance.now();
          if (!passedRef.current && performance.now() - aboveSince > 500) {
            passedRef.current = true;
            setMicState("passed");
          }
        } else {
          aboveSince = 0;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
      };
    } catch {
      setMicState("denied");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] py-10">
      <div className="text-center">
        <p data-eyebrow="">Mock interview</p>
        <h1 className="mt-4 font-display text-[36px] sm:text-[44px] tracking-tight text-[var(--ink)] leading-[1.05]">
          Your visa interview.
        </h1>
        <p className="mt-3 text-[15px] text-[var(--ink-soft)] leading-relaxed">
          Five minutes. One officer. Speak out loud — same as the consulate.
        </p>
      </div>

      {paywallHit && (
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-display text-[18px] leading-snug text-[var(--ink)]">
              You&rsquo;ve used your free mock interview.
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
              Up to 5 sessions/week on Solo, 12/week on Family.
            </p>
          </div>
          <a
            href="/dashboard/upgrade"
            className="btn-ember inline-flex items-center gap-2 rounded-lg px-5 py-[10px] text-[13px] font-medium"
          >
            Upgrade →
          </a>
        </div>
      )}

      {/* Interviewer choice */}
      <section className="mt-10">
        <p data-eyebrow="">Choose your officer</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {INTERVIEWERS.map((i) => {
            const selected = interviewer === i.id;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => setInterviewer(i.id)}
                className={[
                  "group relative overflow-hidden rounded-xl border bg-[var(--surface)] p-3 text-left transition-all",
                  selected
                    ? "border-[var(--ember)] shadow-[0_6px_24px_-8px_rgba(232,96,44,0.35)]"
                    : "border-[var(--line)] hover:border-[var(--line-hover)]",
                ].join(" ")}
                aria-pressed={selected}
              >
                <div className="relative overflow-hidden rounded-[10px] aspect-[4/5] bg-[var(--surface-sunken)]">
                  <Image
                    src={i.src}
                    alt={i.name}
                    fill
                    sizes="(min-width: 640px) 340px, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="mt-3 px-1">
                  <p className="font-display text-[18px] tracking-tight text-[var(--ink)] leading-tight">
                    {i.name}
                  </p>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--stone)] mt-1">
                    Consular Officer
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Length + difficulty pills */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p data-eyebrow="">Length</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([5, 10, 15] as Length[]).map((n) => (
              <Pill key={n} selected={length === n} onClick={() => setLength(n)}>
                {n === 15 ? "Full 15 min" : `${n} min`}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p data-eyebrow="">Difficulty</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill
              selected={difficulty === "standard"}
              onClick={() => setDifficulty("standard")}
            >
              Standard
            </Pill>
            <Pill
              selected={difficulty === "strict"}
              onClick={() => setDifficulty("strict")}
            >
              Strict officer
            </Pill>
          </div>
        </div>
      </section>

      {/* Mic check */}
      <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p data-eyebrow="">Microphone</p>
            <p className="mt-2 text-[13px] text-[var(--ink-soft)]">
              Say &ldquo;testing&rdquo; until the bars light up.
            </p>
          </div>
          {micState === "passed" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ember-soft)] text-[var(--ember-hover)] px-3 py-1 text-[12px] font-semibold">
              <CheckIcon /> Mic ready
            </span>
          ) : micState === "denied" ? (
            <span className="text-[12px] text-[var(--ember-hover)] font-medium">
              Permission denied
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startMicCheck}
                disabled={micState === "live"}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-[8px] text-[13px] font-medium text-[var(--ink)] hover:border-[var(--line-hover)] transition-colors disabled:opacity-60"
              >
                {micState === "live" ? "Listening…" : "Test your mic"}
              </button>
              <button
                type="button"
                onClick={() => {
                  cleanupRef.current?.();
                  passedRef.current = true;
                  setMicState("passed");
                }}
                className="text-[12px] text-[var(--stone)] hover:text-[var(--ink)] underline underline-offset-4 px-1 py-[6px] transition-colors"
              >
                Skip
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end gap-[3px] h-8" aria-hidden>
          {levels.map((lv, i) => {
            const h = Math.max(4, lv * 32);
            const isHot = lv > 0.35;
            return (
              <span
                key={i}
                className="block w-[3px] rounded-full transition-[height,background-color] duration-75"
                style={{
                  height: `${h}px`,
                  backgroundColor: isHot ? "var(--ember)" : "var(--ink)",
                  opacity: micState === "idle" ? 0.15 : 0.85,
                }}
              />
            );
          })}
        </div>

        {micState === "denied" && (
          <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-sunken)] p-3 text-[12px] text-[var(--ink-soft)] leading-relaxed">
            <p className="font-semibold text-[var(--ink)] mb-1">Enable mic access</p>
            Click the lock icon in your address bar → Site settings → set
            Microphone to Allow → refresh this page.
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onStart}
          disabled={paywallHit}
          className="btn-ember inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enter the interview room →
        </button>
        <p className="mt-3 text-[12px] text-[var(--stone)]">
          We don&rsquo;t record audio — only the transcript is stored.
        </p>
      </div>
    </div>
  );
}

function Pill({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "rounded-full px-4 py-[8px] text-[13px] font-medium transition-colors border",
        selected
          ? "bg-[var(--ink)] text-[var(--surface)] border-[var(--ink)]"
          : "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--line-hover)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
