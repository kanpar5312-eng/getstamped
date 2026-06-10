import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SunlightLayer } from "@/components/landing/SunlightLayer";
import { VoiceDemo } from "@/components/landing/VoiceDemo";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TimelineFull } from "@/components/landing/TimelineFull";
import { Pricing } from "@/components/landing/Pricing";
import { ForParents } from "@/components/landing/ForParents";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { getWaitlistCount } from "@/app/actions/waitlist";

export default async function Home() {
  const { earlyBirdClaimed } = await getWaitlistCount();

  return (
    <>
      <SunlightLayer />
      <Header />
      <main className="flex-1">
        <Hero />
        <VoiceDemo />
        <Features />
        <HowItWorks />
        <TimelineFull />
        <Pricing earlyBirdClaimed={earlyBirdClaimed} />
        <ForParents />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
