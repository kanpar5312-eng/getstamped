import "server-only";

/**
 * Cloudflare Turnstile server-side token verification.
 *
 * Returns true if the token came from a real human, false otherwise. If
 * TURNSTILE_SECRET_KEY is not set, returns true (dev mode) so signup keeps
 * working without Cloudflare credentials.
 */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev mode — accept any submission, log a one-time warning.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[turnstile] TURNSTILE_SECRET_KEY unset; accepting all submissions in dev");
    }
    return true;
  }
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("[turnstile] verification failed:", data["error-codes"]);
    }
    return Boolean(data.success);
  } catch (err) {
    console.error("[turnstile] verify request failed:", err);
    return false;
  }
}
