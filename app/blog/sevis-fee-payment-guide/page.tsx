import type { Metadata } from "next";
import Link from "next/link";
import { BlogPost } from "@/components/blog/BlogPost";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

const URL_PATH = "/blog/sevis-fee-payment-guide";

export const metadata: Metadata = {
  title: "SEVIS Fee Payment Guide for F-1 Students | GetStamped",
  description:
    "How to pay the SEVIS I-901 fee for an F-1 visa: when to pay it, what you need first, how to pay online, and how to keep proof of payment for your interview.",
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: "SEVIS Fee Payment Guide for F-1 Students",
    description:
      "How to pay the SEVIS I-901 fee for an F-1 visa: when to pay, what you need first, and how to keep proof of payment.",
    url: URL_PATH,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEVIS Fee Payment Guide for F-1 Students",
    description: "How to pay the SEVIS I-901 fee for an F-1 visa, step by step.",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "SEVIS Fee Payment Guide for F-1 Students",
          description:
            "How to pay the SEVIS I-901 fee for an F-1 visa: when to pay it, what you need first, and how to keep proof of payment.",
          datePublished: "2026-06-01",
          dateModified: "2026-06-01",
          author: { "@type": "Organization", name: "GetStamped" },
          publisher: { "@type": "Organization", name: "GetStamped" },
          url: `${SITE_URL}${URL_PATH}`,
        }}
      />
      <BlogPost
        title="SEVIS Fee Payment Guide for F-1 Students"
        dek="The SEVIS I-901 fee is a separate payment from your visa application fee, and it has to be paid before you can book your visa interview. Here is what it is, when to pay it, and how."
        publishedDate="June 2026"
        intro={
          <p>
            <strong className="font-medium text-[var(--color-ink)]">
              Every F-1 applicant must pay the SEVIS I-901 fee before
              scheduling a visa interview.
            </strong>{" "}
            It funds the Student and Exchange Visitor Information System
            (SEVIS) that tracks F-1 students, and it is separate from the
            visa application (MRV) fee paid later in the process. As of the
            most recent update, the SEVIS I-901 fee for F-1 students is
            $350 — confirm the exact current amount on the official payment
            site before paying, since government fees change over time.
          </p>
        }
        sections={[
          {
            heading: "What you need before you pay",
            body: (
              <>
                <p>You cannot pay the SEVIS fee until you have:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>A signed Form I-20 from your school&rsquo;s international office (DSO).</li>
                  <li>Your SEVIS ID number, printed on the I-20 (starts with &ldquo;N&rdquo;).</li>
                  <li>Your school&rsquo;s SEVIS school code, also on the I-20.</li>
                </ul>
              </>
            ),
          },
          {
            heading: "Where and how to pay",
            body: (
              <p>
                The SEVIS I-901 fee is paid online through the official
                Student and Exchange Visitor Program payment portal, using
                the SEVIS ID and school code from your I-20. Payment can
                typically be made by credit or debit card, or by other
                methods listed on the payment site for applicants without a
                US-issued card. Always pay through the official government
                portal directly — never through a third party or link sent
                by email.
              </p>
            ),
          },
          {
            heading: "When to pay it",
            body: (
              <p>
                Pay the SEVIS fee after your I-20 is signed but before you
                schedule your visa interview appointment — most consulates
                require proof of SEVIS payment to book the appointment slot.
                Paying at least a few days before you plan to schedule gives
                the payment time to register in the system.
              </p>
            ),
          },
          {
            heading: "Keep your proof of payment",
            body: (
              <p>
                After paying, download and print the payment confirmation
                receipt. Bring it to your visa interview along with your
                I-20 — officers can look up SEVIS payment status directly,
                but a printed receipt avoids any delay if the system is slow
                to reflect a recent payment.
              </p>
            ),
          },
          {
            heading: "If your I-20 is reissued or you change schools",
            body: (
              <p>
                If your SEVIS ID changes — for example, if you transfer
                schools or get a new I-20 — you generally need to pay the
                SEVIS fee again under the new SEVIS ID. Check your I-20&rsquo;s
                SEVIS ID against any prior payment before assuming it still
                applies.
              </p>
            ),
          },
          {
            heading: "Tracking this alongside everything else",
            body: (
              <p>
                The SEVIS fee is one of 47 ordered steps in the F-1 process —
                easy to pay late or duplicate if it is not tracked alongside
                the DS-160, MRV fee, and interview scheduling.
                GetStamped&rsquo;s{" "}
                <Link href="/#features" className="text-[var(--color-accent-deep)] underline underline-offset-2">
                  step-by-step playbook
                </Link>{" "}
                sequences all of it in order, so nothing gets paid twice or
                missed.
              </p>
            ),
          },
        ]}
        related={[
          { title: "DS-160 Common Mistakes to Avoid", href: "/blog/ds-160-common-mistakes" },
          { title: "F-1 Visa Interview Questions 2026", href: "/blog/f1-visa-interview-questions-2026" },
          { title: "F-1 visa questions, answered", href: "/faq" },
        ]}
      />
    </>
  );
}
