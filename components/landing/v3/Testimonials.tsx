"use client";

/* ════════════════════════════════════════════════════════════════════════
   Testimonials — two-row continuous marquee. Compact cards (avatar +
   quote + persimmon handle), opposite-direction scroll, edge-fade mask,
   pause on hover. Brand: ink bg, paper text, persimmon accents.
   ═════════════════════════════════════════════════════════════════════════ */

const INK = "#101828";
const CREAM = "#FCFCFD";
const MINT = "#DFF7EE";
void MINT;
const PERSIMMON = "#2C5EFF";
void PERSIMMON;

type AvatarKey = "persimmon" | "peach" | "cream" | "saffron" | "ink";

type Testimonial = {
  handle: string;
  initials: string;
  quote: string;
  avatar: AvatarKey;
  tint?: "persimmon" | "paper";
};

const ROW_A: Testimonial[] = [
  {
    handle: "@ananya.iy",
    initials: "AI",
    quote:
      "ngl thought 47 steps was made up until i hit step 19. it's literally that many lol. ds-160 cleared first try tho 🤝",
    avatar: "persimmon",
    tint: "persimmon",
  },
  {
    handle: "@rohit_srm",
    initials: "RS",
    quote:
      "vault told me my i-20 wasn't signed by my dso the NIGHT BEFORE my appointment. would've been so cooked 💀",
    avatar: "cream",
  },
  {
    handle: "@folake.a",
    initials: "FA",
    quote:
      "the mock interview will humble you fr. was saying 'umm' every 4 words at first. by attempt 5 i actually sounded human",
    avatar: "peach",
    tint: "persimmon",
  },
  {
    handle: "@diegooo",
    initials: "DR",
    quote:
      "mom stopped texting me 'beta how is application?' every night the day i shared the parent link. peace fr",
    avatar: "saffron",
  },
  {
    handle: "@jimin_p",
    initials: "JP",
    quote:
      "did the mock at 1am six times. by the real one i was lowkey bored answering 'why this uni'. stamped ✨",
    avatar: "persimmon",
    tint: "persimmon",
  },
];

const ROW_B: Testimonial[] = [
  {
    handle: "@priya.n",
    initials: "PN",
    quote:
      "phase 1 is free??? tried it for fun. paid the $9 in 20 min bc it was actually good. no cap this thing slaps",
    avatar: "ink",
  },
  {
    handle: "@aarav.s",
    initials: "AS",
    quote:
      "delhi consultants quoted me 40k for visa prep 😭 nine. dollars. literally walked me through everything",
    avatar: "peach",
    tint: "persimmon",
  },
  {
    handle: "@tundeee",
    initials: "TO",
    quote:
      "lagos officer barely looked up. 4 mins. said 'you're prepared'. closest thing to a flex i've ever had",
    avatar: "cream",
  },
  {
    handle: "@mei.lin",
    initials: "ML",
    quote:
      "got 221(g) first try without this. got stamped second try WITH it. the difference was literally one financials section",
    avatar: "persimmon",
    tint: "persimmon",
  },
  {
    handle: "@niran_v",
    initials: "NV",
    quote:
      "chennai officer asked what my dad does. gave the EXACT answer from mock #3 word for word lmao. stamped 🫡",
    avatar: "saffron",
  },
];

function Card({ t }: { t: Testimonial }) {
  const accent = t.tint === "persimmon";
  return (
    <figure className={`gs-tm-card${accent ? " is-accent" : ""}`}>
      <span className={`gs-tm-avatar gs-tm-av-${t.avatar}`} aria-hidden>
        {t.initials}
      </span>
      <div className="gs-tm-body">
        <blockquote className="gs-tm-quote">{t.quote}</blockquote>
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
          background: ${CREAM};
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
          background: #FFFFFF;
          border: 1px solid rgba(16, 24, 40, 0.08);
          border-radius: 18px;
          box-shadow: 0 12px 24px -20px rgba(16, 24, 40, 0.14);
          transition: border-color 200ms ease-out;
        }
        .gs-tm-card:hover {
          border-color: rgba(44, 94, 255, 0.35);
        }
        .gs-tm-card.is-accent {
          background: #DFF7EE;
          border-color: rgba(16, 107, 65, 0.24);
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
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset;
        }
        .gs-tm-av-persimmon {
          background: rgba(44, 94, 255, 0.14);
          color: #1E46D6;
          border: 1px solid rgba(44, 94, 255, 0.40);
        }
        .gs-tm-av-peach {
          background: #DFF7EE;
          color: #1E6B41;
          border: 1px solid rgba(16, 107, 65, 0.28);
        }
        .gs-tm-av-cream {
          background: #F5F7FA;
          color: #101828;
          border: 1px solid rgba(16, 24, 40, 0.14);
        }
        .gs-tm-av-saffron {
          background: rgba(246, 166, 35, 0.16);
          color: #9A5B0A;
          border: 1px solid rgba(246, 166, 35, 0.40);
        }
        .gs-tm-av-ink {
          background: #FFFFFF;
          color: #101828;
          border: 1px solid rgba(16, 24, 40, 0.18);
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
          color: rgba(16, 24, 40, 0.75);
          letter-spacing: -0.003em;
          display: -webkit-box;
          -webkit-line-clamp: 4;
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

        /* Dark mode — collapses every avatar's distinct light-mode tint
           down to black + persimmon, per brand rule (no other colors). */
        html.dark .gs-tm-section {
          background: var(--color-cream);
          color: var(--color-ink);
        }
        html.dark .gs-tm-title { color: var(--color-ink); }
        html.dark .gs-tm-marquee {
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
        }
        html.dark .gs-tm-card {
          background: var(--color-cream-soft);
          border-color: rgba(44, 94, 255, 0.22);
          box-shadow: 0 12px 24px -20px rgba(0, 0, 0, 0.6);
        }
        html.dark .gs-tm-card:hover { border-color: rgba(44, 94, 255, 0.5); }
        html.dark .gs-tm-card.is-accent {
          background: var(--color-persimmon-tint);
          border-color: rgba(44, 94, 255, 0.4);
        }
        html.dark .gs-tm-avatar { box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset; }
        html.dark .gs-tm-av-persimmon,
        html.dark .gs-tm-av-peach,
        html.dark .gs-tm-av-saffron {
          background: rgba(44, 94, 255, 0.18);
          color: var(--color-persimmon-deep);
          border-color: rgba(44, 94, 255, 0.45);
        }
        html.dark .gs-tm-av-cream,
        html.dark .gs-tm-av-ink {
          background: var(--color-cream-deep);
          color: var(--color-ink);
          border-color: rgba(245, 247, 250, 0.18);
        }
        html.dark .gs-tm-quote { color: var(--color-ink-soft); }
      `}</style>
    </section>
  );
}
