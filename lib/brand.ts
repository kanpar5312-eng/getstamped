/**
 * Single source of truth for public-facing brand identifiers.
 * Imported by contact pages, footers, support copy, and legal text so a
 * change here propagates everywhere.
 */

/** Official Gmail used for public contact + support. */
export const SUPPORT_EMAIL = "getstamped.online@gmail.com";

/** Same value, formatted as a mailto: href. */
export const SUPPORT_EMAIL_HREF = `mailto:${SUPPORT_EMAIL}`;

/** Display name + email — used where we want the friendly form. */
export const SUPPORT_FROM = `GetStamped <${SUPPORT_EMAIL}>`;

/** Official legal / DPDP / data-rights contact. */
export const LEGAL_EMAIL = "getstampedlegal@gmail.com";
