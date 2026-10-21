import type { IncomingMessage, ServerResponse } from "node:http";
import type { User } from "../store/types.ts";

export class HttpError extends Error {
  status: number;
  code: string;
  extra: Record<string, unknown> | undefined;
  constructor(status: number, code: string, extra?: Record<string, unknown>) { super(code); this.status = status; this.code = code; this.extra = extra; }
}

export interface Ctx {
  req: IncomingMessage; res: ServerResponse; url: URL; ip: string; setCookies: string[];
  user: User | null; sid: string | null; params: Record<string, string>; requestId: string;
}

export const MAX_JSON = 64 * 1024;

export function parseCookies(h: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (h ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export async function readBody(req: IncomingMessage, limit: number): Promise<string> {
  const declared = Number(req.headers["content-length"] ?? 0);
  if (declared > limit) throw new HttpError(413, "payload_too_large");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    const b = c as Buffer;
    size += b.length;
    if (size > limit) throw new HttpError(413, "payload_too_large");
    chunks.push(b);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function readJson(req: IncomingMessage, limit = MAX_JSON): Promise<Record<string, unknown>> {
  const raw = await readBody(req, limit);
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch { throw new HttpError(400, "invalid_json"); }
}

/** Mass-assignment guard: only listed fields are accepted; anything else is an error, not silently kept. */
export function pick(body: Record<string, unknown>, allowed: readonly string[]): Record<string, unknown> {
  for (const k of Object.keys(body)) if (!allowed.includes(k)) throw new HttpError(400, `unknown_field:${k.slice(0, 40)}`);
  return body;
}

/* ---- small validators: they throw HttpError(400, "invalid_<name>") ---- */
export const v = {
  str(b: Record<string, unknown>, k: string, o: { min?: number; max: number; required?: boolean; trim?: boolean; pattern?: RegExp }): string | undefined {
    const x = b[k];
    if (x === undefined || x === null) { if (o.required) throw new HttpError(400, `${k}_required`); return undefined; }
    if (typeof x !== "string") throw new HttpError(400, `invalid_${k}`);
    const s = o.trim === false ? x : x.trim();
    if (s.length < (o.min ?? (o.required ? 1 : 0)) || s.length > o.max || (o.pattern && !o.pattern.test(s))) throw new HttpError(400, `invalid_${k}`);
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(s)) throw new HttpError(400, `invalid_${k}`);
    return s;
  },
  int(b: Record<string, unknown>, k: string, o: { min: number; max: number; required?: boolean }): number | undefined {
    const x = b[k];
    if (x === undefined || x === null) { if (o.required) throw new HttpError(400, `${k}_required`); return undefined; }
    if (typeof x !== "number" || !Number.isSafeInteger(x) || x < o.min || x > o.max) throw new HttpError(400, `invalid_${k}`);
    return x;
  },
  bool(b: Record<string, unknown>, k: string): boolean | undefined {
    const x = b[k];
    if (x === undefined) return undefined;
    if (typeof x !== "boolean") throw new HttpError(400, `invalid_${k}`);
    return x;
  },
  oneOf<T extends string>(b: Record<string, unknown>, k: string, allowed: readonly T[], required = false): T | undefined {
    const x = b[k];
    if (x === undefined || x === null) { if (required) throw new HttpError(400, `${k}_required`); return undefined; }
    if (typeof x !== "string" || !allowed.includes(x as T)) throw new HttpError(400, `invalid_${k}`);
    return x as T;
  },
  ids(b: Record<string, unknown>, k: string, max: number): string[] {
    const x = b[k];
    if (!Array.isArray(x) || x.length > max || x.some(i => typeof i !== "string" || !UUID.test(i))) throw new HttpError(400, `invalid_${k}`);
    return [...new Set(x as string[])];
  },
  /** A reason is mandatory for every sensitive admin action. */
  reason(b: Record<string, unknown>): string { return v.str(b, "reason", { min: 3, max: 500, required: true })!; },
};
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const EMAIL = /^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$/;
export const LANGS = ["en", "fr", "pt", "es", "ar"] as const;
export type Lang = (typeof LANGS)[number];

export function qInt(url: URL, k: string, def: number, min: number, max: number): number {
  const raw = url.searchParams.get(k);
  if (raw === null || raw === "") return def;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.trunc(n))) : def;
}
export function qEnum<T extends string>(url: URL, k: string, allowed: readonly T[]): T | undefined {
  const raw = url.searchParams.get(k);
  if (raw === null || raw === "") return undefined;
  if (!allowed.includes(raw as T)) throw new HttpError(400, `invalid_${k}`);
  return raw as T;
}
export function qUuid(url: URL, k: string): string | undefined {
  const raw = url.searchParams.get(k);
  if (!raw) return undefined;
  if (!UUID.test(raw)) throw new HttpError(400, `invalid_${k}`);
  return raw;
}

/** First three octets of IPv4 / first four groups of IPv6: enough for "where did I sign in from", not a full address. */
export function ipPrefix(ip: string): string {
  const v4 = /(\d+)\.(\d+)\.(\d+)\.\d+$/.exec(ip);
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.x`;
  return ip.split(":").slice(0, 4).join(":") + "::";
}

export function csvEscape(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
