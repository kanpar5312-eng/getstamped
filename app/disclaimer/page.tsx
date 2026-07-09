import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer — GetStamped",
  description: "GetStamped is informational only. Not legal advice.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      effectiveDate="June 2026"
      intro={
        <p>
          Read this once. It applies to everything else on the site, in the
          product, and in any email we send you.
        </p>
      }
      sections={[
        {
          heading: "GetStamped is informational only",
          body: (
            <p>
              Everything in the GetStamped product — including the 47-step
              checklist, instructions, document templates, AI responses, mock
              interview feedback, and email reminders — is provided as
              educational information. It is not a substitute for advice from a
              licensed immigration attorney or accredited representative.
            </p>
          ),
        },
        {
          heading: "We are not immigration attorneys",
          body: (
            <p>
              GetStamped is built by a small team that includes students and
              technologists. We have spent significant time studying the F-1
              visa process, but none of us is licensed to practice
              immigration law. If your situation involves prior visa denials,
              criminal record, complex employment history, or any other
              complicating factor, consult a licensed attorney.
            </p>
          ),
        },
        {
          heading: "We are not affiliated with any government agency",
          body: (
            <>
              <p>
                GetStamped is an independent product. We are not affiliated
                with, endorsed by, or connected to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The US Department of State</li>
                <li>US Citizenship and Immigration Services (USCIS)</li>
                <li>The US Embassy or any consulate</li>
                <li>The Student and Exchange Visitor Program (SEVP)</li>
                <li>Any university or educational institution</li>
              </ul>
              <p>
                When official information conflicts with what you read here,
                the official information is authoritative.
              </p>
            </>
          ),
        },
        {
          heading: "Visa decisions are made solely by consular officers",
          body: (
            <p>
              No tool, consultant, or service can guarantee a visa approval.
              The decision rests entirely with the US consular officer who
              interviews you. GetStamped helps you prepare; the outcome is not
              and cannot be in our control.
            </p>
          ),
        },
        {
          heading: "Policies change",
          body: (
            <p>
              US immigration policy, consulate procedures, fees, and document
              requirements shift over time — sometimes with little notice.
              We work hard to keep the 47 steps current, but always verify
              critical details (current fees, forms, consulate-specific
              instructions) against the official source — typically{" "}
              <a
                href="https://travel.state.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent-deep)] transition-colors"
              >
                travel.state.gov
              </a>{" "}
              and your university&rsquo;s international office — before
              acting on them.
            </p>
          ),
        },
        {
          heading: "AI responses may be wrong",
          body: (
            <p>
              The Ask feature and Mock Interview feedback are powered by large
              language models. They can be confidently wrong about specific
              facts, especially recent policy changes. Treat AI output as a
              starting point, not as authoritative guidance.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the maximum extent permitted by law, GetStamped is not
              liable for any visa denial, missed deadline, financial loss,
              educational disruption, or other harm arising from your use of
              the product. Your total remedy in any dispute is limited to the
              amount you paid us in the 12 months preceding the claim — which
              may be zero.
            </p>
          ),
        },
        {
          heading: "When to ignore us and call a lawyer",
          body: (
            <>
              <p>Get a licensed attorney if any of the following apply:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You have a prior visa denial.</li>
                <li>You have been arrested, charged, or convicted of any offense.</li>
                <li>You have prior immigration violations (overstay, unauthorized work).</li>
                <li>You are applying from a country under heightened US security review.</li>
                <li>Your case involves dependents, spouses, or unusual sponsor arrangements.</li>
              </ul>
            </>
          ),
        },
      ]}
    />
  );
}
