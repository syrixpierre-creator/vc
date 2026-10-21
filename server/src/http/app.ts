import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import type { Store, User, Contact } from "../store/types.ts";
import { DuplicateError } from "../store/types.ts";
import { newOAuthRequest, buildAuthUrl, verifyIdToken, statesMatch, LOGIN_SCOPES, CONTACTS_SCOPES, type Jwks } from "../auth/oauth.ts";
import { newSessionId, hashSessionId, evaluateSession, sessionCookie, DEFAULT_SESSION_POLICY } from "../auth/session.ts";
import { can, decideAdmin, permissionsFor, type Role } from "../auth/rbac.ts";
import { csrfToken, csrfValid, originAllowed } from "../security/csrf.ts";
import { safeRedirectPath } from "../security/redirect.ts";
import { RateLimiter, RULES } from "../security/ratelimit.ts";
import { normalizeE164, maskPhone, maskEmail } from "../domain/phone.ts";
import { encrypt, decrypt, type KeyRing } from "../security/crypto.ts";
import { creditQualified } from "../domain/referral-engine.ts";
import { DEFAULT_BUDGET, creditableCents } from "../domain/budget.ts";
import { evaluateProgress, canAward, validateUpdate, validateMonthlySet, type ChallengeDef, type Difficulty, type Metric, type RewardType } from "../domain/challenges.ts";
import { recordActivity, awardXp, progressFor } from "../domain/progress.ts";
import { levelFor } from "../domain/xp.ts";
import { enqueueSync } from "../sync/engine.ts";
import { createJobPorts, toSyncContact, refreshContext, accessContext } from "../sync/ports.ts";
import type { ChallengeRec } from "../store/types.ts";
import { generateVcf, parseVcf, type VcfVersion, type VcfContact } from "../domain/vcf.ts";
import { computeBalances } from "../domain/ledger.ts";
import { DEFAULT_POLICY, canRequestWithdrawal } from "../domain/money.ts";
import { assertTransition, type PayoutStatus } from "../domain/payout.ts";

export interface TokenResponse { idToken: string; accessToken?: string; refreshToken?: string; expiresIn?: number; scope?: string }
export interface GoogleClient {
  exchangeCode(code: string, codeVerifier: string, redirectUri: string): Promise<TokenResponse>;
  getJwks(): Promise<Jwks>;
  /** throws GoogleAuthError("invalid_grant") when the user revoked access */
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;
  /** best effort: tell Google to revoke a token */
  revokeToken(token: string): Promise<void>;
}
export interface AppDeps {
  config: { appUrl: string; sessionSecret: string; adminEmail: string; google: { clientId: string; redirectUri: string; authEndpoint?: string }; ads?: { enabled: boolean; clientId?: string } };
  store: Store;
  google: GoogleClient;
  now?: () => number;
  /** override per-route rate limits (tests, or tuning behind a trusted proxy) */
  rules?: Partial<typeof RULES>;
  /** AES keys for payout details (key version 1 = ENCRYPTION_KEY) */
  keyRing: KeyRing;
  /** true only behind our own reverse proxy: then the client IP comes from X-Forwarded-For */
  trustProxy?: boolean;
  /** real readiness probe (database reachable); /healthz stays a cheap liveness check */
  ready?: () => Promise<boolean>;
}

class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) { super(code); this.status = status; this.code = code; }
}

const SID = "__Host-sid";
const OAUTH_COOKIE = "__Host-oauth";
const LANGS = ["en", "fr", "pt", "es", "ar"];
const MAX_JSON = 64 * 1024;
const MAX_VCF = 5 * 1024 * 1024;

function parseCookies(h: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (h ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

async function readBody(req: IncomingMessage, limit: number): Promise<string> {
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

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readBody(req, MAX_JSON);
  if (!raw) return {};
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch { throw new HttpError(400, "invalid_json"); }
}

/** Mass-assignment guard: only listed fields are accepted; anything else is an error, not silently kept. */
function pick(body: Record<string, unknown>, allowed: readonly string[]): Record<string, unknown> {
  for (const k of Object.keys(body)) if (!allowed.includes(k)) throw new HttpError(400, `unknown_field:${k}`);
  return body;
}

export function createApp(deps: AppDeps) {
  const { config, store, google } = deps;
  const now = deps.now ?? Date.now;
  const limiters: Record<string, RateLimiter> = {};
  for (const [k, rule] of Object.entries({ ...RULES, ...deps.rules })) limiters[k] = new RateLimiter(rule!, now);
  const limit = (name: string, key: string) => {
    const r = limiters[name]!.check(key);
    if (!r.allowed) throw new HttpError(429, "rate_limited");
  };

  const jobPorts = createJobPorts(store, now);
  /** After a save: queue a sync job when the user connected Google Contacts and kept automatic sync on. Paused jobs wait in the queue. */
  async function enqueueIfAuto(userId: string, c: Contact) {
    const [conn, st] = await Promise.all([store.getConnection(userId), store.getSyncSettings(userId)]);
    if (conn.status !== "connected" || !st.autoSync) return;
    await enqueueSync(jobPorts, toSyncContact(c));
  }
  // one operation at a time per user for money-moving actions (PostgreSQL does this with a row lock)
  const locks = new Map<string, Promise<unknown>>();
  async function withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
    const prev = locks.get(userId) ?? Promise.resolve();
    const run = prev.then(fn, fn);
    locks.set(userId, run.catch(() => undefined));
    return run;
  }
  const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from(randomBytes(10), b => A[b % A.length]).join(""); };
  const networkHash = (ip: string) => createHash("sha256").update(`${config.sessionSecret}:net:${ip}`).digest("hex");

  interface Ctx { req: IncomingMessage; res: ServerResponse; url: URL; ip: string; setCookies: string[]; user: User | null; sid: string | null }

  function send(c: Ctx, status: number, body: unknown, headers: Record<string, string> = {}) {
    const isText = typeof body === "string";
    const res = c.res;
    res.statusCode = status;
    res.setHeader("Content-Type", isText ? "text/plain; charset=utf-8" : "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    if (c.setCookies.length) res.setHeader("Set-Cookie", c.setCookies);
    res.end(isText ? body : JSON.stringify(body));
  }

  async function resolveSession(c: Ctx) {
    const sid = parseCookies(c.req.headers.cookie)[SID];
    if (!sid) return;
    const rec = await store.getSession(hashSessionId(sid).toString("hex"));
    if (!rec) return;
    const state = evaluateSession(rec, now(), DEFAULT_SESSION_POLICY);
    if (state === "expired" || state === "revoked") return;
    const user = await store.getUser(rec.userId);
    if (!user || user.status !== "active") return;
    rec.lastSeenAt = now();
    let activeSid = sid;
    if (state === "rotate") { // new id, old one revoked
      activeSid = await startSession(c, user.id, rec.createdAt);
      rec.revokedAt = now();
    }
    await store.saveSession(rec);
    c.user = user;
    c.sid = activeSid;
  }

  async function startSession(c: Ctx, userId: string, createdAt = now()): Promise<string> {
    const id = newSessionId();
    const t = now();
    await store.createSession({ idHash: hashSessionId(id).toString("hex"), userId, createdAt, rotatedAt: t, expiresAt: createdAt + DEFAULT_SESSION_POLICY.absoluteMs, lastSeenAt: t, revokedAt: null });
    c.setCookies.push(sessionCookie(id, Math.floor(DEFAULT_SESSION_POLICY.absoluteMs / 1000)));
    return id;
  }

  function requireUser(c: Ctx): User {
    if (!c.user || !c.sid) throw new HttpError(401, "unauthenticated");
    return c.user;
  }
  function requireCsrf(c: Ctx) {
    const user = requireUser(c);
    void user;
    if (!originAllowed(c.req.headers.origin as string | undefined, config.appUrl)) throw new HttpError(403, "bad_origin");
    const tok = c.req.headers["x-csrf-token"];
    if (typeof tok !== "string" || !csrfValid(c.sid!, tok, config.sessionSecret)) throw new HttpError(403, "bad_csrf");
  }
  function requirePermission(c: Ctx, perm: Parameters<typeof can>[1]) {
    const user = requireUser(c);
    if (!can(user.roles, perm)) throw new HttpError(403, "forbidden");
    return user;
  }

  const publicContact = (x: Contact) => ({ id: x.id, fullName: x.fullName, phone: x.phone ?? null, emails: x.emails, organization: x.organization ?? null,
    title: x.title ?? null, notes: x.notes ?? null, syncState: x.syncState, createdAt: x.createdAt, updatedAt: x.updatedAt });

  function validateContact(body: Record<string, unknown>, dialCode: string, partial: boolean) {
    const out: { fullName?: string; phone?: string; emails?: string[]; organization?: string; title?: string; notes?: string } = {};
    if ("fullName" in body || !partial) {
      const n = body["fullName"];
      if (typeof n !== "string" || n.trim().length < 1 || n.length > 200) throw new HttpError(400, "invalid_full_name");
      out.fullName = n.trim();
    }
    if ("phone" in body) {
      const p = body["phone"];
      if (typeof p !== "string") throw new HttpError(400, "invalid_phone");
      const e = normalizeE164(p, dialCode);
      if (!e) throw new HttpError(400, "invalid_phone");
      out.phone = e;
    }
    if ("emails" in body) {
      const e = body["emails"];
      if (!Array.isArray(e) || e.length > 5 || e.some(x => typeof x !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))) throw new HttpError(400, "invalid_emails");
      out.emails = e as string[];
    }
    for (const k of ["organization", "title", "notes"] as const) {
      if (k in body) {
        const v = body[k];
        if (typeof v !== "string" || v.length > (k === "notes" ? 5000 : 200)) throw new HttpError(400, `invalid_${k}`);
        out[k] = v;
      }
    }
    return out;
  }

  const DIFFS: Difficulty[] = ["advanced", "expert", "elite", "legendary"];
  const METRICS: Metric[] = ["qualified_referrals", "active_days", "verified_operations", "challenges_completed"];
  const REWARDS: RewardType[] = ["xp", "badge", "vip", "premium", "cash", "whatsapp_promotion", "telegram_stars", "telegram_premium"];
  function parseChallengeBody(raw: Record<string, unknown>, id: string): Omit<ChallengeRec, "published"> {
    const b = pick(raw, ["title", "description", "difficulty", "startsAt", "endsAt", "metric", "threshold", "rewardType", "rewardCents", "rewardXp", "budgetCents", "maxWinners", "terms", "claimDeadline", "slug"]);
    const int = (k: string, min: number, req = true) => { const v = b[k]; if (v === undefined && !req) return undefined; if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min) throw new HttpError(400, `invalid_${k}`); return v; };
    const text = (k: string) => { const v = b[k]; if (typeof v !== "object" || v === null || Array.isArray(v)) throw new HttpError(400, `invalid_${k}`);
      const o = v as Record<string, unknown>; if (typeof o["en"] !== "string" || !o["en"].trim()) throw new HttpError(400, `${k}_en_required`);
      for (const [l, t] of Object.entries(o)) if (!LANGS.includes(l) || typeof t !== "string" || t.length > 2000) throw new HttpError(400, `invalid_${k}`);
      return o as Record<string, string>; };
    if (!DIFFS.includes(b["difficulty"] as Difficulty)) throw new HttpError(400, "invalid_difficulty");
    if (!METRICS.includes(b["metric"] as Metric)) throw new HttpError(400, "invalid_metric");
    if (!REWARDS.includes(b["rewardType"] as RewardType)) throw new HttpError(400, "invalid_reward_type");
    if (typeof b["terms"] !== "string" || b["terms"].trim().length < 10) throw new HttpError(400, "terms_required");
    const startsAt = int("startsAt", 0)!, endsAt = int("endsAt", 0)!;
    if (endsAt <= startsAt) throw new HttpError(400, "end_before_start");
    const rewardType = b["rewardType"] as RewardType;
    const rewardCents = int("rewardCents", 1, false), budgetCents = int("budgetCents", 1, false);
    if (rewardType === "cash" && (rewardCents === undefined || budgetCents === undefined)) throw new HttpError(400, "cash_reward_needs_amount_and_budget"); // no cash without a budget
    const def: Omit<ChallengeRec, "published"> = { id, slug: typeof b["slug"] === "string" ? b["slug"] : id, title: text("title"), description: text("description"), terms: b["terms"],
      difficulty: b["difficulty"] as Difficulty, metric: b["metric"] as Metric, threshold: int("threshold", 1)!, startsAt, endsAt, rewardType };
    if (rewardCents !== undefined) def.rewardCents = rewardCents;
    if (budgetCents !== undefined) def.budgetCents = budgetCents;
    const mw = int("maxWinners", 1, false); if (mw !== undefined) def.maxWinners = mw;
    const rx = int("rewardXp", 1, false); if (rx !== undefined) def.rewardXp = rx;
    const cd = int("claimDeadline", 0, false); if (cd !== undefined) def.claimDeadline = cd;
    return def;
  }

  /* ---------- routes ---------- */
  async function route(c: Ctx): Promise<void> {
    const { req, url } = c;
    const method = req.method ?? "GET";
    const path = url.pathname;
    let m: RegExpExecArray | null;

    if (method === "GET" && path === "/healthz") return send(c, 200, { ok: true });
    if (method === "GET" && path === "/readyz") {
      let ok = false;
      try { ok = deps.ready ? await deps.ready() : true; } catch { ok = false; }
      return send(c, ok ? 200 : 503, { ok });
    }
    if (method === "GET" && path === "/api/public-config") { // nothing secret: only what the browser needs to decide about ads
      const a = config.ads;
      return send(c, 200, { ads: a?.enabled && a.clientId ? { enabled: true, clientId: a.clientId } : { enabled: false } });
    }

    /* --- Google sign-in --- */
    if (method === "GET" && path === "/api/auth/google/start") {
      limit("authCallback", c.ip);
      const r = newOAuthRequest();
      const refParam = url.searchParams.get("ref") ?? "";
      await store.putPending(r.state, { nonce: r.nonce, codeVerifier: r.codeVerifier, next: safeRedirectPath(url.searchParams.get("next")), expiresAt: now() + 10 * 60_000,
        ...(/^[A-Z0-9]{8,12}$/.test(refParam) ? { ref: refParam } : {}) });
      c.setCookies.push(`${OAUTH_COOKIE}=${r.state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`); // binds the flow to this browser
      return send(c, 302, "", { Location: buildAuthUrl({ clientId: config.google.clientId, redirectUri: config.google.redirectUri, scopes: LOGIN_SCOPES, req: r, ...(config.google.authEndpoint ? { endpoint: config.google.authEndpoint } : {}) }) });
    }
    if (method === "GET" && path === "/api/auth/google/callback") {
      limit("authCallback", c.ip);
      const state = url.searchParams.get("state") ?? "";
      const code = url.searchParams.get("code") ?? "";
      const bound = parseCookies(req.headers.cookie)[OAUTH_COOKIE] ?? "";
      if (!state || !statesMatch(state, bound)) throw new HttpError(400, "invalid_state");
      const pending = await store.takePending(state);
      if (!pending) throw new HttpError(400, "invalid_state");
      const clearOauth = `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
      if (url.searchParams.get("error")) { // the user pressed Cancel at Google
        if (pending.purpose === "contacts") { c.setCookies.push(clearOauth); return send(c, 302, "", { Location: `${pending.next}?e=denied` }); }
        throw new HttpError(400, "authorization_denied");
      }
      if (!code) throw new HttpError(400, "invalid_state");
      let ident;
      let tok;
      try {
        tok = await google.exchangeCode(code, pending.codeVerifier, config.google.redirectUri);
        ident = verifyIdToken(tok.idToken, await google.getJwks(), { audience: config.google.clientId, nonce: pending.nonce, now: now() });
      } catch { throw new HttpError(401, "google_verification_failed"); }

      if (pending.purpose === "contacts") { // connecting Google Contacts: bound to the signed-in user, never to someone else's account
        const me = requireUser(c);
        if (pending.userId !== me.id) throw new HttpError(403, "session_mismatch");
        if (ident.sub !== me.googleSub) { // contacts only go to the Google account the user signed in with; nothing is stored
          c.setCookies.push(clearOauth);
          return send(c, 302, "", { Location: `${pending.next}?e=account` });
        }
        const granted = (tok.scope ?? "").split(" ").includes(CONTACTS_SCOPES[0]);
        c.setCookies.push(clearOauth);
        if (!granted) return send(c, 302, "", { Location: `${pending.next}?e=scope` }); // granular consent: the user unticked Contacts
        if (!tok.refreshToken || !tok.accessToken) return send(c, 302, "", { Location: `${pending.next}?e=token` });
        await store.saveConnection(me.id, { status: "connected", refreshTokenEnc: encrypt(tok.refreshToken, deps.keyRing, refreshContext(me.id)),
          accessTokenEnc: encrypt(tok.accessToken, deps.keyRing, accessContext(me.id)), accessExpiresAt: now() + (tok.expiresIn ?? 3600) * 1000 });
        return send(c, 302, "", { Location: `${pending.next}?e=ok` });
      }

      let user = await store.findUserBySub(ident.sub);
      const isNew = !user;
      if (!user) user = await store.createUser({ googleSub: ident.sub, email: ident.email, name: ident.name ?? ident.email, language: "en", dialCode: "", status: "active", roles: [] });
      if (user.status !== "active") throw new HttpError(403, "account_suspended");
      const decision = decideAdmin(ident, config.adminEmail, await store.getSetting("admin_sub"));
      if (decision.pinSub) await store.setSetting("admin_sub", decision.pinSub);
      const roles: Role[] = user.roles.filter(r => r !== "super_admin");
      if (decision.isSuperAdmin) roles.push("super_admin");
      user = { ...user, email: ident.email, roles };
      await store.saveUser(user);

      if (isNew && pending.ref) { // server-side attribution at registration; clicks alone are never counted
        const referrerId = await store.findUserIdByReferralCode(pending.ref);
        if (referrerId && referrerId !== user.id) {
          try { await store.createReferral({ id: randomUUID(), referrerId, referredId: user.id, status: "pending", networkHash: networkHash(c.ip), createdAt: now() }); }
          catch (e) { if (!(e instanceof DuplicateError)) throw e; }
        }
      }
      await startSession(c, user.id); // a fresh id at login: no session fixation
      c.setCookies.push(clearOauth);
      return send(c, 302, "", { Location: pending.next });
    }
    if (method === "POST" && path === "/api/auth/logout") {
      requireCsrf(c);
      const rec = await store.getSession(hashSessionId(c.sid!).toString("hex"));
      if (rec) { rec.revokedAt = now(); await store.saveSession(rec); }
      c.setCookies.push(`${SID}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
      return send(c, 200, { ok: true });
    }

    /* --- profile --- */
    if (method === "GET" && path === "/api/me") {
      const u = requireUser(c);
      return send(c, 200, { id: u.id, email: u.email, name: u.name, language: u.language, dialCode: u.dialCode, phoneMasked: u.phone ? maskPhone(u.phone) : null, permissions: permissionsFor(u.roles), csrfToken: csrfToken(c.sid!, config.sessionSecret) });
    }
    if (method === "PATCH" && path === "/api/me") {
      requireCsrf(c);
      const u = requireUser(c);
      const b = pick(await readJson(req), ["language", "dialCode", "pseudonym", "leaderboardOptIn"]);
      const next = { ...u };
      if ("language" in b) { if (typeof b["language"] !== "string" || !LANGS.includes(b["language"])) throw new HttpError(400, "invalid_language"); next.language = b["language"]; }
      if ("dialCode" in b) { if (typeof b["dialCode"] !== "string" || !/^\+?[1-9]\d{0,3}$/.test(b["dialCode"])) throw new HttpError(400, "invalid_dial_code"); next.dialCode = b["dialCode"]; }
      if ("pseudonym" in b) {
        const ps = b["pseudonym"];
        if (typeof ps !== "string" || !/^[A-Za-z0-9_-]{3,24}$/.test(ps)) throw new HttpError(400, "invalid_pseudonym"); // no spaces, no @: cannot be an email or a real name by accident
        const owner = await store.findUserByPseudonym(ps);
        if (owner && owner.id !== u.id) throw new HttpError(409, "pseudonym_taken");
        next.pseudonym = ps;
      }
      if ("leaderboardOptIn" in b) {
        if (typeof b["leaderboardOptIn"] !== "boolean") throw new HttpError(400, "invalid_opt_in");
        if (b["leaderboardOptIn"] && !next.pseudonym) throw new HttpError(400, "pseudonym_required");
        next.leaderboardOptIn = b["leaderboardOptIn"];
      }
      await store.saveUser(next);
      return send(c, 200, { language: next.language, dialCode: next.dialCode, pseudonym: next.pseudonym ?? null, leaderboardOptIn: next.leaderboardOptIn ?? false });
    }

    /* --- contacts --- */
    if (path === "/api/contacts" && method === "GET") {
      const u = requireUser(c);
      const lim = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25) || 25));
      const off = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
      const q = url.searchParams.get("q") ?? undefined;
      const r = await store.listContacts(u.id, q ? { q, limit: lim, offset: off } : { limit: lim, offset: off });
      return send(c, 200, { total: r.total, items: r.rows.map(publicContact) });
    }
    if (path === "/api/contacts" && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("contactCreate", u.id);
      const b = pick(await readJson(req), ["fullName", "phone", "emails", "organization", "title", "notes"]);
      const v = validateContact(b, u.dialCode, false);
      try {
        const created = await store.createContact(u.id, { fullName: v.fullName!, emails: v.emails ?? [], ...(v.phone ? { phone: v.phone } : {}), ...(v.organization ? { organization: v.organization } : {}),
          ...(v.title ? { title: v.title } : {}), ...(v.notes ? { notes: v.notes } : {}) });
        await recordActivity(store, u.id, now(), `contact:${created.id}`);
        await enqueueIfAuto(u.id, created);
        return send(c, 201, publicContact(created));
      } catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "duplicate_phone"); throw e; }
    }
    if (path === "/api/contacts/export" && method === "GET") {
      const u = requireUser(c);
      const ver = url.searchParams.get("version") ?? "3.0";
      if (!["2.1", "3.0", "4.0"].includes(ver)) throw new HttpError(400, "invalid_version");
      const all = await store.allContacts(u.id);
      const list: VcfContact[] = all.map(x => ({ name: x.fullName, emails: x.emails, ...(x.phone ? { phone: x.phone } : {}), ...(x.organization ? { organization: x.organization } : {}),
        ...(x.title ? { title: x.title } : {}), ...(x.notes ? { note: x.notes } : {}) }));
      return send(c, 200, generateVcf(list, ver as VcfVersion), { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": 'attachment; filename="contacts.vcf"' });
    }
    if (path === "/api/contacts/import" && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("vcfImport", u.id);
      const mode = url.searchParams.get("mode") ?? "preview";
      if (mode !== "preview" && mode !== "commit") throw new HttpError(400, "invalid_mode");
      const text = await readBody(req, MAX_VCF);
      let parsed;
      try { parsed = parseVcf(text, { defaultDialCode: u.dialCode, maxBytes: MAX_VCF }); } catch { throw new HttpError(400, "invalid_vcf"); }
      const existing = new Set((await store.allContacts(u.id)).map(x => x.phone).filter(Boolean));
      const seenInFile = new Set<string>();
      const fresh: VcfContact[] = [];
      let duplicates = 0;
      for (const x of parsed.contacts) {
        if (x.phone && (existing.has(x.phone) || seenInFile.has(x.phone))) { duplicates++; continue; }
        if (x.phone) seenInFile.add(x.phone);
        fresh.push(x);
      }
      const summary = { total: parsed.contacts.length + parsed.errors.length, valid: parsed.contacts.length, toImport: fresh.length, duplicates, invalid: parsed.errors, ignoredExtraPhones: parsed.ignoredExtraPhones };
      if (mode === "preview") return send(c, 200, { mode, ...summary }); // nothing is written
      let imported = 0;
      for (const x of fresh) {
        try {
          const made = await store.createContact(u.id, { fullName: x.name, emails: x.emails, ...(x.phone ? { phone: x.phone } : {}), ...(x.organization ? { organization: x.organization } : {}),
            ...(x.title ? { title: x.title } : {}), ...(x.note ? { notes: x.note } : {}) });
          imported++;
          await enqueueIfAuto(u.id, made);
        } catch (e) { if (!(e instanceof DuplicateError)) throw e; }
      }
      if (imported > 0) await recordActivity(store, u.id, now(), `import:${randomUUID()}`);
      return send(c, 200, { mode, ...summary, imported });
    }
    if ((m = /^\/api\/contacts\/([0-9a-f-]{36})$/.exec(path))) {
      const id = m[1]!;
      if (method === "GET") {
        const u = requireUser(c);
        const x = await store.getContact(u.id, id);
        if (!x) throw new HttpError(404, "not_found"); // other users' ids look exactly like missing ones
        return send(c, 200, publicContact(x));
      }
      if (method === "PATCH") {
        requireCsrf(c);
        const u = requireUser(c);
        const b = pick(await readJson(req), ["fullName", "phone", "emails", "organization", "title", "notes"]);
        try {
          const x = await store.updateContact(u.id, id, validateContact(b, u.dialCode, true));
          if (!x) throw new HttpError(404, "not_found");
          await enqueueIfAuto(u.id, x);
          return send(c, 200, publicContact(x));
        } catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "duplicate_phone"); throw e; }
      }
      if (method === "DELETE") {
        requireCsrf(c);
        const u = requireUser(c);
        if (url.searchParams.get("confirm") !== "true") throw new HttpError(400, "confirmation_required");
        if (!(await store.deleteContact(u.id, id))) throw new HttpError(404, "not_found");
        return send(c, 200, { ok: true });
      }
    }

    /* --- wallet (read-only: balances are derived from the ledger, never accepted from the client) --- */
    if (method === "GET" && path === "/api/wallet") {
      const u = requireUser(c);
      const b = computeBalances(await store.ledgerFor(u.id));
      return send(c, 200, { ...b, currency: "USD", canWithdraw: canRequestWithdrawal(b.available, DEFAULT_POLICY), minWithdrawCents: DEFAULT_POLICY.minWithdrawCents });
    }


    /* --- the account's single phone number (unique across accounts) --- */
    if (method === "PUT" && path === "/api/me/phone") {
      requireCsrf(c);
      const u = requireUser(c);
      const b = pick(await readJson(req), ["phone"]);
      const e = typeof b["phone"] === "string" ? normalizeE164(b["phone"], u.dialCode) : null;
      if (!e) throw new HttpError(400, "invalid_phone");
      const owner = await store.findUserByPhone(e);
      if (owner && owner.id !== u.id) throw new HttpError(409, "phone_already_used"); // one number, one account
      await store.saveUser({ ...u, phone: e }); // replaces the previous number: only one is ever stored
      return send(c, 200, { phoneMasked: maskPhone(e) });
    }

    /* --- referrals --- */
    if (method === "GET" && path === "/api/referrals/me") {
      const u = requireUser(c);
      let code = await store.getReferralCode(u.id);
      if (!code) { code = newCode(); await store.setReferralCode(u.id, code); }
      const rows = await store.listReferralsByReferrer(u.id);
      const counts = { pending: 0, qualified: 0, under_review: 0, disqualified: 0 };
      for (const r of rows) counts[r.status]++;
      const earned = computeBalances(await store.ledgerFor(u.id)).earned;
      return send(c, 200, { code, link: `${config.appUrl}/register?ref=${code}`, counts, earnedCents: earned });
    }
    if ((m = /^\/api\/admin\/referrals\/([0-9a-f-]{36})\/resolve$/.exec(path)) && method === "POST") {
      requireCsrf(c);
      const admin = requirePermission(c, "fraud.review");
      limit("adminAction", admin.id);
      const b = pick(await readJson(req), ["decision", "reason"]);
      if (b["decision"] !== "qualified" && b["decision"] !== "disqualified") throw new HttpError(400, "invalid_decision");
      if (typeof b["reason"] !== "string" || !b["reason"].trim()) throw new HttpError(400, "reason_required");
      const r = await store.getReferral(m[1]!);
      if (!r) throw new HttpError(404, "not_found");
      if (r.status !== "under_review") throw new HttpError(409, "not_under_review");
      const before = r.status;
      if (b["decision"] === "qualified") await creditQualified(store, r, now(), DEFAULT_POLICY, DEFAULT_BUDGET);
      else { r.status = "disqualified"; r.reason = b["reason"]; await store.saveReferral(r); }
      await store.addAudit({ actorId: admin.id, action: "referral.resolve", resourceType: "referral", resourceId: r.id, from: before, to: r.status, reason: b["reason"], at: now() });
      return send(c, 200, { id: r.id, status: r.status });
    }

    /* --- payout methods and withdrawal requests --- */
    if (path === "/api/payout-methods" && method === "GET") {
      const u = requireUser(c);
      return send(c, 200, { items: (await store.listPayoutMethods(u.id)).map(x => ({ id: x.id, kind: x.kind, recipientName: x.recipientName ?? null, maskedHint: x.maskedHint })) });
    }
    if (path === "/api/payout-methods" && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      const b = pick(await readJson(req), ["kind", "recipientName", "details"]);
      const kind = b["kind"];
      if (kind !== "paypal" && kind !== "binance_pay" && kind !== "pix") throw new HttpError(400, "invalid_kind");
      const details = typeof b["details"] === "string" ? b["details"].trim() : "";
      if (details.length < 3 || details.length > 200) throw new HttpError(400, "invalid_details");
      if (kind === "paypal" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(details)) throw new HttpError(400, "invalid_paypal_email");
      if (b["recipientName"] !== undefined && (typeof b["recipientName"] !== "string" || b["recipientName"].length > 120)) throw new HttpError(400, "invalid_recipient_name");
      const id = randomUUID();
      const hint = kind === "paypal" ? maskEmail(details) : `••••${details.slice(-4)}`;
      await store.addPayoutMethod({ id, userId: u.id, kind, ...(typeof b["recipientName"] === "string" ? { recipientName: b["recipientName"] } : {}),
        detailsEnc: encrypt(details, deps.keyRing, `payout_method:${id}`), maskedHint: hint });
      return send(c, 201, { id, kind, maskedHint: hint }); // the plain details are never returned
    }
    if (path === "/api/payouts" && method === "GET") {
      const u = requireUser(c);
      const list = await store.listPayoutsFor(u.id);
      return send(c, 200, { items: list.map(p => ({ id: p.id, amountCents: p.amountCents, currency: "USD", status: p.status, method: p.methodKind ?? null, maskedHint: p.maskedHint, createdAt: p.createdAt ?? null })) });
    }
    if (path === "/api/payouts/request" && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("rewardClaim", u.id);
      const idem = req.headers["idempotency-key"];
      if (typeof idem !== "string" || idem.length < 8 || idem.length > 64) throw new HttpError(400, "idempotency_key_required");
      const b = pick(await readJson(req), ["methodId", "amountCents"]);
      if (typeof b["methodId"] !== "string") throw new HttpError(400, "method_required");
      const methodId = b["methodId"];
      const result = await withUserLock(u.id, async () => {
        const replay = await store.getPayoutByIdem(u.id, idem);
        if (replay) return { replay: true as const, p: replay };
        const fresh = await store.getUser(u.id);
        if (!fresh || fresh.status !== "active") throw new HttpError(403, "account_not_active");
        const pm = await store.getPayoutMethod(u.id, methodId);
        if (!pm) throw new HttpError(404, "method_not_found");
        if (await store.openPayoutFor(u.id)) throw new HttpError(409, "payout_already_open");
        const bal = computeBalances(await store.ledgerFor(u.id));
        const amount = b["amountCents"] === undefined ? bal.available : b["amountCents"];
        if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) throw new HttpError(400, "invalid_amount");
        if (amount < DEFAULT_POLICY.minWithdrawCents) throw new HttpError(400, "below_withdrawal_minimum");
        if (amount > bal.available) throw new HttpError(409, "insufficient_available_balance");
        const id = randomUUID();
        // frozen copy of the recipient: later profile edits cannot redirect this request
        const snapshot = encrypt(decrypt(pm.detailsEnc, deps.keyRing, `payout_method:${pm.id}`), deps.keyRing, `payout_request:${id}`);
        const p = { id, userId: u.id, amountCents: amount, status: "pending" as PayoutStatus, maskedHint: pm.maskedHint, methodKind: pm.kind, snapshotEnc: snapshot, idempotencyKey: idem, createdAt: now() };
        await store.savePayout(p);
        await store.addLedger({ id: randomUUID(), userId: u.id, type: "reserve", amountCents: amount, idempotencyKey: `reserve:${id}` });
        return { replay: false as const, p };
      });
      return send(c, result.replay ? 200 : 201, { id: result.p.id, status: result.p.status, amountCents: result.p.amountCents, maskedHint: result.p.maskedHint });
    }
    if (path === "/api/admin/payouts" && method === "GET") {
      requirePermission(c, "payouts.read");
      const st = url.searchParams.get("status") ?? undefined;
      const list = await store.listPayouts(st as PayoutStatus | undefined);
      return send(c, 200, { items: list.map(p => ({ id: p.id, userId: p.userId, amountCents: p.amountCents, currency: "USD", status: p.status, method: p.methodKind ?? null, maskedHint: p.maskedHint, txReference: p.txReference ?? null })) });
    }



    /* --- Google Contacts connection and sync controls --- */
    if (method === "GET" && path === "/api/google-contacts/status") {
      const u = requireUser(c);
      const [conn, st, counts, last] = await Promise.all([store.getConnection(u.id), store.getSyncSettings(u.id), store.syncCounts(u.id), store.lastSyncAt(u.id)]);
      return send(c, 200, { status: conn.status, autoSync: st.autoSync, paused: st.paused, counts, lastSyncAt: last });
    }
    if (method === "POST" && path === "/api/google-contacts/connect") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("authCallback", u.id);
      const r = newOAuthRequest();
      await store.putPending(r.state, { nonce: r.nonce, codeVerifier: r.codeVerifier, next: "/app/#/sync", expiresAt: now() + 10 * 60_000, purpose: "contacts", userId: u.id });
      c.setCookies.push(`${OAUTH_COOKIE}=${r.state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
      // incremental authorization: the Contacts scope is requested now, separately from sign-in
      const url2 = buildAuthUrl({ clientId: config.google.clientId, redirectUri: config.google.redirectUri, scopes: ["openid", "email", ...CONTACTS_SCOPES], req: r, loginHint: u.email,
        ...(config.google.authEndpoint ? { endpoint: config.google.authEndpoint } : {}) });
      return send(c, 200, { url: url2 });
    }
    if (method === "PATCH" && path === "/api/google-contacts/settings") {
      requireCsrf(c);
      const u = requireUser(c);
      const b = pick(await readJson(req), ["autoSync", "paused"]);
      const cur = await store.getSyncSettings(u.id);
      const next = { ...cur };
      for (const k of ["autoSync", "paused"] as const) if (k in b) { if (typeof b[k] !== "boolean") throw new HttpError(400, `invalid_${k}`); next[k] = b[k] as boolean; }
      await store.saveSyncSettings(u.id, next);
      if (cur.paused && !next.paused) for (const j of await store.listSyncJobsFor(u.id)) if (j.status === "pending" && j.nextAttemptAt > now()) await store.saveSyncJob({ ...j, nextAttemptAt: now() }); // resume: send what was waiting
      return send(c, 200, next);
    }
    if (method === "POST" && path === "/api/google-contacts/disconnect") {
      requireCsrf(c);
      const u = requireUser(c);
      const conn = await store.getConnection(u.id);
      if (conn.refreshTokenEnc) { try { await google.revokeToken(decrypt(conn.refreshTokenEnc, deps.keyRing, refreshContext(u.id))); } catch { /* local disconnect never depends on Google */ } }
      await store.saveConnection(u.id, { status: "not_connected" }); // tokens are deleted
      for (const j of await store.listSyncJobsFor(u.id)) if (j.status === "pending" || j.status === "running") await store.saveSyncJob({ ...j, status: "failed", lastError: "disconnected" });
      for (const x of await store.allContacts(u.id)) if (x.syncState === "pending" || x.syncState === "paused" || x.syncState === "failed") await store.setContactSync(u.id, x.id, { state: "local_only" });
      await store.addAudit({ actorId: u.id, action: "google_contacts.disconnect", resourceType: "oauth_account", resourceId: u.id, from: conn.status, to: "not_connected", at: now() });
      return send(c, 200, { status: "not_connected" }); // local contacts and anything already in Google are left untouched
    }
    if (method === "POST" && path === "/api/google-contacts/sync-now") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("syncNow", u.id);
      if ((await store.getConnection(u.id)).status !== "connected") throw new HttpError(409, "not_connected");
      if ((await store.getSyncSettings(u.id)).paused) throw new HttpError(409, "sync_paused");
      let queued = 0;
      for (const x of (await store.allContacts(u.id)).filter(k => ["local_only", "pending", "failed"].includes(k.syncState)).slice(0, 500)) {
        const key = `${x.id}:${x.updatedAt}`;
        const existing = await store.findSyncJobByKey(key);
        if (!existing) { if (await enqueueSync(jobPorts, toSyncContact(x))) queued++; }
        else if (existing.status === "failed" || existing.status === "dead") { await store.saveSyncJob({ ...existing, status: "pending", attempts: 0, nextAttemptAt: now() }); await store.setContactSync(u.id, x.id, { state: "pending" }); queued++; }
      }
      return send(c, 200, { queued });
    }

    /* --- progression, challenges, leaderboard --- */
    if (method === "GET" && path === "/api/me/progress") {
      const u = requireUser(c);
      return send(c, 200, await progressFor(store, u.id, now()));
    }
    if (method === "GET" && path === "/api/leaderboard") {
      requireUser(c);
      const period = url.searchParams.get("period") ?? "weekly";
      if (!["weekly", "monthly", "all"].includes(period)) throw new HttpError(400, "invalid_period");
      const since = period === "weekly" ? now() - 7 * 86_400_000 : period === "monthly" ? now() - 30 * 86_400_000 : 0;
      const totals = new Map<string, number>();
      for (const r of await store.xpRowsSince(since)) totals.set(r.userId, (totals.get(r.userId) ?? 0) + r.amount);
      const rows: { pseudonym: string; xp: number; level: number }[] = [];
      for (const [uid, xp] of totals) {
        const usr = await store.getUser(uid);
        if (!usr || usr.status !== "active" || !usr.leaderboardOptIn || !usr.pseudonym) continue; // opt-in only, pseudonym only
        rows.push({ pseudonym: usr.pseudonym, xp, level: levelFor((await progressFor(store, uid, now())).xp) });
      }
      rows.sort((a, b) => b.xp - a.xp || a.pseudonym.localeCompare(b.pseudonym));
      return send(c, 200, { period, items: rows.slice(0, 50).map((r, i) => ({ rank: i + 1, ...r })) });
    }
    if (method === "GET" && path === "/api/challenges") {
      const u = requireUser(c);
      const events = await store.listEvents(u.id);
      const mine = new Map((await store.participationsOf(u.id)).map(p => [p.challengeId, p]));
      const items = (await store.listChallenges(true)).map(d => {
        const part = mine.get(d.id);
        const prog = evaluateProgress(d, events, now());
        let status: string = prog.status;
        if (part?.claimedAt) status = d.rewardType === "xp" || d.rewardType === "badge" || d.rewardType === "cash" ? "reward_delivered" : "reward_pending";
        return { id: d.id, title: d.title[u.language] ?? d.title["en"] ?? "", description: d.description[u.language] ?? d.description["en"] ?? "", difficulty: d.difficulty,
          startsAt: d.startsAt, endsAt: d.endsAt, metric: d.metric, threshold: d.threshold, rewardType: d.rewardType, rewardCents: d.rewardCents ?? null, terms: d.terms,
          joined: !!part, progress: part ? prog.progress : 0, status };
      });
      return send(c, 200, { items });
    }
    if ((m = /^\/api\/challenges\/([0-9a-f-]{36})\/join$/.exec(path)) && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      const d = await store.getChallenge(m[1]!);
      if (!d || !d.published) throw new HttpError(404, "not_found");
      if (now() < d.startsAt) throw new HttpError(409, "not_started");
      if (now() >= d.endsAt) throw new HttpError(409, "challenge_ended");
      try { await store.joinChallenge({ challengeId: d.id, userId: u.id, joinedAt: now() }); }
      catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "already_joined"); throw e; }
      // work already done inside the window counts: if it already meets the goal, record completion now (this freezes the terms too)
      if (evaluateProgress(d, await store.listEvents(u.id), now()).status === "completed") {
        const part = await store.getParticipation(d.id, u.id);
        if (part && !part.completedAt) await store.saveParticipation({ ...part, completedAt: now() });
      }
      return send(c, 201, { ok: true });
    }
    if ((m = /^\/api\/challenges\/([0-9a-f-]{36})\/claim$/.exec(path)) && method === "POST") {
      requireCsrf(c);
      const u = requireUser(c);
      limit("rewardClaim", u.id);
      const id = m[1]!;
      const out = await withUserLock(`challenge:${id}`, async () => { // serialises claims so the winner cap and budget cannot be raced
        const d = await store.getChallenge(id);
        if (!d || !d.published) throw new HttpError(404, "not_found");
        const part = await store.getParticipation(id, u.id);
        if (!part) throw new HttpError(409, "not_joined");
        if (part.claimedAt) throw new HttpError(409, "already_claimed");
        const prog = evaluateProgress(d, await store.listEvents(u.id), now());
        if (prog.status !== "completed") throw new HttpError(409, "not_completed");
        const deadline = d.claimDeadline ?? d.endsAt + 7 * 86_400_000;
        if (now() > deadline) throw new HttpError(409, "claim_deadline_passed");
        const winners = (await store.participationsFor(id)).filter(x => x.claimedAt).length;
        const spent = (await store.participationsFor(id)).reduce((a, x) => a + (x.awardedCents ?? 0), 0);
        const ok = canAward(d, winners, spent);
        if (!ok.ok) throw new HttpError(409, ok.reason ?? "cannot_award");
        let awarded = 0;
        if (d.rewardType === "cash") {
          const earned = computeBalances(await store.ledgerFor(u.id)).earned;
          if (creditableCents(d.rewardCents!, earned, await store.globalEarnedCents(), DEFAULT_BUDGET) < d.rewardCents!) throw new HttpError(409, "budget_exhausted");
          awarded = d.rewardCents!;
          await store.addLedger({ id: randomUUID(), userId: u.id, type: "earn", amountCents: awarded, idempotencyKey: `challenge:${id}:${u.id}` }); // withdrawn through the same manual payout flow
        } else if (d.rewardType === "xp") {
          await awardXp(store, u.id, d.rewardXp ?? 100, `challenge:${d.slug}`, `xp:challenge:${id}:${u.id}`, now());
        } else if (d.rewardType !== "badge") { // premium, vip, whatsapp/telegram: tracked for manual fulfilment, never marked delivered here
          await store.addRewardClaim({ id: randomUUID(), userId: u.id, source: `challenge:${id}`, kind: d.rewardType, status: "pending", createdAt: now() });
        }
        part.claimedAt = now();
        part.awardedCents = awarded;
        await store.saveParticipation(part);
        return { rewardType: d.rewardType, awardedCents: awarded };
      });
      return send(c, 200, out);
    }

    /* --- admin: challenge management --- */
    if (path === "/api/admin/challenges" && method === "POST") {
      requireCsrf(c);
      const admin = requirePermission(c, "challenges.manage");
      limit("adminAction", admin.id);
      const def = parseChallengeBody(await readJson(req), randomUUID());
      await store.saveChallenge({ ...def, published: false });
      await store.addAudit({ actorId: admin.id, action: "challenge.create", resourceType: "challenge", resourceId: def.id, from: null, to: "draft", at: now() });
      return send(c, 201, { id: def.id });
    }
    if ((m = /^\/api\/admin\/challenges\/([0-9a-f-]{36})$/.exec(path)) && method === "PUT") {
      requireCsrf(c);
      const admin = requirePermission(c, "challenges.manage");
      const old = await store.getChallenge(m[1]!);
      if (!old) throw new HttpError(404, "not_found");
      const next = parseChallengeBody(await readJson(req), old.id);
      const anyoneQualified = (await store.participationsFor(old.id)).some(p => p.completedAt);
      const errs = validateUpdate(old, next, anyoneQualified); // terms are frozen once someone has qualified
      if (errs.length) throw new HttpError(409, errs[0]!.replace(/\s+/g, "_").slice(0, 80));
      await store.saveChallenge({ ...next, published: old.published });
      await store.addAudit({ actorId: admin.id, action: "challenge.update", resourceType: "challenge", resourceId: old.id, from: old.threshold, to: next.threshold, at: now() });
      return send(c, 200, { id: old.id });
    }
    if (path === "/api/admin/challenges/publish-month" && method === "POST") {
      requireCsrf(c);
      const admin = requirePermission(c, "challenges.manage");
      const b = pick(await readJson(req), ["ids"]);
      const ids = b["ids"];
      if (!Array.isArray(ids) || ids.some(x => typeof x !== "string")) throw new HttpError(400, "invalid_ids");
      const defs: ChallengeRec[] = [];
      for (const id of ids as string[]) { const d = await store.getChallenge(id); if (!d) throw new HttpError(404, "not_found"); defs.push(d); }
      const errs = validateMonthlySet(defs);
      if (errs.length) return send(c, 422, { error: "invalid_month", problems: errs });
      for (const d of defs) { d.published = true; await store.saveChallenge(d); }
      await store.addAudit({ actorId: admin.id, action: "challenge.publish_month", resourceType: "challenge", resourceId: ids.join(","), from: "draft", to: "published", at: now() });
      return send(c, 200, { published: defs.length });
    }

    /* --- admin: payout status changes --- */
    if ((m = /^\/api\/admin\/payouts\/([\w-]{8,64})\/status$/.exec(path)) && method === "POST") {
      requireCsrf(c);
      const admin = requireUser(c);
      limit("adminAction", admin.id);
      const b = pick(await readJson(req), ["to", "reason", "txReference", "confirmPaid"]);
      const to = b["to"] as PayoutStatus;
      if (!["in_progress", "action_required", "paid", "failed", "rejected", "pending"].includes(to)) throw new HttpError(400, "invalid_status");
      requirePermission(c, to === "paid" ? "payouts.mark_paid" : "payouts.review");
      const p = await store.getPayout(m[1]!);
      if (!p) throw new HttpError(404, "not_found");
      try {
        assertTransition({ from: p.status, to, ...(typeof b["reason"] === "string" ? { reason: b["reason"] } : {}), ...(typeof b["txReference"] === "string" ? { txReference: b["txReference"] } : {}), confirmedPaid: b["confirmPaid"] === true });
      } catch (e) { throw new HttpError(409, (e as Error).message.replace(/\s+/g, "_").slice(0, 80)); }
      const before = p.status;
      p.status = to;
      if (to === "paid" && typeof b["txReference"] === "string") p.txReference = b["txReference"];
      if (typeof b["reason"] === "string") p.adminNotes = b["reason"];
      await store.savePayout(p);
      if (to === "paid") await store.addLedger({ id: randomUUID(), userId: p.userId, type: "pay", amountCents: p.amountCents, idempotencyKey: `pay:${p.id}` });
      if (to === "failed" || to === "rejected") await store.addLedger({ id: randomUUID(), userId: p.userId, type: "release", amountCents: p.amountCents, idempotencyKey: `release:${p.id}` });
      await store.addAudit({ actorId: admin.id, action: "payout.status", resourceType: "payout", resourceId: p.id, from: before, to, ...(typeof b["reason"] === "string" ? { reason: b["reason"] } : {}), at: now() });
      return send(c, 200, { id: p.id, status: p.status });
    }

    throw new HttpError(404, "not_found");
  }

  return async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const c: Ctx = { req, res, url: new URL(req.url ?? "/", "http://local"), ip: (deps.trustProxy ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0]?.trim() : "") || (req.socket.remoteAddress ?? "unknown"), setCookies: [], user: null, sid: null };
    try {
      await resolveSession(c);
      await route(c);
    } catch (e) {
      if (res.headersSent) return;
      if (e instanceof HttpError) return send(c, e.status, { error: e.code });
      return send(c, 500, { error: "internal_error" }); // no stack traces or internals to the client
    }
  };
}

export type { Role };
