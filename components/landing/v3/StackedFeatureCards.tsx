"use client";

import type { ReactNode } from "react";
import { ScrollStack } from "@/components/ui/ScrollStack";
import { ScrollStackItem } from "@/components/ui/ScrollStackItem";

/* ════════════════════════════════════════════════════════════════════════
   StackedFeatureCards — the four full-bleed feature cards that pin and
   stack as the user scrolls past the hero.

   Each card is a split LEFT (copy) + RIGHT (mini demo). The demos are
   now self-contained "app screenshot" cards with a fake browser chrome
   and an animated cursor that walks through the actual interaction
   the feature describes — checking a step, dropping a document,
   starting a mock interview, copying a parent link.

   Pinning, ScrollStack, ScrollStackItem behavior, and the surrounding
   page layout are untouched.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#1C1917";
const PAPER = "#FAF8F4";
const WARM_PAPER = "#FAF5EE";
const SOFT_PEACH = "#FBE8D9";
const PERSIMMON = "#E8622A";
const GREEN = "#3FB37F";
void INK;
void GREEN;

/* ────────────────────────────────────────────── shared primitives ── */

function Chip({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <span
      className="gs-sc-chip"
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
        gridTemplateColumns: "1.05fr 1fr",
        gap: "clamp(32px, 5vw, 80px)",
        alignItems: "center",
        padding: "clamp(32px, 4vw, 56px) clamp(24px, 6vw, 80px)",
      }}
    >
      <div className="gs-sc-copy" style={{ maxWidth: 560 }}>
        {children}
      </div>
      <div
        className="gs-sc-demo"
        style={{ width: "100%", maxWidth: 620, justifySelf: "center" }}
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
        fontSize: "clamp(36px, 4.4vw, 56px)",
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: ink,
        margin: "20px 0 0 0",
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
        fontSize: 16,
        lineHeight: 1.7,
        color: ink,
        maxWidth: 480,
        margin: "20px 0 0 0",
      }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────── demo frame + cursor ── */

/** Browser-chrome wrapper so every demo reads as a small product card. */
function DemoFrame({
  title,
  children,
  tint = "dark",
}: {
  title: string;
  children: ReactNode;
  tint?: "dark" | "light";
}) {
  const isDark = tint === "dark";
  return (
    <div
      className="gs-df-frame"
      style={{
        background: isDark ? "var(--color-ink)" : "#FFFDF7",
        border: `1px solid ${isDark ? "rgba(250,248,244,0.10)" : "rgba(11,30,63,0.08)"}`,
        borderRadius: 16,
        boxShadow: "0 30px 70px -32px rgba(11,30,63,0.32)",
        overflow: "hidden",
      }}
    >
      <div
        className="gs-df-bar"
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
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

/** SVG cursor positioned absolutely. Animation timing comes from the
 *  caller via a className that owns the keyframe. */
function Cursor({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      width="20"
      height="22"
      viewBox="0 0 20 22"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 5,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
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

/* ════════════════════════════════════════════════════════════════════════
   CARD 1 — Playbook: cursor checks off step 14
   ═════════════════════════════════════════════════════════════════════════ */

function PlaybookMock() {
  const rows = [
    { n: 11, label: "Receive I-20 from school",     date: "Feb 28", state: "done" },
    { n: 12, label: "Pay SEVIS I-901 fee",           date: "Mar 03", state: "done" },
    { n: 13, label: "Complete DS-160 form",          date: "Mar 07", state: "done" },
    { n: 14, label: "Schedule visa appointment",     date: "Mar 10", state: "target" },
    { n: 15, label: "Prepare document bundle",       date: "Mar 12", state: "upcoming" },
  ] as const;

  return (
    <DemoFrame title="F-1 PLAYBOOK · PHASE 02">
      <div style={{ padding: "16px 18px 18px", color: PAPER }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(250,248,244,0.45)",
              textTransform: "uppercase",
            }}
          >
            After I-20 · steps 11–15
          </p>
          <span
            className="gs-pb-counter"
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              color: "rgba(250,248,244,0.6)",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>

        {/* Progress bar that animates from 60% to 80% mid-loop */}
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "rgba(250,248,244,0.08)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <span
            className="gs-pb-progress"
            style={{
              display: "block",
              height: "100%",
              width: "60%",
              background: PERSIMMON,
              borderRadius: 999,
              boxShadow: "0 0 10px rgba(232,98,42,0.55)",
            }}
          />
        </div>

        <ul
          className="gs-pb-list"
          style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}
        >
          {rows.map((r, i) => (
            <li
              key={r.n}
              data-state={r.state}
              style={{
                display: "grid",
                gridTemplateColumns: "26px 64px 1fr auto",
                alignItems: "center",
                gap: 12,
                padding: "10px 6px",
                borderBottom:
                  i < rows.length - 1 ? "0.5px solid rgba(250,248,244,0.06)" : "none",
                fontFamily: "var(--font-sans-stack)",
                fontSize: 13,
                color: "rgba(250,248,244,0.85)",
              }}
            >
              {/* Checkbox — default state per row + a target row that
                  flips mid-loop when the cursor "clicks" it. */}
              <span
                className={r.state === "target" ? "gs-pb-target-mark" : ""}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: r.state === "done" ? PERSIMMON : "transparent",
                  border:
                    r.state === "done"
                      ? `1px solid ${PERSIMMON}`
                      : "1px solid rgba(250,248,244,0.25)",
                  color: PAPER,
                  position: "relative",
                }}
              >
                {r.state === "done" && (
                  <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
                    <path
                      d="M2.5 6.2 L5 8.6 L9.5 3.6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span
                style={{
                  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "rgba(250,248,244,0.45)",
                }}
              >
                Step {r.n}
              </span>
              <span
                style={{
                  color:
                    r.state === "upcoming"
                      ? "rgba(250,248,244,0.55)"
                      : PAPER,
                  fontWeight: r.state === "target" ? 500 : 400,
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                  fontSize: 10,
                  color: "rgba(250,248,244,0.4)",
                }}
              >
                {r.date}
              </span>
            </li>
          ))}

          {/* Animated cursor — walks to step 14's checkbox and clicks. */}
          <Cursor className="gs-pb-cursor" />
        </ul>
      </div>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 2 — Document Vault: cursor drags a passport onto the upload zone,
   the scanner runs, and the result panel appears.
   ═════════════════════════════════════════════════════════════════════════ */

function DocVaultMock() {
  return (
    <DemoFrame title="DOCUMENT VAULT" tint="light">
      <div style={{ padding: "18px 18px 20px", position: "relative" }}>
        {/* The fake file the cursor will drag */}
        <div
          className="gs-vt-file"
          style={{
            position: "absolute",
            top: 10,
            left: 22,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px 6px 8px",
            borderRadius: 8,
            background: "#FFFFFF",
            border: "1px solid rgba(11,30,63,0.12)",
            boxShadow: "0 6px 14px -8px rgba(11,30,63,0.2)",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            color: "rgba(11,30,63,0.78)",
            zIndex: 4,
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          passport.png
        </div>

        {/* Upload zone */}
        <div
          className="gs-vt-zone"
          style={{
            marginTop: 56,
            padding: "26px 18px 22px",
            borderRadius: 12,
            border: `1.5px dashed rgba(232,98,42,0.42)`,
            background: "rgba(232,98,42,0.05)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display-stack)",
              fontSize: 18,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            Drop your passport
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(11,30,63,0.45)",
            }}
          >
            png · jpg · pdf · ≤ 10 MB
          </p>

          {/* Scanning sweep — only visible while the .gs-vt-zone has the
              "is-scanning" pseudo-state via the timeline keyframe. */}
          <span className="gs-vt-scan" aria-hidden />
        </div>

        {/* Verified result panel — appears at the end of the timeline */}
        <div
          className="gs-vt-result"
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#FFFFFF",
            border: `1px solid rgba(63,179,127,0.4)`,
            boxShadow: "0 12px 24px -16px rgba(63,179,127,0.4)",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
            color: "var(--color-ink)",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: GREEN,
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
              <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <strong style={{ fontWeight: 500 }}>Passport cleared.</strong>{" "}
            <span style={{ color: "rgba(11,30,63,0.55)" }}>Expires Mar 2028 · all corners visible.</span>
          </span>
        </div>

        <Cursor className="gs-vt-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 3 — Mock Interview: cursor clicks "Start", waveform animates,
   score counts up to 84.
   ═════════════════════════════════════════════════════════════════════════ */

function InterviewMock() {
  return (
    <DemoFrame title="MOCK INTERVIEW · OFFICER REYES">
      <div style={{ padding: "16px 18px 18px", position: "relative", color: PAPER }}>
        {/* Officer pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(250,248,244,0.06)",
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
              fontSize: 13,
            }}
          >
            R
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-sans-stack)", fontSize: 12, color: PAPER, fontWeight: 500 }}>
              Officer Reyes
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 9,
                color: "rgba(250,248,244,0.45)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Standard · 5 questions
            </p>
          </div>
          <span style={{ flex: 1 }} />
          <span
            className="gs-iv-live"
            aria-hidden
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GREEN,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: GREEN }} />
            live
          </span>
        </div>

        {/* Prompt */}
        <p
          style={{
            marginTop: 14,
            fontFamily: "var(--font-display-stack)",
            fontSize: 16,
            lineHeight: 1.4,
            color: PAPER,
            fontStyle: "italic",
          }}
        >
          &ldquo;Why this university, and not a closer one back home?&rdquo;
        </p>

        {/* Waveform — bars pulse while the cursor "holds" Start */}
        <div
          className="gs-iv-wave"
          aria-hidden
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 36,
          }}
        >
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                background: PERSIMMON,
                borderRadius: 2,
                opacity: 0.7,
                transformOrigin: "center",
                animation: `gs-iv-bar 1.1s ease-in-out infinite`,
                animationDelay: `${(i % 8) * 90}ms`,
                height: "100%",
                transform: "scaleY(0.3)",
              }}
            />
          ))}
        </div>

        {/* Score row — reveals after the waveform "stops" */}
        <div
          className="gs-iv-score"
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            background: "rgba(250,248,244,0.05)",
            border: "1px solid rgba(250,248,244,0.10)",
            borderRadius: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display-stack)",
              fontSize: 28,
              letterSpacing: "-0.02em",
              color: PERSIMMON,
              minWidth: 56,
            }}
          >
            <span className="gs-iv-num" />/100
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-sans-stack)", fontSize: 12, color: PAPER }}>
              Officer-ready
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(250,248,244,0.5)",
              }}
            >
              Clarity 88 · Confidence 82 · Ties 79
            </span>
          </span>
        </div>

        {/* Start button — cursor lands on this */}
        <button
          className="gs-iv-start"
          type="button"
          tabIndex={-1}
          aria-hidden
          style={{
            position: "absolute",
            right: 18,
            top: 14,
            padding: "8px 16px",
            borderRadius: 999,
            background: PERSIMMON,
            color: PAPER,
            border: "none",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            boxShadow: "0 8px 18px -8px rgba(232,98,42,0.6)",
            cursor: "default",
          }}
        >
          Start
        </button>

        <Cursor className="gs-iv-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CARD 4 — Parent Share: cursor clicks Copy, toast confirms, the parent
   read-only preview slides into view.
   ═════════════════════════════════════════════════════════════════════════ */

function ParentViewMock() {
  return (
    <DemoFrame title="PARENT SHARE" tint="light">
      <div style={{ padding: "18px 18px 20px", position: "relative" }}>
        {/* Link row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(11,30,63,0.12)",
            background: "#FFFFFF",
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 12,
              color: "rgba(11,30,63,0.78)",
              flex: 1,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            getstamped.app/parent/k9c3w2
          </span>

          {/* Copy button — cursor target */}
          <button
            className="gs-pv-copy"
            type="button"
            tabIndex={-1}
            aria-hidden
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: PERSIMMON,
              color: PAPER,
              border: "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "default",
              boxShadow: "0 6px 14px -6px rgba(232,98,42,0.45)",
            }}
          >
            Copy
          </button>

          {/* Copied! toast — appears on click */}
          <span
            className="gs-pv-toast"
            aria-hidden
            style={{
              position: "absolute",
              right: 10,
              top: -28,
              padding: "4px 10px",
              borderRadius: 6,
              background: "var(--color-ink)",
              color: PAPER,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.04em",
              boxShadow: "0 6px 14px -6px rgba(11,30,63,0.4)",
              opacity: 0,
              transform: "translateY(4px)",
            }}
          >
            Link copied
          </span>
        </div>

        {/* Parent preview card — reveals after copy */}
        <div
          className="gs-pv-preview"
          style={{
            marginTop: 14,
            padding: "14px 14px 16px",
            borderRadius: 12,
            background: "var(--color-ink)",
            color: PAPER,
            opacity: 0,
            transform: "translateY(8px)",
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
              margin: "6px 0 0",
              fontFamily: "var(--font-display-stack)",
              fontSize: 18,
              lineHeight: 1.3,
              color: PAPER,
            }}
          >
            Your daughter&rsquo;s F-1 application
          </p>
          <p
            style={{
              margin: "4px 0 12px",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 11,
              color: "rgba(250,248,244,0.55)",
            }}
          >
            63% complete · last update 2m ago
          </p>
          <div
            style={{
              height: 4,
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
              marginTop: 12,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {["Phase 4 of 5", "Mocks done · 2", "Docs 12 / 14"].map((p) => (
              <span
                key={p}
                style={{
                  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(250,248,244,0.7)",
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "0.5px solid rgba(250,248,244,0.18)",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <Cursor className="gs-pv-cursor" />
      </div>
    </DemoFrame>
  );
}

/* ────────────────────────────────────────────── component ── */

export function StackedFeatureCards() {
  return (
    <>
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
              Our vision model reads every page in seconds — catches missing signatures,
              expired dates, and wrong form versions before they cost you a reappointment.
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

      <style>{`
        /* ── Shared waveform bars (Interview demo) ─────────────────── */
        @keyframes gs-iv-bar {
          0%, 100% { transform: scaleY(0.3); opacity: 0.55; }
          50%      { transform: scaleY(1);   opacity: 1; }
        }

        /* ── Card 1: Playbook ──────────────────────────────────────── */
        /* Cursor walks from bottom-right corner up to the step-14
           checkbox at (8px, 162px), pauses, "clicks", then resets. */
        @keyframes gs-pb-cursor {
          0%, 6%    { transform: translate(380px, 220px); }
          26%, 34%  { transform: translate(8px, 158px); }
          36%       { transform: translate(8px, 158px) scale(0.85); }
          40%, 86%  { transform: translate(8px, 158px); }
          100%      { transform: translate(380px, 220px); }
        }
        .gs-pb-cursor {
          animation: gs-pb-cursor 5s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        /* Step-14 row reacts: ring fills with persimmon at the click moment. */
        @keyframes gs-pb-target {
          0%, 35%   { background: transparent; border-color: rgba(250,248,244,0.25); }
          40%, 96%  { background: ${PERSIMMON}; border-color: ${PERSIMMON}; }
          100%      { background: transparent; border-color: rgba(250,248,244,0.25); }
        }
        @keyframes gs-pb-checkpop {
          0%, 36%   { opacity: 0; transform: scale(0.4); }
          42%, 96%  { opacity: 1; transform: scale(1); }
          100%      { opacity: 0; transform: scale(0.4); }
        }
        .gs-pb-target-mark { animation: gs-pb-target 5s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
        .gs-pb-target-mark::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'><path d='M2.5 6.2 L5 8.6 L9.5 3.6' stroke='%23FAF8F4' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / 9px no-repeat;
          opacity: 0;
          animation: gs-pb-checkpop 5s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }
        /* Progress bar slides 60% → 80% in sync with the click. */
        @keyframes gs-pb-progress {
          0%, 38%   { width: 60%; }
          50%, 96%  { width: 80%; }
          100%      { width: 60%; }
        }
        .gs-pb-progress { animation: gs-pb-progress 5s cubic-bezier(0.45, 0, 0.25, 1) infinite; }

        @keyframes gs-pb-counter {
          0%, 38%   { content: "3 / 5"; }
          50%, 96%  { content: "4 / 5"; }
          100%      { content: "3 / 5"; }
        }
        .gs-pb-counter::after {
          content: "3 / 5";
          animation: gs-pb-counter 5s cubic-bezier(0.45, 0, 0.25, 1) infinite;
        }

        /* ── Card 2: Document Vault ─────────────────────────────────── */
        /* Cursor: idle → pick up file → drag to zone → release. */
        @keyframes gs-vt-cursor {
          0%, 6%    { transform: translate(90px, 12px); }
          20%, 24%  { transform: translate(60px, 18px) scale(0.92); }
          50%, 56%  { transform: translate(220px, 130px); }
          60%       { transform: translate(220px, 130px) scale(1); }
          100%      { transform: translate(90px, 12px); }
        }
        .gs-vt-cursor { animation: gs-vt-cursor 6s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
        /* File follows the cursor with a tiny lag. */
        @keyframes gs-vt-file {
          0%, 18%   { transform: translate(0, 0) scale(1); opacity: 1; }
          24%, 50%  { transform: translate(150px, 90px) scale(0.9); opacity: 0.92; }
          58%       { transform: translate(150px, 90px) scale(0.1); opacity: 0; }
          70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        .gs-vt-file { animation: gs-vt-file 6s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
        /* Scanner sweep — only visible during the scanning window. */
        @keyframes gs-vt-scan {
          0%, 58%   { opacity: 0; transform: translateY(-30%); }
          62%, 78%  { opacity: 1; transform: translateY(30%); }
          82%, 100% { opacity: 0; transform: translateY(120%); }
        }
        .gs-vt-scan {
          position: absolute;
          left: 0; right: 0;
          height: 24px;
          background: linear-gradient(180deg, transparent, rgba(232,98,42,0.55), transparent);
          pointer-events: none;
          animation: gs-vt-scan 6s ease-in-out infinite;
        }
        /* Zone breathes when the file is being dragged onto it. */
        @keyframes gs-vt-zone {
          0%, 48%   { background: rgba(232,98,42,0.05); border-color: rgba(232,98,42,0.42); }
          52%, 80%  { background: rgba(232,98,42,0.12); border-color: rgba(232,98,42,0.7); }
          100%      { background: rgba(232,98,42,0.05); border-color: rgba(232,98,42,0.42); }
        }
        .gs-vt-zone { animation: gs-vt-zone 6s ease-in-out infinite; }
        /* Result panel appears at the end of the scan. */
        @keyframes gs-vt-result {
          0%, 80%   { opacity: 0; transform: translateY(6px); }
          88%, 96%  { opacity: 1; transform: translateY(0); }
          100%      { opacity: 0; transform: translateY(6px); }
        }
        .gs-vt-result { animation: gs-vt-result 8.5s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        /* ── Card 3: Mock Interview ─────────────────────────────────── */
        /* Cursor: idle bottom-left → start button (top-right) → click → leaves. */
        @keyframes gs-iv-cursor {
          0%, 6%    { transform: translate(30px, 180px); }
          22%, 28%  { transform: translate(340px, 10px); }
          30%       { transform: translate(340px, 10px) scale(0.85); }
          34%, 100% { transform: translate(30px, 180px); }
        }
        .gs-iv-cursor { animation: gs-iv-cursor 5.5s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
        /* Start button presses, then fades to a "Listening…" disabled style. */
        @keyframes gs-iv-start {
          0%, 28%   { transform: scale(1); background: ${PERSIMMON}; }
          32%       { transform: scale(0.93); background: #B85A15; }
          40%, 92%  { transform: scale(1); background: rgba(232,98,42,0.35); }
          100%      { transform: scale(1); background: ${PERSIMMON}; }
        }
        .gs-iv-start { animation: gs-iv-start 5.5s ease-in-out infinite; }
        /* Waveform is muted before click, lively during, mutes again at end. */
        @keyframes gs-iv-wave-amp {
          0%, 30%   { opacity: 0.2; filter: saturate(0.4); }
          36%, 78%  { opacity: 1;   filter: saturate(1.1); }
          88%, 100% { opacity: 0.3; filter: saturate(0.5); }
        }
        .gs-iv-wave { animation: gs-iv-wave-amp 5.5s ease-in-out infinite; }
        /* Score row + number reveal after the wave settles. */
        @keyframes gs-iv-score-in {
          0%, 78%   { opacity: 0; transform: translateY(6px); }
          84%, 96%  { opacity: 1; transform: translateY(0); }
          100%      { opacity: 0; transform: translateY(6px); }
        }
        .gs-iv-score { animation: gs-iv-score-in 5.5s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        /* The score number counts up by swapping content via keyframes. */
        @keyframes gs-iv-num {
          0%, 79%  { content: ""; }
          80%      { content: "62"; }
          84%      { content: "74"; }
          88%, 96% { content: "84"; }
          100%     { content: ""; }
        }
        .gs-iv-num::after {
          content: "";
          font-variant-numeric: tabular-nums;
          animation: gs-iv-num 5.5s steps(1, end) infinite;
        }
        /* "live" dot pulses gently while wave is animating. */
        .gs-iv-live span:first-child { animation: gs-iv-live-pulse 1.4s ease-in-out infinite; }
        @keyframes gs-iv-live-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.5); opacity: 0.4; }
        }

        /* ── Card 4: Parent Share ───────────────────────────────────── */
        /* Cursor: idle → Copy button → click → leaves. */
        @keyframes gs-pv-cursor {
          0%, 6%    { transform: translate(60px, 200px); }
          22%, 28%  { transform: translate(380px, 30px); }
          32%       { transform: translate(380px, 30px) scale(0.88); }
          40%, 100% { transform: translate(60px, 200px); }
        }
        .gs-pv-cursor { animation: gs-pv-cursor 5.5s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
        /* Copy button presses, briefly turns deeper. */
        @keyframes gs-pv-copy {
          0%, 28%  { background: ${PERSIMMON}; }
          32%      { transform: scale(0.92); background: #B85A15; }
          40%, 90% { transform: scale(1); background: ${PERSIMMON}; }
          100%     { background: ${PERSIMMON}; }
        }
        .gs-pv-copy { animation: gs-pv-copy 5.5s ease-in-out infinite; }
        /* Toast slides down + holds. */
        @keyframes gs-pv-toast {
          0%, 30%  { opacity: 0; transform: translateY(4px); }
          36%, 60% { opacity: 1; transform: translateY(0); }
          70%, 100%{ opacity: 0; transform: translateY(-2px); }
        }
        .gs-pv-toast { animation: gs-pv-toast 5.5s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        /* Parent preview card reveals after copy. */
        @keyframes gs-pv-preview {
          0%, 38%  { opacity: 0; transform: translateY(10px); }
          50%, 96% { opacity: 1; transform: translateY(0); }
          100%     { opacity: 0; transform: translateY(10px); }
        }
        .gs-pv-preview { animation: gs-pv-preview 5.5s cubic-bezier(0.22, 1, 0.36, 1) infinite; }

        /* ── Layout — collapse to single column on tablet/mobile ──── */
        @media (max-width: 900px) {
          .gs-sc-shell {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            align-content: center;
            padding: 32px 22px !important;
          }
          .gs-sc-copy { max-width: 100% !important; }
          .gs-sc-demo { max-width: 100% !important; }
          .gs-sc-headline { font-size: 30px !important; }
          .gs-sc-body { font-size: 14px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-pb-cursor, .gs-vt-cursor, .gs-iv-cursor, .gs-pv-cursor,
          .gs-pb-progress, .gs-pb-target-mark, .gs-pb-target-mark::after,
          .gs-pb-counter::after,
          .gs-vt-file, .gs-vt-scan, .gs-vt-zone, .gs-vt-result,
          .gs-iv-start, .gs-iv-wave, .gs-iv-score, .gs-iv-num::after,
          .gs-iv-live span:first-child,
          .gs-pv-copy, .gs-pv-toast, .gs-pv-preview,
          .gs-iv-wave > span {
            animation: none !important;
          }
          /* In the reduced-motion fallback, show the "after" state of each
             demo so users still see what the feature does. */
          .gs-pb-target-mark { background: ${PERSIMMON} !important; border-color: ${PERSIMMON} !important; }
          .gs-pb-target-mark::after { opacity: 1 !important; }
          .gs-pb-progress { width: 80% !important; }
          .gs-pb-counter::after { content: "4 / 5" !important; }
          .gs-vt-result { opacity: 1 !important; transform: none !important; }
          .gs-vt-file { opacity: 0 !important; }
          .gs-iv-score { opacity: 1 !important; transform: none !important; }
          .gs-iv-num::after { content: "84" !important; }
          .gs-pv-preview { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </>
  );
}
