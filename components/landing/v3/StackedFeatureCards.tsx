"use client";

import { ScrollStack } from "@/components/ui/ScrollStack";
import { ScrollStackItem } from "@/components/ui/ScrollStackItem";

/* ════════════════════════════════════════════════════════════════════════
   StackedFeatureCards — the four full-bleed feature cards that pin and
   stack as the user scrolls past the hero.

   Each card is now a split LEFT (copy) + RIGHT (rich demo) layout.
   Demos are larger, denser, and ship with subtle CSS animations
   (progress sweep, scan line, score-bar fill, live pulse).

   Pinning, ScrollStack, and ScrollStackItem behavior are untouched.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#1C1917";
const PAPER = "#FAF8F4";
const WARM_PAPER = "#FAF5EE";
const PERSIMMON = "#E8622A";
const GREEN = "#3FB37F";
const RED = "#E5484D";
const NOCTURNAL = "#114C5A";
const FORSYTHA = "#FFC801";
void INK;
void FORSYTHA;

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
        padding: "clamp(40px, 5vw, 80px) clamp(24px, 6vw, 96px)",
      }}
    >
      <div className="gs-sc-copy" style={{ maxWidth: 560 }}>
        {children}
      </div>
      <div
        className="gs-sc-demo"
        style={{
          width: "100%",
          maxWidth: 560,
          justifySelf: "center",
        }}
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

/* ────────────────────────────────────────────── card 1 — playbook ── */

function PlaybookMock() {
  const rows = [
    { n: 11, label: "Receive I-20 from school", date: "Feb 28", status: "done" as const },
    { n: 12, label: "Pay SEVIS I-901 fee", date: "Mar 03", status: "done" as const },
    { n: 13, label: "Complete DS-160 form", date: "Mar 07", status: "done" as const },
    { n: 14, label: "Schedule visa appointment", date: "Mar 10", status: "current" as const },
    { n: 15, label: "Prepare document bundle", date: "Mar 12", status: "upcoming" as const },
    { n: 16, label: "Mock interview, round 1", date: "Mar 14", status: "upcoming" as const },
  ];
  const done = rows.filter((r) => r.status === "done").length;
  return (
    <div
      className="gs-sc-panel gs-sc-panel-dark"
      style={{
        background: "rgba(250,248,244,0.04)",
        border: "0.5px solid rgba(250,248,244,0.10)",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(250,248,244,0.45)",
            }}
          >
            PHASE 02 · AFTER I-20
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontFamily: "var(--font-display-stack)",
              fontSize: 18,
              color: PAPER,
            }}
          >
            Steps 11 – 17
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 11,
            color: "rgba(250,248,244,0.55)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {done} / {rows.length}
        </span>
      </div>

      {/* Phase progress sweep */}
      <div
        aria-hidden
        style={{
          position: "relative",
          height: 4,
          borderRadius: 999,
          background: "rgba(250,248,244,0.08)",
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${(done / rows.length) * 100}%`,
            background: PERSIMMON,
            borderRadius: 999,
            boxShadow: "0 0 8px rgba(232,98,42,0.55)",
          }}
        />
        <span
          className="gs-sc-sweep"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 80,
            background:
              "linear-gradient(90deg, transparent, rgba(250,248,244,0.35), transparent)",
          }}
        />
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((r, i) => (
          <li
            key={r.n}
            style={{
              display: "grid",
              gridTemplateColumns: "26px 56px 1fr auto",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i < rows.length - 1 ? "0.5px solid rgba(250,248,244,0.06)" : "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              color: "rgba(250,248,244,0.8)",
            }}
          >
            <PlaybookCheck status={r.status} delay={i * 120} />
            <span
              style={{
                color: "rgba(250,248,244,0.45)",
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 11,
                letterSpacing: "0.06em",
              }}
            >
              Step {r.n}
            </span>
            <span
              style={{
                color: r.status === "upcoming" ? "rgba(250,248,244,0.55)" : PAPER,
                fontWeight: r.status === "current" ? 500 : 400,
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 11,
                color: "rgba(250,248,244,0.4)",
              }}
            >
              {r.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlaybookCheck({
  status,
  delay,
}: {
  status: "done" | "current" | "upcoming";
  delay: number;
}) {
  if (status === "done") {
    return (
      <span
        className="gs-sc-check"
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: PERSIMMON,
          color: PAPER,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          boxShadow: "0 0 0 4px rgba(232,98,42,0.15)",
          animationDelay: `${delay}ms`,
        }}
      >
        ✓
      </span>
    );
  }
  if (status === "current") {
    return (
      <span
        className="gs-sc-current"
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: `1.5px solid ${PERSIMMON}`,
          display: "inline-block",
        }}
      />
    );
  }
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        border: "1.5px solid rgba(250,248,244,0.18)",
        display: "inline-block",
      }}
    />
  );
}

/* ────────────────────────────────────────────── card 2 — vault ── */

function DocVaultMock() {
  const checks = [
    { label: "Bio page", status: "ok" as const },
    { label: "Passport number", status: "ok" as const },
    { label: "Photo specs", status: "ok" as const },
    { label: "Signature, page 3", status: "warn" as const },
    { label: "Issue date", status: "ok" as const },
    { label: "Expiry date", status: "ok" as const },
    { label: "SEVIS receipt", status: "ok" as const },
    { label: "Funds proof, page 2", status: "scanning" as const },
  ];
  return (
    <div
      className="gs-sc-panel"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(28,25,23,0.08)",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 24px 60px rgba(28,25,23,0.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(28,25,23,0.06)",
            color: "rgba(28,25,23,0.6)",
            fontSize: 16,
          }}
        >
          ◫
        </span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 13,
              fontWeight: 600,
              color: INK,
            }}
          >
            DS-2019_Fall2024.pdf
          </p>
          <p
            style={{
              margin: "2px 0 0 0",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              color: "rgba(28,25,23,0.45)",
              letterSpacing: "0.06em",
            }}
          >
            342 KB · 3 PAGES
          </p>
        </div>
        <span
          className="gs-sc-pulse-dot gs-sc-pulse-warn"
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: PERSIMMON,
          }}
        />
      </div>

      {/* Page preview with scan line */}
      <div
        style={{
          position: "relative",
          marginTop: 16,
          borderRadius: 12,
          height: 120,
          background:
            "repeating-linear-gradient(180deg, rgba(28,25,23,0.04) 0 12px, rgba(28,25,23,0.06) 12px 14px)",
          overflow: "hidden",
        }}
      >
        <span
          className="gs-sc-scanline"
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 28,
            background:
              "linear-gradient(180deg, rgba(232,98,42,0) 0%, rgba(232,98,42,0.18) 50%, rgba(232,98,42,0) 100%)",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            height: 18,
            borderRadius: 4,
            background: "rgba(229,72,77,0.15)",
            border: "1px dashed rgba(229,72,77,0.55)",
          }}
        />
      </div>

      {/* Findings */}
      <div
        style={{
          marginTop: 14,
          background: "rgba(229,72,77,0.06)",
          border: "0.5px solid rgba(229,72,77,0.25)",
          borderRadius: 10,
          padding: "10px 12px",
          color: RED,
          fontFamily: "var(--font-sans-stack)",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          className="gs-sc-pulse-dot gs-sc-pulse-bad"
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: RED,
            flex: "0 0 auto",
          }}
        />
        Signature missing — page 3, field 7B
      </div>

      {/* Per-check grid */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
        }}
      >
        {checks.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-sans-stack)",
              fontSize: 11,
              color: "rgba(28,25,23,0.7)",
            }}
          >
            {c.status === "ok" && (
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "rgba(63,179,127,0.16)",
                  color: GREEN,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
            )}
            {c.status === "warn" && (
              <span
                className="gs-sc-pulse-dot gs-sc-pulse-warn"
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: PERSIMMON,
                  color: PAPER,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                !
              </span>
            )}
            {c.status === "scanning" && (
              <span
                className="gs-sc-spin"
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  border: `1.5px solid rgba(28,25,23,0.15)`,
                  borderTopColor: PERSIMMON,
                  display: "inline-block",
                }}
              />
            )}
            {c.label}
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: 16,
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "rgba(28,25,23,0.45)",
          textTransform: "uppercase",
        }}
      >
        AI checked 12 fields · 3.2s
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────── card 3 — interview ── */

function InterviewMock() {
  const bars = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div
      className="gs-sc-panel gs-sc-panel-dark"
      style={{
        background: "rgba(250,248,244,0.04)",
        border: "0.5px solid rgba(255,255,255,0.10)",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(250,248,244,0.45)",
            }}
          >
            QUESTION 04 / 12
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              color: "rgba(250,248,244,0.6)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            00:14 elapsed
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: PERSIMMON,
            textTransform: "uppercase",
          }}
        >
          <span
            className="gs-sc-pulse-dot gs-sc-pulse-warn"
            aria-hidden
            style={{ width: 7, height: 7, borderRadius: 999, background: PERSIMMON }}
          />
          Recording
        </span>
      </div>

      <p
        style={{
          fontFamily: "var(--font-display-stack)",
          fontSize: 20,
          lineHeight: 1.35,
          color: PAPER,
          marginTop: 14,
          marginBottom: 0,
          letterSpacing: "-0.01em",
        }}
      >
        &ldquo;Why did you choose this university over ones in your home country?&rdquo;
      </p>

      {/* Waveform */}
      <div
        className="gs-sc-wave"
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          gap: 3,
          height: 36,
        }}
      >
        {bars.map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              flex: 1,
              minWidth: 2,
              maxWidth: 4,
              background: PERSIMMON,
              borderRadius: 2,
              animation: `gs-sc-pulse 1.2s ease-in-out ${i * 60}ms infinite`,
              ["--gs-sc-h" as string]: `${10 + ((i * 7) % 22)}px`,
              height: `${10 + ((i * 7) % 22)}px`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* Scores */}
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <ScoreRow label="Ties to home" pct={78} delay={0} />
        <ScoreRow label="Study clarity" pct={61} delay={200} />
        <ScoreRow label="Confidence" pct={84} delay={400} />
        <ScoreRow label="Financials" pct={72} delay={600} />
      </div>

      <p
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "0.5px solid rgba(250,248,244,0.08)",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 12,
          color: "rgba(250,248,244,0.6)",
          lineHeight: 1.5,
        }}
      >
        Officer note · <span style={{ color: PAPER }}>Tighten the &ldquo;why this school&rdquo;
        — name two professors and the program rank.</span>
      </p>
    </div>
  );
}

function ScoreRow({ label, pct, delay }: { label: string; pct: number; delay: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr 40px",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans-stack)",
          fontSize: 11,
          color: "rgba(250,248,244,0.55)",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        style={{
          background: "rgba(250,248,244,0.08)",
          borderRadius: 999,
          height: 5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          className="gs-sc-fill"
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: PERSIMMON,
            borderRadius: 999,
            boxShadow: "0 0 6px rgba(232,98,42,0.45)",
            transformOrigin: "left center",
            animationDelay: `${delay}ms`,
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 11,
          color: PAPER,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pct}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────── card 4 — family ── */

function ParentViewMock() {
  return (
    <div
      className="gs-sc-panel"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(28,25,23,0.08)",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 24px 60px rgba(28,25,23,0.10)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(28,25,23,0.45)",
            }}
          >
            ANIKA — FAMILY VIEW
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontFamily: "var(--font-display-stack)",
              fontSize: 20,
              color: INK,
            }}
          >
            Your child&rsquo;s F-1 application
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: GREEN,
            textTransform: "uppercase",
          }}
        >
          <span
            className="gs-sc-pulse-dot gs-sc-pulse-live"
            aria-hidden
            style={{ width: 7, height: 7, borderRadius: 999, background: GREEN }}
          />
          Live
        </span>
      </div>

      {/* Progress */}
      <div
        style={{
          marginTop: 18,
          height: 8,
          width: "100%",
          background: "rgba(28,25,23,0.08)",
          borderRadius: 999,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="gs-sc-progress"
          style={{
            height: "100%",
            width: "66%",
            background: "linear-gradient(90deg, #E8622A, #F07040)",
            borderRadius: 999,
            boxShadow: "0 0 8px rgba(232,98,42,0.35)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans-stack)",
            fontSize: 11,
            color: "rgba(28,25,23,0.55)",
          }}
        >
          31 of 47 steps complete
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
            fontSize: 11,
            color: PERSIMMON,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          66%
        </span>
      </div>

      {/* Stat chips */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        {[
          ["Phase", "4 / 5"],
          ["Mocks", "2 done"],
          ["Docs", "12 / 14"],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              padding: "10px 12px",
              border: "0.5px solid rgba(28,25,23,0.10)",
              borderRadius: 10,
              background: "rgba(28,25,23,0.02)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "rgba(28,25,23,0.5)",
                textTransform: "uppercase",
              }}
            >
              {k}
            </p>
            <p
              style={{
                margin: "4px 0 0 0",
                fontFamily: "var(--font-display-stack)",
                fontSize: 15,
                color: INK,
              }}
            >
              {v}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0 0" }}>
        {[
          { label: "Paid SEVIS fee", time: "2m ago" },
          { label: "Filed DS-160", time: "1h ago" },
          { label: "Booked interview slot", time: "yesterday" },
        ].map((row, i, arr) => (
          <li
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 0",
              borderBottom:
                i < arr.length - 1 ? "0.5px solid rgba(28,25,23,0.06)" : "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 12,
              color: INK,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "rgba(63,179,127,0.16)",
                color: GREEN,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            <span style={{ flex: 1 }}>{row.label}</span>
            <span
              style={{
                fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                fontSize: 10,
                color: "rgba(28,25,23,0.45)",
                letterSpacing: "0.06em",
              }}
            >
              {row.time}
            </span>
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 14,
          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "rgba(28,25,23,0.45)",
          textTransform: "uppercase",
        }}
      >
        Updating now
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────── component ── */

export function StackedFeatureCards() {
  return (
    <>
      <ScrollStack>
        <ScrollStackItem>
          <CardShell bg={NOCTURNAL} ink={PAPER} demo={<PlaybookMock />}>
            <Chip dark>01 / PLAYBOOK</Chip>
            <Headline ink={PAPER}>
              47 steps. In the exact order the consulate expects them.
            </Headline>
            <Body ink="rgba(250,248,244,0.55)">
              Every form, fee, and deadline — sequenced, dated, and checked off as you go.
              Nothing ambiguous. Nothing missed.
            </Body>
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={PAPER} ink={INK} demo={<DocVaultMock />}>
            <Chip dark={false}>02 / DOCUMENT VAULT</Chip>
            <Headline ink={INK}>
              Your documents checked before the consulate does.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              Upload once. Our vision model reads every page — catches a missing signature,
              expired date, or wrong form version before it costs you a reappointment.
            </Body>
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={NOCTURNAL} ink={PAPER} demo={<InterviewMock />}>
            <Chip dark>03 / MOCK INTERVIEW</Chip>
            <Headline ink={PAPER}>
              Answer until you stop freezing.
            </Headline>
            <Body ink="rgba(250,248,244,0.55)">
              A voice officer asks real F-1 questions in the order they actually ask them.
              You answer out loud. We score your ties-to-home argument, your study plan
              clarity, and your confidence.
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
              A read-only view updates in real time as you check off steps. Share it once.
              Your parents know exactly where you are without needing to ask.
            </Body>
          </CardShell>
        </ScrollStackItem>
      </ScrollStack>

      <style>{`
        @keyframes gs-sc-pulse {
          0%, 100% { transform: scaleY(0.45); }
          50%      { transform: scaleY(1); }
        }
        @keyframes gs-sc-dot-pulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0 0   currentColor; opacity: 0.95; }
          50%      { transform: scale(1.2); box-shadow: 0 0 0 6px transparent;  opacity: 0.65; }
        }
        @keyframes gs-sc-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(1200%); }
        }
        @keyframes gs-sc-scan {
          0%   { transform: translateY(-30%); }
          100% { transform: translateY(140%); }
        }
        @keyframes gs-sc-fill {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes gs-sc-progress {
          0%   { width: 0%; }
          100% { width: 66%; }
        }
        @keyframes gs-sc-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gs-sc-check-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .gs-sc-check { animation: gs-sc-check-pop 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .gs-sc-sweep { animation: gs-sc-sweep 2.4s ease-in-out infinite; }
        .gs-sc-scanline { animation: gs-sc-scan 2.6s ease-in-out infinite; }
        .gs-sc-fill { animation: gs-sc-fill 1100ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .gs-sc-progress { animation: gs-sc-progress 1400ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .gs-sc-spin { animation: gs-sc-spin 1s linear infinite; }

        .gs-sc-pulse-dot { animation: gs-sc-dot-pulse 1.6s ease-in-out infinite; }
        .gs-sc-pulse-warn { color: rgba(232,98,42,0.45); }
        .gs-sc-pulse-bad  { color: rgba(229,72,77,0.45); }
        .gs-sc-pulse-live { color: rgba(63,179,127,0.45); }

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
          /* Hide trailing waveform bars so phones don't crowd */
          .gs-sc-wave > span:nth-child(n+19) { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-sc-wave > span,
          .gs-sc-sweep,
          .gs-sc-scanline,
          .gs-sc-fill,
          .gs-sc-progress,
          .gs-sc-spin,
          .gs-sc-pulse-dot,
          .gs-sc-check { animation: none !important; }
          .gs-sc-progress { width: 66% !important; }
          .gs-sc-fill { transform: none !important; }
        }
      `}</style>
    </>
  );
}
