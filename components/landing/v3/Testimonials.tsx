"use client";

/* ════════════════════════════════════════════════════════════════════════
   Testimonials — two-row continuous marquee. Compact cards (avatar +
   quote + persimmon handle), opposite-direction scroll, edge-fade mask,
   pause on hover. Brand: ink bg, paper text, persimmon accents.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#0B1E3F";
const PEACH = "#FBE8D9";
const PERSIMMON = "#E8622A";

type Testimonial = {
  handle: string;
  initials: string;
  quote: string;
  tint?: "persimmon" | "paper";
};

const ROW_A: Testimonial[] = [
  {
    handle: "@ananya_iyer",
    initials: "AI",
    quote:
      "The 47-step list felt overwhelming on day one. By week three it was a checklist. DS-160 cleared first time.",
    tint: "persimmon",
  },
  {
    handle: "@rohit.s",
    initials: "RS",
    quote:
      "The vault caught a missing DSO signature the day before my appointment. Worth it for that one catch alone.",
  },
  {
    handle: "@folake_ade",
    initials: "FA",
    quote:
      "Breaks down the four things officers actually score. The mock interview doesn't let vague answers slide.",
    tint: "persimmon",
  },
  {
    handle: "@diego.r",
    initials: "DR",
    quote:
      "My parents stopped asking for updates the day I shared the read-only link. Replaced three calls a week.",
  },
  {
    handle: "@jimin_p",
    initials: "JP",
    quote:
      "Did six mocks. By the real one I'd already heard every variant of 'why this school'. Felt familiar.",
    tint: "persimmon",
  },
];

const ROW_B: Testimonial[] = [
  {
    handle: "@priya.nair",
    initials: "PN",
    quote:
      "Phase 1 was free so I tried it. Paid because nowhere else gets this stuff in order. Financial story rubric saved me.",
  },
  {
    handle: "@aarav_s",
    initials: "AS",
    quote:
      "Almost paid a consultant 40k. Did Phase 1 free and knew within an hour this was better.",
    tint: "persimmon",
  },
  {
    handle: "@tunde.o",
    initials: "TO",
    quote:
      "Lagos yesterday. Approved in four minutes. Officer said 'you're clearly prepared'.",
  },
  {
    handle: "@mei.l",
    initials: "ML",
    quote:
      "221(g) on attempt one. Approved on attempt two. Difference was the financial paperwork GetStamped flagged.",
    tint: "persimmon",
  },
  {
    handle: "@niran_v",
    initials: "NV",
    quote:
      "Chennai officer asked what my father does. I gave the exact line from mock #3. Stamped.",
  },
];

function Card({ t }: { t: Testimonial }) {
  const accent = t.tint === "persimmon";
  return (
    <figure className={`gs-tm-card${accent ? " is-accent" : ""}`}>
      <span className="gs-tm-avatar" aria-hidden>
        {t.initials}
      </span>
      <div className="gs-tm-body">
        <blockquote className="gs-tm-quote">&ldquo;{t.quote}&rdquo;</blockquote>
        <figcaption className="gs-tm-handle">{t.handle}</figcaption>
      </div>
    </figure>
  );
}

function Row({ items, direction }: { items: Testimonial[]; direction: "ltr" | "rtl" }) {
  // Duplicate the list so the translate loop is seamless.
  const loop = [...items, ...items];
  return (
    <div className="gs-tm-row">
      <div className={`gs-tm-track gs-tm-${direction}`}>
        {loop.map((t, i) => (
          <Card key={`${direction}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What people say"
      className="gs-tm-section"
    >
      <div className="gs-tm-head">
        <h2 className="gs-tm-title">
          <span className="gs-tm-chevron" aria-hidden>
            ›
          </span>
          What People Say
        </h2>
        <a className="gs-tm-viewall" href="#waitlist">
          View all <span aria-hidden>→</span>
        </a>
      </div>

      <div className="gs-tm-marquee" aria-hidden={false}>
        <Row items={ROW_A} direction="ltr" />
        <Row items={ROW_B} direction="rtl" />
      </div>

      <style>{`
        .gs-tm-section {
          position: relative;
          background: ${PEACH};
          color: ${INK};
          padding: clamp(48px, 6vw, 80px) 0 clamp(56px, 7vw, 88px);
          overflow: hidden;
        }
        .gs-tm-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          max-width: 1240px;
          margin: 0 auto 28px;
          padding: 0 clamp(20px, 4vw, 48px);
        }
        .gs-tm-title {
          display: inline-flex;
          align-items: baseline;
          gap: 12px;
          margin: 0;
          font-family: var(--font-display-stack);
          font-weight: 500;
          font-size: clamp(28px, 3vw, 40px);
          letter-spacing: -0.02em;
          color: ${INK};
        }
        .gs-tm-chevron {
          color: ${PERSIMMON};
          font-weight: 400;
          font-size: 0.85em;
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .gs-tm-viewall {
          font-family: var(--font-sans-stack);
          font-size: 14px;
          font-weight: 500;
          color: ${PERSIMMON};
          text-decoration: none;
          letter-spacing: -0.005em;
          transition: opacity 200ms ease-out;
        }
        .gs-tm-viewall:hover { opacity: 0.78; }

        .gs-tm-marquee {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #fff 8%, #fff 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #fff 8%, #fff 92%, transparent 100%);
        }

        .gs-tm-row { overflow: hidden; }
        .gs-tm-track {
          display: flex;
          gap: 18px;
          width: max-content;
          will-change: transform;
        }
        .gs-tm-ltr { animation: gs-tm-scroll-ltr 60s linear infinite; }
        .gs-tm-rtl { animation: gs-tm-scroll-rtl 60s linear infinite; }
        .gs-tm-row:hover .gs-tm-track { animation-play-state: paused; }

        @keyframes gs-tm-scroll-ltr {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes gs-tm-scroll-rtl {
          from { transform: translate3d(-50%, 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }

        .gs-tm-card {
          flex: 0 0 auto;
          width: clamp(320px, 32vw, 420px);
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 22px;
          margin: 0;
          background: #FAF5EE;
          border: 1px solid rgba(11, 30, 63, 0.14);
          border-radius: 18px;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.6) inset,
            0 12px 28px -18px rgba(11, 30, 63, 0.25);
          transition: transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out;
        }
        .gs-tm-card:hover {
          border-color: rgba(232, 98, 42, 0.55);
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.7) inset,
            0 18px 38px -18px rgba(232, 98, 42, 0.35);
        }
        .gs-tm-card.is-accent {
          background: ${INK};
          border-color: rgba(232, 98, 42, 0.55);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.08) inset,
            0 18px 38px -18px rgba(11, 30, 63, 0.55);
        }
        .gs-tm-card.is-accent .gs-tm-quote {
          color: rgba(250, 248, 244, 0.92);
        }
        .gs-tm-card.is-accent .gs-tm-avatar {
          color: ${PEACH};
          background: rgba(232, 98, 42, 0.22);
          border-color: rgba(232, 98, 42, 0.6);
        }

        .gs-tm-avatar {
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display-stack);
          font-size: 16px;
          letter-spacing: -0.02em;
          color: ${PERSIMMON};
          background: rgba(232, 98, 42, 0.14);
          border: 1px solid rgba(232, 98, 42, 0.4);
        }

        .gs-tm-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        .gs-tm-quote {
          margin: 0;
          font-family: var(--font-sans-stack);
          font-size: 14px;
          line-height: 1.55;
          color: rgba(11, 30, 63, 0.78);
          letter-spacing: -0.003em;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .gs-tm-handle {
          font-family: var(--font-sans-stack);
          font-size: 13px;
          font-weight: 500;
          color: ${PERSIMMON};
          letter-spacing: -0.005em;
        }

        @media (max-width: 640px) {
          .gs-tm-card { width: 280px; padding: 16px 18px; }
          .gs-tm-quote { font-size: 13px; -webkit-line-clamp: 4; }
          .gs-tm-avatar { width: 38px; height: 38px; font-size: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .gs-tm-ltr, .gs-tm-rtl { animation: none; }
        }
      `}</style>
    </section>
  );
}
