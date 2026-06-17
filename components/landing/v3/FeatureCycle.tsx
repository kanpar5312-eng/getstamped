"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ════════════════════════════════════════════════════════════════════════════
   FeatureCycle — Superhuman-style 4-panel cycle.
   Inline styles for ALL layout/sizing so Tailwind arbitrary-value compilation
   never breaks the grid. Sticky left nav, 4 stacked full-viewport panels,
   per-panel content animated in via Framer Motion whileInView (independent of
   active-state detection so content is always visible when in view).
   ═════════════════════════════════════════════════════════════════════════ */

type Panel = {
  id: string;
  number: string;
  name: string;
  fear: string;
  tag: string;
  headline: string;
  body: string;
};

const PANELS: Panel[] = [
  {
    id: "fc-playbook",
    number: "01",
    name: "Playbook",
    fear: "for the chaos",
    tag: "Step-by-step",
    headline: "47 steps. Sequenced, dated, and waiting for you.",
    body:
      "Every form, fee, and deadline in the exact order the consulate expects them. Checked off as you go. Nothing ambiguous.",
  },
  {
    id: "fc-vault",
    number: "02",
    name: "Document Vault",
    fear: "for the paperwork",
    tag: "AI-powered",
    headline: "Your documents checked before the consulate does.",
    body:
      "Upload once. Our vision model reads every page — catches a missing signature, expired date, or wrong form version before it costs you a reappointment.",
  },
  {
    id: "fc-mock",
    number: "03",
    name: "Mock Interview",
    fear: "for freezing at the window",
    tag: "Voice AI",
    headline: "Answer until you stop freezing.",
    body:
      "A voice officer asks real F-1 questions in the order they actually ask them. You answer out loud. We score your ties-to-home argument, your study plan clarity, and your confidence on the hard ones.",
  },
  {
    id: "fc-parent",
    number: "04",
    name: "Parent Share",
    fear: "for the nightly calls",
    tag: "Share instantly",
    headline: "One link. They see everything. No calls needed.",
    body:
      "A read-only view updates in real time as you check off steps. Share it once. Your parents know exactly where you are without needing to ask.",
  },
];

const PAPER = "#F5EFE6";
const PERSIMMON = "#FF5B2E";
const INK = "#1C1B1A";
const PAPER_50 = "rgba(245, 239, 230, 0.5)";
const PAPER_65 = "rgba(245, 239, 230, 0.65)";
const PAPER_35 = "rgba(245, 239, 230, 0.35)";
const PAPER_15 = "rgba(245, 239, 230, 0.15)";
const PAPER_08 = "rgba(245, 239, 230, 0.08)";

export function FeatureCycle() {
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 880px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Active-panel detection — pick whichever panel's center is closest to
     viewport center. Updates left-nav highlight state. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!panels.length) return;

    const onScroll = () => {
      const vh = window.innerHeight;
      let bestIdx = 0;
      let bestDist = Infinity;
      panels.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - vh / 2);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setActiveIdx(bestIdx);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToPanel = useCallback((i: number) => {
    const el = panelRefs.current[i];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <section
      id="feature-cycle"
      aria-label="What GetStamped does"
      style={{ background: INK, color: PAPER }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: isDesktop ? "120px 48px" : "80px 24px",
          display: isDesktop ? "grid" : "block",
          gridTemplateColumns: isDesktop ? "minmax(0, 38%) minmax(0, 62%)" : undefined,
          columnGap: isDesktop ? 48 : undefined,
        }}
      >
        {/* LEFT — sticky nav */}
        <div
          style={{
            position: isDesktop ? "sticky" : "static",
            top: isDesktop ? 120 : undefined,
            alignSelf: "start",
            marginBottom: isDesktop ? 0 : 48,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: PERSIMMON,
            }}
          >
            What GetStamped does
          </p>
          <h2
            style={{
              margin: "18px 0 0",
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(36px, 5vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: PAPER,
            }}
          >
            Four tools. One stamp.
          </h2>
          <p
            style={{
              margin: "16px 0 0",
              maxWidth: 340,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 15,
              lineHeight: 1.6,
              color: PAPER_50,
            }}
          >
            Each one built for the exact moment the F-1 process breaks down.
          </p>

          {isDesktop && (
            <nav
              aria-label="Feature navigation"
              style={{
                marginTop: 48,
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              {PANELS.map((p, i) => {
                const active = i === activeIdx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => scrollToPanel(i)}
                    style={{
                      cursor: "pointer",
                      textAlign: "left",
                      background: "transparent",
                      border: 0,
                      padding: "0 0 0 18px",
                      borderLeft: `2px solid ${
                        active ? PERSIMMON : PAPER_15
                      }`,
                      transition:
                        "border-color 240ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans-stack)",
                          fontSize: 11,
                          color: active ? PERSIMMON : PAPER_35,
                          transition: "color 240ms",
                        }}
                      >
                        {p.number}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sans-stack)",
                          fontSize: 15,
                          fontWeight: 500,
                          color: active ? PAPER : PAPER_50,
                          transition: "color 240ms",
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: "var(--font-sans-stack)",
                        fontStyle: "italic",
                        fontSize: 12,
                        color: PAPER_35,
                      }}
                    >
                      {p.fear}
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* RIGHT — 4 stacked panels */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PANELS.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              style={{
                position: "relative",
                minHeight: isDesktop ? "100vh" : 600,
                padding: "48px 0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <PanelBg index={i} />
              <PanelContent panel={p} index={i} isDesktop={isDesktop} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanelBg({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          right: 0,
          width: 240,
          height: 160,
          background:
            "repeating-linear-gradient(0deg, rgba(245,239,230,0.04) 0 1px, transparent 1px 24px), " +
            "repeating-linear-gradient(90deg, rgba(245,239,230,0.04) 0 1px, transparent 1px 24px)",
        }}
      />
    );
  }
  if (index === 1) {
    return (
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(245,239,230,0.025) 0 1px, transparent 1px 5px)",
        }}
      />
    );
  }
  if (index === 2) {
    return (
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(420px circle at 50% 0%, rgba(255, 91, 46, 0.05), transparent 70%)",
        }}
      />
    );
  }
  return null;
}

function PanelContent({
  panel,
  index,
  isDesktop,
}: {
  panel: Panel;
  index: number;
  isDesktop: boolean;
}) {
  const reduce = useReducedMotion();
  const isParent = index === 3;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        background: isParent ? "#FAF5EE" : "transparent",
        color: isParent ? INK : PAPER,
        padding: isParent ? 36 : 0,
        borderRadius: isParent ? 16 : 0,
        maxWidth: isParent ? 540 : undefined,
      }}
    >
      {!isDesktop && (
        <p
          style={{
            margin: "0 0 24px",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: PERSIMMON,
          }}
        >
          {panel.number} · {panel.name}
        </p>
      )}

      <motion.span
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          background: isParent ? INK : PERSIMMON,
          color: isParent ? PAPER : "#fff",
          padding: "5px 12px",
          borderRadius: 4,
        }}
      >
        {panel.tag}
      </motion.span>

      <motion.h3
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          margin: "20px 0 0",
          maxWidth: 560,
          fontFamily: "var(--font-display-stack)",
          fontWeight: 400,
          fontSize: "clamp(28px, 3.5vw, 38px)",
          lineHeight: 1.15,
          letterSpacing: "-0.015em",
          color: isParent ? INK : PAPER,
        }}
      >
        {panel.headline}
      </motion.h3>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{
          margin: "16px 0 0",
          maxWidth: 440,
          fontFamily: "var(--font-sans-stack)",
          fontSize: 15,
          lineHeight: 1.65,
          color: isParent ? "rgba(28, 27, 26, 0.7)" : PAPER_65,
        }}
      >
        {panel.body}
      </motion.p>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          delay: 0.35,
        }}
        style={{ marginTop: 36 }}
      >
        {index === 0 ? <PlaybookViz /> : null}
        {index === 1 ? <VaultViz /> : null}
        {index === 2 ? <MockViz /> : null}
        {index === 3 ? <ParentViz /> : null}
      </motion.div>
    </div>
  );
}

/* ── Visualizations — all use inline styles, no Tailwind arbitrary values ─ */

function PlaybookViz() {
  const rows = [
    { n: 12, name: "Pay SEVIS fee", date: "Mar 3", state: "Done" as const },
    { n: 13, name: "DS-160 form", date: "Mar 7", state: "Done" as const },
    { n: 14, name: "Schedule visa", date: "Mar 10", state: "Next" as const },
    {
      n: 15,
      name: "Prep documents",
      date: "Mar 12",
      state: "Upcoming" as const,
    },
  ];
  return (
    <div
      style={{
        maxWidth: 520,
        borderRadius: 10,
        background: PAPER_08,
        border: "1px solid rgba(245,239,230,0.10)",
        overflow: "hidden",
      }}
    >
      {rows.map((r, i) => {
        const done = r.state === "Done";
        const next = r.state === "Next";
        return (
          <div
            key={r.n}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 24px 1fr auto 78px",
              alignItems: "center",
              gap: 12,
              height: 46,
              padding: "0 16px",
              borderBottom:
                i < rows.length - 1
                  ? "1px solid rgba(245,239,230,0.06)"
                  : "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              color: PAPER_65,
            }}
          >
            <span
              style={{
                color: done ? PERSIMMON : "rgba(245,239,230,0.3)",
                fontSize: 14,
              }}
            >
              {done ? "✓" : "○"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono-stack)",
                fontSize: 11,
                color: "rgba(245,239,230,0.4)",
              }}
            >
              {r.n}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{r.name}</span>
            <span style={{ fontSize: 11, color: "rgba(245,239,230,0.4)" }}>
              {r.date}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 4,
                textAlign: "center",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: done
                  ? "rgba(245,239,230,0.10)"
                  : next
                  ? "rgba(255, 91, 46, 0.2)"
                  : "rgba(245,239,230,0.05)",
                color: next ? PERSIMMON : "rgba(245,239,230,0.6)",
              }}
            >
              {r.state}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function VaultViz() {
  return (
    <div
      style={{
        maxWidth: 440,
        borderRadius: 10,
        padding: 16,
        background: "rgba(245,239,230,0.06)",
        border: "1px solid rgba(245,239,230,0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: PAPER_65,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="2" y="1.5" width="10" height="11" rx="1" />
          <path d="M4 5h6M4 7.5h6M4 10h4" />
        </svg>
        <span style={{ fontFamily: "var(--font-mono-stack)" }}>
          DS-2019_Fall2024.pdf
        </span>
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 6,
          padding: "8px 12px",
          background: "rgba(239,68,68,0.10)",
          color: "#EF4444",
          fontSize: 12,
        }}
      >
        ⚠ Signature missing — page 3, field 7B
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 6,
          padding: "8px 12px",
          background: "rgba(34,197,94,0.08)",
          color: "#22C55E",
          fontSize: 13,
        }}
      >
        ✓ 11 fields verified
      </div>
      <p
        style={{
          margin: "12px 0 0",
          textAlign: "center",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 11,
          color: PAPER_35,
        }}
      >
        AI checked 12 fields in 3 seconds
      </p>
    </div>
  );
}

function MockViz() {
  const bars = Array.from({ length: 24 }, (_, i) => 8 + ((i * 37) % 25));
  return (
    <div
      style={{
        maxWidth: 460,
        borderRadius: 10,
        padding: 16,
        background: PAPER_08,
        border: "1px solid rgba(245,239,230,0.10)",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: "rgba(245,239,230,0.45)" }}>
        Officer:
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 13,
          color: "rgba(245,239,230,0.85)",
          lineHeight: 1.5,
        }}
      >
        Why did you choose this university over ones in your home country?
      </p>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 32,
        }}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{
              width: 2,
              height: h,
              background: PERSIMMON,
              opacity: 0.85,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <div
        style={{ marginTop: 14, display: "grid", gap: 8 }}
      >
        <ScoreRow label="Ties to home" value={78} />
        <ScoreRow label="Study clarity" value={61} />
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 11,
        color: PAPER_65,
      }}
    >
      <span style={{ width: 92 }}>{label}</span>
      <span
        style={{
          flex: 1,
          height: 6,
          borderRadius: 999,
          background: "rgba(245,239,230,0.10)",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${value}%`,
            background: PERSIMMON,
            borderRadius: 999,
          }}
        />
      </span>
      <span
        style={{
          width: 36,
          textAlign: "right",
          fontFamily: "var(--font-mono-stack)",
        }}
      >
        {value}%
      </span>
    </div>
  );
}

function ParentViz() {
  return (
    <div
      style={{
        maxWidth: 380,
        borderRadius: 10,
        padding: 18,
        background: "#fff",
        border: "1px solid rgba(28,27,26,0.08)",
        boxShadow: "0 6px 18px -10px rgba(0,0,0,0.10)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-sans-stack)",
          fontSize: 13,
          fontWeight: 600,
          color: INK,
        }}
      >
        Parneet&rsquo;s Visa Progress
      </p>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            flex: 1,
            height: 8,
            borderRadius: 999,
            background: "rgba(28,27,26,0.08)",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: "66%",
              background: PERSIMMON,
              borderRadius: 999,
            }}
          />
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono-stack)",
            fontSize: 11,
            color: "rgba(28,27,26,0.55)",
          }}
        >
          31 of 47
        </span>
      </div>
      <ul
        style={{
          margin: "14px 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 12,
          color: "rgba(28,27,26,0.55)",
          display: "grid",
          gap: 6,
        }}
      >
        <li>✓ Paid SEVIS fee</li>
        <li>✓ Filed DS-160</li>
        <li>✓ Booked interview slot</li>
      </ul>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 10,
          color: "rgba(28,27,26,0.40)",
        }}
      >
        Last updated 4 minutes ago
      </p>
    </div>
  );
}
