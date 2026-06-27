import "server-only";

/* ════════════════════════════════════════════════════════════════════════
   Weekly progress digest — same Ink/Persimmon/Paper inline styling as
   the deadline-reminder template so it renders identically across
   Gmail, Outlook, and Apple Mail.
   ════════════════════════════════════════════════════════════════════════ */

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

export type WeeklyDigestInput = {
  firstName: string;
  stepsDoneThisWeek: number;
  totalSteps: number;
  percentComplete: number;
  nextStepTitle: string | null;
  daysToInterview: number | null;
  ctaUrl: string;
};

export function renderWeeklyDigest(input: WeeklyDigestInput): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    firstName,
    stepsDoneThisWeek,
    totalSteps,
    percentComplete,
    nextStepTitle,
    daysToInterview,
    ctaUrl,
  } = input;

  const subject =
    stepsDoneThisWeek > 0
      ? `You closed ${stepsDoneThisWeek} step${stepsDoneThisWeek === 1 ? "" : "s"} this week.`
      : `Your weekly visa recap is in.`;

  const greeting = firstName ? `Hi ${esc(firstName)},` : "Hi,";

  const interviewLine =
    daysToInterview != null && daysToInterview >= 0
      ? `Interview is in ${daysToInterview} day${daysToInterview === 1 ? "" : "s"}.`
      : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${PAPER_SOFT};border:1px solid ${BORDER};border-radius:14px;">
          <tr>
            <td style="padding:28px 28px 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${PERSIMMON};font-weight:700;">Weekly recap</p>
              <h1 style="margin:14px 0 0;font-size:22px;line-height:1.25;font-weight:600;color:${INK};">${esc(subject)}</h1>
              <p style="margin:14px 0 0;font-size:14px;line-height:1.55;color:${INK_SOFT};">${greeting}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:10px;background:${PAPER};">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:12px;letter-spacing:0.08em;color:${MUTED};text-transform:uppercase;">Progress</p>
                    <p style="margin:6px 0 0;font-size:18px;color:${INK};font-weight:600;">
                      ${stepsDoneThisWeek} / ${totalSteps} steps · ${percentComplete}%
                    </p>
                    ${interviewLine ? `<p style="margin:6px 0 0;font-size:13px;color:${INK_SOFT};">${esc(interviewLine)}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${nextStepTitle ? `
          <tr>
            <td style="padding:18px 28px 0;">
              <p style="margin:0;font-size:12px;letter-spacing:0.08em;color:${MUTED};text-transform:uppercase;">Next up</p>
              <p style="margin:6px 0 0;font-size:15px;color:${INK};">${esc(nextStepTitle)}</p>
            </td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding:24px 28px 28px;">
              <a href="${esc(ctaUrl)}" style="display:inline-block;background:${PERSIMMON};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">Open dashboard →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;border-top:1px solid ${BORDER};">
              <p style="margin:18px 0 0;font-size:11px;color:${MUTED};line-height:1.6;">
                You're receiving this because the weekly summary is on in Settings → Notifications.
                Reply to ${SUPPORT_EMAIL} if anything is off.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text =
    `${greeting}\n\n` +
    `${subject}\n` +
    `Progress: ${stepsDoneThisWeek} / ${totalSteps} steps (${percentComplete}%).\n` +
    (interviewLine ? `${interviewLine}\n` : "") +
    (nextStepTitle ? `Next up: ${nextStepTitle}\n` : "") +
    `\nOpen your dashboard: ${ctaUrl}\n\n` +
    `Mute weekly recaps in Settings → Notifications.\n`;

  return { subject, html, text };
}
