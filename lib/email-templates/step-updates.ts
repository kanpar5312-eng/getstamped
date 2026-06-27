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

export type StepUpdateInput = {
  firstName: string;
  updatedSteps: { number: number; title: string }[];
  ctaUrl: string;
};

export function renderStepUpdateEmail(input: StepUpdateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { firstName, updatedSteps, ctaUrl } = input;
  const subject =
    updatedSteps.length === 1
      ? `We refreshed step ${updatedSteps[0].number}: ${updatedSteps[0].title}`
      : `We refreshed ${updatedSteps.length} steps you've already completed`;

  const greeting = firstName ? `Hi ${esc(firstName)},` : "Hi,";

  const list = updatedSteps
    .map(
      (s) =>
        `<li style="margin:6px 0;font-size:14px;color:${INK};">
          <strong>Step ${s.number}:</strong> ${esc(s.title)}
        </li>`,
    )
    .join("");

  const listText = updatedSteps.map((s) => ` • Step ${s.number}: ${s.title}`).join("\n");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PAPER_SOFT};border:1px solid ${BORDER};border-radius:14px;">
        <tr><td style="padding:28px 28px 0;">
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PERSIMMON};font-weight:700;">Step refreshed</p>
          <h1 style="margin:14px 0 0;font-size:22px;line-height:1.25;font-weight:600;color:${INK};">${esc(subject)}</h1>
          <p style="margin:14px 0 0;font-size:14px;line-height:1.55;color:${INK_SOFT};">${greeting}</p>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:${INK_SOFT};">
            We just updated the content of ${updatedSteps.length === 1 ? "this step" : "these steps"} you'd already completed. Worth a 30-second look in case anything material changed.
          </p>
        </td></tr>
        <tr><td style="padding:8px 28px 0;">
          <ul style="margin:8px 0 0;padding-left:18px;color:${INK};">${list}</ul>
        </td></tr>
        <tr><td style="padding:24px 28px 28px;">
          <a href="${esc(ctaUrl)}" style="display:inline-block;background:${PERSIMMON};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">Open dashboard →</a>
        </td></tr>
        <tr><td style="padding:0 28px 24px;border-top:1px solid ${BORDER};">
          <p style="margin:18px 0 0;font-size:11px;color:${MUTED};line-height:1.6;">
            You're receiving this because step-content updates are on in Settings → Notifications.
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
    `${listText}\n\n` +
    `Open your dashboard: ${ctaUrl}\n\n` +
    `Mute step-content updates in Settings → Notifications.\n`;

  return { subject, html, text };
}
