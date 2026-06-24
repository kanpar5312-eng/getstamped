"use client";

import CardSwap, { Card } from "@/components/ui/CardSwap";

/* Combined feature pillars (Playbook · Document Vault · Mock Interview ·
   Parent Share) collapsed into one CardSwap stack. Left column holds
   the editorial copy; right column hosts the rotating cards. */

const ink = "#1C1917";
const persimmon = "#E8622A";
const paper = "#FAF8F4";
const muted = "rgba(28,25,23,0.62)";

const cardOuter = {
  width: "100%",
  height: "100%",
  padding: "28px 28px 24px 28px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  background: ink,
  borderRadius: 12,
  color: paper,
  fontFamily: "var(--font-sans-stack)",
  border: "1px solid rgba(250,248,244,0.18)",
};

const eyebrowStyle = {
  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
  fontSize: 10,
  letterSpacing: "0.32em",
  textTransform: "uppercase" as const,
  color: persimmon,
  margin: 0,
};

const titleStyle = {
  fontFamily: "var(--font-display-stack)",
  fontSize: 28,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  margin: "12px 0 0 0",
  color: paper,
};

const subStyle = {
  fontSize: 13,
  lineHeight: 1.55,
  color: "rgba(250,248,244,0.72)",
  margin: "12px 0 0 0",
};

const metaRow = {
  fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "rgba(250,248,244,0.45)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 10,
  borderTop: "1px solid rgba(250,248,244,0.12)",
};

export function FeaturesShowcase() {
  return (
    <section
      id="features"
      aria-label="Product pillars"
      style={{
        position: "relative",
        background: paper,
        color: ink,
        padding: "clamp(80px, 12vw, 160px) 24px",
      }}
    >
      <div
        className="gs-features-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 48,
          alignItems: "center",
          minHeight: 600,
        }}
      >
        {/* Left — editorial copy */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
              fontSize: 11,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: persimmon,
              margin: 0,
            }}
          >
            The Workspace
          </p>

          <h2
            className="gs-features-h2"
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(40px, 5.5vw, 72px)",
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              margin: "20px 0 0 0",
              textWrap: "balance" as "balance",
            }}
          >
            Four tools.{" "}
            <em style={{ color: persimmon, fontStyle: "italic", fontFamily: "inherit" }}>One stamp.</em>
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: muted,
              maxWidth: 480,
              margin: "24px 0 0 0",
            }}
          >
            A 47-step playbook, an AI document vault, a voice-driven mock interview, and a read-only
            parent view. Built to work in one workspace until your passport is stamped.
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "32px 0 0 0",
              display: "grid",
              gap: 12,
              fontSize: 14,
              color: ink,
            }}
          >
            {[
              "Every phase ordered and annotated",
              "Documents verified against real refusal patterns",
              "Officer-style scoring on clarity, confidence, financials",
              "Parents see progress without seeing your inbox",
            ].map((line) => (
              <li key={line} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  aria-hidden
                  style={{
                    flex: "0 0 auto",
                    marginTop: 7,
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: persimmon,
                  }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — CardSwap stack */}
        <div
          className="gs-features-cards"
          style={{
            position: "relative",
            height: 600,
            minHeight: 600,
          }}
        >
          <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
            {/* 1. Playbook */}
            <Card>
              <div style={cardOuter}>
                <div>
                  <p style={eyebrowStyle}>The 47-step playbook</p>
                  <h3 style={titleStyle}>
                    Forty-seven steps.{" "}
                    <em style={{ color: persimmon, fontStyle: "italic" }}>Taken apart.</em>
                  </h3>
                  <p style={subStyle}>
                    Every phase ordered, estimated, and annotated by people who&apos;ve sat in front of
                    the officer.
                  </p>
                </div>
                <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
                  {[
                    ["Phase 01", "Before your I-20", "STEPS 01 – 06"],
                    ["Phase 02", "After I-20 arrival", "STEPS 07 – 17"],
                    ["Phase 03", "DS-160 and fees", "STEPS 18 – 28"],
                    ["Phase 04", "Interview preparation", "STEPS 29 – 40"],
                    ["Phase 05", "Post-approval", "STEPS 41 – 47"],
                  ].map(([k, label, range]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid rgba(250,248,244,0.08)",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: persimmon, fontFamily: "var(--font-mono-stack, var(--font-sans-stack))", fontSize: 9, letterSpacing: "0.18em" }}>{k}</span>
                      <span style={{ color: paper, flex: 1, marginLeft: 14 }}>{label}</span>
                      <span style={{ color: "rgba(250,248,244,0.4)", fontFamily: "var(--font-mono-stack, var(--font-sans-stack))", fontSize: 9, letterSpacing: "0.18em" }}>{range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 2. Document Vault */}
            <Card>
              <div style={cardOuter}>
                <div>
                  <p style={eyebrowStyle}>Document vault</p>
                  <h3 style={titleStyle}>
                    Catch the mistake that{" "}
                    <em style={{ color: persimmon, fontStyle: "italic" }}>would&apos;ve cost a month.</em>
                  </h3>
                  <p style={subStyle}>
                    AI vision trained on the exact 221(g) failure modes consular officers cite. Plain-
                    language fixes, not error codes.
                  </p>
                </div>
                <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
                  {[
                    ["Passport bio page", "Checked", "ok"],
                    ["I-20 — signature page", "Checking…", "wait"],
                    ["Bank statement (page 3)", "Re-upload page 3", "warn"],
                    ["DS-160 confirmation", "Checked", "ok"],
                  ].map(([file, status, kind]) => (
                    <div
                      key={file}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: "rgba(250,248,244,0.05)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: paper }}>{file}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color:
                            kind === "warn" ? persimmon : kind === "wait" ? "rgba(250,248,244,0.6)" : "#7FD7C4",
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={metaRow}>
                  <span>9 documents · 6 ready</span>
                  <span>1 needs you</span>
                </div>
              </div>
            </Card>

            {/* 3. Mock Interview */}
            <Card>
              <div style={cardOuter}>
                <div>
                  <p style={eyebrowStyle}>Mock interview</p>
                  <h3 style={titleStyle}>
                    Hear every question{" "}
                    <em style={{ color: persimmon, fontStyle: "italic" }}>before they ask it.</em>
                  </h3>
                  <p style={subStyle}>
                    Voice-driven officer. 200+ real F-1 questions. Scored on clarity, confidence,
                    specificity, and your financial story.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18 }}>
                  {[
                    ["Clarity", 94],
                    ["Confidence", 88],
                    ["Specificity", 91],
                    ["Financials", 76],
                  ].map(([k, v]) => (
                    <div
                      key={k as string}
                      style={{
                        background: "rgba(250,248,244,0.05)",
                        borderRadius: 8,
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "rgba(250,248,244,0.7)" }}>{k}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                          fontSize: 18,
                          color: paper,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {v as number}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={metaRow}>
                  <span>Question 04 / 12</span>
                  <span>00:14</span>
                </div>
              </div>
            </Card>

            {/* 4. Parent Share */}
            <Card>
              <div style={cardOuter}>
                <div>
                  <p style={eyebrowStyle}>Parent share</p>
                  <h3 style={titleStyle}>
                    Parents see what matters.{" "}
                    <em style={{ color: persimmon, fontStyle: "italic" }}>Nothing else.</em>
                  </h3>
                  <p style={subStyle}>
                    One read-only link, revocable anytime. Phase, progress, interview date — no inbox,
                    no app, no login.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    background: "rgba(250,248,244,0.05)",
                    borderRadius: 10,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      color: "rgba(250,248,244,0.5)",
                      margin: 0,
                    }}
                  >
                    ANIKA — FAMILY VIEW
                  </p>
                  <p style={{ fontFamily: "var(--font-display-stack)", fontSize: 18, margin: "8px 0 12px 0", color: paper }}>
                    Your child&apos;s F-1 application
                  </p>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(250,248,244,0.1)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: "63%", height: "100%", background: persimmon }} />
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(250,248,244,0.55)", margin: "10px 0 14px 0" }}>
                    63% complete · updated 2m ago
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Phase 4 of 5", "Mocks done: 2", "Docs 12 / 14"].map((chip) => (
                      <span
                        key={chip}
                        style={{
                          fontFamily: "var(--font-mono-stack, var(--font-sans-stack))",
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(250,248,244,0.18)",
                          color: paper,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={metaRow}>
                  <span>Live updates</span>
                  <span style={{ color: persimmon }}>● ON</span>
                </div>
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .gs-features-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .gs-features-cards {
            height: 520px !important;
            min-height: 520px !important;
          }
        }
        @media (max-width: 480px) {
          .gs-features-cards {
            height: 460px !important;
            min-height: 460px !important;
          }
        }
      `}</style>
    </section>
  );
}
