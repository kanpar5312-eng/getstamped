import Link from "next/link";
import { Eyebrow } from "./primitives/Eyebrow";

export function StampedCloser() {
  return (
    <section id="closer" className="v3-section v3-closer">
      <span className="v3-closer-glow" aria-hidden />
      <span className="v3-closer-rule" aria-hidden />
      <Eyebrow className="v3-text-center">Stamped.</Eyebrow>
      <h2 className="v3-h1-closer">
        Take the <span className="v3-italic v3-persimmon">stamped</span> way.
      </h2>
      <p className="v3-lead v3-text-center v3-mx-auto v3-max-reading v3-mt-6">
        Forty-seven steps. Phase 1 free forever. Upgrade only when you hit
        Phase 2.
      </p>
      <div className="v3-closer-image">
        <video
          src="/pass.mp4"
          poster="/pass.png"
          width={980}
          height={620}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label="Navy passport with GetStamped emblem and glowing persimmon F-1 stamp"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
      <div className="v3-closer-ctas">
        <Link href="/sign-up" className="v3-pill">Start free</Link>
        <Link href="#pricing" className="v3-ghost">See pricing</Link>
      </div>
    </section>
  );
}
