import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM envelope: "v<keyVersion>:<iv>:<tag>:<ciphertext>" (base64url).
 * Several key versions can be loaded so old data stays readable during key rotation.
 */
export interface KeyRing { current: number; keys: Record<number, string> } // hex-encoded 32-byte keys

function key(ring: KeyRing, version: number): Buffer {
  const hex = ring.keys[version];
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error(`encryption key v${version} is missing or malformed`);
  return Buffer.from(hex, "hex");
}

/** `context` binds the ciphertext to its owner (e.g. "payout_method:<id>") so it cannot be swapped between rows. */
export function encrypt(plaintext: string, ring: KeyRing, context: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(ring, ring.current), iv);
  c.setAAD(Buffer.from(context));
  const ct = Buffer.concat([c.update(plaintext, "utf8"), c.final()]);
  const b = (x: Buffer) => x.toString("base64url");
  return `v${ring.current}:${b(iv)}:${b(c.getAuthTag())}:${b(ct)}`;
}

export function decrypt(envelope: string, ring: KeyRing, context: string): string {
  const m = /^v(\d+):([^:]+):([^:]+):([^:]+)$/.exec(envelope);
  if (!m) throw new Error("malformed ciphertext");
  const d = createDecipheriv("aes-256-gcm", key(ring, Number(m[1])), Buffer.from(m[2]!, "base64url"));
  d.setAAD(Buffer.from(context));
  d.setAuthTag(Buffer.from(m[3]!, "base64url"));
  return Buffer.concat([d.update(Buffer.from(m[4]!, "base64url")), d.final()]).toString("utf8");
}
