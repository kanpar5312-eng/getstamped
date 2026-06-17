import { Eyebrow } from "./primitives/Eyebrow";

type Review = { q: string; n: string; m: string; weight?: boolean };

const REVIEWS_ROW_A: Review[] = [
  {
    q: "Almost paid a consultant 40k. Did Phase 1 free and knew within an hour this was better.",
    n: "Aarav S.",
    m: "Master's · Mumbai",
  },
  {
    q: "Did the mock at 1am. I kept saying 'um'. Fixed it by 3. Real officer didn't catch one.",
    n: "Priya R.",
    m: "Master's · Bangalore",
    weight: true,
  },
  {
    q: "My mom stopped calling every night. She just opens the parent link and texts 'good progress beta'.",
    n: "Ji-won K.",
    m: "Bachelor's · Seoul",
  },
  {
    q: "Vault caught that my I-20 wasn't signed by the DSO. I'd have shown up and been turned away.",
    n: "Lucas M.",
    m: "PhD · São Paulo",
  },
];

const REVIEWS_ROW_B: Review[] = [
  {
    q: "Couldn't sleep for a week. The 47 steps made the chaos feel finite.",
    n: "Defne A.",
    m: "Master's · Istanbul",
    weight: true,
  },
  {
    q: "Lagos yesterday. Approved in four minutes. Officer said 'you're clearly prepared'.",
    n: "Tunde O.",
    m: "Master's · Lagos",
  },
  {
    q: "Chennai officer asked what my father does. I gave the exact line from mock #3. Stamped.",
    n: "Niran V.",
    m: "Bachelor's · Chennai",
  },
  {
    q: "221(g) on attempt one. Approved on attempt two. Difference was the financial paperwork.",
    n: "Mei L.",
    m: "Master's · Taipei",
    weight: true,
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="v3-section v3-reviews">
      <div className="v3-reviews-head">
        <Eyebrow>Notes</Eyebrow>
        <h2 className="v3-h2 v3-mt-6">
          Notes from students who got stamped.
        </h2>
      </div>

      {/* Two rows scrolling opposite directions, persimmon glow on each card.
          Pause on hover, edge-fade mask, prefers-reduced-motion freezes. */}
      <div className="v3-review-marquee" aria-label="Student notes">
        <div className="v3-review-row">
          <div className="v3-review-track v3-review-track-ltr">
            {[...REVIEWS_ROW_A, ...REVIEWS_ROW_A].map((r, i) => (
              <ReviewCard key={`a-${i}`} r={r} />
            ))}
          </div>
        </div>
        <div className="v3-review-row">
          <div className="v3-review-track v3-review-track-rtl">
            {[...REVIEWS_ROW_B, ...REVIEWS_ROW_B].map((r, i) => (
              <ReviewCard key={`b-${i}`} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <figure
      className={`v3-review-card${r.weight ? " v3-review-weight" : ""}`}
    >
      {r.weight ? (
        <div className="v3-review-stars" aria-label="5 out of 5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
              <path d="M6 0l1.6 3.7L11.6 4l-3 2.7.9 3.9L6 8.7 2.5 10.6l.9-3.9-3-2.7 4-.3z" />
            </svg>
          ))}
        </div>
      ) : null}
      <blockquote className="v3-review-q">&ldquo;{r.q}&rdquo;</blockquote>
      <hr className="v3-review-rule" />
      <figcaption className="v3-review-foot">
        <span className="v3-review-avatar" aria-hidden>
          {r.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </span>
        <span>
          <span className="v3-review-name">{r.n}</span>
          <span className="v3-review-meta">{r.m}</span>
        </span>
      </figcaption>
    </figure>
  );
}
