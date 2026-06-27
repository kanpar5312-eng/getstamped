import "server-only";

const INK         = "#1C1B1A";
const INK_SOFT    = "#4A4844";
const PAPER       = "#FAF6EE";
const PAPER_SOFT  = "#FFFFFF";
const BORDER      = "#E6DFCC";
const PERSIMMON   = "#FF5B2E";
const MUTED       = "#857F73";

const SUPPORT_EMAIL = "getstamped.online@gmail.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ProductNewsInput = {
  firstName: string;
  subject: string;
  /** Plain text body — newlines preserved as <p> breaks in HTML. */
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export function renderProductNews(input: ProductNewsInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { firstName, subject, bodyText, ctaLabel, ctaUrl } = input;
  const greeting = firstName ? `Hi ${esc(firstName)},` : "Hi,";

  const paragraphsHtml = bodyText
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:${INK};">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PAPER_SOFT};border:1px solid ${BORDER};border-radius:14px;">
        <tr><td style="padding:28px 28px 0;">
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PERSIMMON};font-weight:700;">From GetStamped</p>
          <h1 style="margin:14px 0 0;font-size:22px;line-height:1.25;font-weight:600;color:${INK};">${esc(subject)}</h1>
          <p style="margin:14px 0 0;font-size:14px;line-height:1.55;color:${INK_SOFT};">${greeting}</p>
          ${paragraphsHtml}
        </td></tr>
        ${ctaUrl && ctaLabel ? `
        <tr><td style="padding:24px 28px 28px;">
          <a href="${esc(ctaUrl)}" style="display:inline-block;background:${PERSIMMON};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">${esc(ctaLabel)}</a>
        </td></tr>
        ` : `<tr><td style="padding:24px 28px 0;"></td></tr>`}
        <tr><td style="padding:0 28px 24px;border-top:1px solid ${BORDER};">
          <p style="margin:18px 0 0;font-size:11px;color:${MUTED};line-height:1.6;">
            You're receiving this because Product news is on in Settings → Notifications.
            Reply to ${SUPPORT_EMAIL} if anything is off.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text =
    `${greeting}\n\n` +
    `${subject}\n\n` +
    `${bodyText}\n\n` +
    (ctaUrl && ctaLabel ? `${ctaLabel}: ${ctaUrl}\n\n` : "") +
    `Mute Product news in Settings → Notifications.\n`;

  return { subject, html, text };
}
