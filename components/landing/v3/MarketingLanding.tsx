/* ════════════════════════════════════════════════════════════════════════════
   GetStamped — Landing v3 (editorial rebuild)
   ----------------------------------------------------------------------------
   CHANGELOG vs v2 (MacLanding):
   • Drops the macOS desktop metaphor. Marketing surfaces read as a restrained
     editorial site (Linear/Aesop/Stripe register), not a sim.
   • Hero: full-bleed newtrain.mp4, two-line word-stagger serif H1 with
     italic persimmon emphasis on "isn't", trust strip in mono small caps.
   • Playbook: editorial spread (eyebrow + serif H2 + lead) on the left,
     five phase rows with mono meta + persimmon hairline animating its width
     on the right. One Granola-style handwritten arrow annotation.
   • Four product moments (Document Vault, Mock Interview, Parent Share +
     Playbook) replace v2's spotlight stack. CSS-only mocks; alternating
     left/right; 21px Lead body; 3 bullets each + pull quote.
   • Pricing: 3 columns, mono numerals (Geist Mono tabular-nums), 1.5px
     persimmon border + soft shadow on Solo, "Most chosen" chip in tint.
   • Reviews: 6-card editorial grid with two "weight" cards (5-star line).
   • FAQ: documentation-style cards with mono counter + persimmon-tint
     category chip + circular toggle (rotates 180°, flips to persimmon).
   • Closer: persimmon hairline + serif XXL "Take the stamped way." +
     /pass.png with 8s float (killed under reduced-motion).
   • Footer untouched (existing component).
   • Geist Sans (body) + Geist Mono (numbers, eyebrows, meta) added to
     app/layout.tsx; Instrument Serif retained for display.
   ════════════════════════════════════════════════════════════════════════════ */

import { Footer } from "@/components/landing/Footer";
import type { Currency } from "@/lib/pricing";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import { Reviews } from "./Reviews";
import { FAQ } from "./FAQ";
import { StampedCloser } from "./StampedCloser";
import { ScrollTransitions } from "./ScrollTransitions";
import { Styles } from "./Styles";
import { StackedFeatureCards } from "./StackedFeatureCards";
import { VsConsultants } from "./VsConsultants";

type Props = {
  currency: Currency;
  totalSignups: number;
  earlyBirdClaimed: number;
};

/* Real, gated signup count — never a fabricated number. getWaitlistCount()
   already returns 0 when the backing table isn't configured, so hiding on
   totalSignups <= 0 means this only ever shows a true count. */
function LiveSignupLine({ totalSignups }: { totalSignups: number }) {
  if (totalSignups <= 0) return null;
  return (
    <p className="py-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
      {totalSignups.toLocaleString("en-US")} students already building their playbook
    </p>
  );
}

export function MarketingLanding({ currency, totalSignups }: Props) {
  return (
    <div className="v3-root">
      <Header />
      <main>
        <Hero />
        <LiveSignupLine totalSignups={totalSignups} />
        {/* Anchor target for #features / #how-it-works links (Header, Footer,
            Pricing) — kept as a separate no-op marker instead of adding an id
            inside StackedFeatureCards so that component stays untouched. */}
        <span id="features" className="sr-only" aria-hidden="true" />
        {/* Pinned, stacking feature cards come first — they carry the
            full Playbook / Document Vault / Mock Interview / Parent Share
            story right after the hero. */}
        <StackedFeatureCards />
        <VsConsultants />
        {/* Pricing was built (v3/Pricing.tsx) but never wired into this page
            — restoring it here, right after the differentiation section it
            was designed to follow (see VsConsultants.tsx's own comment). */}
        <Pricing currency={currency} />
        <Testimonials />
        {/* Reviews hidden for MVP — fictional testimonials replaced when
            we have ≥3 real student quotes from beta. Re-add <Reviews />
            here when ready. */}
        <FAQ />
        <StampedCloser />
      </main>
      <Footer />
      <ScrollTransitions />
      <Styles />
    </div>
  );
}
