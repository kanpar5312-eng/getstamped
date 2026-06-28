"use client";

import { useState } from "react";

/* ════════════════════════════════════════════════════════════════════════
   FAQ — Wavly-style minimal accordion. No category chips, no numbered
   watermarks. Plus icon rotates to × on open; answer fades in below.
   Copy is preserved verbatim from the previous FAQ.
   ═════════════════════════════════════════════════════════════════════════ */

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: "Is it really one payment forever?",
    a: "Yes. One charge unlocks every phase, every step, every tool until your visa is stamped. No renewal, no usage tier, no trial timer.",
  },
  {
    q: "Are you actual visa lawyers?",
    a: "No, and we say that everywhere. We are a structured prep tool built on the official DS-160, FAM 9, and SEVP guidance, with sources cited on every claim. For legal advice, talk to an immigration attorney.",
  },
  {
    q: "What does the AI document check actually do?",
    a: "It reads each page you upload — passport bio, I-20, bank statements — and flags missing signatures, expired SEVIS receipts, wrong DS-160 confirmation numbers, and 14 other refusal patterns documented in 221(g) data.",
  },
  {
    q: "How is the mock interview scored?",
    a: "Your voice is transcribed and graded on four axes officers actually weight: clarity (filler words, sentence length), confidence (response latency, hedging), specificity (named programs, dates), and financial story (sponsor consistency).",
  },
  {
    q: "Do my parents need to install anything?",
    a: "No. The parent view is a read-only link you share. They open it in any browser and see progress, the next step, and what is blocking. No login, no app, no document downloads.",
  },
  {
    q: "What if I get refused — do I get my money back?",
    a: "Refunds in the first 14 days for any reason. After that, we don't refund based on visa outcome — that depends on factors no prep tool can guarantee. We're honest about that.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      style={{
        background: "var(--color-cream)",
        color: "var(--color-ink)",
        padding: "96px 20px",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: "center" }}>
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
            FAQ
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display-stack)",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4.4vw, 3rem)",
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              margin: "14px 0 0 0",
            }}
          >
            Questions,{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "var(--color-forest)",
                fontFamily: "inherit",
              }}
            >
              answered.
            </em>
          </h2>
          <p
            style={{
              marginTop: 16,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--color-ink-soft)",
            }}
          >
            Still curious?{" "}
            <a
              href="mailto:getstamped.online@gmail.com"
              style={{
                color: "var(--color-forest)",
                textDecoration: "none",
                borderBottom: "1px solid currentColor",
              }}
            >
              getstamped.online@gmail.com
            </a>
          </p>
        </div>

        <ul
          style={{
            marginTop: 48,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {ITEMS.map((it) => (
            <Row key={it.q} item={it} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Row({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  return (
    <li
      style={{
        borderTop: "1px solid var(--color-border-soft)",
        borderBottom: "1px solid var(--color-border-soft)",
        transition: "border-color 200ms ease",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          all: "unset",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          width: "100%",
          padding: "18px 20px",
          cursor: "pointer",
          fontFamily: "var(--font-display-stack)",
          fontSize: 18,
          letterSpacing: "-0.01em",
          color: "var(--color-ink)",
          fontWeight: 400,
        }}
      >
        <span>{item.q}</span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            color: "var(--color-forest)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-4px)",
            transition:
              "opacity 280ms ease 60ms, transform 280ms ease 60ms",
          }}
        >
          <p
            style={{
              margin: 0,
              padding: "0 20px 20px",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--color-ink-soft)",
              maxWidth: "62ch",
            }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </li>
  );
}
