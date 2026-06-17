import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ContactClient } from "@/components/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact — GetStamped",
  description:
    "Reach out about your F-1 application, billing, or a bug. Replies within 24 hours from a real person.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-32 lg:pt-40 pb-24 lg:pb-32 bg-[var(--color-paper)]">
        <ContactClient />
      </main>
      <Footer />
    </>
  );
}
