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
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderReferralRewardEmail(input: {
  firstName: string;
  rewardLabel: string;   // e.g. "₹500" or "$8"
  ctaUrl: string;
}): { subject: string; html: string; text: string } {
  const { firstName, rewardLabel, ctaUrl } = input;
  const subject = `You earned a reward on GetStamped.`;
  const greeting = firstName ? `Hi ${esc(firstName)},` : "Hi,";

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${PAPER_SOFT};border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">

        <tr><td style="padding:28px 32px 0 32px;">
          <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${PERSIMMON};font-weight:600;">
            REFERRAL · REWARD EARNED
          </p>
          <h1 style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:30px;line-height:1.18;color:${INK};letter-spacing:-0.01em;">
            Your friend just signed up.<br/>
            Your ${esc(rewardLabel)} credit is ready.
          </h1>
        </td></tr>

        <tr><td style="padding:22px 32px 0 32px;">
          <p style="margin:0 0 14px 0;font-size:15.5px;line-height:1.6;color:${INK};">${greeting}</p>
          <p style="margin:0;font-size:15.5px;line-height:1.65;color:${INK_SOFT};">
            Someone you shared GetStamped with just upgraded. That earned you a
            <strong style="color:${INK};">${esc(rewardLabel)} credit</strong>, automatically applied to your account
            and ready to spend on your next purchase.
          </p>
        </td></tr>

        <tr><td style="padding:26px 32px 28px 32px;">
          <a href="${esc(ctaUrl)}" style="display:inline-block;background:${PERSIMMON};color:${PAPER_SOFT};text-decoration:none;font-weight:500;font-size:14.5px;padding:13px 22px;border-radius:10px;">
            View your credit + share again →
          </a>
        </td></tr>

        <tr><td style="padding:18px 32px 24px 32px;border-top:1px solid ${BORDER};background:${PAPER};">
          <p style="margin:0;font-size:11.5px;line-height:1.55;color:${MUTED};">
            Sent because someone signed up via your referral link.
            Questions go to <a href="mailto:${SUPPORT_EMAIL}" style="color:${INK_SOFT};">${SUPPORT_EMAIL}</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text =
`REFERRAL — REWARD EARNED

Your friend just signed up. Your ${rewardLabel} credit is ready.

${greeting.replace(/<[^>]+>/g, "")}

Someone you shared GetStamped with just upgraded. That earned you a ${rewardLabel} credit, automatically applied to your account and ready to spend on your next purchase.

View your credit + share again:
${ctaUrl}

— GetStamped
Questions? Reply or write ${SUPPORT_EMAIL}.`;

  return { subject, html, text };
}
