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
          your data. This policy describes what we collect, why, and what
          you can do about it.
        </p>
      }
      sections={[
        {
          heading: "What we collect",
          body: (
            <>
              <p>
                When you join the waitlist, we collect your email address.
                Optional fields — country of origin, intended intake term,
                and university name — are collected only if you choose to
                share them.
              </p>
              <p>
                Once GetStamped launches, we will additionally store the
                progress data you create inside the product (which steps you
                have completed, notes you add, documents you upload). This
                policy will be updated before that data is collected.
              </p>
            </>
          ),
        },
        {
          heading: "Why we collect it",
          body: (
            <>
              <p>Your email is used for three things, and only three:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Confirming your spot on the waitlist.</li>
                <li>
                  Notifying you once when GetStamped opens for early access.
                </li>
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
          heading: "Who we share it with",
          body: (
            <>
              <p>
                Your data is stored on third-party infrastructure we have
                chosen specifically for security and privacy practices:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="font-medium text-ink">Convex</strong> —
                  database hosting for waitlist records.
                </li>
                <li>
                  <strong className="font-medium text-ink">Resend</strong> —
                  transactional email delivery for the welcome and launch
                  notifications.
                </li>
                <li>
                  <strong className="font-medium text-ink">Vercel</strong> —
                  web hosting for the site itself.
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
            <p>
              You can request a copy of your data, request deletion, or ask
              us to correct anything inaccurate by emailing
              hello@getstamped.app. We will respond within seven days.
              Deletion requests are honored within fourteen days.
            </p>
          ),
        },
        {
          heading: "Cookies and tracking",
          body: (
            <p>
              The landing page uses no analytics cookies and no third-party
              trackers. The only cookies set by this site are essential
              cookies required for the waitlist form to function. If we add
              analytics in the future, this policy will be updated and you
              will be notified.
            </p>
          ),
        },
        {
          heading: "Children",
          body: (
            <p>
              GetStamped is designed for prospective university students,
              who are typically 17 and older. We do not knowingly collect
              data from anyone under 13. If you believe we have, email us
              and we will delete it.
            </p>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <p>
              If we change anything material, we will email everyone on the
              waitlist before the change takes effect. The effective date at
              the top of this page will be updated.
            </p>
          ),
        },
      ]}
    />
  );
}
