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

export function renderFamilyInviteEmail(input: {
  ownerFirstName: string;
  joinUrl: string;
}): { subject: string; html: string; text: string } {
  const { ownerFirstName, joinUrl } = input;
  const owner = ownerFirstName || "A GetStamped user";
  const subject = `${owner} invited you to their GetStamped Family plan`;

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${PAPER_SOFT};border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">

        <tr><td style="padding:28px 32px 0 32px;">
          <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${PERSIMMON};font-weight:600;">
            FAMILY PLAN · INVITE
          </p>
          <h1 style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.2;color:${INK};letter-spacing:-0.01em;">
            ${esc(owner)} added you to their Family plan on GetStamped.
          </h1>
        </td></tr>

        <tr><td style="padding:22px 32px 0 32px;">
          <p style="margin:0;font-size:15.5px;line-height:1.65;color:${INK_SOFT};">
            That gets you your own account with all 47 F-1 visa steps unlocked,
            unlimited AI Q&amp;A, and up to 6 voice mock interviews a week —
            already paid for, nothing to enter.
          </p>
        </td></tr>

        <tr><td style="padding:26px 32px 28px 32px;">
          <a href="${esc(joinUrl)}" style="display:inline-block;background:${PERSIMMON};color:${PAPER_SOFT};text-decoration:none;font-weight:500;font-size:14.5px;padding:13px 22px;border-radius:10px;">
            Accept and set up your account →
          </a>
        </td></tr>

        <tr><td style="padding:18px 32px 24px 32px;border-top:1px solid ${BORDER};background:${PAPER};">
          <p style="margin:0;font-size:11.5px;line-height:1.55;color:${MUTED};">
            Sent because ${esc(owner)} entered your email address in their GetStamped
            Family plan settings. If you weren&rsquo;t expecting this, you can ignore it —
            the link only works once. Questions: <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${owner} added you to their Family plan on GetStamped.

That gets you your own account with all 47 F-1 visa steps unlocked, unlimited AI Q&A, and up to 6 voice mock interviews a week — already paid for.

Accept and set up your account: ${joinUrl}

If you weren't expecting this, you can ignore it — the link only works once.
Questions: ${SUPPORT_EMAIL}`;

  return { subject, html, text };
}
