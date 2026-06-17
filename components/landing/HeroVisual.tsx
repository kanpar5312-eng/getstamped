"use client";

/**
 * Hero visual — a 3D passport that opens once, gets four entry stamps and a
 * big APPROVED stamp, then holds at the final landed state. No loop.
 *
 * Static variant: Aarav · Phase 3 (DS-160) · forest-green APPROVED stamp.
 *
 * All visuals are pure CSS + SVG. No images, no Three.js. The 3D illusion is
 * sold through:
 *   • Layered cover material (leather grain + dual highlights + inset emboss)
 *   • Spine + visible page stack with gold/cream edge stripe
 *   • Stacked drop-shadows for ground/contact + an elliptical ambient shadow
 *   • Cover bend (skewY) + directional light sweep during the opening
 *   • High-DPI SVG stamps with ink bleed via filter:drop-shadow
 */

import { TOTAL_STEPS } from "@/lib/constants";

const STAMPS = [
  { text: "I-20 RECEIVED",    color: "forest", size: 78, pos: "top-3 right-3",     cls: "stamp-1" },
  { text: "SEVIS PAID",       color: "forest", size: 74, pos: "top-24 left-2",     cls: "stamp-2" },
  { text: "DS-160 SUBMITTED", color: "accent", size: 80, pos: "bottom-28 right-2", cls: "stamp-3" },
  { text: "INTERVIEW BOOKED", color: "forest", size: 76, pos: "bottom-3 left-3",   cls: "stamp-4" },
] as const;

const STUDENT = {
  first: "Aarav",
  possessive: "Aarav's",
  phaseLabel: "Phase 3 · DS-160 and fees",
  progressDone: 23,
  progressTotal: TOTAL_STEPS,
  nextStep: "Upload your photo to the DS-160",
  nextStepMins: "10 min",
  consulate: "Mumbai consulate",
} as const;

const BIG_STAMP = {
  label: "APPROVED",
  top: "F-1 · UNITED STATES",
  bottom: "JUN 2026",
  color: "forest" as const,
};

/* ================================ Stamp =================================== */

function Stamp({
  text,
  color,
  className,
  size = 86,
}: {
  text: string;
  color: "forest" | "accent";
  className: string;
  size?: number;
}) {
  const stroke = color === "forest" ? "#FF5B2E" : "#FF5B2E";
  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: size,
        height: size,
        filter:
          "drop-shadow(0 1px 0 rgba(0,0,0,0.18)) drop-shadow(0 0 1.5px " +
          (color === "forest" ? "rgba(20,58,47,0.4)" : "rgba(34,158,217,0.4)") +
          ")",
      }}
      aria-hidden
    >
      <svg viewBox="-50 -50 100 100" className="w-full h-full">
        {/* Outer ring + soft secondary ring for ink bleed */}
        <circle cx="0" cy="0" r="44" fill="none" stroke={stroke} strokeWidth="2.6" opacity="0.92" />
        <circle cx="0" cy="0" r="44" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
        <circle cx="0" cy="0" r="36" fill="none" stroke={stroke} strokeWidth="1" opacity="0.85" />

        <defs>
          <radialGradient id={`ink-${text}`} cx="0" cy="0" r="50">
            <stop offset="0%" stopColor={stroke} stopOpacity="0" />
            <stop offset="60%" stopColor={stroke} stopOpacity="0.04" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.1" />
          </radialGradient>
          <path id={`p-${text}`} d="M -32 0 A 32 32 0 0 1 32 0" fill="none" />
        </defs>
        <circle cx="0" cy="0" r="44" fill={`url(#ink-${text})`} />

        <text
          fill={stroke}
          fontFamily="ui-monospace, monospace"
          fontSize="8"
          letterSpacing="2"
          opacity="0.92"
          fontWeight="500"
        >
          <textPath href={`#p-${text}`} startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
        <text x="0" y="6" fill={stroke} fontFamily="serif" fontSize="11" textAnchor="middle" opacity="0.95">
          ✓
        </text>
      </svg>
    </div>
  );
}

/* ============================= Inner dashboard ============================ */

function InnerDashboard() {
  const pct = Math.round((STUDENT.progressDone / STUDENT.progressTotal) * 100);
  return (
    <div className="passport-page-fade absolute inset-0 p-4 sm:p-5 flex flex-col">
      <div
        className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-4"
        style={{ boxShadow: "inset 0 0 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.6)" }}
      >
        <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-medium">
          {STUDENT.possessive} application
        </div>
        <div className="mt-1.5 font-display text-[18px] leading-snug text-[var(--color-ink)] tracking-tight">
          {STUDENT.phaseLabel}
        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--color-paper-deep)] overflow-hidden">
          <div
            className="passport-progress-fill h-full bg-[var(--color-accent)]"
            style={{
              width: "0%",
              ["--progress-end" as string]: `${pct}%`,
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--color-muted)] tabular-nums">
          <span>{STUDENT.progressDone} of {STUDENT.progressTotal} complete</span>
          <span>{pct}%</span>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] p-3">
        <div className="text-[9px] uppercase tracking-[0.15em] text-[var(--color-muted)] font-medium">Next step</div>
        <div className="mt-1 flex items-start justify-between gap-2">
          <p className="text-[12px] text-[var(--color-ink)] leading-snug">{STUDENT.nextStep}</p>
          <span className="shrink-0 rounded-md bg-[var(--color-accent-tint)] text-[var(--color-accent-deep)] px-2 py-0.5 text-[10px] font-medium">
            {STUDENT.nextStepMins}
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--color-muted)]">
        <span>{STUDENT.consulate}</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-soft-pulse" />
          Live
        </span>
      </div>
    </div>
  );
}

/* ============================ Cover (premium) ============================ */

function PassportCover() {
  return (
    <div
      className="passport-cover absolute inset-0 rounded-xl overflow-hidden"
      style={{
        transformOrigin: "left center",
        backfaceVisibility: "hidden",
        background:
          "linear-gradient(135deg, #0A0D11 0%, #3B1812 28%, #FF5B2E 58%, #2A1810 80%, #1A0A05 100%)",
        border: "1px solid #FF8A66",
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Leather grain — three layered noise textures at different scales */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-45 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0.5px, transparent 1px), " +
            "radial-gradient(circle at 70% 65%, rgba(0,0,0,0.10) 0.5px, transparent 1px), " +
            "radial-gradient(circle at 40% 80%, rgba(255,255,255,0.04) 0.5px, transparent 1px)",
          backgroundSize: "3px 3px, 4px 4px, 5px 5px",
        }}
      />

      {/* Top highlight */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[36%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)",
        }}
      />

      {/* Diagonal sheen — subtle reflective band */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.05) 45%, transparent 60%)",
        }}
      />

      {/* Bottom shadow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[24%] pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)",
        }}
      />

      {/* Inset decorative border (pressed into the leather) */}
      <div
        aria-hidden
        className="absolute inset-3 rounded-lg pointer-events-none"
        style={{
          border: "1px solid rgba(201,169,97,0.32)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      />

      {/* Inner thin gold filament */}
      <div
        aria-hidden
        className="absolute inset-4 rounded-md pointer-events-none"
        style={{
          border: "1px solid rgba(201,169,97,0.18)",
        }}
      />

      {/* Light sweep during open */}
      <div
        aria-hidden
        className="passport-light-sweep absolute inset-y-0 -inset-x-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)",
          willChange: "transform, opacity",
        }}
      />

      {/* Cover content — embossed gold */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <div className="text-[10px] uppercase tracking-[0.30em] text-[#c9a961]/75 font-medium">
          International
        </div>

        <div
          className="mt-3 font-display tracking-[0.20em]"
          style={{
            fontSize: "32px",
            backgroundImage:
              "linear-gradient(180deg, #f0d68c 0%, #d4ae5e 30%, #8a6f37 55%, #d4ae5e 80%, #f0d68c 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow:
              "0 1px 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(255,255,255,0.10), 0 2px 4px rgba(0,0,0,0.25)",
            filter: "blur(0.15px)",
          }}
        >
          PASSPORT
        </div>

        <div className="mt-5 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a961]/60 to-transparent" />

        {/* Embossed seal — larger, more detailed */}
        <div
          className="mt-6 inline-flex items-center justify-center w-14 h-14 rounded-full relative"
          style={{
            border: "1px solid #c9a961",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {/* Inner ring */}
          <span
            aria-hidden
            className="absolute inset-1.5 rounded-full"
            style={{ border: "0.5px solid rgba(201,169,97,0.4)" }}
          />
          <span
            className="font-display text-[24px] relative z-10"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #f0d68c 0%, #8a6f37 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 1px 0 rgba(0,0,0,0.4)",
            }}
          >
            ★
          </span>
        </div>

        <div className="mt-6 text-[9px] uppercase tracking-[0.28em] text-[#c9a961]/55 font-medium">
          GetStamped · F-1
        </div>
      </div>
    </div>
  );
}

/* ============================ Passport body ============================== */

function PassportBody() {
  const bigStroke = "#FF5B2E";

  return (
    <div
      className="relative w-full aspect-[5/6] animate-float-y"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(8deg) rotateY(-12deg) rotateZ(-2deg)",
        filter:
          "drop-shadow(10px 16px 26px rgba(20,33,28,0.32)) drop-shadow(2px 4px 6px rgba(20,33,28,0.22))",
      }}
    >
      {/* Ambient ground shadow */}
      <div
        aria-hidden
        className="absolute -bottom-6 left-[8%] right-[8%] h-5 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse closest-side, rgba(0,0,0,0.36), transparent 70%)",
          filter: "blur(12px)",
          zIndex: -1,
        }}
      />

      {/* Spine */}
      <div
        aria-hidden
        className="absolute -left-1.5 top-[3%] bottom-[3%] w-2 rounded-l-md"
        style={{
          background:
            "linear-gradient(90deg, #0A0D11 0%, #1A0F0A 60%, #FF5B2E 100%)",
          boxShadow: "inset 1px 0 0 rgba(0,0,0,0.55), inset -1px 0 0 rgba(255,255,255,0.04)",
          transformOrigin: "right center",
          transform: "rotateY(-8deg)",
        }}
      />

      {/* Spine stitching detail */}
      <div
        aria-hidden
        className="absolute -left-0.5 top-[6%] bottom-[6%] w-px"
        style={{
          background: "repeating-linear-gradient(180deg, rgba(201,169,97,0.4) 0 2px, transparent 2px 6px)",
        }}
      />

      {/* Page stack */}
      <div className="absolute inset-0">
        {/* 4 stacked page layers for visible thickness */}
        <div aria-hidden className="absolute inset-x-1 rounded-xl"
          style={{ top: 5, bottom: -5, background: "#d6c7a8", boxShadow: "inset -1px 0 0 rgba(0,0,0,0.06)" }} />
        <div aria-hidden className="absolute inset-x-1 rounded-xl"
          style={{ top: 3, bottom: -3, background: "#e3d4b5", boxShadow: "inset -1px 0 0 rgba(0,0,0,0.05)" }} />
        <div aria-hidden className="absolute inset-x-1 rounded-xl"
          style={{ top: 2, bottom: -2, background: "#ede0c4", boxShadow: "inset -1px 0 0 rgba(0,0,0,0.05)" }} />
        <div aria-hidden className="absolute inset-x-0.5 rounded-xl"
          style={{ top: 1, bottom: -1, background: "#f5ead2", boxShadow: "inset -1px 0 0 rgba(0,0,0,0.04)" }} />

        {/* Page-edge stripe (gold/cream stack edge) — sells the 3D */}
        <div
          aria-hidden
          className="absolute -bottom-1 left-[4%] right-[4%] h-2 rounded-b-sm"
          style={{
            background:
              "linear-gradient(180deg, #f7eed7 0%, #d8c89f 45%, #b59c6e 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.15)",
          }}
        />

        {/* Active visible page */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden border border-[var(--color-border)]"
          style={{
            background:
              "linear-gradient(90deg, transparent 49.5%, rgba(0,0,0,0.07) 50%, transparent 50.5%), " +
              "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 60%), " +
              "#FFFFFF",
            boxShadow:
              "inset 0 0 14px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {/* Faint paper-fiber texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 30%, rgba(20,33,28,0.5) 0.5px, transparent 1px), " +
                "radial-gradient(circle at 75% 70%, rgba(20,33,28,0.4) 0.5px, transparent 1px)",
              backgroundSize: "4px 4px, 5px 5px",
            }}
          />

          <InnerDashboard />

          {/* Small stamps */}
          {STAMPS.map((s) => (
            <Stamp
              key={s.text}
              text={s.text}
              color={s.color}
              className={`${s.pos} ${s.cls}`}
              size={s.size}
            />
          ))}

          {/* Big APPROVED stamp */}
          <div
            className="approved-stamp absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              filter:
                "drop-shadow(0 1px 0 rgba(0,0,0,0.18)) drop-shadow(0 0 2.5px rgba(20,58,47,0.42))",
            }}
            aria-hidden
          >
            <svg viewBox="-100 -100 200 200" className="w-[190px] h-[190px]">
              <defs>
                <radialGradient id="big-ink-static" cx="0" cy="0" r="100">
                  <stop offset="0%" stopColor={bigStroke} stopOpacity="0" />
                  <stop offset="70%" stopColor={bigStroke} stopOpacity="0.04" />
                  <stop offset="100%" stopColor={bigStroke} stopOpacity="0.12" />
                </radialGradient>
                <path id="approved-top-static" d="M -68 0 A 68 68 0 0 1 68 0" fill="none" />
                <path id="approved-bot-static" d="M -68 6 A 68 68 0 0 0 68 6" fill="none" />
              </defs>
              <circle cx="0" cy="0" r="90" fill="url(#big-ink-static)" />
              <circle cx="0" cy="0" r="90" fill="none" stroke={bigStroke} strokeWidth="4.6" opacity="0.88" />
              <circle cx="0" cy="0" r="90" fill="none" stroke={bigStroke} strokeWidth="1.2" opacity="0.32" />
              <circle cx="0" cy="0" r="76" fill="none" stroke={bigStroke} strokeWidth="1.6" opacity="0.85" />

              <text fill={bigStroke} fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="3" opacity="0.88" fontWeight="500">
                <textPath href="#approved-top-static" startOffset="50%" textAnchor="middle">
                  {BIG_STAMP.top}
                </textPath>
              </text>
              <text fill={bigStroke} fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="3" opacity="0.88" fontWeight="500">
                <textPath href="#approved-bot-static" startOffset="50%" textAnchor="middle">
                  {BIG_STAMP.bottom}
                </textPath>
              </text>
              <text
                x="0"
                y="11"
                fill={bigStroke}
                fontFamily="serif"
                fontSize="40"
                fontWeight="500"
                textAnchor="middle"
                letterSpacing="-1"
                opacity="0.94"
              >
                {BIG_STAMP.label}
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* COVER — sits on top, rotates open from the left hinge */}
      <PassportCover />
    </div>
  );
}

/* =============================== Container ================================ */

export function HeroVisual() {
  return (
    <div
      className="relative w-full max-w-[480px] mx-auto"
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 30%",
      }}
    >
      <div className="relative rounded-2xl border border-white/40 bg-[var(--color-paper-soft)]/70 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/30 shadow-[0_40px_100px_-30px_rgba(20,33,28,0.5)] p-6 sm:p-8 min-h-[520px]">
        <PassportBody />
      </div>
    </div>
  );
}
