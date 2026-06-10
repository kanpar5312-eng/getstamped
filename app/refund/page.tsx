import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy — GetStamped",
  description: "Full refund within 14 days if GetStamped is not useful.",
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      effectiveDate="June 2026"
      intro={
        <p>
          GetStamped costs less than dinner. If it does not help you, you
          should not have to pay for it. The policy below is short on
          purpose.
        </p>
      }
      sections={[
        {
          heading: "Full refund within 14 days",
          body: (
            <p>
              Within 14 days of your purchase, you can request a full
              refund for any reason — or no reason at all. We will refund
              the original payment method within seven business days.
            </p>
          ),
        },
        {
          heading: "How to request",
          body: (
            <p>
              Email <span className="text-ink">hello@getstamped.app</span>{" "}
              with the email address you used to purchase. No forms, no
              survey, no friction. One sentence is fine.
            </p>
          ),
        },
        {
          heading: "When refunds do not apply",
          body: (
            <>
              <p>
                Refunds are not available in the following narrow cases:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  More than 14 days have passed since your original
                  purchase.
                </li>
                <li>
                  The account has been suspended for violating the{" "}
                  <a
                    href="/terms"
                    className="text-ink underline underline-offset-4 hover:text-saffron-deep transition-colors"
                  >
                    Terms of Service
                  </a>
                  .
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "After your visa is stamped",
          body: (
            <p>
              GetStamped is a one-time purchase that includes access until
              your visa is stamped. There are no recurring charges, so
              there is nothing to cancel. Your account stays active for
              reference; you can request data deletion at any time.
            </p>
          ),
        },
      ]}
    />
  );
}
