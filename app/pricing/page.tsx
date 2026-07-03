import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Header } from "@/components/landing/v3/Header";
import { Pricing } from "@/components/landing/v3/Pricing";
import { Styles } from "@/components/landing/v3/Styles";
import { Footer } from "@/components/landing/Footer";
import type { Currency } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — GetStamped",
  description:
    "Phase 1 free forever. One payment unlocks every step through visa stamping — no subscription, no upsells.",
};

export default async function PricingPage() {
  const c = await cookies();
  const stored = c.get("gs_currency")?.value;
  const currency: Currency = stored === "USD" ? "USD" : "INR";

  return (
    <div className="v3-root">
      <Header />
      <main>
        <Pricing currency={currency} />
      </main>
      <Footer />
      <Styles />
    </div>
  );
}
