/** Only same-site relative paths are accepted. Everything else falls back to "/". */
export function safeRedirectPath(input: unknown, fallback = "/app"): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 512) return fallback;
  if (/[\u0000-\u001F\u007F\\]/.test(input)) return fallback;       // control chars and backslashes (browsers treat \ like /)
  if (!input.startsWith("/") || input.startsWith("//")) return fallback; // absolute, scheme-relative
  let decoded: string;
  try { decoded = decodeURIComponent(input); } catch { return fallback; }
  if (decoded.startsWith("//") || /[\u0000-\u001F\\]/.test(decoded) || /^\/[a-z][a-z0-9+.-]*:/i.test(decoded)) return fallback;
  return input;
}
