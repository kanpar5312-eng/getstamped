/* ════════════════════════════════════════════════════════════════════════
   DOCUMENT_EXAMPLES — illustrated, in-code mockups of the docs students
   must upload. Zero images, zero real personal data; every name, ID,
   amount, and date is fabricated. Each mockup carries a diagonal
   "EXAMPLE ONLY — NOT A REAL DOCUMENT" watermark on top so it can't be
   mistaken for the real thing, even in a screenshot.

   Map keys cover both the checklist slugs in lib/documents/checklist.ts
   (e.g. "passport-bio", "sevis-receipt") AND the friendlier aliases
   from the product spec (e.g. "passport", "sevis_receipt"). Whichever
   identifier the caller passes, it resolves.

   To add a new document: write a Mockup component below, register both
   the slug and the alias under DOCUMENT_EXAMPLES.
   ════════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from "react";

export type DocumentExample = {
  title: string;
  subtitle: string;
  aiChecks: string[];
  commonMistakes: string[];
  mockup: ReactNode;
};

const SUBTITLE_DEFAULT =
  "This is what a correct version looks like. Yours doesn’t need to match exactly — it needs to pass these checks.";

/* ──────────────────────────────────────────────────────────────────────
   Visual primitives shared across every mockup. Inline styles so they
   work even if a future Tailwind purge changes; mockups are visually
   prescriptive enough that resolving design tokens at render time
   would only invite drift.
   ────────────────────────────────────────────────────────────────────── */

const PAPER_PATTERN_BG =
  "repeating-linear-gradient(45deg, rgba(28,27,26,0.03) 0px, rgba(28,27,26,0.03) 1px, transparent 1px, transparent 8px)";

function MockShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "1px solid rgba(28,27,26,0.15)",
        borderRadius: 8,
        padding: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        fontSize: 11,
        color: "#1C1B1A",
        backgroundImage: PAPER_PATTERN_BG,
        overflow: "hidden",
      }}
    >
      {children}
      <Watermark />
    </div>
  );
}

function Watermark() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <span
        style={{
          transform: "rotate(-22deg)",
          color: "rgba(28,27,26,0.06)",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        EXAMPLE ONLY — NOT A REAL DOCUMENT
      </span>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(28,27,26,0.45)",
  fontWeight: 600,
};
const valueStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#1C1B1A",
  fontWeight: 500,
};
const fieldRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "120px 1fr",
  gap: 12,
  padding: "6px 0",
  borderBottom: "1px solid rgba(28,27,26,0.06)",
};

function Field({ label, value, accent }: { label: string; value: ReactNode; accent?: "ok" | "warn" }) {
  return (
    <div style={fieldRowStyle}>
      <span style={labelStyle}>{label}</span>
      <span
        style={{
          ...valueStyle,
          color: accent === "ok" ? "#1F7A3A" : accent === "warn" ? "#FF5B2E" : "#1C1B1A",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CheckCallout({ tone = "ok", children }: { tone?: "ok" | "warn"; children: ReactNode }) {
  const color = tone === "ok" ? "#1F7A3A" : "#FF5B2E";
  return (
    <p
      style={{
        marginTop: 6,
        fontSize: 10,
        color,
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────── PASSPORT ────────────────────────── */

function PassportMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "rgba(28,27,26,0.4)",
            fontWeight: 600,
            margin: 0,
          }}
        >
          UNITED STATES OF AMERICA
        </p>
        <div
          aria-hidden
          style={{
            margin: "8px auto 0",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(28,27,26,0.1)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 16, marginTop: 16 }}>
        <div
          aria-hidden
          style={{
            width: 80,
            height: 100,
            background: "rgba(28,27,26,0.08)",
            border: "1px solid rgba(28,27,26,0.15)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(28,27,26,0.45)",
            fontSize: 10,
            letterSpacing: "0.16em",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          PHOTO
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Field label="Surname" value="JOHNSON" />
          <Field label="Given Names" value="ALEX" />
          <Field label="Nationality" value="INDIAN" />
          <Field label="Date of Birth" value="15 MAR 1999" />
          <Field label="Sex" value="M" />
          <Field label="Place of Birth" value="NEW DELHI" />
          <Field label="Date of Issue" value="01 JAN 2022" />
          <div
            style={{
              ...fieldRowStyle,
              border: "1px solid rgba(31,122,58,0.35)",
              background: "rgba(31,122,58,0.06)",
              borderRadius: 6,
              padding: "8px 10px",
              marginTop: 4,
            }}
          >
            <span style={labelStyle}>Date of Expiry</span>
            <span style={{ ...valueStyle, color: "#1F7A3A" }}>31 DEC 2031</span>
          </div>
          <CheckCallout tone="ok">✓ 6+ months valid — AI checks this</CheckCallout>
          <Field label="Passport No" value={<span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>X00000000</span>} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 18,
          padding: 8,
          background: "rgba(28,27,26,0.04)",
          borderRadius: 4,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 10,
          color: "rgba(28,27,26,0.55)",
          lineHeight: 1.4,
        }}
      >
        <div>P&lt;INDJOHNSON&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        <div>X000000002IND9903154M3112318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;6</div>
      </div>
    </MockShell>
  );
}

/* ────────────────────────── I-20 ────────────────────────── */

function I20Mockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...labelStyle, color: "rgba(28,27,26,0.5)" }}>Department of Homeland Security</p>
          <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", marginTop: 2 }}>
            U.S. Immigration and Customs Enforcement
          </p>
          <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", marginTop: 2, fontWeight: 600 }}>
            CERTIFICATE OF ELIGIBILITY FOR NONIMMIGRANT STUDENT STATUS — (F-1)
          </p>
        </div>
        <div
          style={{
            background: "rgba(28,27,26,0.06)",
            border: "1px solid rgba(28,27,26,0.15)",
            padding: 8,
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <p style={labelStyle}>SEVIS ID</p>
          <p
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              color: "#FF5B2E",
              fontSize: 12,
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            N0000000000
          </p>
          <CheckCallout>✓ Must match SEVIS fee receipt</CheckCallout>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="School name" value="STATE UNIVERSITY" />
        <Field label="City / State" value="BOSTON, MA" />
        <Field label="Program" value="MASTER OF SCIENCE" />
        <Field label="Major" value="COMPUTER SCIENCE" />
        <Field label="Level" value="GRADUATE" />
        <Field label="Start date" value="01 SEP 2024" />
        <Field label="End date" value="31 MAY 2026" />
        <Field label="Student name" value="JOHNSON, ALEX" />
        <Field label="Date of birth" value="15/03/1999" />
        <Field label="Country of birth" value="INDIA" />
        <Field
          label="Admission no."
          value={<span style={{ color: "rgba(28,27,26,0.3)", fontStyle: "italic" }}>(left blank)</span>}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 16,
          padding: 10,
          border: "1px solid rgba(255,91,46,0.3)",
          background: "rgba(255,91,46,0.04)",
          borderRadius: 6,
        }}
      >
        <p style={labelStyle}>Designated School Official Signature</p>
        <svg viewBox="0 0 220 30" width="200" height="26" style={{ marginTop: 4 }} aria-hidden>
          <path
            d="M2 22 C 12 6, 22 30, 34 12 S 56 26, 72 14 S 100 4, 118 20 S 152 8, 172 18 S 200 12, 218 24"
            stroke="rgba(28,27,26,0.4)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <CheckCallout tone="warn">✓ DSO signature required here — AI checks this field</CheckCallout>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          padding: 10,
          background: "rgba(28,27,26,0.04)",
          borderRadius: 6,
        }}
      >
        <p style={{ ...labelStyle, marginBottom: 6 }}>Student's expenses per academic year</p>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
          <span>Tuition</span>
          <span style={{ fontWeight: 500 }}>$18,000</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
          <span>Living</span>
          <span style={{ fontWeight: 500 }}>$12,000</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0 3px",
            borderTop: "1px solid rgba(28,27,26,0.08)",
            marginTop: 4,
          }}
        >
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ fontWeight: 600 }}>$30,000</span>
        </div>
        <CheckCallout>✓ AI checks funding source matches your bank statement total</CheckCallout>
      </div>
    </MockShell>
  );
}

/* ────────────────────────── DS-160 ────────────────────────── */

function Ds160Mockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ ...labelStyle, color: "rgba(28,27,26,0.4)" }}>U.S. Department of State</p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.4)", marginTop: 2 }}>NONIMMIGRANT VISA APPLICATION</p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.4)", marginTop: 2, fontWeight: 600 }}>
          FORM DS-160 — APPLICATION CONFIRMATION
        </p>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          margin: "16px auto 0",
          width: 200,
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            height: 60,
            background:
              "repeating-linear-gradient(90deg, #1C1B1A 0 2px, transparent 2px 3px, #1C1B1A 3px 4px, transparent 4px 6px)",
            borderRadius: 4,
            border: "1px solid rgba(28,27,26,0.12)",
          }}
        />
        <p
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 11,
            marginTop: 6,
            color: "#1C1B1A",
            letterSpacing: "0.08em",
          }}
        >
          AA00EXAMPLE0
        </p>
        <CheckCallout tone="warn">✓ Barcode must be fully visible and scannable</CheckCallout>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Applicant name" value="ALEX JOHNSON" />
        <Field label="Date of birth" value="15 MAR 1999" />
        <Field label="Nationality" value="INDIA" />
        <Field
          label="Application ID"
          value={<span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>AA00EXAMPLE0</span>}
        />
        <Field label="Date submitted" value="04 FEB 2026" />
        <Field label="Consular post" value="MUMBAI, INDIA" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          padding: 12,
          background: "rgba(28,27,26,0.04)",
          borderRadius: 6,
          fontSize: 11,
          color: "rgba(28,27,26,0.7)",
        }}
      >
        Print this confirmation and bring it to your visa interview. This page alone is not a visa.
      </div>
    </MockShell>
  );
}

/* ────────────────────────── SEVIS RECEIPT ────────────────────────── */

function SevisReceiptMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ ...labelStyle, color: "rgba(28,27,26,0.4)" }}>SEVIS I-901 FEE PAYMENT</p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.4)", marginTop: 2 }}>
          Student and Exchange Visitor Program
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <div style={fieldRowStyle}>
          <span style={labelStyle}>SEVIS ID</span>
          <span style={{ fontFamily: "ui-monospace, Menlo, monospace", color: "#FF5B2E", fontWeight: 600, fontSize: 12 }}>
            N0000000000
          </span>
        </div>
        <CheckCallout>✓ Must match your I-20 exactly</CheckCallout>
        <Field label="Student name" value="ALEX JOHNSON" />
        <Field label="School" value="STATE UNIVERSITY" />
        <Field label="Payment amount" value="$350.00" />
        <div style={fieldRowStyle}>
          <span style={labelStyle}>Payment status</span>
          <span
            style={{
              display: "inline-block",
              background: "rgba(31,122,58,0.12)",
              color: "#1F7A3A",
              padding: "2px 10px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.04em",
              width: "fit-content",
            }}
          >
            PAID
          </span>
        </div>
        <Field label="Payment date" value="04 FEB 2026" />
        <Field
          label="Transaction ID"
          value={<span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>000000000000</span>}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          padding: 12,
          background: "rgba(31,122,58,0.06)",
          border: "1px solid rgba(31,122,58,0.2)",
          borderRadius: 6,
          color: "#1F7A3A",
          fontWeight: 500,
        }}
      >
        ✓ Payment received. Bring this receipt to your visa interview.
      </div>
    </MockShell>
  );
}

/* ────────────────────────── BANK STATEMENT ────────────────────────── */

function BankStatementMockup() {
  const txns = [
    { d: "28 MAR 2024", desc: "Salary credit", debit: "", credit: "₹2,40,000", bal: "₹24,32,000" },
    { d: "22 MAR 2024", desc: "UPI transfer", debit: "₹18,500", credit: "", bal: "₹21,92,000" },
    { d: "14 MAR 2024", desc: "ATM withdrawal", debit: "₹20,000", credit: "", bal: "₹22,10,500" },
    { d: "01 MAR 2024", desc: "Salary credit", debit: "", credit: "₹2,40,000", bal: "₹22,30,500" },
    { d: "20 FEB 2024", desc: "Insurance auto-debit", debit: "₹12,000", credit: "", bal: "₹19,90,500" },
  ];
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1B1A" }}>NATIONAL BANK OF INDIA</p>
        <p style={{ fontSize: 11, color: "rgba(28,27,26,0.6)", marginTop: 2 }}>Account Statement</p>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 12 }}>
        <Field label="Account holder" value="ALEX JOHNSON" />
        <Field
          label="Account number"
          value={<span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>XXXX XXXX 1234</span>}
        />
        <div
          style={{
            ...fieldRowStyle,
            border: "1px solid rgba(255,91,46,0.3)",
            background: "rgba(255,91,46,0.04)",
            padding: "8px 10px",
            borderRadius: 6,
            marginTop: 4,
          }}
        >
          <span style={labelStyle}>Statement period</span>
          <span style={valueStyle}>01 JAN 2024 — 31 MAR 2024</span>
        </div>
        <CheckCallout tone="warn">✓ Must be within last 90 days</CheckCallout>
        <Field label="Account type" value="SAVINGS" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          background: "rgba(28,27,26,0.04)",
          borderRadius: 6,
          padding: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <span style={labelStyle}>Opening balance</span>
          <span style={valueStyle}>₹18,45,000</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 8px",
            marginTop: 6,
            background: "rgba(31,122,58,0.08)",
            borderRadius: 4,
          }}
        >
          <span style={{ ...labelStyle, color: "#1F7A3A" }}>Closing balance</span>
          <span style={{ ...valueStyle, color: "#1F7A3A", fontWeight: 600 }}>₹24,32,000</span>
        </div>
        <CheckCallout>✓ Must cover first year costs ($20,000+)</CheckCallout>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <span style={labelStyle}>Average balance</span>
          <span style={valueStyle}>₹21,00,000</span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <p style={labelStyle}>Recent transactions</p>
        <table style={{ width: "100%", marginTop: 6, borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "rgba(28,27,26,0.55)" }}>
              <th style={{ padding: "4px 0" }}>Date</th>
              <th>Description</th>
              <th style={{ textAlign: "right" }}>Debit</th>
              <th style={{ textAlign: "right" }}>Credit</th>
              <th style={{ textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t, i) => (
              <tr key={i} style={{ borderTop: "1px solid rgba(28,27,26,0.06)" }}>
                <td style={{ padding: "5px 0", fontFamily: "ui-monospace, Menlo, monospace" }}>{t.d}</td>
                <td>{t.desc}</td>
                <td style={{ textAlign: "right", color: t.debit ? "#1C1B1A" : "rgba(28,27,26,0.25)" }}>{t.debit || "—"}</td>
                <td style={{ textAlign: "right", color: t.credit ? "#1F7A3A" : "rgba(28,27,26,0.25)" }}>{t.credit || "—"}</td>
                <td style={{ textAlign: "right", fontWeight: 500 }}>{t.bal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(28,27,26,0.1)",
            border: "1px solid rgba(28,27,26,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "rgba(28,27,26,0.55)",
            letterSpacing: "0.1em",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          BANK
          <br />
          SEAL
        </div>
        <CheckCallout>✓ Official bank stamp or letterhead required</CheckCallout>
      </div>
    </MockShell>
  );
}

/* ────────────────────────── ENGLISH (TOEFL) ────────────────────────── */

function EnglishMockup() {
  const ScoreRow = ({ name, score, max }: { name: string; score: number; max: number }) => {
    const pct = (score / max) * 100;
    return (
      <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(28,27,26,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 500 }}>{name}</span>
          <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 }}>
            {score}/{max}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            height: 6,
            background: "rgba(28,27,26,0.08)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "#1C1B1A",
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ ...labelStyle, color: "rgba(28,27,26,0.4)" }}>ETS — TOEFL iBT SCORE REPORT</p>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Name" value="ALEX JOHNSON" />
        <Field
          label="Registration"
          value={<span style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>0000000000</span>}
        />
        <Field label="Test date" value="04 FEB 2026" />
        <div
          style={{
            ...fieldRowStyle,
            border: "1px solid rgba(255,91,46,0.3)",
            background: "rgba(255,91,46,0.04)",
            padding: "8px 10px",
            borderRadius: 6,
            marginTop: 4,
          }}
        >
          <span style={labelStyle}>Valid until</span>
          <span style={valueStyle}>04 FEB 2028</span>
        </div>
        <CheckCallout tone="warn">✓ Scores valid for 2 years</CheckCallout>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <ScoreRow name="Reading" score={28} max={30} />
        <ScoreRow name="Listening" score={27} max={30} />
        <ScoreRow name="Speaking" score={24} max={30} />
        <ScoreRow name="Writing" score={25} max={30} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            padding: "10px 12px",
            background: "rgba(31,122,58,0.06)",
            border: "1px solid rgba(31,122,58,0.2)",
            borderRadius: 6,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>TOTAL</span>
          <span
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontWeight: 600,
              color: "#1F7A3A",
              fontSize: 14,
            }}
          >
            104 / 120
          </span>
        </div>
        <CheckCallout>✓ Above the common 80+ minimum</CheckCallout>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          padding: 12,
          background: "rgba(28,27,26,0.04)",
          borderRadius: 6,
          fontSize: 11,
          color: "rgba(28,27,26,0.7)",
        }}
      >
        Most F-1 programs require 80+ total. Check your specific university requirement.
      </div>
    </MockShell>
  );
}

/* ────────────────────────── MARKSHEETS / TRANSCRIPTS ────────────────────────── */

function MarksheetMockup({ grade }: { grade: "10" | "12" }) {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          CENTRAL BOARD OF EXAMINATION
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Statement of Marks — Class {grade}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Candidate" value="ALEX JOHNSON" />
        <Field label="Roll Number" value="7 7 4 4 1 9 2" />
        <Field label="School" value="Delhi Public School" />
        <Field label="Year of Issue" value={grade === "10" ? "2019" : "2021"} accent="ok" />
        <Field label="Subjects" value="5 listed with marks" />
        <Field label="Result" value="PASS" accent="ok" />
      </div>
      <CheckCallout tone="ok">Board seal or hologram visible bottom-right of the original.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── DEGREE TRANSCRIPT ────────────────────────── */

function DegreeTranscriptMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          UNIVERSITY OF DELHI
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Official Academic Transcript
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Student" value="ALEX JOHNSON" />
        <Field label="Program" value="B.Tech, Computer Science" />
        <Field label="Duration" value="2019 – 2023" />
        <Field label="CGPA" value="8.7 / 10" accent="ok" />
        <Field label="Courses" value="42 listed, semester-wise" />
        <Field label="Registrar seal" value="Present" accent="ok" />
      </div>
      <CheckCallout tone="ok">Sealed/stamped copies travel better than plain printouts.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── ADMISSION LETTER ────────────────────────── */

function AdmissionLetterMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          NORTHFIELD STATE UNIVERSITY
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Office of Graduate Admissions
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Addressed to" value="Alex Johnson" />
        <Field label="Program" value="M.S. Computer Science" />
        <Field label="Term of Admission" value="Fall 2026" accent="ok" />
        <Field label="Status" value="Unconditional Admit" accent="ok" />
        <Field label="Signed by" value="Dean of Admissions" />
      </div>
      <CheckCallout tone="ok">University letterhead + a real signature or seal, not just a PDF export.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── VISA FEE (MRV) RECEIPT ────────────────────────── */

function VisaFeeReceiptMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          MRV FEE RECEIPT
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          U.S. Nonimmigrant Visa Application Fee
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Reference No." value="AA00 7712 3390" />
        <Field label="Applicant" value="ALEX JOHNSON" />
        <Field label="Amount Paid" value="$185.00" accent="ok" />
        <Field label="Payment Date" value="04 MAR 2026" />
        <Field label="Status" value="CONFIRMED" accent="ok" />
      </div>
      <CheckCallout tone="ok">Bring the printed receipt — officers cross-check it against your appointment.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── US VISA PHOTO ────────────────────────── */

function UsVisaPhotoMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
        <div
          aria-hidden
          style={{
            width: 110,
            height: 110,
            background: "rgba(28,27,26,0.05)",
            border: "2px solid rgba(28,27,26,0.18)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(28,27,26,0.4)",
            fontSize: 9,
            letterSpacing: "0.12em",
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          2×2 in
          <br />
          WHITE BG
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 16 }}>
        <Field label="Aspect ratio" value="1:1 square" accent="ok" />
        <Field label="Background" value="Plain white / off-white" accent="ok" />
        <Field label="Expression" value="Neutral, both eyes open" />
        <Field label="Eyewear" value="None" />
        <Field label="Taken within" value="Last 6 months" accent="ok" />
      </div>
      <CheckCallout tone="ok">Face centered, ears visible, no shadows on the background.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── LOAN / SCHOLARSHIP LETTER ────────────────────────── */

function LoanScholarshipMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          STATE BANK — EDUCATION LOAN CELL
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Loan Sanction Letter
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Borrower" value="Alex Johnson" />
        <Field label="Sanctioned Amount" value="$45,000" accent="ok" />
        <Field label="Disbursement" value="Semester-wise, on tuition invoice" />
        <Field label="Sanction Date" value="18 FEB 2026" />
        <Field label="Bank seal" value="Present" accent="ok" />
      </div>
      <CheckCallout tone="ok">Sanction letter, not just the application — officers want proof it's approved.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── SPONSOR DOCS (ITR / CA CERTIFICATE) ────────────────────────── */

function SponsorDocsMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          INCOME TAX RETURN — ACKNOWLEDGEMENT
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Assessment Year 2025–26
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Sponsor Name" value="Rajesh Johnson" />
        <Field label="Relationship" value="Father" />
        <Field label="Gross Annual Income" value="$38,000" accent="ok" />
        <Field label="Assessment Year" value="2025–26" />
        <Field label="Issuing Authority" value="Income Tax Dept. / CA seal" accent="ok" />
      </div>
      <CheckCallout tone="ok">Three years of ITRs (or one CA net-worth certificate) is the usual ask.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── TIES TO HOME ────────────────────────── */

function TiesToHomeMockup() {
  return (
    <MockShell>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", margin: 0, color: "#1C1B1A" }}>
          PROPERTY / FAMILY BUSINESS RECORD
        </p>
        <p style={{ fontSize: 9, color: "rgba(28,27,26,0.5)", margin: "2px 0 0" }}>
          Evidence of ties to home country
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: 14 }}>
        <Field label="Document type" value="Property deed / GST registration" />
        <Field label="Linked to" value="Alex Johnson (family member)" />
        <Field label="Issue date" value="Within last 12 months" accent="ok" />
        <Field label="Seal / signature" value="Present" accent="ok" />
      </div>
      <CheckCallout tone="ok">Anything concrete — property, a running business, a job offer back home.</CheckCallout>
    </MockShell>
  );
}

/* ────────────────────────── MAP ────────────────────────── */

const passport: DocumentExample = {
  title: "Passport (Bio Page)",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <PassportMockup />,
  aiChecks: [
    "Expiry date is 6+ months beyond program end",
    "Photo page is fully visible, no glare",
    "Name matches I-20 exactly",
    "Signature present on bio page",
    "No water damage or torn edges visible",
  ],
  commonMistakes: [
    "Passport expires within 6 months of travel",
    "Photo page cut off at edges when scanning",
    "Name spelling differs from university records",
    "Old expired passport uploaded by mistake",
  ],
};

const i20: DocumentExample = {
  title: "Form I-20",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <I20Mockup />,
  aiChecks: [
    "DSO signature present and not blank",
    "SEVIS ID format is correct (N + 10 digits)",
    "Program start date is in the future",
    "Student name matches passport exactly",
    "School is SEVP certified",
  ],
  commonMistakes: [
    "DSO signature missing on page 1",
    "Uploading an unsigned initial I-20",
    "SEVIS ID on I-20 doesn’t match fee receipt",
    "Expired I-20 (past program end date)",
  ],
};

const ds160: DocumentExample = {
  title: "DS-160 Confirmation",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <Ds160Mockup />,
  aiChecks: [
    "Barcode is visible and not cut off",
    "Application ID is present",
    "Name matches passport exactly",
    "Consular post matches your appointment location",
  ],
  commonMistakes: [
    "Barcode cut off when scanning or photographing",
    "Uploading DS-160 draft instead of confirmation",
    "Name format differs from passport",
  ],
};

const sevisReceipt: DocumentExample = {
  title: "SEVIS Fee Receipt (I-901)",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <SevisReceiptMockup />,
  aiChecks: [
    "SEVIS ID matches I-20 exactly",
    "Payment status shows PAID",
    "Amount is $350 (F-1 student fee)",
    "Student name matches passport",
  ],
  commonMistakes: [
    "SEVIS ID on receipt doesn’t match I-20",
    "Payment shows PENDING not PAID",
    "Wrong fee amount (exchange visitors pay $220)",
  ],
};

const bankStatement: DocumentExample = {
  title: "Bank Statement",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <BankStatementMockup />,
  aiChecks: [
    "Statement is within last 90 days",
    "Account holder name matches application",
    "Balance covers estimated first year costs",
    "Bank stamp or official letterhead visible",
    "No sudden large deposits in last 30 days",
  ],
  commonMistakes: [
    "Statement older than 90 days",
    "Account holder name is parent not student (need sponsor letter if parent’s account)",
    "Balance insufficient for first year costs",
    "Large unexplained deposit in last 30 days (officers flag this as borrowed funds)",
  ],
};

const englishProof: DocumentExample = {
  title: "English Proficiency (TOEFL)",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <EnglishMockup />,
  aiChecks: [
    "Score report is within 2-year validity",
    "Name matches passport exactly",
    "Total score meets common minimum (80+)",
    "Official ETS report, not a screenshot",
  ],
  commonMistakes: [
    "Score report expired (older than 2 years)",
    "Uploading unofficial score preview",
    "Name on report differs from passport",
  ],
};

const marksheet10: DocumentExample = {
  title: "10th Grade Marksheet",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <MarksheetMockup grade="10" />,
  aiChecks: [
    "Student name is present and legible",
    "School or board name is visible",
    "Subject-wise marks or grades are listed",
    "Year/date of issue is visible",
  ],
  commonMistakes: [
    "Scan is cropped and cuts off the board seal",
    "Photocopy of a photocopy — text too faint to read",
    "Wrong document uploaded (12th marksheet instead of 10th)",
  ],
};

const marksheet12: DocumentExample = {
  title: "12th Grade Marksheet",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <MarksheetMockup grade="12" />,
  aiChecks: [
    "Student name is present and legible",
    "School or board name is visible",
    "Subject-wise marks or grades are listed",
    "Year/date of issue is visible",
  ],
  commonMistakes: [
    "Scan is cropped and cuts off the board seal",
    "Provisional marksheet uploaded instead of the final one",
    "Name spelling differs from the passport",
  ],
};

const degreeTranscript: DocumentExample = {
  title: "Degree / University Transcript",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <DegreeTranscriptMockup />,
  aiChecks: [
    "Student name matches passport exactly",
    "University name is visible",
    "Course list with grades or GPA is present",
    "Registrar signature or seal is visible",
  ],
  commonMistakes: [
    "Unofficial transcript (no seal) submitted where an official one is required",
    "Cumulative GPA missing from the printout",
    "Pages out of order or missing the final semester",
  ],
};

const admissionLetter: DocumentExample = {
  title: "Admission / Acceptance Letter",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <AdmissionLetterMockup />,
  aiChecks: [
    "University letterhead is visible",
    "Student name matches your other documents",
    "Program and term of admission are stated",
    "Signature or official seal is present",
  ],
  commonMistakes: [
    "Uploading a conditional offer instead of the final unconditional letter",
    "Program name doesn't match the I-20",
    "Missing signature — some portals export unsigned drafts",
  ],
};

const visaFeeReceipt: DocumentExample = {
  title: "Visa Fee (MRV) Receipt",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <VisaFeeReceiptMockup />,
  aiChecks: [
    "Reference or receipt number is visible",
    "Amount paid is shown clearly",
    "Payment date is visible",
    "Applicant name matches your passport",
  ],
  commonMistakes: [
    "Screenshot of a pending transaction, not the confirmed receipt",
    "Receipt paid in the wrong currency shows a mismatched amount",
    "Applicant name entered differently than on the passport",
  ],
};

const usVisaPhoto: DocumentExample = {
  title: "US Visa Photo (2×2 in)",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <UsVisaPhotoMockup />,
  aiChecks: [
    "Square 1:1 aspect ratio",
    "Plain white or off-white background",
    "Face centered and unobstructed, ears visible",
    "No eyeglasses, neutral expression",
    "Taken within the last 6 months",
  ],
  commonMistakes: [
    "Background has shadows or isn't plain white",
    "Photo is older than 6 months (visible haircut/appearance change)",
    "Glasses worn, or a smiling/non-neutral expression",
  ],
};

const loanOrScholarship: DocumentExample = {
  title: "Loan / Scholarship Letter",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <LoanScholarshipMockup />,
  aiChecks: [
    "Lender or sponsor letterhead is visible",
    "Student name is present",
    "Sanctioned or awarded amount is stated",
    "Terms (duration, disbursement) are listed",
    "Official signature or stamp is present",
  ],
  commonMistakes: [
    "Loan application uploaded instead of the sanction letter",
    "Amount sanctioned doesn't cover the I-20's estimated cost",
    "Missing bank seal or authorized signatory",
  ],
};

const sponsorDocs: DocumentExample = {
  title: "Sponsor Docs (ITR / CA Certificate)",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <SponsorDocsMockup />,
  aiChecks: [
    "Sponsor's full name is visible",
    "Assessment year or certificate date is present",
    "Income or net-worth figures are stated",
    "Issuing authority (tax dept or CA firm) is named",
    "Signature or seal is present",
  ],
  commonMistakes: [
    "Only one year of ITR when three years is expected",
    "Sponsor's relationship to the student isn't documented anywhere",
    "CA certificate missing the CA's registration/seal",
  ],
};

const tiesToHome: DocumentExample = {
  title: "Ties to Home Country Evidence",
  subtitle: SUBTITLE_DEFAULT,
  mockup: <TiesToHomeMockup />,
  aiChecks: [
    "Document title or letterhead is visible",
    "Student's name or a clear family link is shown",
    "Issue date is within the last 12 months",
    "Official stamp or signature is present",
  ],
  commonMistakes: [
    "Document is several years old with no recent proof attached",
    "No clear link between the document and the student",
    "Photocopy is too faint to read the stamp or signature",
  ],
};

/* Both checklist slugs and spec-friendly aliases resolve to the same
   example so callers don't have to translate. */
export const DOCUMENT_EXAMPLES: Record<string, DocumentExample> = {
  passport,
  "passport-bio": passport,
  i20,
  ds160,
  "ds160-confirmation": ds160,
  sevis_receipt: sevisReceipt,
  "sevis-receipt": sevisReceipt,
  bank_statement: bankStatement,
  "bank-statement": bankStatement,
  english_proof: englishProof,
  "marksheet-10": marksheet10,
  "marksheet-12": marksheet12,
  "degree-transcript": degreeTranscript,
  "admission-letter": admissionLetter,
  "visa-fee-receipt": visaFeeReceipt,
  "us-visa-photo": usVisaPhoto,
  "loan-or-scholarship": loanOrScholarship,
  "sponsor-docs": sponsorDocs,
  "ties-to-home": tiesToHome,
};

export function getDocumentExample(key: string): DocumentExample | null {
  return DOCUMENT_EXAMPLES[key] ?? null;
}
