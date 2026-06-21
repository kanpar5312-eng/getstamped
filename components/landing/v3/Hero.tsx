import { CTA } from "./primitives/CTA";
import { HeroTourButton } from "./HeroTourButton";

type Word = { text: string; italic?: boolean };

const LINE_1: Word[] = [
  { text: "The" },
  { text: "visa" },
  { text: "is" },
  { text: "small." },
];

const LINE_2: Word[] = [
  { text: "The" },
  { text: "journey" },
  { text: "isn’t.", italic: true },
];

export function Hero() {
  let n = 0;
  // Words are individual spans for the staggered fade-in animation; the
  // flex parent uses `gap` for spacing, but we also emit a real space
  // text node between siblings so the line reads correctly even if a
  // browser ever collapses the flex gap or the layout falls back to
  // inline rendering.
  const render = (w: Word, i: number, arr: Word[]) => {
    const idx = n++;
    return (
      <span key={`wf-${idx}`}>
        <span
          className={`v3-hero-word${w.italic ? " v3-hero-italic" : ""}`}
          style={{ animationDelay: `${200 + idx * 80}ms` }}
        >
          {w.text}
        </span>
        {i < arr.length - 1 ? " " : null}
      </span>
    );
  };
  return (
    <section className="v3-hero" aria-label="Hero">
      {/* macOS-window-style screen frame around the hero video */}
      <div className="v3-hero-screen" aria-hidden="false">
        <div className="v3-hero-chrome" aria-hidden="true">
          <span className="v3-hero-lights">
            <span className="v3-hero-light v3-hero-light-r" />
            <span className="v3-hero-light v3-hero-light-y" />
            <span className="v3-hero-light v3-hero-light-g" />
          </span>
          <span className="v3-hero-title">Welcome.mdx — GetStamped</span>
          <span className="v3-hero-actions">
            <span className="v3-hero-action" />
            <span className="v3-hero-action" />
            <span className="v3-hero-action" />
          </span>
        </div>
        <div className="v3-hero-stage">
          <video
            className="v3-hero-video"
            src="/newtrain.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="v3-hero-vignette" aria-hidden />
          <div className="v3-hero-inner">
            <p className="v3-hero-eyebrow">
              <span className="v3-hero-eyebrow-text">F-1 Student Visa · End-to-End</span>
              <span className="v3-hero-eyebrow-rule" aria-hidden />
            </p>
            <h1 className="v3-hero-h1">
              <span className="v3-hero-line">{LINE_1.map(render)}</span>
              <span className="v3-hero-line">{LINE_2.map(render)}</span>
            </h1>
            <p className="v3-hero-sub">
              Forty-seven ordered steps. AI document checks trained on real consular
              failure modes. Voice mock interviews scored like the real thing. One
              workspace until your passport is stamped.
            </p>
            <div className="v3-hero-ctas">
              <CTA href="/sign-up" tone="primary" size="lg">
                Start free — Phase 1 forever
              </CTA>
              <HeroTourButton />
            </div>
            <ul className="v3-hero-trust" role="list">
              <li>47 ordered steps</li>
              <li aria-hidden />
              <li>200+ real F-1 questions</li>
              <li aria-hidden />
              <li>One-time payment</li>
            </ul>
          </div>
        </div>
      </div>
      <span className="v3-scroll-cue" aria-hidden />
    </section>
  );
}
