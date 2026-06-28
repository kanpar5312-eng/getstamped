"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/* ════════════════════════════════════════════════════════════════════════
   FeaturesBento — Wavly-style bento grid replacing the prior FeaturesShowcase
   CardSwap section. Six cells across three rows, cream-soft surfaces with
   two dark feature cells (Nocturnal + Ink) breaking the rhythm. All copy
   preserved from the brief; visuals are CSS mocks (no images).
   ═════════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

export function FeaturesBento() {
  return (
    <section
      id="features"
      aria-label="What's inside"
      style={{
        background: "var(--color-cream)",
        color: "var(--color-ink)",
        padding: "96px 20px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Eyebrow + headline */}
        <div style={{ maxWidth: 720 }}>
          <p
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--color-forest)",
              margin: 0,
              fontWeight: 700,
            }}
          >
            What&rsquo;s inside
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4.4vw, 3rem)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: "14px 0 0 0",
              textWrap: "balance" as "balance",
            }}
          >
            Four tools.{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--color-forest)",
                fontFamily: "inherit",
              }}
            >
              One stamp.
            </em>
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--color-ink-soft)",
              margin: "18px 0 0 0",
              maxWidth: 600,
            }}
          >
            A 47-step playbook, AI document checks, voice mock interviews, and a parent
            view — built to work until your passport is stamped.
          </p>
        </div>

        {/* Grid */}
        <div
          className="gs-bento mt-12 grid gap-4 lg:gap-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            marginTop: 56,
          }}
        >
          {/* Row 1 — Playbook (col-span 2) + Document Vault (col-span 1) */}
          <Cell variant="light" colSpan={2}>
            <Inner eyebrow="Playbook" title="47 steps. In the exact order.">
              <p style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
                Nothing ambiguous. Nothing missed.
              </p>
              <PlaybookMock />
            </Inner>
          </Cell>
          <Cell variant="light">
            <Inner eyebrow="Document Vault" title="Caught before the consulate does.">
              <DocumentMock />
            </Inner>
          </Cell>

          {/* Row 2 — Mock Interview · Parent Share · Dark price cell */}
          <Cell variant="light">
            <Inner eyebrow="Mock Interview" title="Answer until you stop freezing.">
              <MockInterviewMock />
            </Inner>
          </Cell>
          <Cell variant="light">
            <Inner eyebrow="Parent Share" title="One link. They see everything.">
              <ParentMock />
            </Inner>
          </Cell>
          <Cell variant="tg">
            <Inner
              eyebrow="One-time payment"
              title="No subscription. No renewal."
              dark
              subtitle="Pay once. Use until your visa is stamped."
            >
              <PriceMock />
            </Inner>
          </Cell>

          {/* Row 3 — full-width dark card */}
          <Cell variant="ink" colSpan={3}>
            <div
              className="gs-bento-error-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 28,
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                    fontSize: 10,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "var(--color-forest-soft)",
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  221(g) Refusal patterns
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display-stack)",
                    fontWeight: 400,
                    fontSize: "clamp(1.5rem, 2.4vw, 2rem)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.018em",
                    color: "#FAF8F4",
                    margin: "10px 0 0 0",
                    maxWidth: 540,
                  }}
                >
                  Every mistake that costs a reappointment —{" "}
                  <em
                    style={{
                      fontStyle: "italic",
                      color: "var(--color-forest)",
                      fontFamily: "inherit",
                    }}
                  >
                    caught first.
                  </em>
                </h3>
              </div>
              <ErrorCycler />
            </div>
          </Cell>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .gs-bento-error-grid { grid-template-columns: 1.1fr 1fr !important; }
        }
        @media (max-width: 900px) {
          .gs-bento { grid-template-columns: 1fr !important; }
          .gs-bento > [data-col-span] { grid-column: span 1 !important; }
        }
      `}</style>
    </section>
  );
}

/* ───────────────────────── Cell shell ───────────────────────── */

function Cell({
  children,
  colSpan = 1,
  variant = "light",
}: {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3;
  variant?: "light" | "tg" | "ink";
}) {
  const isLight = variant === "light";
  const bg =
    variant === "tg"
      ? "var(--color-tg)"
      : variant === "ink"
      ? "var(--color-ink)"
      : "var(--color-cream-soft)";
  const border = isLight ? "var(--color-border-soft)" : "rgba(255,255,255,0.10)";
  return (
    <motion.div
      data-col-span={colSpan}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease }}
      style={{
        gridColumn: `span ${colSpan}`,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: 26,
        color: isLight ? "var(--color-ink)" : "#FAF8F4",
        transition: "border-color 220ms ease, transform 220ms ease",
        boxShadow: isLight
          ? "0 1px 0 rgba(28,25,23,0.02)"
          : "0 24px 60px -30px rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </motion.div>
  );
}

function Inner({
  eyebrow,
  title,
  subtitle,
  dark,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <p
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 10,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: dark ? "var(--color-forest-soft)" : "var(--color-forest)",
          margin: 0,
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display-stack)",
          fontWeight: 400,
          fontSize: "clamp(1.15rem, 1.6vw, 1.5rem)",
          lineHeight: 1.18,
          letterSpacing: "-0.015em",
          color: dark ? "#FAF8F4" : "var(--color-ink)",
          margin: 0,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: dark ? "rgba(250,248,244,0.66)" : "var(--color-ink-soft)",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>
      )}
      {children && <div style={{ marginTop: "auto" }}>{children}</div>}
    </div>
  );
}

/* ───────────────────────── Mocks ───────────────────────── */

function PlaybookMock() {
  const rows = [
    { n: "01", label: "Receive I-20", done: true },
    { n: "02", label: "Pay SEVIS fee", done: true },
    { n: "03", label: "Complete DS-160", done: true },
    { n: "04", label: "Schedule visa interview", next: true },
  ];
  return (
    <div
      style={{
        marginTop: 22,
        border: "1px solid var(--color-border-soft)",
        borderRadius: 14,
        padding: 14,
        background: "var(--color-cream)",
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.n}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 0",
            borderBottom:
              i < rows.length - 1 ? "1px solid var(--color-border-soft)" : "none",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 13,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: r.done ? "var(--color-forest)" : "transparent",
              border: r.done
                ? "none"
                : r.next
                ? "1.5px solid var(--color-forest)"
                : "1.5px solid var(--color-border)",
              color: "#FAF8F4",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {r.done ? "✓" : ""}
          </span>
          <span
            style={{
              color: "var(--color-muted)",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            {r.n}
          </span>
          <span style={{ color: "var(--color-ink)", flex: 1 }}>{r.label}</span>
          {r.next && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-forest)",
                background: "rgba(232,98,42,0.10)",
                border: "1px solid rgba(232,98,42,0.32)",
                padding: "3px 8px",
                borderRadius: 999,
              }}
            >
              Next
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function DocumentMock() {
  return (
    <div
      style={{
        marginTop: 18,
        border: "1px solid var(--color-border-soft)",
        borderRadius: 12,
        padding: 12,
        background: "var(--color-cream)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: "rgba(28,25,23,0.06)",
            color: "var(--color-ink-soft)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
          }}
        >
          ◫
        </span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>DS-2019_Fall2024.pdf</span>
      </div>
      <div
        style={{
          marginTop: 10,
          background: "rgba(229,72,77,0.06)",
          border: "1px dashed rgba(229,72,77,0.4)",
          borderRadius: 8,
          padding: "8px 10px",
          color: "#c43030",
          fontSize: 11,
        }}
      >
        ⚠ Signature missing — page 3, field 7B
      </div>
      <p
        style={{
          marginTop: 8,
          marginBottom: 0,
          color: "#2e9d6c",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        ✓ 11 fields verified
      </p>
    </div>
  );
}

function MockInterviewMock() {
  const rows = [
    ["Ties to home", 78],
    ["Clarity", 84],
    ["Financials", 72],
  ] as const;
  return (
    <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
      {rows.map(([label, val]) => (
        <div
          key={label}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 32px",
            alignItems: "center",
            gap: 10,
            fontSize: 11.5,
          }}
        >
          <span style={{ color: "var(--color-ink-soft)" }}>{label}</span>
          <span
            aria-hidden
            style={{
              height: 4,
              background: "var(--color-border-soft)",
              borderRadius: 999,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                width: `${val}%`,
                background: "var(--color-forest)",
                borderRadius: 999,
              }}
            />
          </span>
          <span
            style={{
              textAlign: "right",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              color: "var(--color-ink)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {val}
          </span>
        </div>
      ))}
      <div
        aria-hidden
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 3,
          height: 22,
        }}
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 2,
              borderRadius: 2,
              background: "var(--color-forest)",
              height: `${6 + ((i * 7) % 16)}px`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ParentMock() {
  return (
    <div
      style={{
        marginTop: 18,
        border: "1px solid var(--color-border-soft)",
        borderRadius: 12,
        padding: 14,
        background: "var(--color-cream)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 600 }}>
          Anika&rsquo;s F-1 progress
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#2e9d6c",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#2e9d6c",
            }}
          />
          Live
        </span>
      </div>
      <div
        aria-hidden
        style={{
          height: 6,
          background: "var(--color-border-soft)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: "66%",
            background: "var(--color-forest)",
          }}
        />
      </div>
      <p style={{ marginTop: 8, marginBottom: 0, fontSize: 11, color: "var(--color-muted)" }}>
        31 of 47 steps complete
      </p>
    </div>
  );
}

function PriceMock() {
  return (
    <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 14 }}>
      <span
        style={{
          fontFamily: "var(--font-display-stack)",
          fontSize: 42,
          letterSpacing: "-0.02em",
          color: "#FAF8F4",
        }}
      >
        ₹2,999
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 13,
          color: "rgba(250,248,244,0.45)",
          textDecoration: "line-through",
        }}
      >
        ₹4,999
      </span>
    </div>
  );
}

const ERRORS = [
  "Missing signature · page 3, field 7B",
  "SEVIS receipt expired",
  "DS-160 confirmation mismatch",
];

function ErrorCycler() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % ERRORS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      style={{
        border: "1px solid rgba(250,248,244,0.10)",
        borderRadius: 14,
        padding: 18,
        background: "rgba(250,248,244,0.04)",
        minHeight: 88,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {ERRORS.map((e, i) => (
        <div
          key={e}
          style={{
            opacity: i === idx ? 1 : 0.35,
            transform: i === idx ? "translateY(0)" : "translateY(0)",
            transition: "opacity 360ms ease",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13.5,
            color: "#FAF8F4",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background:
                i === idx ? "var(--color-forest)" : "rgba(250,248,244,0.25)",
            }}
          />
          <span>{e}</span>
        </div>
      ))}
    </div>
  );
}
