"use client";

import { useState } from "react";
import { Eyebrow } from "./primitives/Eyebrow";

type Item = { cat: string; q: string; a: string };

const ITEMS: Item[] = [
  { cat: "Pricing", q: "Is it really one payment forever?", a: "Yes. One charge unlocks every phase, every step, every tool until your visa is stamped. No renewal, no usage tier, no trial timer." },
  { cat: "Trust", q: "Are you actual visa lawyers?", a: "No, and we say that everywhere. We are a structured prep tool built on the official DS-160, FAM 9, and SEVP guidance, with sources cited on every claim. For legal advice, talk to an immigration attorney." },
  { cat: "Product", q: "What does the AI document check actually do?", a: "It reads each page you upload — passport bio, I-20, bank statements — and flags missing signatures, expired SEVIS receipts, wrong DS-160 confirmation numbers, and 14 other refusal patterns documented in 221(g) data." },
  { cat: "Product", q: "How is the mock interview scored?", a: "Your voice is transcribed and graded on four axes officers actually weight: clarity (filler words, sentence length), confidence (response latency, hedging), specificity (named programs, dates), and financial story (sponsor consistency)." },
  { cat: "Parents", q: "Do my parents need to install anything?", a: "No. The parent view is a read-only link you share. They open it in any browser and see progress, the next step, and what is blocking. No login, no app, no document downloads." },
  { cat: "Refund", q: "What if I get refused — do I get my money back?", a: "Refunds in the first 14 days for any reason. After that, we don't refund based on visa outcome — that depends on factors no prep tool can guarantee. We're honest about that." },
];

export function FAQ() {
  return (
    <section id="faq" className="v3-section v3-faq">
      <div className="v3-faq-head">
        <Eyebrow>Q&amp;A</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">Questions students ask first.</h2>
        <p className="v3-lead v3-mt-6 v3-max-reading">
          Short answers. No corporate hedging. If yours isn&rsquo;t here,{" "}
          <a className="v3-link" href="mailto:getstamped.online@gmail.com">
            getstamped.online@gmail.com
          </a>{" "}
          and a human replies same day.
        </p>
      </div>
      <ul className="v3-faq-list">
        {ITEMS.map((it, idx) => (
          <Row key={it.q} index={idx + 1} item={it} />
        ))}
      </ul>
    </section>
  );
}

function Row({ index, item }: { index: number; item: Item }) {
  const [open, setOpen] = useState(false);
  const num = index.toString().padStart(2, "0");
  return (
    <li className={`v3-faq-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="v3-faq-btn"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="v3-mono v3-faq-num">{num}</span>
        <div className="v3-faq-body">
          <span className="v3-faq-cat">{item.cat}</span>
          <span className="v3-faq-q">{item.q}</span>
        </div>
        <span className="v3-faq-toggle" aria-hidden>
          <svg viewBox="0 0 14 14" width="14" height="14">
            <path d="M3 5.5L7 9.5L11 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="v3-faq-panel">
        <div className="v3-faq-panel-inner">
          <p>{item.a}</p>
        </div>
      </div>
    </li>
  );
}
