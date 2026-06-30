/* ════════════════════════════════════════════════════════════════════════
   Document upload privacy consent — current version constant.

   DPDP Act compliance — affirmative consent.

   When the modal text materially changes (different retention promise,
   different processor disclosed, etc.), bump this string. Existing
   users will then see the modal again because their stored
   profiles.document_consent_version no longer matches.
   ════════════════════════════════════════════════════════════════════════ */
export const DOCUMENT_CONSENT_VERSION = "document_upload_privacy_v1";
