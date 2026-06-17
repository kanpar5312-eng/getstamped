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
import { Playbook } from "./Playbook";
import { DocumentVault } from "./DocumentVault";
import { MockInterview } from "./MockInterview";
import { ParentShare } from "./ParentShare";
import { Pricing } from "./Pricing";
import { Reviews } from "./Reviews";
import { FAQ } from "./FAQ";
import { StampedCloser } from "./StampedCloser";
import { ScrollTransitions } from "./ScrollTransitions";
import { SectionDivider } from "./SectionDivider";
import { TrustStrip } from "./TrustStrip";
import { FeatureCycle } from "./FeatureCycle";
import { ProblemSlam } from "./ProblemSlam";
import { FinalCTA } from "./FinalCTA";
import { Styles } from "./Styles";

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
        <SectionDivider label="DOCUMENT RECEIVED" bg="paper" />
        <TrustStrip />
        <SectionDivider label="FORM I-20 VERIFIED" bg="ink" />
        <FeatureCycle />
        <Playbook />
        <DocumentVault />
        <MockInterview />
        <ParentShare />
        <SectionDivider label="REVIEW COMPLETE" bg="ink" />
        <ProblemSlam />
        <Pricing currency={currency} />
        <SectionDivider label="APPROVED FOR ENTRY" bg="paper" />
        <Reviews />
        <FAQ />
        <StampedCloser />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollTransitions />
      <Styles />
    </div>
  );
}
