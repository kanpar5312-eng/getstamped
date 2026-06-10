import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — GetStamped",
  description: "The terms under which you may use GetStamped.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate="June 2026"
      intro={
        <p>
          These terms apply to anyone who joins the GetStamped waitlist or
          uses the product after launch. By using the site, you agree to
          what is written below.
        </p>
      }
      sections={[
        {
          heading: "What GetStamped is",
          body: (
            <p>
              GetStamped is a guided checklist and reference tool for the
              United States F-1 student visa process. It is an educational
              resource. It is not legal advice, immigration counsel, or a
              substitute for the official information published by the US
              Department of State.
            </p>
          ),
        },
        {
          heading: "Eligibility",
          body: (
            <p>
              You may join the waitlist if you are at least 13 years old.
              You may use the product after launch if you are at least 17
              years old, or if a parent or guardian is using it on your
              behalf.
            </p>
          ),
        },
        {
          heading: "Waitlist commitment",
          body: (
            <p>
              Joining the waitlist does not require a payment. The
              early-bird price of $9 will be honored for the first 100
              signups once payments are enabled. After that, the standard
              price of $19 will apply. Pricing may change for future
              cohorts but will not change for users who have already paid.
            </p>
          ),
        },
        {
          heading: "Accuracy",
          body: (
            <p>
              We work hard to keep the 47-step process current with US visa
              requirements, but immigration policies change. You are
              responsible for verifying critical information — particularly
              forms, fees, and consulate-specific instructions — against
              the official source before acting on it. GetStamped is not
              liable for outcomes resulting from outdated or incorrect
              third-party information.
            </p>
          ),
        },
        {
          heading: "Refunds",
          body: (
            <p>
              After launch, every paid plan includes a full refund within
              14 days of purchase if the product is not useful to you. See
              the{" "}
              <Link
                href="/refund"
                className="text-ink underline underline-offset-4 hover:text-saffron-deep transition-colors"
              >
                Refund Policy
              </Link>{" "}
              for details.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the service to misrepresent identity or documents.</li>
                <li>
                  Resell, redistribute, or scrape the content for commercial
                  purposes without written permission.
                </li>
                <li>
                  Attempt to break, abuse, or disrupt the service for other
                  users.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Termination",
          body: (
            <p>
              We may suspend access if you violate these terms. You may
              delete your account at any time by emailing
              hello@getstamped.app.
            </p>
          ),
        },
        {
          heading: "Disclaimer of warranty",
          body: (
            <p>
              GetStamped is provided as is. We make no warranty that the
              product will be uninterrupted or error-free. To the extent
              permitted by law, our total liability is limited to what you
              paid in the twelve months before the claim.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of the jurisdiction in
              which GetStamped is registered. Any disputes will be resolved
              there. We will update this section once the company is
              formally incorporated.
            </p>
          ),
        },
      ]}
    />
  );
}
