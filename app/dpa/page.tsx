import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Data Processing Agreement — GetStamped",
  description:
    "How GetStamped processes personal data on behalf of its users, including categories of data, sub-processors, security measures, and data subject rights.",
};

/**
 * Data Processing Agreement (Article 28-style).
 * This is a starting point — recommend a privacy attorney review before
 * processing data for users in the EU/UK or California at any meaningful scale.
 */
export default function DPAPage() {
  return (
    <LegalPage
      title="Data Processing Agreement"
      effectiveDate="June 2026"
      intro={
        <>
          <p>
            This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the
            agreement between you (the &ldquo;Customer&rdquo;) and GetStamped
            (&ldquo;Processor&rdquo;), and governs the processing of personal
            data carried out by GetStamped on the Customer&rsquo;s behalf when
            using the product.
          </p>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            Where this DPA conflicts with the GetStamped Privacy Policy, the
            stricter clause applies. Capitalised terms not defined here have
            the meaning given in the GDPR (Regulation (EU) 2016/679) and, where
            applicable, the UK GDPR and the California Consumer Privacy Act.
          </p>
        </>
      }
      sections={[
        {
          heading: "1. Definitions",
          body: (
            <>
              <p>
                <strong>&ldquo;Personal Data&rdquo;</strong> means any
                information relating to an identified or identifiable natural
                person processed by GetStamped on the Customer&rsquo;s behalf.
              </p>
              <p>
                <strong>&ldquo;Processing&rdquo;</strong> means any operation
                performed on Personal Data — collection, storage, retrieval,
                use, disclosure, erasure, etc.
              </p>
              <p>
                <strong>&ldquo;Sub-processor&rdquo;</strong> means any third
                party engaged by GetStamped to process Personal Data on the
                Customer&rsquo;s behalf.
              </p>
              <p>
                <strong>&ldquo;Data Subject&rdquo;</strong> means the
                individual to whom the Personal Data relates — typically the
                Customer themselves and, where applicable, household members
                granted access to a shared plan.
              </p>
            </>
          ),
        },
        {
          heading: "2. Roles and scope",
          body: (
            <>
              <p>
                The Customer is the <strong>Controller</strong> of Personal
                Data they submit to GetStamped. GetStamped is the{" "}
                <strong>Processor</strong>, acting only on the Customer&rsquo;s
                documented instructions, which are conveyed through use of the
                product features and the Customer&rsquo;s account settings.
              </p>
              <p>
                This DPA applies to the processing of Personal Data the
                Customer submits to GetStamped, including: account
                identifiers, profile information, application progress,
                uploaded documents, AI conversation transcripts, mock interview
                recordings and transcripts, and parent-share metadata.
              </p>
            </>
          ),
        },
        {
          heading: "3. Categories of data processed",
          body: (
            <>
              <p>The categories of Personal Data processed are:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  <strong>Identity:</strong> first and last name, legal
                  signatory name on the Terms acceptance record, email
                  address.
                </li>
                <li>
                  <strong>Application context:</strong> country of citizenship,
                  destination university, intended intake term, program type,
                  consulate location, interview date, funding source.
                </li>
                <li>
                  <strong>Product activity:</strong> step completion status,
                  step activity timestamps, mock interview session
                  transcripts and scores, AI question/answer history,
                  notification preferences.
                </li>
                <li>
                  <strong>Uploaded content:</strong> documents the Customer
                  uploads to the document vault (financial statements,
                  transcripts, photos, etc.), stored as object data in
                  encrypted Supabase Storage buckets scoped to the
                  Customer&rsquo;s user ID.
                </li>
                <li>
                  <strong>Technical logs:</strong> IP address, user agent, and
                  request timestamps captured for security and abuse-prevention
                  purposes by infrastructure providers.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "4. Sub-processors",
          body: (
            <>
              <p>
                GetStamped engages the following Sub-processors. The Customer
                consents to these engagements as a condition of using the
                product. We will notify Customers at least 30 days before
                adding or replacing a Sub-processor; objections can be raised
                by emailing{" "}
                <a
                  href="mailto:legal@getstamped.app"
                  className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
                >
                  legal@getstamped.app
                </a>
                .
              </p>

              <div className="mt-4 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] overflow-hidden">
                <table className="w-full text-[14px]">
                  <thead className="bg-[var(--color-paper-deep)] text-[var(--color-ink-soft)]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Sub-processor</th>
                      <th className="px-3 py-2 text-left font-medium">Purpose</th>
                      <th className="px-3 py-2 text-left font-medium">Region</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    <tr>
                      <td className="px-3 py-2.5 font-medium">Supabase</td>
                      <td className="px-3 py-2.5">Database, authentication, object storage, realtime</td>
                      <td className="px-3 py-2.5">US / EU regions</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-medium">Vercel</td>
                      <td className="px-3 py-2.5">Application hosting, edge network, server-side request handling</td>
                      <td className="px-3 py-2.5">Global edge, US-primary</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-medium">Groq</td>
                      <td className="px-3 py-2.5">AI inference for the Ask product and mock interview scoring</td>
                      <td className="px-3 py-2.5">US</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-medium">Resend</td>
                      <td className="px-3 py-2.5">Transactional email delivery (verification, reminders, exports)</td>
                      <td className="px-3 py-2.5">US</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-medium">Stripe / Razorpay</td>
                      <td className="px-3 py-2.5">Payment processing (engaged only at checkout — handled by them as independent Controllers)</td>
                      <td className="px-3 py-2.5">US / IN</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
                GetStamped has executed each Sub-processor&rsquo;s standard DPA
                or Article 28 terms where available. Copies can be requested
                via legal@getstamped.app.
              </p>
            </>
          ),
        },
        {
          heading: "5. Processor obligations",
          body: (
            <>
              <p>GetStamped will:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  Process Personal Data only on the Customer&rsquo;s documented
                  instructions, including with regard to transfers outside the
                  EEA / UK.
                </li>
                <li>
                  Ensure that personnel authorised to process Personal Data are
                  bound by appropriate confidentiality undertakings.
                </li>
                <li>
                  Implement and maintain the technical and organisational
                  security measures described in Section 6 below.
                </li>
                <li>
                  Engage Sub-processors only under contract terms providing
                  protections substantially similar to those in this DPA.
                </li>
                <li>
                  Assist the Customer in responding to Data Subject requests,
                  data protection impact assessments, and consultations with
                  supervisory authorities.
                </li>
                <li>
                  Notify the Customer without undue delay of any Personal Data
                  breach affecting the Customer&rsquo;s data, with detail
                  sufficient to meet the Customer&rsquo;s notification
                  obligations under GDPR Article 33.
                </li>
                <li>
                  Delete or return all Personal Data at the end of the
                  service, in line with Section 9 below.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. Security measures",
          body: (
            <>
              <p>GetStamped maintains the following measures:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  <strong>Encryption in transit</strong> — TLS 1.2 or higher
                  for all client-server and server-server communication.
                </li>
                <li>
                  <strong>Encryption at rest</strong> — AES-256 on all
                  Supabase-managed databases and Storage buckets.
                </li>
                <li>
                  <strong>Access control</strong> — Row-Level Security policies
                  scoped to <code>auth.uid()</code> on every user-data table;
                  service-role keys held only in server-side environment and
                  rotated on personnel change.
                </li>
                <li>
                  <strong>Authentication</strong> — Supabase Auth with email
                  verification mandatory; password storage via bcrypt.
                </li>
                <li>
                  <strong>Audit logging</strong> — A{" "}
                  <code>step_activity</code> table records significant Data
                  Subject actions with timestamps for retrospective review.
                </li>
                <li>
                  <strong>Sub-processor diligence</strong> — Each
                  Sub-processor maintains SOC 2 Type II or equivalent
                  attestation.
                </li>
                <li>
                  <strong>Disaster recovery</strong> — Supabase point-in-time
                  recovery enabled with a 7-day recovery window.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "7. International transfers",
          body: (
            <>
              <p>
                Some Sub-processors are located in the United States. Where
                Personal Data is transferred outside the EEA / UK / Switzerland,
                GetStamped relies on:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  The European Commission&rsquo;s Standard Contractual Clauses
                  (Module 2 or 3 as appropriate), incorporated by reference
                  into each Sub-processor&rsquo;s DPA.
                </li>
                <li>
                  The UK International Data Transfer Addendum where the
                  Customer is in the UK.
                </li>
                <li>
                  EU-US and UK-US Data Privacy Framework certifications where
                  the Sub-processor maintains them.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "8. Data Subject rights",
          body: (
            <>
              <p>
                The Customer can exercise the following rights directly inside
                the product, with no separate request needed:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  <strong>Access &amp; portability</strong> — Settings →
                  Account → Export my data. Returns a JSON archive of all
                  Personal Data held about the Customer.
                </li>
                <li>
                  <strong>Rectification</strong> — Profile, Application, and
                  Plan tabs in Settings.
                </li>
                <li>
                  <strong>Erasure</strong> — Settings → Danger zone →{" "}
                  Delete account. A 30-day grace window applies; signing in
                  during the window cancels deletion.
                </li>
                <li>
                  <strong>Restriction / objection</strong> — Email{" "}
                  <a
                    href="mailto:legal@getstamped.app"
                    className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    legal@getstamped.app
                  </a>
                  ; we respond within 30 days.
                </li>
                <li>
                  <strong>Withdrawal of consent</strong> — Available for
                  marketing emails via Settings → Notifications. Withdrawal
                  does not affect lawfulness of prior processing.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "9. Term, return, and deletion of data",
          body: (
            <>
              <p>
                This DPA remains in effect for the duration of the
                Customer&rsquo;s use of GetStamped. On termination:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[15px]">
                <li>
                  Active accounts that delete their account enter a 30-day
                  grace period during which data is retained but not
                  processed for new purposes; reactivation cancels deletion.
                </li>
                <li>
                  After the grace period, all Personal Data is irreversibly
                  deleted from Supabase databases, Storage buckets, and AI
                  conversation logs within 30 days.
                </li>
                <li>
                  Backups age out within 30 additional days as Supabase
                  point-in-time recovery retention expires.
                </li>
                <li>
                  Limited records may be retained where required by law (e.g.
                  tax records of paid transactions for 7 years).
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "10. Audit and contact",
          body: (
            <>
              <p>
                On reasonable written notice (no more than once per calendar
                year except where compelled by a supervisory authority), the
                Customer may request information demonstrating GetStamped&rsquo;s
                compliance with this DPA. GetStamped will respond within 30
                days with summary documentation; full third-party audit reports
                can be shared under NDA.
              </p>
              <p>
                Data protection contact:{" "}
                <a
                  href="mailto:legal@getstamped.app"
                  className="text-[var(--color-accent-deep)] hover:text-[var(--color-accent)] transition-colors"
                >
                  legal@getstamped.app
                </a>
                .
              </p>
            </>
          ),
        },
        {
          heading: "11. Changes to this DPA",
          body: (
            <>
              <p>
                Material changes will be notified to the Customer at least 30
                days in advance via the email address on file. Continued use
                of GetStamped after the notice period constitutes acceptance.
                Previous versions are archived and available on request.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
