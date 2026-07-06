"use client";

import type { ReactNode } from "react";
import { ScrollStack } from "@/components/ui/ScrollStack";
import { ScrollStackItem } from "@/components/ui/ScrollStackItem";

/* ════════════════════════════════════════════════════════════════════════
   StackedFeatureCards — four feature cards that pin and stack as the
   user scrolls past the hero.

   Each card is a split copy / demo layout. The demo is a fixed-size
   "app screenshot" stage (browser chrome on top, absolutely positioned
   elements inside). The cursor moves between known coordinates and
   triggers a click ripple at the contact moment. State changes
   (checkbox fill, progress fill, score reveal) are timed against the
   same keyframe percentages so the cursor always lands on the element
   that animates.

   The point: every motion is anchored. Cursor never drifts onto empty
   space, never lands beside the button. If you change a demo's size,
   change its STAGE_W / STAGE_H constants and only those.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#1C1917";
const PAPER = "#FAF8F4";
const WARM_PAPER = "#FAF5EE";
const SOFT_PEACH = "#FBE8D9";
const PERSIMMON = "#E8622A";
const GREEN = "#3FB37F";

/* ────────────────────────────────────────────── shared primitives ── */

function Chip({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: 999,
        fontFamily: "var(--font-sans-stack)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: PERSIMMON,
        background: dark ? "rgba(232,98,42,0.10)" : "rgba(232,98,42,0.06)",
        border: "0.5px solid rgba(232,98,42,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function CardShell({
  bg,
  ink,
  children,
  demo,
}: {
  bg: string;
  ink: string;
  children: React.ReactNode;
  demo: React.ReactNode;
}) {
  return (
    <div
      className="gs-sc-shell"
      style={{
        background: bg,
        color: ink,
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr",
        gap: "clamp(40px, 5vw, 80px)",
        alignItems: "center",
        padding: "clamp(40px, 5vw, 72px) clamp(28px, 6vw, 88px)",
      }}
    >
      <div className="gs-sc-copy" style={{ maxWidth: 620 }}>
        {children}
      </div>
      <div
        className="gs-sc-demo"
        style={{ width: "100%", maxWidth: 720, justifySelf: "center" }}
      >
        {demo}
      </div>
    </div>
  );
}

function Headline({ children, ink }: { children: React.ReactNode; ink: string }) {
  return (
    <h2
      className="gs-sc-headline"
      style={{
        fontFamily: "var(--font-display-stack)",
        fontWeight: 400,
        fontSize: "clamp(44px, 5.4vw, 72px)",
        lineHeight: 1.04,
        letterSpacing: "-0.022em",
        color: ink,
        margin: "24px 0 0 0",
      }}
    >
      {children}
    </h2>
  );
}

function Body({ children, ink }: { children: React.ReactNode; ink: string }) {
  return (
    <p
      className="gs-sc-body"
      style={{
        fontFamily: "var(--font-sans-stack)",
        fontSize: 19,
        lineHeight: 1.65,
        color: ink,
        maxWidth: 560,
        margin: "26px 0 0 0",
      }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────── demo frame + cursor ── */

/** Browser-chrome wrapper. The stage inside has a FIXED width so the
 *  cursor's pixel-based keyframes are deterministic. */
function DemoFrame({
  title,
  tint = "dark",
  children,
}: {
  title: string;
  tint?: "dark" | "light";
  children: ReactNode;
}) {
  const isDark = tint === "dark";
  return (
    <div
      style={{
        background: isDark ? INK : "#FFFDF7",
        border: `1px solid ${isDark ? "rgba(250,248,244,0.10)" : "rgba(11,30,63,0.08)"}`,
        borderRadius: 16,
        boxShadow: "0 30px 70px -32px rgba(11,30,63,0.32)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: isDark ? "rgba(250,248,244,0.04)" : "rgba(11,30,63,0.03)",
          borderBottom: `1px solid ${isDark ? "rgba(250,248,244,0.08)" : "rgba(11,30,63,0.06)"}`,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#FF5F57" }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#FEBC2E" }} />
        <span style={{ width: 9, height: 9, borderRadius: 999, background: "#28C840" }} />
        <span
          style={{
            marginLeft: 12,
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: isDark ? "rgba(250,248,244,0.55)" : "rgba(11,30,63,0.55)",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Cursor SVG positioned absolutely; keyframe owns the translate path. */
function Cursor({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      width="22"
      height="24"
      viewBox="0 0 20 22"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <path
        d="M3 1.5L17 11L10 12.5L13 19.5L10 21L7 14L3 17.5V1.5Z"
        fill="#FFFFFF"
        stroke="#0B1E3F"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Click ripple — a circle that scales out + fades at the click moment. */
function Ripple({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 28,
        height: 28,
        borderRadius: 999,
        background: "rgba(232,98,42,0.55)",
        opacity: 0,
        transform: "translate(-50%, -50%) scale(0.3)",
        zIndex: 9,
        pointerEvents: "none",
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 1 — PLAYBOOK
   Stage: header → progress bar → three rows. Cursor lands on row 2
   (step 14), clicks, the checkbox fills, the progress bar slides
   forward, the counter ticks 3→4.
   ═════════════════════════════════════════════════════════════════════════ */

function PlaybookMock() {
  return (
    <DemoFrame title="F-1 PLAYBOOK · PHASE 02">
      <div
        style={{
          position: "relative",
          height: 320,
          padding: "16px 18px",
          color: PAPER,
          fontFamily: "var(--font-sans-stack)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(250,248,244,0.45)",
            }}
          >
            After I-20
          </span>
          <span
            className="gs-pb-counter"
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 12,
              color: "rgba(250,248,244,0.7)",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>

        {/* Progress */}
        <div
          style={{
            height: 5,
            borderRadius: 999,
            background: "rgba(250,248,244,0.08)",
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <span
            className="gs-pb-progress"
            style={{
              display: "block",
              height: "100%",
              width: "43%",
              background: PERSIMMON,
              borderRadius: 999,
              boxShadow: "0 0 8px rgba(232,98,42,0.55)",
            }}
          />
        </div>

        {/* Three rows — fixed Y positions so cursor coords stay valid */}
        <Row y={62} n={13} label="Complete DS-160 form" date="Mar 07" state="done" />
        <Row y={122} n={14} label="Schedule visa appointment" date="Mar 10" state="target" />
        <Row y={182} n={15} label="Prepare document bundle" date="Mar 12" state="upcoming" />
        <Row y={242} n={16} label="Mock interview, round 1" date="Mar 14" state="upcoming" />

        {/* Ripple sits over step 14's checkbox center (~30, 140) */}
        <Ripple className="gs-pb-ripple" />
        <Cursor className="gs-pb-cursor" />
      </div>
    </DemoFrame>
  );
}

function Row({
  y,
  n,
  label,
  date,
  state,
}: {
  y: number;
  n: number;
  label: string;
  date: string;
  state: "done" | "target" | "upcoming";
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 18,
        right: 18,
        display: "grid",
        gridTemplateColumns: "28px 72px 1fr auto",
        alignItems: "center",
        gap: 14,
        fontSize: 14,
        color: state === "upcoming" ? "rgba(250,248,244,0.55)" : PAPER,
      }}
    >
      <span
        className={state === "target" ? "gs-pb-target-mark" : ""}
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: state === "done" ? PERSIMMON : "transparent",
          border:
            state === "done"
              ? `1px solid ${PERSIMMON}`
              : "1px solid rgba(250,248,244,0.28)",
          color: PAPER,
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        {state === "done" && <CheckSvg />}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "rgba(250,248,244,0.5)",
        }}
      >
        Step {n}
      </span>
      <span style={{ fontWeight: state === "target" ? 500 : 400 }}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 11,
          color: "rgba(250,248,244,0.4)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {date}
      </span>
    </div>
  );
}

function CheckSvg() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
      <path
        d="M2.5 6.2 L5 8.6 L9.5 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 2 — DOCUMENT VAULT
   Stage: passport file at top-left, dropzone middle, result at bottom.
   Cursor → grabs file → drags to dropzone → drops → scan → verified.
   ═════════════════════════════════════════════════════════════════════════ */

function DocVaultMock() {
  return (
    <DemoFrame title="DOCUMENT VAULT" tint="light">
      <div
        style={{
          position: "relative",
          height: 320,
          padding: "18px",
        }}
      >
        {/* The draggable file */}
        <div
          className="gs-vt-file"
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px 8px 10px",
            borderRadius: 10,
            background: "#FFFFFF",
            border: "1px solid rgba(11,30,63,0.14)",
            boxShadow: "0 8px 18px -10px rgba(11,30,63,0.25)",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 12,
            color: "rgba(11,30,63,0.82)",
            zIndex: 6,
            willChange: "transform",
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          passport.png
        </div>

        {/* Drop zone — centered horizontally at y ≈ 70 to 170 */}
        <div
          className="gs-vt-zone"
          style={{
            position: "absolute",
            top: 70,
            left: 18,
            right: 18,
            height: 110,
            borderRadius: 14,
            border: `1.6px dashed rgba(232,98,42,0.45)`,
            background: "rgba(232,98,42,0.05)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display-stack)",
              fontSize: 22,
              color: INK,
              letterSpacing: "-0.01em",
            }}
          >
            Drop your passport
          </p>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(11,30,63,0.5)",
            }}
          >
            png · jpg · pdf
          </p>
          <span className="gs-vt-scan" aria-hidden />
        </div>

        {/* Verified result panel */}
        <div
          className="gs-vt-result"
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#FFFFFF",
            border: `1px solid rgba(63,179,127,0.45)`,
            boxShadow: "0 10px 22px -14px rgba(63,179,127,0.45)",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
            color: INK,
            opacity: 0,
            transform: "translateY(6px)",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: GREEN,
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            <CheckSvg />
          </span>
          <span>
            <strong style={{ fontWeight: 500 }}>Passport cleared.</strong>{" "}
            <span style={{ color: "rgba(11,30,63,0.6)" }}>Expires Mar 2028 · all corners visible.</span>
          </span>
        </div>

        <Ripple className="gs-vt-ripple" />
        <Cursor className="gs-vt-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 3 — MOCK INTERVIEW
   Stage: officer pill (top-left), Start button (top-right), prompt
   (middle), waveform, then score reveal.
   ═════════════════════════════════════════════════════════════════════════ */

function InterviewMock() {
  return (
    <DemoFrame title="MOCK INTERVIEW · OFFICER REYES">
      <div
        style={{
          position: "relative",
          height: 320,
          padding: "16px 18px",
          color: PAPER,
          fontFamily: "var(--font-sans-stack)",
        }}
      >
        {/* Officer pill — top-left */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(232,98,42,0.18)",
              border: `1px solid ${PERSIMMON}`,
              color: PERSIMMON,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display-stack)",
              fontSize: 14,
            }}
          >
            R
          </span>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 500 }}>Officer Reyes</p>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(250,248,244,0.45)",
              }}
            >
              Standard · 5 Q
            </p>
          </div>
        </div>

        {/* Start button — top-right at known coords */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="gs-iv-start"
          style={{
            position: "absolute",
            top: 22,
            right: 18,
            padding: "10px 22px",
            borderRadius: 999,
            background: PERSIMMON,
            color: PAPER,
            border: "none",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            boxShadow: "0 8px 20px -8px rgba(232,98,42,0.65)",
            cursor: "default",
            willChange: "transform, background",
          }}
        >
          <span className="gs-iv-start-label">Start</span>
        </button>

        {/* Prompt */}
        <p
          style={{
            position: "absolute",
            top: 92,
            left: 18,
            right: 18,
            margin: 0,
            fontFamily: "var(--font-display-stack)",
            fontSize: 17,
            lineHeight: 1.4,
            color: PAPER,
            fontStyle: "italic",
          }}
        >
          &ldquo;Why this university, and not a closer one back home?&rdquo;
        </p>

        {/* Waveform */}
        <div
          className="gs-iv-wave"
          aria-hidden
          style={{
            position: "absolute",
            top: 160,
            left: 18,
            right: 18,
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                background: PERSIMMON,
                borderRadius: 2,
                opacity: 0.75,
                transformOrigin: "center",
                animation: "gs-iv-bar 1.1s ease-in-out infinite",
                animationDelay: `${(i % 8) * 90}ms`,
                height: "100%",
                transform: "scaleY(0.3)",
              }}
            />
          ))}
        </div>

        {/* Score panel */}
        <div
          className="gs-iv-score"
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 14px",
            background: "rgba(250,248,244,0.05)",
            border: "1px solid rgba(250,248,244,0.10)",
            borderRadius: 10,
            opacity: 0,
            transform: "translateY(6px)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display-stack)",
              fontSize: 32,
              letterSpacing: "-0.02em",
              color: PERSIMMON,
              minWidth: 66,
            }}
          >
            <span className="gs-iv-num" />
            <span style={{ fontSize: 16, color: "rgba(250,248,244,0.5)" }}>/100</span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12 }}>Officer-ready</span>
            <span
              style={{
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(250,248,244,0.55)",
              }}
            >
              Clarity 88 · Confidence 82 · Ties 79
            </span>
          </span>
        </div>

        <Ripple className="gs-iv-ripple" />
        <Cursor className="gs-iv-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 4 — PARENT SHARE
   Stage: URL row with Copy button (top), toast above it, parent preview
   card (bottom). Cursor → Copy → click → toast pops → preview slides up.
   ═════════════════════════════════════════════════════════════════════════ */

function ParentViewMock() {
  return (
    <DemoFrame title="PARENT SHARE" tint="light">
      <div style={{ position: "relative", height: 320, padding: "18px" }}>
        {/* URL row */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 18,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px 10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(11,30,63,0.14)",
            background: "#FFFFFF",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 12,
              color: "rgba(11,30,63,0.8)",
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            getstamped.app/parent/k9c3w2
          </span>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="gs-pv-copy"
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              background: PERSIMMON,
              color: PAPER,
              border: "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "default",
              boxShadow: "0 6px 14px -6px rgba(232,98,42,0.5)",
              willChange: "transform, background",
            }}
          >
            <span className="gs-pv-copy-label">Copy</span>
          </button>
        </div>

        {/* Toast — appears above the URL row */}
        <span
          aria-hidden
          className="gs-pv-toast"
          style={{
            position: "absolute",
            top: -2,
            right: 22,
            padding: "5px 12px",
            borderRadius: 6,
            background: INK,
            color: PAPER,
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.04em",
            boxShadow: "0 8px 18px -8px rgba(11,30,63,0.45)",
            opacity: 0,
            transform: "translateY(6px)",
            zIndex: 4,
          }}
        >
          Link copied
        </span>

        {/* Parent preview card */}
        <div
          className="gs-pv-preview"
          style={{
            position: "absolute",
            top: 100,
            left: 18,
            right: 18,
            bottom: 18,
            padding: "18px 18px 18px",
            borderRadius: 14,
            background: INK,
            color: PAPER,
            opacity: 0,
            transform: "translateY(10px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(250,248,244,0.55)",
            }}
          >
            Anika — family view
          </p>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-display-stack)",
              fontSize: 20,
              lineHeight: 1.25,
              color: PAPER,
              letterSpacing: "-0.01em",
            }}
          >
            Your daughter&rsquo;s F-1 application
          </p>
          <p
            style={{
              margin: "4px 0 14px",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 11,
              color: "rgba(250,248,244,0.55)",
            }}
          >
            63% complete · last update 2m ago
          </p>
          <div
            style={{
              height: 5,
              borderRadius: 999,
              background: "rgba(250,248,244,0.10)",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: "63%",
                background: PERSIMMON,
                borderRadius: 999,
                boxShadow: "0 0 10px rgba(232,98,42,0.55)",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "auto",
              paddingTop: 14,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {["Phase 4 of 5", "Mocks · 2", "Docs 12 / 14"].map((p) => (
              <span
                key={p}
                style={{
                  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(250,248,244,0.7)",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "0.5px solid rgba(250,248,244,0.18)",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <Ripple className="gs-pv-ripple" />
        <Cursor className="gs-pv-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ────────────────────────────────────────────── component ── */

export function StackedFeatureCards() {
  return (
    <>
      <div id="playbook">
      <ScrollStack>
        <ScrollStackItem>
          <CardShell bg={WARM_PAPER} ink={INK} demo={<PlaybookMock />}>
            <Chip dark={false}>01 / PLAYBOOK</Chip>
            <Headline ink={INK}>
              47 steps. In the exact order the consulate expects them.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              Every form, fee, and deadline — sequenced, dated, and checked off as you go.
              Watch your progress bar move every time you tick a step.
            </Body>
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={PAPER} ink={INK} demo={<DocVaultMock />}>
            <Chip dark={false}>02 / DOCUMENT VAULT</Chip>
            <Headline ink={INK}>
              Drop a document. Get an officer&rsquo;s verdict.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              Our vision model reads every page in seconds — checks for missing
              signatures, expired dates, and wrong form versions before they cost
              you a reappointment.
            </Body>
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={SOFT_PEACH} ink={INK} demo={<InterviewMock />}>
            <Chip dark={false}>03 / MOCK INTERVIEW</Chip>
            <Headline ink={INK}>
              Practice until you stop freezing.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              A voice officer asks real F-1 questions in the order they actually ask them.
              You answer out loud. Get scored on clarity, confidence, and your ties story.
            </Body>
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={WARM_PAPER} ink={INK} demo={<ParentViewMock />}>
            <Chip dark={false}>04 / PARENT SHARE</Chip>
            <Headline ink={INK}>
              One link. They see everything. No calls needed.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              Tap copy, send it to your parents. They open a read-only view that updates
              live as you progress — no app, no login, no questions every night.
            </Body>
          </CardShell>
        </ScrollStackItem>
      </ScrollStack>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Animation timelines. EVERY cursor + state-change uses the SAME
          duration per card so they stay perfectly synced. Cursor uses
          a natural ease (cubic-bezier(0.32, 0.72, 0.32, 1)) — fast in
          the middle, slower at start/end like a real hand movement.
          ════════════════════════════════════════════════════════════════ */}
      <style>{`
        /* Shared natural cursor ease */
        :root {
          --gs-cursor-ease: cubic-bezier(0.32, 0.72, 0.32, 1);
        }

        /* Waveform bars (always pulsing — purely decorative) */
        @keyframes gs-iv-bar {
          0%, 100% { transform: scaleY(0.3); opacity: 0.55; }
          50%      { transform: scaleY(1);   opacity: 1; }
        }

        /* ── CARD 1 · PLAYBOOK (6s loop) ─────────────────────────────
           Stage: 320px tall, padding 16/18.
           Step 14 checkbox center is at roughly (29, 133) inside the
           padded box (left: 18 + 11 from row-padding ≈ 29; top: 122
           row-y + 11 mid-checkbox = 133). Cursor SVG hotspot is its
           tip (~3, 1.5) so translate to (29-3, 133-1.5) = (26, 131).
        */
        @keyframes gs-pb-cursor {
          0%, 8%   { transform: translate(360px, 270px); }
          38%, 46% { transform: translate(26px, 131px); }
          50%, 92% { transform: translate(26px, 131px); }
          100%     { transform: translate(360px, 270px); }
        }
        .gs-pb-cursor {
          animation: gs-pb-cursor 6s var(--gs-cursor-ease) infinite;
        }

        @keyframes gs-pb-ripple {
          0%, 45%  { opacity: 0; transform: translate(29px, 133px) scale(0.3); }
          47%      { opacity: 0.7; transform: translate(29px, 133px) scale(0.4); }
          56%      { opacity: 0; transform: translate(29px, 133px) scale(1.6); }
          100%     { opacity: 0; transform: translate(29px, 133px) scale(0.3); }
        }
        .gs-pb-ripple { animation: gs-pb-ripple 6s ease-out infinite; }

        @keyframes gs-pb-target-fill {
          0%, 47%   { background: transparent; border-color: rgba(250,248,244,0.28); }
          50%, 96%  { background: ${PERSIMMON}; border-color: ${PERSIMMON}; }
          100%      { background: transparent; border-color: rgba(250,248,244,0.28); }
        }
        .gs-pb-target-mark { animation: gs-pb-target-fill 6s var(--gs-cursor-ease) infinite; }

        @keyframes gs-pb-target-check {
          0%, 47%   { opacity: 0; transform: scale(0.5); }
          52%, 96%  { opacity: 1; transform: scale(1); }
          100%      { opacity: 0; transform: scale(0.5); }
        }
        .gs-pb-target-mark::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'><path d='M2.5 6.2 L5 8.6 L9.5 3.6' stroke='%23FAF8F4' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / 11px no-repeat;
          opacity: 0;
          animation: gs-pb-target-check 6s var(--gs-cursor-ease) infinite;
        }

        @keyframes gs-pb-progress {
          0%, 47%   { width: 43%; }
          55%, 96%  { width: 57%; }
          100%      { width: 43%; }
        }
        .gs-pb-progress { animation: gs-pb-progress 6s var(--gs-cursor-ease) infinite; }

        @keyframes gs-pb-counter {
          0%, 47%   { content: "3 / 7"; }
          50%, 96%  { content: "4 / 7"; }
          100%      { content: "3 / 7"; }
        }
        .gs-pb-counter::after {
          content: "3 / 7";
          animation: gs-pb-counter 6s steps(1, end) infinite;
        }

        /* ── CARD 2 · DOCUMENT VAULT (6.5s loop) ────────────────────────
           File starts at (18, 14). Drop zone center is at ~(width/2, 125)
           inside padding. Width is dynamic so we use the file's translate
           to move it RELATIVE to its starting position.
        */
        @keyframes gs-vt-cursor {
          0%, 8%    { transform: translate(330px, 250px); }
          22%, 28%  { transform: translate(58px, 24px); }
          54%, 60%  { transform: translate(228px, 130px); }
          78%, 100% { transform: translate(228px, 130px); }
        }
        .gs-vt-cursor { animation: gs-vt-cursor 6.5s var(--gs-cursor-ease) infinite; }

        /* File follows cursor: 0,0 → grab spot (offset 0,0) →
           drag delta (228-58, 130-24) = (170, 106) */
        @keyframes gs-vt-file {
          0%, 22%  { transform: translate(0, 0) scale(1); opacity: 1; }
          28%      { transform: translate(0, 0) scale(0.92); opacity: 1; }
          54%      { transform: translate(170px, 106px) scale(0.92); opacity: 1; }
          60%      { transform: translate(170px, 106px) scale(0.5); opacity: 0; }
          75%, 100%{ transform: translate(0, 0) scale(1); opacity: 1; }
        }
        .gs-vt-file { animation: gs-vt-file 6.5s var(--gs-cursor-ease) infinite; }

        @keyframes gs-vt-ripple {
          0%, 56%  { opacity: 0; transform: translate(228px, 130px) scale(0.3); }
          60%      { opacity: 0.65; transform: translate(228px, 130px) scale(0.5); }
          70%      { opacity: 0; transform: translate(228px, 130px) scale(2); }
          100%     { opacity: 0; transform: translate(228px, 130px) scale(0.3); }
        }
        .gs-vt-ripple { animation: gs-vt-ripple 6.5s ease-out infinite; }

        @keyframes gs-vt-zone {
          0%, 30%   { background: rgba(232,98,42,0.05); border-color: rgba(232,98,42,0.45); }
          35%, 60%  { background: rgba(232,98,42,0.12); border-color: rgba(232,98,42,0.7); }
          70%, 100% { background: rgba(232,98,42,0.05); border-color: rgba(232,98,42,0.45); }
        }
        .gs-vt-zone { animation: gs-vt-zone 6.5s ease-in-out infinite; }

        /* Scan sweep — only fires AFTER drop (60–75%) */
        @keyframes gs-vt-scan {
          0%, 60%   { opacity: 0; transform: translateY(-30%); }
          65%, 78%  { opacity: 1; transform: translateY(60%); }
          82%, 100% { opacity: 0; transform: translateY(150%); }
        }
        .gs-vt-scan {
          position: absolute;
          left: 0; right: 0;
          height: 28px;
          background: linear-gradient(180deg, transparent, rgba(232,98,42,0.6), transparent);
          pointer-events: none;
          animation: gs-vt-scan 6.5s ease-in-out infinite;
        }

        @keyframes gs-vt-result {
          0%, 78%   { opacity: 0; transform: translateY(8px); }
          85%, 96%  { opacity: 1; transform: translateY(0); }
          100%      { opacity: 0; transform: translateY(8px); }
        }
        .gs-vt-result { animation: gs-vt-result 6.5s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        /* ── CARD 3 · MOCK INTERVIEW (6s loop) ──────────────────────────
           Stage 320 tall. Start button is right-anchored (top:22, right:18)
           so its actual on-screen position depends on the demo's real
           rendered width — which varies a lot (single fixed-px column on
           mobile vs a ~1.1fr grid track on desktop, up to 720px). The
           previous version used a hardcoded transform: translate(540px…)
           that only lined up with the button at one specific width
           (~640px) and drifted everywhere else — that's the "cursor
           doesn't go to the right place" bug.

           Fix: animate left/top (real CSS offset properties) instead
           of transform: translate(). Unlike transform's percentages
           (relative to the element's own box), left's percentage is
           relative to the containing block — the same box the button's
           own right: 18px resolves against — so calc(100% - Npx) tracks
           the button's real position at any width, matching it exactly
           instead of guessing one number for one screen size.
        */
        @keyframes gs-iv-cursor {
          0%, 8%    { left: 60px; top: 270px; }
          30%, 36%  { left: calc(100% - 60px); top: 32px; }
          40%, 92%  { left: calc(100% - 60px); top: 32px; }
          100%      { left: 60px; top: 270px; }
        }
        .gs-iv-cursor { animation: gs-iv-cursor 6s var(--gs-cursor-ease) infinite; }

        @keyframes gs-iv-ripple {
          0%, 36%  { opacity: 0; left: calc(100% - 50px); top: 38px; transform: scale(0.3); }
          39%      { opacity: 0.7; left: calc(100% - 50px); top: 38px; transform: scale(0.4); }
          50%      { opacity: 0; left: calc(100% - 50px); top: 38px; transform: scale(2); }
          100%     { opacity: 0; left: calc(100% - 50px); top: 38px; transform: scale(0.3); }
        }
        .gs-iv-ripple { animation: gs-iv-ripple 6s ease-out infinite; }

        /* Start button press + state shift to "listening" */
        @keyframes gs-iv-start {
          0%, 36%   { transform: scale(1); background: ${PERSIMMON}; }
          39%       { transform: scale(0.93); background: #B85A15; }
          45%, 92%  { transform: scale(1); background: rgba(232,98,42,0.40); }
          100%      { transform: scale(1); background: ${PERSIMMON}; }
        }
        .gs-iv-start { animation: gs-iv-start 6s ease-in-out infinite; }

        /* Label flips Start → Listening… */
        @keyframes gs-iv-label {
          0%, 38%  { content: "Start"; }
          42%, 92% { content: "Listening…"; }
          100%     { content: "Start"; }
        }
        .gs-iv-start-label { display: none; }
        .gs-iv-start::before {
          content: "Start";
          animation: gs-iv-label 6s steps(1, end) infinite;
        }

        /* Waveform amplifies after click */
        @keyframes gs-iv-wave {
          0%, 38%  { opacity: 0.25; filter: saturate(0.5); }
          44%, 80% { opacity: 1; filter: saturate(1.15); }
          88%, 100%{ opacity: 0.3; filter: saturate(0.6); }
        }
        .gs-iv-wave { animation: gs-iv-wave 6s ease-in-out infinite; }

        /* Score reveal */
        @keyframes gs-iv-score {
          0%, 80%   { opacity: 0; transform: translateY(8px); }
          88%, 96%  { opacity: 1; transform: translateY(0); }
          100%      { opacity: 0; transform: translateY(8px); }
        }
        .gs-iv-score { animation: gs-iv-score 6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        @keyframes gs-iv-num {
          0%, 81%  { content: ""; }
          83%      { content: "62"; }
          86%      { content: "74"; }
          90%, 96% { content: "84"; }
          100%     { content: ""; }
        }
        .gs-iv-num::after {
          content: "";
          font-variant-numeric: tabular-nums;
          animation: gs-iv-num 6s steps(1, end) infinite;
        }

        /* ── CARD 4 · PARENT SHARE (6s loop) ────────────────────────────
           Same bug and same fix as Card 3 above: the Copy button is
           right-anchored inside the URL row, so its real position
           depends on the demo's actual rendered width, not a fixed
           number. Animate left/top (resolves against the real
           containing-block width) instead of a hardcoded
           transform: translate(560px…) that only matched one screen size.
        */
        @keyframes gs-pv-cursor {
          0%, 8%    { left: 70px; top: 250px; }
          30%, 36%  { left: calc(100% - 65px); top: 50px; }
          40%, 92%  { left: calc(100% - 65px); top: 50px; }
          100%      { left: 70px; top: 250px; }
        }
        .gs-pv-cursor { animation: gs-pv-cursor 6s var(--gs-cursor-ease) infinite; }

        @keyframes gs-pv-ripple {
          0%, 36%  { opacity: 0; left: calc(100% - 55px); top: 56px; transform: scale(0.3); }
          39%      { opacity: 0.7; left: calc(100% - 55px); top: 56px; transform: scale(0.45); }
          50%      { opacity: 0; left: calc(100% - 55px); top: 56px; transform: scale(2); }
          100%     { opacity: 0; left: calc(100% - 55px); top: 56px; transform: scale(0.3); }
        }
        .gs-pv-ripple { animation: gs-pv-ripple 6s ease-out infinite; }

        @keyframes gs-pv-copy {
          0%, 36%   { transform: scale(1); background: ${PERSIMMON}; }
          39%       { transform: scale(0.93); background: #B85A15; }
          45%, 92%  { transform: scale(1); background: ${PERSIMMON}; }
          100%      { transform: scale(1); background: ${PERSIMMON}; }
        }
        .gs-pv-copy { animation: gs-pv-copy 6s ease-in-out infinite; }

        @keyframes gs-pv-label {
          0%, 38%  { content: "Copy"; }
          42%, 92% { content: "Copied"; }
          100%     { content: "Copy"; }
        }
        .gs-pv-copy-label { display: none; }
        .gs-pv-copy::before {
          content: "Copy";
          animation: gs-pv-label 6s steps(1, end) infinite;
        }

        @keyframes gs-pv-toast {
          0%, 38%   { opacity: 0; transform: translateY(8px); }
          44%, 62%  { opacity: 1; transform: translateY(0); }
          72%, 100% { opacity: 0; transform: translateY(-4px); }
        }
        .gs-pv-toast { animation: gs-pv-toast 6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        @keyframes gs-pv-preview {
          0%, 50%   { opacity: 0; transform: translateY(10px); }
          62%, 96%  { opacity: 1; transform: translateY(0); }
          100%      { opacity: 0; transform: translateY(10px); }
        }
        .gs-pv-preview { animation: gs-pv-preview 6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        /* Responsive: collapse columns + scale demo down on tablet/mobile */
        @media (max-width: 900px) {
          .gs-sc-shell {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 32px 22px !important;
          }
          .gs-sc-copy { max-width: 100% !important; }
          .gs-sc-demo { max-width: 100% !important; }
          .gs-sc-headline { font-size: 30px !important; }
          .gs-sc-body { font-size: 14px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-pb-cursor, .gs-pb-ripple, .gs-pb-target-mark,
          .gs-pb-target-mark::after, .gs-pb-progress, .gs-pb-counter::after,
          .gs-vt-cursor, .gs-vt-ripple, .gs-vt-file, .gs-vt-zone,
          .gs-vt-scan, .gs-vt-result,
          .gs-iv-cursor, .gs-iv-ripple, .gs-iv-start, .gs-iv-start::before,
          .gs-iv-wave, .gs-iv-wave > span, .gs-iv-score, .gs-iv-num::after,
          .gs-pv-cursor, .gs-pv-ripple, .gs-pv-copy, .gs-pv-copy::before,
          .gs-pv-toast, .gs-pv-preview {
            animation: none !important;
          }
          /* Freeze on the "after-click" state so users still see what
             each feature does. */
          .gs-pb-target-mark { background: ${PERSIMMON} !important; border-color: ${PERSIMMON} !important; }
          .gs-pb-target-mark::after { opacity: 1 !important; }
          .gs-pb-progress { width: 57% !important; }
          .gs-pb-counter::after { content: "4 / 7" !important; }
          .gs-vt-file { opacity: 0 !important; }
          .gs-vt-result { opacity: 1 !important; transform: none !important; }
          .gs-iv-start::before { content: "Listening…" !important; }
          .gs-iv-score { opacity: 1 !important; transform: none !important; }
          .gs-iv-num::after { content: "84" !important; }
          .gs-pv-copy::before { content: "Copied" !important; }
          .gs-pv-toast { opacity: 1 !important; transform: none !important; }
          .gs-pv-preview { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </>
  );
}
