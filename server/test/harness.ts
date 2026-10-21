import { createServer, type Server } from "node:http";
import { generateKeyPairSync, sign, createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import assert from "node:assert/strict";
import pg from "pg";
import { createApp, type GoogleClient, type TokenResponse } from "../src/http/app.ts";
import { GoogleAuthError } from "../src/http/google-client.ts";
import { createSyncPorts } from "../src/sync/ports.ts";
import { runDueJobs, PeopleApiError, type PeopleApi, type SyncContact } from "../src/sync/engine.ts";
import { createPgDb, type Db } from "../src/store/db.ts";
import { PgStore } from "../src/store/pg.ts";
import { runMigrations, readMigrations } from "../src/migrate.ts";
import { memoryDispatcher } from "../src/services/queue.ts";
import type { Services } from "../src/services/notify.ts";
import type { Jwks } from "../src/auth/oauth.ts";
import type { KeyRing } from "../src/security/crypto.ts";
import type { Role } from "../src/auth/rbac.ts";
import type { LimitRule } from "../src/security/ratelimit.ts";

export const APP = "https://vcf.example.com";
export const CLIENT_ID = "client-123";
export const KEYRING: KeyRing = { current: 1, keys: { 1: "cd".repeat(32) } };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const HERE = dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = join(HERE, "..", "..", "db", "migrations");
/** Admin connection to a disposable PostgreSQL (tests create and drop their own databases there). */
export const ADMIN_URL = process.env["TEST_DATABASE_URL"] ?? "postgres://postgres@127.0.0.1:5432/postgres";
const urlFor = (db: string) => { const u = new URL(ADMIN_URL); u.pathname = `/${db}`; return u.toString(); };

/** One migrated template per migration set; each test file clones it (fast, isolated, parallel-safe). */
async function templateName(): Promise<string> {
  const files = readMigrations(MIGRATIONS_DIR);
  const hash = createHash("sha256").update(files.map(f => f.name + f.sql).join("\n")).digest("hex").slice(0, 12);
  const name = `syrix_tpl_${hash}`;
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  try {
    await admin.query("SELECT pg_advisory_lock(424242)");
    const exists = (await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [name])).rowCount;
    if (!exists) {
      await admin.query(`CREATE DATABASE ${name}`);
      const db = createPgDb(urlFor(name), { max: 1 });
      try { await runMigrations(db, files); } finally { await db.close(); }
    }
    await admin.query("SELECT pg_advisory_unlock(424242)");
  } finally { await admin.end(); }
  return name;
}

export async function freshDatabase(): Promise<{ db: Db; url: string; drop: () => Promise<void> }> {
  const tpl = await templateName();
  const name = `syrix_t_${randomBytes(6).toString("hex")}`;
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${name} TEMPLATE ${tpl}`);
  await admin.end();
  const db = createPgDb(urlFor(name), { max: 12 });
  return { db, url: urlFor(name), async drop() {
    await db.close();
    const a = new pg.Client({ connectionString: ADMIN_URL }); await a.connect();
    await a.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`); await a.end();
  } };
}

export interface Session { cookie: string; csrf: string; userId: string }

export async function startHarness(opts: { ready?: () => Promise<boolean>; rules?: Record<string, LimitRule>; adminEmail?: string; webRoot?: string } = {}) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwks: Jwks = { keys: [{ ...(publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: "k1" } as unknown as Jwks["keys"][number]] };
  const codes = new Map<string, TokenResponse>();
  const fake = {
    revoked: [] as string[],
    refresh: async (_rt: string): Promise<{ accessToken: string; expiresIn: number }> => ({ accessToken: "at-refreshed", expiresIn: 3600 }),
  };
  const google: GoogleClient = {
    async exchangeCode(code) { const t = codes.get(code); if (!t) throw new Error("bad code"); return t; },
    async getJwks() { return jwks; },
    async refreshAccessToken(rt) { return fake.refresh(rt); },
    async revokeToken(t) { fake.revoked.push(t); },
  };
  /** Fake Google People API: records every call with the token it carried. */
  const remote = {
    calls: [] as { op: "create" | "update"; token: string; name: string; resourceName?: string; phones: string[] }[],
    fail: null as null | (() => PeopleApiError),
    n: 0,
  };
  const people: PeopleApi = {
    async createContact(token, c: SyncContact) { if (remote.fail) throw remote.fail(); remote.calls.push({ op: "create", token, name: c.fullName, phones: c.phones }); remote.n++; return { resourceName: `people/c${remote.n}`, etag: `e${remote.n}` }; },
    async updateContact(token, resourceName, _etag, c: SyncContact) { if (remote.fail) throw remote.fail(); remote.calls.push({ op: "update", token, name: c.fullName, resourceName, phones: c.phones }); return { etag: `e-upd-${remote.calls.length}` }; },
  };
  let clockOffset = 0;
  const now = () => Date.now() + clockOffset;
  const database = await freshDatabase();
  const store = new PgStore(database.db, now);
  const dispatch = memoryDispatcher();
  const sv: Services = { store, dispatch, now, keyRing: KEYRING, log: () => undefined };
  const handler = createApp({ store, google, dispatch, now, ...(opts.ready ? { ready: opts.ready } : {}), keyRing: KEYRING, log: process.env["TEST_LOG"] ? (l: string, m: string, e?: object) => console.error(l, m, JSON.stringify(e ?? {})) : () => undefined,
    rules: { authCallback: { max: 10_000, windowMs: 60_000 }, rewardClaim: { max: 1000, windowMs: 60_000 }, write: { max: 100_000, windowMs: 60_000 }, contactCreate: { max: 10_000, windowMs: 60_000 },
      adminAction: { max: 10_000, windowMs: 60_000 }, challenge: { max: 10_000, windowMs: 60_000 }, bulk: { max: 1000, windowMs: 60_000 }, backup: { max: 1000, windowMs: 60_000 }, export: { max: 1000, windowMs: 60_000 },
      account: { max: 1000, windowMs: 60_000 }, support: { max: 1000, windowMs: 60_000 }, syncNow: { max: 1000, windowMs: 60_000 }, ...(opts.rules ?? {}) },
    config: { appUrl: APP, sessionSecret: "s".repeat(40), adminEmail: opts.adminEmail ?? "syrixcompany@gmail.com", ...(opts.webRoot ? { webRoot: opts.webRoot } : {}), google: { clientId: CLIENT_ID, redirectUri: `${APP}/api/auth/google/callback` } } });
  const server: Server = createServer((q, r) => { void handler(q, r); });
  await new Promise<void>(res => server.listen(0, "127.0.0.1", res));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  function idToken(nonce: string, sub: string, email: string, verified = true): string {
    const h = b64({ alg: "RS256", kid: "k1" });
    const sec = Math.floor(now() / 1000); // Google's clock follows the harness clock
    const p = b64({ iss: "https://accounts.google.com", aud: CLIENT_ID, sub, email, email_verified: verified, nonce, iat: sec, exp: sec + 600, name: email.split("@")[0] });
    return `${h}.${p}.${sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url")}`;
  }
  /** Runs the full Google sign-in dance and returns the session. */
  async function login(sub: string, email: string, ref?: string, o: { verified?: boolean; next?: string } = {}): Promise<Session> {
    const q = new URLSearchParams(); if (ref) q.set("ref", ref); if (o.next) q.set("next", o.next);
    const start = await fetch(`${base}/api/auth/google/start?${q}`, { redirect: "manual" });
    const loc = new URL(start.headers.get("location")!);
    const state = loc.searchParams.get("state")!;
    codes.set(`code-${sub}`, { idToken: idToken(loc.searchParams.get("nonce")!, sub, email, o.verified ?? true) });
    const cb = await fetch(`${base}/api/auth/google/callback?state=${state}&code=code-${sub}`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
    assert.equal(cb.status, 302, `callback should redirect (got ${cb.status})`);
    const cookie = cb.headers.getSetCookie().map(c => c.split(";")[0]!).find(c => c.startsWith("__Host-sid=") && !c.endsWith("="));
    assert.ok(cookie, `no session cookie (redirect: ${cb.headers.get("location")})`);
    const me = await (await fetch(`${base}/api/me`, { headers: { cookie } })).json() as { csrfToken: string; id: string };
    return { cookie, csrf: me.csrfToken, userId: me.id };
  }
  const send = (s: Session, path: string, body: unknown, method = "POST", extra: Record<string, string> = {}) =>
    fetch(`${base}${path}`, { method, headers: { cookie: s.cookie, origin: APP, "x-csrf-token": s.csrf, "content-type": typeof body === "string" ? "text/plain" : "application/json", ...extra },
      body: method === "GET" ? null : typeof body === "string" ? body : JSON.stringify(body) });
  const get = (s: Session, path: string) => fetch(`${base}${path}`, { headers: { cookie: s.cookie } });
  const json = async <T = Record<string, unknown>>(r: Response | Promise<Response>): Promise<T> => (await (await r).json()) as T;
  /** Connect Google Contacts for a signed-in session (the Contacts consent step). */
  async function connectContacts(s: Session, o: { sub: string; email: string; scope?: string; refreshToken?: string | null; accessToken?: string; cancel?: boolean; as?: Session }) {
    const r = await send(s, "/api/google-contacts/connect", {});
    const url = new URL(((await r.json()) as { url: string }).url);
    const state = url.searchParams.get("state")!;
    const cookie = `${(o.as ?? s).cookie}; __Host-oauth=${state}`;
    const code = `ctc-${Math.random().toString(36).slice(2)}`;
    codes.set(code, { idToken: idToken(url.searchParams.get("nonce")!, o.sub, o.email), accessToken: o.accessToken ?? "at-initial", ...(o.refreshToken === null ? {} : { refreshToken: o.refreshToken ?? "rt-initial" }),
      expiresIn: 3600, scope: o.scope ?? "openid email https://www.googleapis.com/auth/contacts" });
    const q = o.cancel ? `state=${state}&error=access_denied` : `state=${state}&code=${code}`;
    return { scopes: url.searchParams.get("scope")!, state, response: await fetch(`${base}/api/auth/google/callback?${q}`, { redirect: "manual", headers: { cookie } }) };
  }
  /** One worker tick with the real engine and ports, a fake People API and the harness clock. */
  const runSync = (max = 20) => runDueJobs(createSyncPorts({ store, people, google, keyRing: KEYRING, now, random: () => 0 }), max);
  const sql = async (text: string, params: unknown[] = []) => (await database.db.query(text, params)).rows;
  const setRoles = (userId: string, roles: Role[]) => store.setRoles(userId, roles, null);
  /** Credits money directly in the ledger (test setup only). */
  const credit = (userId: string, cents: number) => store.addLedger({ id: randomUUID(), userId, type: "earn", amountCents: cents, idempotencyKey: `test-credit:${randomUUID()}`, reason: "test" });
  /** A real payout request: payout method + balance + withdrawal through the API. */
  async function makePayout(user: Session, cents: number): Promise<string> {
    const m = await json<{ id: string }>(send(user, "/api/payout-methods", { kind: "paypal", details: `pay-${user.userId.slice(0, 6)}@example.com` }));
    await credit(user.userId, cents);
    const r = await send(user, "/api/payouts/request", { methodId: m.id }, "POST", { "idempotency-key": `idem-${randomUUID()}` });
    assert.equal(r.status, 201, await r.clone().text());
    return ((await r.json()) as { id: string }).id;
  }
  return { store, sv, base, login, makePayout, send, get, json, connectContacts, runSync, remote, fake, dispatch, sql, setRoles, credit, now, idToken, codes,
    advance: (ms: number) => { clockOffset += ms; },
    close: async () => { await new Promise(res => server.close(res)); await database.drop(); } };
}
export type Harness = Awaited<ReturnType<typeof startHarness>>;
