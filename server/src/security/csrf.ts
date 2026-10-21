import { createHmac, timingSafeEqual } from "node:crypto";

/** CSRF token bound to the session id: an attacker's page cannot know or forge it. */
export function csrfToken(sessionId: string, secret: string): string {
  return createHmac("sha256", secret).update("csrf:" + sessionId).digest("base64url");
}
export function csrfValid(sessionId: string, token: string, secret: string): boolean {
  const a = Buffer.from(csrfToken(sessionId, secret));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
/** State-changing requests must come from our own origin. */
export function originAllowed(originHeader: string | undefined, appUrl: string): boolean {
  if (!originHeader) return false;
  try { return new URL(originHeader).origin === new URL(appUrl).origin; } catch { return false; }
}
