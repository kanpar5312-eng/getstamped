"use client";

/**
 * PersonalizationCurtain — "this is being built for you" moment.
 *
 * Shown after the user picks destination + applying-from in CountrySelector.
 * The GetStamped mark fills from the bottom in persimmon (like ink in a
 * glass), while a status line cycles through personalization steps. After
 * ~5 seconds it fades and calls onDone, which the CountrySelector chains
 * to its own onClose.
 *
 * Pure CSS animation — no JS rAF loops. Respects prefers-reduced-motion:
 * the fill jumps to 100% and the messages still cycle, but no movement.
 */

import { useEffect, useMemo, useState } from "react";
import type { CountryCode } from "@/lib/visa-countries";
import { APPLICANT_COUNTRIES, SUPPORTED_COUNTRIES } from "@/lib/visa-countries";

type Props = {
  destination: CountryCode;
  applyingFrom?: string | null;
  /** Optional first name for the headline; we fall back to "your" if absent. */
  firstName?: string | null;
  /** Called when the curtain finishes. CountrySelector hooks its onClose here. */
  onDone: () => void;
  /** Total duration in ms. Default 5200. */
  durationMs?: number;
};

const STEPS_BY_COUNTRY: Record<CountryCode, number> = {
  US: 47, UK: 38, CA: 35, AU: 32, DE: 30,
};

export function PersonalizationCurtain({
  destination, applyingFrom, firstName, onDone, durationMs = 5200,
}: Props) {
  const dest = SUPPORTED_COUNTRIES.find((c) => c.code === destination);
  const fromName = applyingFrom
    ? APPLICANT_COUNTRIES.find((c) => c.code === applyingFrom)?.name ?? null
    : null;
  const stepCount = STEPS_BY_COUNTRY[destination];

  const messages = useMemo(() => {
    const lines: string[] = [
      `Loading the ${dest?.visa_type ?? "visa"} playbook…`,
      `Ordering ${stepCount} steps across five phases…`,
      fromName
        ? `Personalising for applicants from ${fromName}…`
        : `Personalising for international applicants…`,
      `Tuning ${dest?.visa_type ?? "visa"} interview questions…`,
      `Your workspace is ready.`,
    ];
    return lines;
  }, [dest, fromName, stepCount]);

  const slot = Math.max(1, Math.floor(durationMs / messages.length));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"showing" | "fading">("showing");
  const fadeOutMs = 720;

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, messages.length - 1));
    }, slot);

    // Wake the dashboard slightly BEFORE the curtain finishes fading,
    // so the two transitions overlap — curtain dissolves while the
    // dashboard underneath staggers in. One continuous breath.
    const wake = setTimeout(() => {
      setPhase("fading");
      if (typeof window !== "undefined") {
        // Same-document case (CountrySelector inside the dashboard): the
        // event fires DashboardWake immediately. Cross-route case (the
        // onboarding flow → /dashboard): the dashboard isn't mounted yet,
        // so we also set a sessionStorage flag that DashboardWake reads on
        // mount and consumes once.
        try { sessionStorage.setItem("gs.systemWake", "1"); } catch {}
        window.dispatchEvent(new CustomEvent("gs:system-wake"));
      }
    }, Math.max(0, durationMs - fadeOutMs));

    const done = setTimeout(onDone, durationMs);

    return () => {
      clearInterval(t);
      clearTimeout(wake);
      clearTimeout(done);
    };
  }, [slot, durationMs, onDone, messages.length]);

  const personHeadline = firstName
    ? `Building ${firstName}’s ${dest?.visa_type ?? "visa"} workspace.`
    : `Building your ${dest?.visa_type ?? "visa"} workspace.`;

  return (
    <div
      className={`pc-root${phase === "fading" ? " is-fading" : ""}`}
      role="status"
      aria-live="polite"
      style={{ ["--pc-fade-out" as string]: `${fadeOutMs}ms` }}
    >
      <div className="pc-inner">
        <div className="pc-logo" aria-hidden>
          {/* Base ink ghost of the mark */}
          <LogoSvg className="pc-logo-ghost" />
          {/* Persimmon fill copy, clipped by an animated rect that rises.
              The fill is intentionally faster than the overall curtain so
              the logo is always 100% filled by ~1.8s — even if the curtain
              exits early for any reason, the user never sees a half-filled
              mark. The full-fill state holds via `forwards` until unmount. */}
          <div className="pc-logo-fill" style={{ animationDuration: "1800ms" }}>
            <LogoSvg className="pc-logo-stroke" />
          </div>
          {/* Soft persimmon glow underneath, intensifies with progress */}
          <span className="pc-glow" aria-hidden />
        </div>

        <p className="pc-eyebrow" style={{ animationDelay: "120ms" }}>
          GetStamped
        </p>

        <h2 className="pc-headline" style={{ animationDelay: "240ms" }}>
          {personHeadline}
        </h2>

        <p className="pc-dest" style={{ animationDelay: "360ms" }}>
          <span className="pc-flag" aria-hidden>{dest?.flag_emoji ?? "🌐"}</span>
          <span>{dest?.name ?? destination}</span>
          {fromName ? (
            <>
              <span className="pc-bullet" aria-hidden>·</span>
              <span className="pc-from">From {fromName}</span>
            </>
          ) : null}
        </p>

        <div className="pc-status">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`pc-status-line${i === idx ? " is-active" : ""}${i < idx ? " is-past" : ""}`}
            >
              <span className="pc-status-dot" aria-hidden />
              {m}
            </p>
          ))}
        </div>

        <span className="pc-rule" aria-hidden style={{ animationDuration: `${durationMs}ms` }} />
      </div>

      <style>{`
        .pc-root {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-paper);
          padding: 24px;
          font-family: var(--font-sans-stack);
          color: var(--color-ink);
          opacity: 1;                       /* visible by default — animation is enhancement */
          transition:
            opacity var(--pc-fade-out, 720ms) var(--ease-out),
            backdrop-filter var(--pc-fade-out, 720ms) var(--ease-out);
          animation: pc-root-in 320ms var(--ease-out) backwards;
          will-change: opacity;
        }
        @keyframes pc-root-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        .pc-root.is-fading {
          opacity: 0;
          pointer-events: none;
          animation: none;
        }
        .pc-root.is-fading .pc-inner { animation: pc-inner-out var(--pc-fade-out, 720ms) var(--ease-in-out) forwards; }
        @keyframes pc-inner-out {
          from { transform: scale(1);    filter: blur(0); }
          to   { transform: scale(1.04); filter: blur(2px); }
        }
        .pc-root.is-fading .pc-status-dot { animation: none; }

        .pc-inner {
          width: 100%; max-width: 520px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }

        /* ── Logo with rising persimmon fill ──────────────────────────── */
        .pc-logo {
          position: relative; width: 160px; height: 133px;
          margin-bottom: 28px;
        }
        .pc-logo-ghost, .pc-logo-stroke {
          position: absolute; inset: 0; width: 100%; height: 100%;
          stroke-linecap: square; stroke-linejoin: miter;
        }
        .pc-logo-ghost { color: var(--color-ink); opacity: 0.10; }
        .pc-logo-fill {
          position: absolute; inset: 0; overflow: hidden;
          /* Start fully clipped; animation reveals it bottom-up.
             The 5200ms duration is the safe default if the inline-style
             override fails for any reason. */
          clip-path: inset(100% 0 0 0);
          animation: pc-fill 5200ms var(--ease-in-out) forwards;
        }
        @keyframes pc-fill {
          0%   { clip-path: inset(100% 0 0 0); }
          100% { clip-path: inset(0%   0 0 0); }
        }
        .pc-logo-stroke { color: var(--color-persimmon); }
        .pc-glow {
          position: absolute; inset: -20% -10% -10% -10%;
          background: radial-gradient(closest-side,
            color-mix(in srgb, var(--color-persimmon) 22%, transparent) 0%,
            transparent 70%);
          opacity: 0; pointer-events: none;
          animation: pc-glow 5.2s var(--ease-in-out) forwards;
          z-index: -1;
        }
        @keyframes pc-glow {
          0% { opacity: 0; }
          70% { opacity: 0.9; }
          100% { opacity: 0.6; }
        }

        /* ── Type ──────────────────────────────────────────────────── */
        .pc-eyebrow {
          font-family: var(--font-mono-stack);
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--color-persimmon);
          opacity: 1; transform: translateY(0);            /* visible by default */
          animation: pc-in 600ms var(--ease-out) backwards;
        }
        .pc-headline {
          margin-top: 14px;
          font-family: var(--font-display-stack); font-weight: 400;
          font-size: clamp(26px, 3.6vw, 38px);
          line-height: 1.12; letter-spacing: -0.018em;
          color: var(--color-ink); max-width: 22ch;
          text-wrap: balance;
          opacity: 1; transform: translateY(0);            /* visible by default */
          animation: pc-in 600ms var(--ease-out) backwards;
        }
        .pc-dest {
          margin-top: 14px;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--font-mono-stack);
          font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--color-ink-soft);
          opacity: 1; transform: translateY(0);            /* visible by default */
          animation: pc-in 600ms var(--ease-out) backwards;
        }
        .pc-flag { font-size: 16px; line-height: 1; }
        .pc-bullet { color: var(--color-muted); }
        @keyframes pc-in {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* ── Status reel ─────────────────────────────────────────────── */
        .pc-status {
          margin-top: 36px;
          height: 44px; position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 100%;
        }
        .pc-status-line {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, calc(-50% + 6px));
          opacity: 0;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--font-mono-stack);
          font-size: 12.5px; letter-spacing: 0.04em;
          color: var(--color-ink-soft);
          transition: opacity 320ms var(--ease-out),
            transform 320ms var(--ease-out);
          white-space: nowrap;
        }
        .pc-status-line.is-active {
          opacity: 1; transform: translate(-50%, -50%);
        }
        .pc-status-line.is-past {
          opacity: 0; transform: translate(-50%, calc(-50% - 6px));
        }
        .pc-status-dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: var(--color-persimmon);
          box-shadow: 0 0 0 0 var(--color-persimmon);
          animation: pc-dot 1.6s var(--ease-out) infinite;
        }
        @keyframes pc-dot {
          0% { box-shadow: 0 0 0 0 rgba(255,91,46,0.55); }
          100% { box-shadow: 0 0 0 8px rgba(255,91,46,0); }
        }

        /* ── Progress hairline ───────────────────────────────────────── */
        .pc-rule {
          display: block; margin-top: 16px;
          width: 200px; height: 1px;
          background: var(--color-border);
          position: relative; overflow: hidden;
        }
        .pc-rule::after {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 100%;
          background: var(--color-persimmon);
          transform-origin: left center;
          transform: scaleX(0);
          /* Default duration matches the curtain length; the inline style
             overrides it. Falling back to the default still gives the bar
             time to fill if the override doesn't apply. */
          animation: pc-progress 5200ms var(--ease-out) forwards;
        }
        @keyframes pc-progress {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-logo-fill { animation: none !important; clip-path: inset(0 0 0 0) !important; }
          .pc-glow      { animation: none !important; opacity: 0.6 !important; }
          .pc-rule::after { animation: none !important; transform: scaleX(1) !important; }
          .pc-eyebrow, .pc-headline, .pc-dest { animation: none !important; opacity: 1 !important; transform: none !important; }
          .pc-status-dot { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* The GetStamped mark, inlined so we can re-skin its strokes per layer. */
function LogoSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {/* Arch left leg + foot */}
      <path d="M 8 90 L 38 90 M 23 90 L 23 55" />
      {/* Arch crown */}
      <path d="M 23 55 Q 23 27 50 27 Q 77 27 77 55" />
      {/* Arch right leg + foot */}
      <path d="M 77 55 L 77 90 M 62 90 L 92 90" />
      {/* Rising arrow shaft */}
      <path d="M 23 90 L 105 22" />
      {/* Arrow head */}
      <path d="M 82 14 L 110 14 L 110 42" />
    </svg>
  );
}
