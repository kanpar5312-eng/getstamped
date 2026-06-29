"use client";

import FlowingMenu from "@/components/ui/FlowingMenu";

/* ════════════════════════════════════════════════════════════════════════
   WhatsInside — typographic preview of the four pillars. Resting rows
   sit quiet on bone with ink serif text; hover sweeps a deep-ink band
   in from the left with persimmon italic text. Inverts the previous
   loud-orange treatment so the section reads editorial, not banner-ad.
   ═════════════════════════════════════════════════════════════════════════ */

const BONE = "#F5F1E8";
const INK = "#0B1E3F";
const PERSIMMON = "#E8622A";
const STONE = "rgba(11, 30, 63, 0.12)";

/* Inline brand tiles — deep ink card with a persimmon glyph and an
   eyebrow label. Encoded as data URIs so FlowingMenu's <img> can render
   them without a network round-trip or external asset. */
function tile(label: string, glyph: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
  <rect width='600' height='600' fill='${INK}'/>
  <rect x='18' y='18' width='564' height='564' fill='none' stroke='${PERSIMMON}' stroke-opacity='0.35' stroke-width='1'/>
  <text x='44' y='72' font-family='ui-monospace, SFMono-Regular, Menlo, monospace' font-size='18' letter-spacing='6' fill='${PERSIMMON}'>${label}</text>
  <g transform='translate(300 320)' stroke='${PERSIMMON}' stroke-width='6' fill='none' stroke-linecap='round' stroke-linejoin='round'>${glyph}</g>
  <text x='44' y='560' font-family='Georgia, serif' font-style='italic' font-size='22' fill='${BONE}' opacity='0.7'>GetStamped</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const GLYPH_PLAYBOOK = `
  <line x1='-110' y1='-70' x2='110' y2='-70'/>
  <line x1='-110' y1='-20' x2='60' y2='-20'/>
  <line x1='-110' y1='30' x2='90' y2='30'/>
  <line x1='-110' y1='80' x2='40' y2='80'/>
  <circle cx='-130' cy='-70' r='6' fill='${PERSIMMON}'/>
  <circle cx='-130' cy='-20' r='6' fill='${PERSIMMON}'/>
  <circle cx='-130' cy='30' r='6' fill='${PERSIMMON}'/>
  <circle cx='-130' cy='80' r='6' fill='${PERSIMMON}'/>`;

const GLYPH_VAULT = `
  <rect x='-110' y='-90' width='180' height='220' rx='6'/>
  <rect x='-80' y='-60' width='180' height='220' rx='6'/>
  <line x1='-50' y1='-20' x2='70' y2='-20'/>
  <line x1='-50' y1='20' x2='40' y2='20'/>
  <line x1='-50' y1='60' x2='70' y2='60'/>`;

const GLYPH_INTERVIEW = `
  <rect x='-25' y='-110' width='50' height='110' rx='25'/>
  <path d='M -60 -20 a 60 60 0 0 0 120 0'/>
  <line x1='0' y1='40' x2='0' y2='90'/>
  <line x1='-40' y1='110' x2='40' y2='110'/>`;

const GLYPH_PARENT = `
  <circle cx='-60' cy='-40' r='32'/>
  <circle cx='60' cy='-40' r='32'/>
  <circle cx='0' cy='60' r='26'/>
  <path d='M -60 0 q 0 60 60 60'/>
  <path d='M 60 0 q 0 60 -60 60'/>`;

const menuItems = [
  { link: "#playbook", text: "Playbook", image: tile("PLAYBOOK", GLYPH_PLAYBOOK) },
  { link: "#vault", text: "Document Vault", image: tile("VAULT", GLYPH_VAULT) },
  { link: "#interview", text: "Mock Interview", image: tile("INTERVIEW", GLYPH_INTERVIEW) },
  { link: "#parent", text: "Parent Share", image: tile("PARENT SHARE", GLYPH_PARENT) },
];

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
