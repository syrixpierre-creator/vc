import { createHash, randomBytes } from "node:crypto";

/** The cookie holds the raw id; the database only ever stores its SHA-256 hash. */
export function newSessionId(): string {
  return randomBytes(32).toString("base64url");
}
export function hashSessionId(id: string): Buffer {
  return createHash("sha256").update(id).digest();
}

export interface SessionRow { createdAt: number; rotatedAt: number; expiresAt: number; revokedAt: number | null; lastSeenAt: number }
export interface SessionPolicy { idleMs: number; absoluteMs: number; rotateAfterMs: number }
export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  idleMs: 14 * 24 * 3600_000,
  absoluteMs: 30 * 24 * 3600_000,
  rotateAfterMs: 24 * 3600_000,
};
export type SessionState = "valid" | "rotate" | "expired" | "revoked";

export function evaluateSession(s: SessionRow, now: number, p: SessionPolicy = DEFAULT_SESSION_POLICY): SessionState {
  if (s.revokedAt !== null) return "revoked";
  if (now >= s.expiresAt || now - s.createdAt >= p.absoluteMs || now - s.lastSeenAt >= p.idleMs) return "expired";
  if (now - s.rotatedAt >= p.rotateAfterMs) return "rotate"; // issue a new id, revoke the old one
  return "valid";
}

export function sessionCookie(value: string, maxAgeSec: number): string {
  return `__Host-sid=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}
