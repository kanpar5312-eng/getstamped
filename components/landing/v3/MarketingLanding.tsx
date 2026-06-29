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
import { Testimonials } from "./Testimonials";
import { Pricing } from "./Pricing";
import { Reviews } from "./Reviews";
import { FAQ } from "./FAQ";
import { StampedCloser } from "./StampedCloser";
import { ScrollTransitions } from "./ScrollTransitions";
import { Styles } from "./Styles";
import { StackedFeatureCards } from "./StackedFeatureCards";

type Props = {
  currency: Currency;
  totalSignups: number;
  earlyBirdClaimed: number;
};

export function MarketingLanding({ currency }: Props) {
  return (
    <div className="v3-root">
      <Header />
      <main>
        <Hero />
        {/* Pinned, stacking feature cards come first — they carry the
            full Playbook / Document Vault / Mock Interview / Parent Share
            story right after the hero. */}
        <StackedFeatureCards />
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
