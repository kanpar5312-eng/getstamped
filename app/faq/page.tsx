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
        <FAQ />
      </main>
      <Footer />
      <Styles />
    </div>
  );
}
