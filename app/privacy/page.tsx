import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — GetStamped",
  description: "How GetStamped collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate="June 2026"
      intro={
        <p>
          GetStamped is built by one person who cares deeply about not abusing
          your data. This policy describes what we collect, why, what we
          deliberately do not keep, and what you can do about it.
        </p>
      }
      sections={[
        {
          heading: "What we collect",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-medium text-ink">Account info</strong> —
                  your name and email address.
                </li>
                <li>
                  <strong className="font-medium text-ink">Document scan results</strong> —
                  a structured checklist only (e.g. &ldquo;signature: verified&rdquo;).
                  Never the document image, never the extracted text.
                </li>
                <li>
                  <strong className="font-medium text-ink">Mock interview transcripts and scores</strong> —
                  the words you spoke during a practice interview and the
                  numeric scores our model produced from them.
                </li>
                <li>
                  <strong className="font-medium text-ink">Usage data</strong> —
                  anonymous product-improvement metrics (which screens were
                  used, error rates, performance). Not joined to your identity.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "What we don't store",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-medium text-ink">Raw document images or PDFs</strong> —
                  deleted within 5 minutes of upload, per our data
                  minimization policy.
                </li>
                <li>
                  <strong className="font-medium text-ink">OCR or extracted text</strong> from
                  documents — never persisted to our database.
                </li>
                <li>
                  <strong className="font-medium text-ink">Any personally identifiable information</strong> beyond
                  your account email and name.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Why we collect it",
          body: (
            <>
              <p>Your data is used for three things, and only three:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Running the product features you signed up for.</li>
                <li>Notifying you about your account and product updates.</li>
                <li>Responding to messages you send us directly.</li>
              </ul>
              <p>
                We do not send marketing emails. We do not sell your data.
                We do not run analytics that profile you across the web.
              </p>
            </>
          ),
        },
        {
          heading: "Third-party AI providers",
          body: (
            <>
              <p>
                We use{" "}
                <strong className="font-medium text-ink">Groq</strong> for
                AI-powered document scanning and mock interview features. By
                default, Groq does not retain customer data for inference
                requests, and we have enabled{" "}
                <strong className="font-medium text-ink">
                  Zero Data Retention (ZDR)
                </strong>{" "}
                on our account for additional protection.
              </p>
              <p>
                We also send Groq only the minimum content needed for each
                feature — a single document image (which we delete from our
                own storage within minutes) or an interview transcript — and
                never your account identity.
              </p>
            </>
          ),
        },
        {
          heading: "Who we share data with",
          body: (
            <>
              <p>
                Your data is stored on third-party infrastructure we have
                chosen specifically for security and privacy practices:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-medium text-ink">Supabase</strong> —
                  database + authenticated storage.
                </li>
                <li>
                  <strong className="font-medium text-ink">Resend</strong> —
                  transactional email delivery.
                </li>
                <li>
                  <strong className="font-medium text-ink">Vercel</strong> —
                  web hosting for the site itself.
                </li>
                <li>
                  <strong className="font-medium text-ink">Groq</strong> —
                  AI inference for document checks and mock interviews (see
                  &ldquo;Third-party AI providers&rdquo; above).
                </li>
              </ul>
              <p>
                We do not share your data with advertisers, brokers, or any
                party not directly required to deliver the service.
              </p>
            </>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You may request deletion of your account and all
                  associated data at any time by emailing{" "}
                  <a
                    href="mailto:getstampedlegal@gmail.com"
                    className="underline underline-offset-2"
                  >
                    getstampedlegal@gmail.com
                  </a>
                  . Requests are actioned within 7 business days.
                </li>
                <li>
                  You may request a copy of the data we hold about you. Send
                  the request to the same address and we will reply within 7
                  business days.
                </li>
                <li>
                  You may ask us to correct anything inaccurate.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Data retention",
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="font-medium text-ink">Documents</strong> —
                deleted within 5 minutes of upload.
              </li>
              <li>
                <strong className="font-medium text-ink">Account data</strong> —
                retained until account deletion is requested.
              </li>
              <li>
                <strong className="font-medium text-ink">Mock interview data</strong> —
                retained until account deletion is requested.
              </li>
            </ul>
          ),
        },
        {
          heading: "Compliance",
          body: (
            <p>
              We comply with India&rsquo;s Digital Personal Data Protection
              Act (DPDP Act) as a Data Fiduciary. Our document handling
              follows the Act&rsquo;s data minimization principle: raw
              document files are processed transiently and never retained.
            </p>
          ),
        },
        {
          heading: "Cookies and tracking",
          body: (
            <p>
              The site uses no analytics cookies and no third-party
              trackers. The only cookies set by this site are essential
              cookies required for the product to function. If we add
              analytics in the future, this policy will be updated and you
              will be notified.
            </p>
          ),
        },
        {
          heading: "Children",
          body: (
            <p>
              GetStamped is designed for prospective university students.
              Users must be 18 or older, or using the service with the
              consent and supervision of a parent or guardian (we confirm
              this at signup). We do not knowingly collect data from anyone
              under 13. If you believe we have, email us and we will delete
              it.
            </p>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <p>
              If we change anything material, we will email all account
              holders before the change takes effect. The effective date at
              the top of this page will be updated.
            </p>
          ),
        },
      ]}
    />
  );
}
