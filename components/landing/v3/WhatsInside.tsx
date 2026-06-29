"use client";

import FlowingMenu from "@/components/ui/FlowingMenu";

/* ════════════════════════════════════════════════════════════════════════
   WhatsInside — typographic preview of the four pillars. Resting rows
   sit quiet on bone with ink serif text; hover sweeps a deep-ink band
   in from the left with persimmon italic text. Inverts the previous
   loud-orange treatment so the section reads editorial, not banner-ad.
   ═════════════════════════════════════════════════════════════════════════ */

const menuItems = [
  {
    link: "#playbook",
    text: "Playbook",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80",
  },
  {
    link: "#vault",
    text: "Document Vault",
    image: "https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=600&q=80",
  },
  {
    link: "#interview",
    text: "Mock Interview",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&q=80",
  },
  {
    link: "#parent",
    text: "Parent Share",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  },
];

const BONE = "#F5F1E8";
const INK = "#0B1E3F";
const PERSIMMON = "#E8622A";
const STONE = "rgba(11, 30, 63, 0.12)";

export function WhatsInside() {
  return (
    <section
      className="gs-whats-inside"
      style={{ position: "relative", background: BONE }}
    >
      <div className="gs-whats-inside-head">
        <p className="gs-whats-inside-eyebrow">What&rsquo;s Inside</p>
        <h2 className="gs-whats-inside-title">
          Four tools, <em>one stamp.</em>
        </h2>
      </div>

      <div className="gs-whats-inside-frame">
        <FlowingMenu
          items={menuItems}
          speed={15}
          textColor={INK}
          bgColor={BONE}
          marqueeBgColor={INK}
          marqueeTextColor={PERSIMMON}
          borderColor={STONE}
        />
      </div>

      <style>{`
        .gs-whats-inside {
          padding-bottom: 8px;
        }
        .gs-whats-inside-head {
          text-align: center;
          padding: 72px 24px 36px;
        }
        .gs-whats-inside-eyebrow {
          font-size: 10px;
          color: ${PERSIMMON};
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-family: var(--font-sans-stack);
          font-weight: 600;
          margin: 0 0 18px;
        }
        .gs-whats-inside-title {
          margin: 0;
          font-family: var(--font-display-stack);
          font-weight: 400;
          font-size: clamp(28px, 3.4vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.022em;
          color: ${INK};
        }
        .gs-whats-inside-title em {
          font-style: italic;
          color: ${PERSIMMON};
        }
        .gs-whats-inside-frame {
          height: 500px;
          position: relative;
        }

        /* Refine the rest state inside FlowingMenu — serif, italic on hover row */
        .gs-whats-inside .gs-flow-text {
          font-family: var(--font-display-stack) !important;
          font-weight: 400 !important;
          letter-spacing: -0.02em !important;
        }
        .gs-whats-inside .gs-flow-marquee .gs-flow-text,
        .gs-whats-inside .gs-flow-marquee span {
          font-style: italic !important;
        }

        @media (max-width: 768px) {
          .gs-whats-inside-frame { height: 400px; }
          .gs-whats-inside-head { padding: 56px 20px 28px; }
        }
      `}</style>
    </section>
  );
}
