import { CinematicHero } from "@/components/landing/CinematicHero";
import { getWaitlistCount } from "@/app/actions/waitlist";

export async function Hero() {
  const { totalSignups, earlyBirdClaimed } = await getWaitlistCount();
  return (
    <CinematicHero
      totalSignups={totalSignups}
      earlyBirdClaimed={earlyBirdClaimed}
    />
  );
}
