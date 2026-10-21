import { createServer, type Server } from "node:http";
import { generateKeyPairSync, sign } from "node:crypto";
import type { AddressInfo } from "node:net";
import assert from "node:assert/strict";
import { createApp, type GoogleClient, type TokenResponse } from "../src/http/app.ts";
import { GoogleAuthError } from "../src/http/google-client.ts";
import { createSyncPorts } from "../src/sync/ports.ts";
import { runDueJobs, PeopleApiError, type PeopleApi, type SyncContact } from "../src/sync/engine.ts";
import { MemoryStore } from "../src/store/memory.ts";
import type { Store } from "../src/store/types.ts";
import type { Jwks } from "../src/auth/oauth.ts";
import type { KeyRing } from "../src/security/crypto.ts";

export const APP = "https://vcf.example.com";
export const CLIENT_ID = "client-123";
export const KEYRING: KeyRing = { current: 1, keys: { 1: "cd".repeat(32) } };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

export interface Session { cookie: string; csrf: string; userId: string }

/** `slow` (default) yields to the event loop before every store call, so concurrent requests really interleave and missing locks show up. */
export async function startHarness(opts: { slow?: boolean; ready?: () => Promise<boolean> } = {}) {
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
    calls: [] as { op: "create" | "update"; token: string; name: string; resourceName?: string }[],
    fail: null as null | (() => PeopleApiError),
    n: 0,
  };
  const people: PeopleApi = {
    async createContact(token, c: SyncContact) { if (remote.fail) throw remote.fail(); remote.calls.push({ op: "create", token, name: c.fullName }); remote.n++; return { resourceName: `people/c${remote.n}`, etag: `e${remote.n}` }; },
    async updateContact(token, resourceName, _etag, c: SyncContact) { if (remote.fail) throw remote.fail(); remote.calls.push({ op: "update", token, name: c.fullName, resourceName }); return { etag: `e-upd-${remote.calls.length}` }; },
  };
  const store = new MemoryStore();
  const slowStore = opts.slow === false ? store : new Proxy(store, {
    get(t, prop, r) {
      const v = Reflect.get(t, prop, r) as unknown;
      if (typeof v !== "function") return v;
      return async (...a: unknown[]) => { await new Promise(res => setImmediate(res)); return (v as (...x: unknown[]) => unknown).apply(t, a); };
    },
  }) as Store;
  const handler = createApp({ store: slowStore, google, ...(opts.ready ? { ready: opts.ready } : {}), keyRing: KEYRING, rules: { authCallback: { max: 10_000, windowMs: 60_000 }, rewardClaim: { max: 1000, windowMs: 60_000 } },
    config: { appUrl: APP, sessionSecret: "s".repeat(40), adminEmail: "syrixcompany@gmail.com", google: { clientId: CLIENT_ID, redirectUri: `${APP}/api/auth/google/callback` } } });
  const server: Server = createServer((q, r) => { void handler(q, r); });
  await new Promise<void>(res => server.listen(0, "127.0.0.1", res));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  let clockOffset = 0;
  const syncNow = () => Date.now() + clockOffset;
  function idToken(nonce: string, sub: string, email: string): string {
    const h = b64({ alg: "RS256", kid: "k1" });
    const sec = Math.floor(Date.now() / 1000);
    const p = b64({ iss: "https://accounts.google.com", aud: CLIENT_ID, sub, email, email_verified: true, nonce, iat: sec, exp: sec + 600, name: email.split("@")[0] });
    return `${h}.${p}.${sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url")}`;
  }
  async function login(sub: string, email: string, ref?: string): Promise<Session> {
    const start = await fetch(`${base}/api/auth/google/start${ref ? `?ref=${ref}` : ""}`, { redirect: "manual" });
    const loc = new URL(start.headers.get("location")!);
    const state = loc.searchParams.get("state")!;
    codes.set(`code-${sub}`, { idToken: idToken(loc.searchParams.get("nonce")!, sub, email) });
    const cb = await fetch(`${base}/api/auth/google/callback?state=${state}&code=code-${sub}`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
    assert.equal(cb.status, 302);
    const cookie = cb.headers.getSetCookie().map(c => c.split(";")[0]!).find(c => c.startsWith("__Host-sid=") && !c.endsWith("="))!;
    const me = await (await fetch(`${base}/api/me`, { headers: { cookie } })).json() as { csrfToken: string; id: string };
    return { cookie, csrf: me.csrfToken, userId: me.id };
  }
  const send = (s: Session, path: string, body: unknown, method = "POST", extra: Record<string, string> = {}) =>
    fetch(`${base}${path}`, { method, headers: { cookie: s.cookie, origin: APP, "x-csrf-token": s.csrf, "content-type": "application/json", ...extra }, body: JSON.stringify(body) });
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
  /** One worker tick with the real engine and ports, a fake People API and a controllable clock. */
  const runSync = (max = 20) => runDueJobs(createSyncPorts({ store, people, google, keyRing: KEYRING, now: syncNow, random: () => 0 }), max);
  const get = (s: Session, path: string) => fetch(`${base}${path}`, { headers: { cookie: s.cookie } });
  return { store, base, login, send, get, connectContacts, runSync, remote, fake, advance: (ms: number) => { clockOffset += ms; }, close: () => { server.close(); } };
}
