import type { Metadata } from "next";
import Link from "next/link";
import { BlogPost } from "@/components/blog/BlogPost";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

const URL_PATH = "/blog/ds-160-common-mistakes";

export const metadata: Metadata = {
  title: "DS-160 Common Mistakes to Avoid | GetStamped",
  description:
    "The most common DS-160 mistakes that delay or complicate F-1 visa applications — from mismatched names to wrong SEVIS numbers — and how to avoid each one.",
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: "DS-160 Common Mistakes to Avoid",
    description:
      "The most common DS-160 mistakes that delay or complicate F-1 visa applications, and how to avoid each one.",
    url: URL_PATH,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "DS-160 Common Mistakes to Avoid",
    description: "The most common DS-160 mistakes that delay F-1 visa applications, and how to avoid them.",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "DS-160 Common Mistakes to Avoid",
          description:
            "The most common DS-160 mistakes that delay or complicate F-1 visa applications, and how to avoid each one.",
          datePublished: "2026-06-01",
          dateModified: "2026-06-01",
          author: { "@type": "Organization", name: "GetStamped" },
          publisher: { "@type": "Organization", name: "GetStamped" },
          url: `${SITE_URL}${URL_PATH}`,
        }}
      />
      <BlogPost
        title="DS-160 Common Mistakes to Avoid"
        dek="The DS-160 is the online nonimmigrant visa application every F-1 applicant must submit before their interview. Small errors on it are one of the most common causes of delays and extra scrutiny."
        publishedDate="June 2026"
        intro={
          <p>
            <strong className="font-medium text-[var(--color-ink)]">
              The DS-160 form cannot be edited after submission
            </strong>{" "}
            — once you submit it, the only fix for an error is starting a new
            form with a new confirmation number. The mistakes below are the
            ones that come up most often, roughly in order of how much
            trouble they cause.
          </p>
        }
        sections={[
          {
            heading: "Name and passport mismatches",
            body: (
              <p>
                Your name on the DS-160 must match your passport exactly,
                including the order of given name and surname and any
                middle names. A common error is entering a name the way it
                appears on a school transcript or a nickname used casually,
                rather than the exact spelling and order printed in the
                passport&rsquo;s machine-readable zone.
              </p>
            ),
          },
          {
            heading: "Wrong or mismatched SEVIS ID and school code",
            body: (
              <p>
                The SEVIS ID (starts with &ldquo;N&rdquo; followed by nine
                digits) and school code on the DS-160 must match your I-20
                exactly. This is one of the most common data-entry errors,
                because applicants copy it from memory instead of the
                document itself. A mismatch here can cause the interview to
                be delayed while the officer verifies your SEVIS record.
              </p>
            ),
          },
          {
            heading: "Incomplete or inconsistent travel and address history",
            body: (
              <p>
                The DS-160 asks for your address history, prior US visits,
                and any prior visa refusals. Leaving out a previous US trip,
                a prior visa denial, or a past visa (even an expired one)
                creates an inconsistency the officer will ask about directly
                — and an omission reads worse than the underlying fact itself.
              </p>
            ),
          },
          {
            heading: "Uploading the wrong photo specification",
            body: (
              <p>
                The DS-160 photo has strict requirements: a recent photo (
                typically within six months), plain white or off-white
                background, no glasses, and specific pixel dimensions. Photos
                that fail these specs are rejected during submission, which
                wastes time right before an appointment deadline — plan to
                upload your photo well before your target submission date.
              </p>
            ),
          },
          {
            heading: "Not saving the application ID before closing the form",
            body: (
              <p>
                The DS-160 portal times out and does not auto-save reliably.
                Applicants who do not record their Application ID after each
                session sometimes lose partially completed forms and have to
                restart. Write down the Application ID as soon as it appears,
                every session.
              </p>
            ),
          },
          {
            heading: "How to catch these before you submit",
            body: (
              <p>
                Most of these mistakes are simple copy-and-check errors —
                the kind that are easy to miss reading your own form but
                obvious on a second pass. GetStamped&rsquo;s{" "}
                <Link href="/#features" className="text-[var(--color-accent-deep)] underline underline-offset-2">
                  AI document check
                </Link>{" "}
                cross-references your uploaded I-20 against your entered
                details and flags mismatched SEVIS numbers, missing
                signatures, and formatting issues before you submit anything
                official.
              </p>
            ),
          },
        ]}
        related={[
          { title: "F-1 Visa Interview Questions 2026", href: "/blog/f1-visa-interview-questions-2026" },
          { title: "SEVIS Fee Payment Guide", href: "/blog/sevis-fee-payment-guide" },
          { title: "F-1 visa questions, answered", href: "/faq" },
        ]}
      />
    </>
  );
}
