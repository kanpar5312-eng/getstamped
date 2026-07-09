import type { Metadata } from "next";
import { Header } from "@/components/landing/v3/Header";
import { FAQ } from "@/components/landing/v3/FAQ";
import { Styles } from "@/components/landing/v3/Styles";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "F-1 Visa Questions Answered — Common Student Visa FAQs | GetStamped",
  description:
    "Answers to the most common F-1 student visa questions: pricing, AI document checks, mock interview scoring, document safety, refunds, and consulate coverage.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "F-1 Visa Questions Answered | GetStamped",
    description:
      "Answers to the most common F-1 student visa questions — pricing, AI document checks, mock interview scoring, document safety, refunds, and consulate coverage.",
    url: "/faq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F-1 Visa Questions Answered | GetStamped",
    description:
      "Answers to the most common F-1 student visa questions — pricing, AI document checks, mock interviews, and refunds.",
  },
};

export default function FaqPage() {
  return (
    <div className="v3-root">
      <Header />
      <main>
        {/* Same pattern as app/pricing/page.tsx — FAQ is shared with the
            homepage (which already has its own h1 via Hero), so FAQ's
            own heading starts at h2 to avoid a duplicate h1 there.
            Standalone on /faq nothing else provides one. */}
        <h1 className="sr-only">F-1 Visa Questions Answered — GetStamped</h1>
        <FAQ />
      </main>
      <Footer />
      <Styles />
    </div>
  );
}
