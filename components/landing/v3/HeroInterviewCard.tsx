"use client";

import { useEffect, useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   HeroInterviewCard — the Wavly-style glass chat card that sits on the
   right of the hero. Auto-loops a 4-turn officer/student exchange with
   a typing indicator between turns. Pure CSS animation per turn; the
   state machine here is a simple setInterval that walks the script.

   The cycle length: 12 seconds. Two officer questions, two student
   answers, plus typing indicators in between.
   ═════════════════════════════════════════════════════════════════════════ */

type Turn =
  | { role: "officer"; text: string }
  | { role: "student"; text: string }
  | { role: "typing"; from: "officer" | "student" };

const SCRIPT: Turn[] = [
  { role: "officer", text: "Why did you choose this university over ones in your home country?" },
  { role: "typing", from: "student" },
  {
    role: "student",
    text:
      "I applied to three programs in India but USC's CS ranking and the research lab I want to join don't exist here.",
  },
  { role: "typing", from: "officer" },
  { role: "officer", text: "What are your plans after graduation?" },
  { role: "typing", from: "student" },
  { role: "student", text: "I plan to return and work at my father's firm in Bangalore." },
];

const CYCLE_MS = 12_000;
const STEP_MS = CYCLE_MS / SCRIPT.length;

export function HeroInterviewCard() {
  const [shown, setShown] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setShown((s) => (s >= SCRIPT.length ? 1 : s + 1));
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  const visible = SCRIPT.slice(0, shown);

  return (
    <div
      role="img"
      aria-label="Sample mock interview exchange"
      style={{
        position: "relative",
        borderRadius: 24,
        padding: 20,
        background: "rgba(250,246,237,0.70)",
        border: "1px solid rgba(255,255,255,0.40)",
        boxShadow:
          "0 30px 80px -30px rgba(28,25,23,0.25), inset 0 1px 0 rgba(255,255,255,0.45)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-sans-stack)",
        minHeight: 380,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 14,
          borderBottom: "1px solid rgba(28,25,23,0.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--color-forest)",
              boxShadow: "0 0 0 4px rgba(232,98,42,0.18)",
              animation: "gs-hero-dot 1.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-ink-soft)",
            }}
          >
            Officer · U.S. Consulate Mumbai
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 11,
            color: "var(--color-muted)",
          }}
        >
          LIVE
        </span>
      </div>

      {/* Transcript */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {visible.map((t, i) => {
          if (t.role === "typing") {
            const isOfficer = t.from === "officer";
            return (
              <Bubble key={i} side={isOfficer ? "left" : "right"} muted>
                <TypingDots />
              </Bubble>
            );
          }
          return (
            <Bubble key={i} side={t.role === "officer" ? "left" : "right"}>
              {t.text}
            </Bubble>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(28,25,23,0.10)",
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          fontSize: 11,
          color: "var(--color-muted)",
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>Mock #4 of 12</span>
        <span aria-hidden style={{ opacity: 0.35 }}>·</span>
        <span>
          Confidence <strong style={{ color: "var(--color-ink)" }}>84</strong>
        </span>
        <span aria-hidden style={{ opacity: 0.35 }}>·</span>
        <span>
          Ties to home <strong style={{ color: "var(--color-ink)" }}>78</strong>
        </span>
      </div>

      <style>{`
        @keyframes gs-hero-dot {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(1.25); }
        }
        @keyframes gs-hero-bubble {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes gs-hero-typing {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
          40%           { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Bubble({
  side,
  muted,
  children,
}: {
  side: "left" | "right";
  muted?: boolean;
  children: React.ReactNode;
}) {
  const isLeft = side === "left";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        animation: "gs-hero-bubble 260ms ease-out both",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: 14,
          fontSize: 13.5,
          lineHeight: 1.5,
          background: isLeft
            ? "rgba(255,255,255,0.75)"
            : "var(--color-ink)",
          color: isLeft ? "var(--color-ink)" : "#FAF8F4",
          border: isLeft ? "1px solid rgba(28,25,23,0.08)" : "none",
          boxShadow: isLeft
            ? "0 6px 16px -10px rgba(28,25,23,0.18)"
            : "0 6px 16px -8px rgba(28,25,23,0.35)",
          opacity: muted ? 0.85 : 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, padding: "2px 4px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "currentColor",
            opacity: 0.35,
            animation: `gs-hero-typing 1.1s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
