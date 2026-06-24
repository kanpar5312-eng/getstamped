"use client";

import { ScrollStack } from "@/components/ui/ScrollStack";
import { ScrollStackItem } from "@/components/ui/ScrollStackItem";

/* ════════════════════════════════════════════════════════════════════════
   StackedFeatureCards — the four full-bleed feature cards that pin and
   stack as the user scrolls past the hero. Replaces the old
   SectionDivider / TrustStrip / SectionDivider / FeatureCycle sequence
   immediately after <Hero/>.

   Mobile (<768px) uses the same scroll behaviour with tighter type sizes
   (declared in <Mobile> at the bottom of this file). Lenis is mounted
   inside <ScrollStack/>; it cleans up on unmount.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#1C1917";
const PAPER = "#FAF8F4";
const WARM_PAPER = "#FAF5EE";
const PERSIMMON = "#E8622A";

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
}: {
  bg: string;
  ink: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: bg,
        color: ink,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px, 5vw, 48px) clamp(20px, 5vw, 48px)",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>{children}</div>
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
        fontSize: 52,
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

/* ────────────────────────────────────────────── card 1 — chaos ── */

function StepListMock() {
  const rows = [
    { n: 12, label: "Pay SEVIS fee",    date: "Mar 3",  status: "done" as const, check: true },
    { n: 13, label: "DS-160 form",      date: "Mar 7",  status: "done" as const, check: true },
    { n: 14, label: "Schedule visa",    date: "Mar 10", status: "next" as const, check: false },
    { n: 15, label: "Prep documents",   date: "Mar 12", status: "upcoming" as const, check: false },
  ];
  return (
    <div
      className="gs-sc-mock"
      style={{
        marginTop: 32,
        background: "rgba(250,248,244,0.04)",
        border: "0.5px solid rgba(250,248,244,0.08)",
        borderRadius: 16,
        padding: 20,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.n}
          style={{
            display: "grid",
            gridTemplateColumns: "20px 64px 1fr auto auto",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
            fontFamily: "var(--font-sans-stack)",
            fontSize: 12,
            color: "rgba(250,248,244,0.7)",
          }}
        >
          <span style={{ color: r.check ? PERSIMMON : "rgba(250,248,244,0.35)" }}>
            {r.check ? "✓" : "○"}
          </span>
          <span style={{ color: "rgba(250,248,244,0.5)" }}>Step {r.n}</span>
          <span style={{ color: "rgba(250,248,244,0.9)" }}>{r.label}</span>
          <span style={{ color: "rgba(250,248,244,0.45)", fontFamily: "var(--font-mono-stack)" }}>{r.date}</span>
          <StatusPill status={r.status} />
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: "done" | "next" | "upcoming" }) {
  const cfg =
    status === "done"
      ? { bg: "rgba(250,248,244,0.10)", color: "rgba(250,248,244,0.85)", label: "Done" }
      : status === "next"
      ? { bg: "rgba(232,98,42,0.20)", color: PERSIMMON, label: "Next" }
      : { bg: "transparent", color: "rgba(250,248,244,0.4)", label: "Upcoming" };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 4,
        padding: "2px 8px",
        fontFamily: "var(--font-sans-stack)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

/* ────────────────────────────────────────────── card 2 — vault ── */

function DocVaultMock() {
  return (
    <div
      style={{
        marginTop: 32,
        background: "#FFFFFF",
        border: "0.5px solid rgba(28,25,23,0.08)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(28,25,23,0.05)",
            color: "rgba(28,25,23,0.5)",
            fontSize: 12,
          }}
        >
          📄
        </span>
        <span style={{ fontFamily: "var(--font-sans-stack)", fontSize: 13, fontWeight: 600, color: INK }}>
          DS-2019_Fall2024.pdf
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          background: "rgba(239,68,68,0.06)",
          borderRadius: 8,
          padding: "10px 12px",
          color: "#EF4444",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 12,
        }}
      >
        ⚠ Signature missing — page 3, field 7B
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#22C55E",
          fontFamily: "var(--font-sans-stack)",
          fontSize: 12,
        }}
      >
        ✓ 11 fields verified
      </div>

      <p
        style={{
          marginTop: 12,
          fontFamily: "var(--font-sans-stack)",
          fontSize: 11,
          color: "rgba(28,25,23,0.35)",
        }}
      >
        AI checked 12 fields in 3 seconds
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────── card 3 — interview ── */

function InterviewMock() {
  // 24 bars on desktop, 16 on mobile via CSS in the Mobile block below.
  const bars = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div
      style={{
        marginTop: 32,
        background: "rgba(250,248,244,0.04)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans-stack)",
          fontSize: 10,
          color: "rgba(250,248,244,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: 0,
        }}
      >
        Officer:
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans-stack)",
          fontSize: 14,
          lineHeight: 1.5,
          color: "rgba(250,248,244,0.85)",
          marginTop: 6,
          marginBottom: 0,
        }}
      >
        Why did you choose this university over ones in your home country?
      </p>

      <div
        className="gs-sc-wave"
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {bars.map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 2,
              background: PERSIMMON,
              borderRadius: 2,
              animation: `gs-sc-pulse 1.2s ease-in-out ${i * 60}ms infinite`,
              ["--gs-sc-h" as string]: `${8 + ((i * 7) % 24)}px`,
              height: `${8 + ((i * 7) % 24)}px`,
            }}
          />
        ))}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <ScoreRow label="Ties to home" pct={78} />
        <ScoreRow label="Study clarity" pct={61} />
      </div>
    </div>
  );
}

function ScoreRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 36px", gap: 10, alignItems: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-sans-stack)",
          fontSize: 11,
          color: "rgba(250,248,244,0.5)",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        style={{
          background: "rgba(250,248,244,0.08)",
          borderRadius: 999,
          height: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: PERSIMMON,
            borderRadius: 999,
            boxShadow: "0 0 6px rgba(232,98,42,0.4)",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans-stack)",
          fontSize: 11,
          color: "rgba(250,248,244,0.6)",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────── card 4 — family ── */

function ParentViewMock() {
  return (
    <div
      style={{
        marginTop: 32,
        background: "#FFFFFF",
        border: "0.5px solid rgba(28,25,23,0.08)",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontFamily: "var(--font-sans-stack)", fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>
        Parneet&rsquo;s Visa Progress
      </p>

      <div
        style={{
          marginTop: 12,
          height: 6,
          width: "100%",
          background: "rgba(28,25,23,0.08)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "66%",
            background: "linear-gradient(90deg, #E8622A, #F07040)",
            borderRadius: 999,
            boxShadow: "0 0 6px rgba(232,98,42,0.3)",
          }}
        />
      </div>
      <p style={{ marginTop: 6, fontFamily: "var(--font-sans-stack)", fontSize: 11, color: "rgba(28,25,23,0.55)" }}>
        31 of 47 steps complete
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}>
        {["Paid SEVIS fee", "Filed DS-160", "Booked interview slot"].map((label, i, arr) => (
          <li
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < arr.length - 1 ? "0.5px solid rgba(28,25,23,0.06)" : "none",
              fontFamily: "var(--font-sans-stack)",
              fontSize: 12,
              color: INK,
            }}
          >
            <span aria-hidden style={{ color: "#22C55E", fontWeight: 700 }}>✓</span>
            {label}
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 12,
          fontFamily: "var(--font-sans-stack)",
          fontSize: 10,
          color: "rgba(28,25,23,0.45)",
        }}
      >
        Last updated 4 minutes ago
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
          <CardShell bg={INK} ink={PAPER}>
            <Chip dark>01 / PLAYBOOK</Chip>
            <Headline ink={PAPER}>
              47 steps. In the exact order the consulate expects them.
            </Headline>
            <Body ink="rgba(250,248,244,0.55)">
              Every form, fee, and deadline — sequenced, dated, and checked off as you go.
              Nothing ambiguous. Nothing missed.
            </Body>
            <StepListMock />
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={PAPER} ink={INK}>
            <Chip dark={false}>02 / DOCUMENT VAULT</Chip>
            <Headline ink={INK}>
              Your documents checked before the consulate does.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              Upload once. Our vision model reads every page — catches a missing signature,
              expired date, or wrong form version before it costs you a reappointment.
            </Body>
            <DocVaultMock />
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={INK} ink={PAPER}>
            <Chip dark>03 / MOCK INTERVIEW</Chip>
            <Headline ink={PAPER}>
              Answer until you stop freezing.
            </Headline>
            <Body ink="rgba(250,248,244,0.55)">
              A voice officer asks real F-1 questions in the order they actually ask them.
              You answer out loud. We score your ties-to-home argument, your study plan
              clarity, and your confidence.
            </Body>
            <InterviewMock />
          </CardShell>
        </ScrollStackItem>

        <ScrollStackItem>
          <CardShell bg={WARM_PAPER} ink={INK}>
            <Chip dark={false}>04 / PARENT SHARE</Chip>
            <Headline ink={INK}>
              One link. They see everything. No calls needed.
            </Headline>
            <Body ink="rgba(28,25,23,0.55)">
              A read-only view updates in real time as you check off steps. Share it once.
              Your parents know exactly where you are without needing to ask.
            </Body>
            <ParentViewMock />
          </CardShell>
        </ScrollStackItem>
      </ScrollStack>

      <style>{`
        @keyframes gs-sc-pulse {
          0%, 100% { transform: scaleY(0.55); }
          50%      { transform: scaleY(1); }
        }
        @media (max-width: 768px) {
          .gs-sc-headline { font-size: 36px !important; }
          .gs-sc-body { font-size: 15px !important; }
          .gs-sc-mock { max-width: 100% !important; }
          /* Hide the trailing 8 waveform bars so only 16 show on phones */
          .gs-sc-wave > span:nth-child(n+17) { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-sc-wave > span { animation: none !important; }
        }
      `}</style>
    </>
  );
}
