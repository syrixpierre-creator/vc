import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { Store } from "../store/pg.ts";
import type { User } from "../store/types.ts";
import type { Jwks } from "../auth/oauth.ts";
import { hashSessionId, evaluateSession, DEFAULT_SESSION_POLICY } from "../auth/session.ts";
import { can, type Role } from "../auth/rbac.ts";
import { csrfValid, originAllowed } from "../security/csrf.ts";
import { memoryLimiter, RULES, type Limiter, type LimitRule } from "../security/ratelimit.ts";
import type { KeyRing } from "../security/crypto.ts";
import { DomainError } from "../domain/errors.ts";
import { memoryDispatcher, type Dispatcher } from "../services/queue.ts";
import type { Services } from "../services/notify.ts";
import { HttpError, parseCookies, ipPrefix, type Ctx } from "./kit.ts";
import { Router, type Access } from "./router.ts";
import { createStatic } from "./static.ts";
import { registerAuth, startSession, SID } from "./routes/auth.ts";
import { registerMe } from "./routes/me.ts";
import { registerContacts } from "./routes/contacts.ts";
import { registerSync } from "./routes/sync.ts";
import { registerMoney } from "./routes/money.ts";
import { registerEngage } from "./routes/engage.ts";
import { registerCommunity } from "./routes/community.ts";
import { registerAdmin } from "./routes/admin.ts";
import { registerAdminOps } from "./routes/admin-ops.ts";

export interface TokenResponse { idToken: string; accessToken?: string; refreshToken?: string; expiresIn?: number; scope?: string }
export interface GoogleClient {
  exchangeCode(code: string, codeVerifier: string, redirectUri: string): Promise<TokenResponse>;
  getJwks(): Promise<Jwks>;
  /** throws GoogleAuthError("invalid_grant") when the user revoked access */
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;
  /** best effort: tell Google to revoke a token */
  revokeToken(token: string): Promise<void>;
}
export interface AppConfig {
  appUrl: string; sessionSecret: string; adminEmail: string;
  google: { clientId: string; redirectUri: string; authEndpoint?: string };
  ads?: { enabled: boolean; clientId?: string };
  version?: string;
  /** directory with the web front end; when set, the app serves it (production without Caddy, Railway, Render) */
  webRoot?: string;
  supportEmail?: string;
}
export interface AppDeps {
  config: AppConfig;
  store: Store;
  google: GoogleClient;
  keyRing: KeyRing;
  now?: () => number;
  /** override per-route rate limits (tests, or tuning behind a trusted proxy) */
  rules?: Partial<Record<string, LimitRule>>;
  /** shared limiter (Redis in production); default: in-memory with `rules` */
  limiter?: Limiter;
  dispatch?: Dispatcher;
  /** true only behind our own reverse proxy: then the client IP comes from X-Forwarded-For */
  trustProxy?: boolean;
  /** real readiness probe (database, Redis); /healthz stays a cheap liveness check */
  ready?: () => Promise<boolean>;
  /** dependency health for the admin overview */
  health?: () => Promise<Record<string, unknown>>;
  log?: (level: string, msg: string, extra?: object) => void;
}

/** Everything a route module needs. */
export interface AppCtx {
  deps: AppDeps; config: AppConfig; store: Store; sv: Services; now: () => number;
  limit(name: string, key: string): Promise<void>;
  send(c: Ctx, status: number, body: unknown, headers?: Record<string, string>): void;
  router: Router;
}

const API_CSP = "default-src 'none'; frame-ancestors 'none'";

export function createApp(deps: AppDeps) {
  const { config, store } = deps;
  const now = deps.now ?? Date.now;
  const log = deps.log ?? ((level: string, msg: string, extra: object = {}) => { if (level !== "debug") console.log(JSON.stringify({ level, msg, ...extra })); });
  const rules = { ...RULES, ...deps.rules } as Record<string, LimitRule>;
  const limiter = deps.limiter ?? memoryLimiter(rules, now);
  const dispatch = deps.dispatch ?? memoryDispatcher();
  const sv: Services = { store, dispatch, now, keyRing: deps.keyRing, log };
  const router = new Router();

  function send(c: Ctx, status: number, body: unknown, headers: Record<string, string> = {}) {
    const isText = typeof body === "string" || Buffer.isBuffer(body);
    const res = c.res;
    res.statusCode = status;
    res.setHeader("Content-Type", isText ? "text/plain; charset=utf-8" : "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", API_CSP);
    res.setHeader("X-Request-Id", c.requestId);
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    if (c.setCookies.length) res.setHeader("Set-Cookie", c.setCookies);
    res.end(isText ? body : JSON.stringify(body));
  }
  async function limit(name: string, key: string) {
    const r = await limiter.check(name, key);
    if (!r.allowed) throw new HttpError(429, "rate_limited", { retryAfterMs: r.retryAfterMs });
  }
  const app: AppCtx = { deps, config, store, sv, now, limit, send, router };

  registerAuth(app);
  registerMe(app);
  registerContacts(app);
  registerSync(app);
  registerMoney(app);
  registerEngage(app);
  registerCommunity(app);
  registerAdmin(app);
  registerAdminOps(app);

  router.get("/healthz", { summary: "Liveness", tag: "system", access: "public" }, async c => send(c, 200, { ok: true }));
  router.get("/readyz", { summary: "Readiness (database and Redis reachable)", tag: "system", access: "public" }, async c => {
    let ok = false;
    try { ok = deps.ready ? await deps.ready() : true; } catch { ok = false; }
    send(c, ok ? 200 : 503, { ok });
  });
  router.get("/api/openapi.json", { summary: "This API description", tag: "system", access: "public" }, async c =>
    send(c, 200, router.openApi({ title: "SYRIX VCF API", version: config.version ?? "1.0.0", serverUrl: config.appUrl }), { "Cache-Control": "public, max-age=300" }));

  const statics = config.webRoot ? createStatic({ root: config.webRoot, appUrl: config.appUrl, ads: config.ads }) : null;

  /* ---------- session ---------- */
  async function resolveSession(c: Ctx) {
    const sid = parseCookies(c.req.headers.cookie)[SID];
    if (!sid || sid.length > 100) return;
    const rec = await store.getSession(hashSessionId(sid).toString("hex"));
    if (!rec) return;
    const state = evaluateSession(rec, now(), DEFAULT_SESSION_POLICY);
    if (state === "expired" || state === "revoked") return;
    let user = await store.getUser(rec.userId);
    if (!user) return;
    if (user.status === "suspended" && user.suspendedUntil && user.suspendedUntil <= now()) { // a temporary suspension ends by itself
      await store.setUserStatus(user.id, "active");
      await store.addSecurityEvent({ userId: user.id, kind: "suspension_expired", detail: {}, at: now() });
      user = (await store.getUser(user.id))!;
    }
    if (user.status !== "active" && user.status !== "pending_deletion") return;
    rec.lastSeenAt = now();
    rec.ipPrefix = ipPrefix(c.ip);
    let activeSid = sid;
    if (state === "rotate") { // new id, old one revoked
      activeSid = await startSession(app, c, user.id, rec.createdAt);
      rec.revokedAt = now();
    }
    await store.saveSession(rec);
    await store.touchUser(user.id);
    c.user = user;
    c.sid = activeSid;
  }

  async function enforce(c: Ctx, access: Access, method: string, allowWhenRestricted: boolean | undefined) {
    if (access === "public") return;
    const user = c.user;
    if (!user || !c.sid) throw new HttpError(401, "unauthenticated");
    const writes = method !== "GET";
    if (writes) {
      if (!originAllowed(c.req.headers.origin as string | undefined, config.appUrl)) throw new HttpError(403, "bad_origin");
      const tok = c.req.headers["x-csrf-token"];
      if (typeof tok !== "string" || !csrfValid(c.sid, tok, config.sessionSecret)) throw new HttpError(403, "bad_csrf");
    }
    if (typeof access === "object") {
      if (!can(user.roles, access.perm)) {
        await store.addSecurityEvent({ userId: user.id, kind: "admin_denied", detail: { perm: access.perm, path: c.url.pathname }, ipPrefix: ipPrefix(c.ip), at: now() });
        throw new HttpError(403, "forbidden");
      }
      if (writes) await limit("adminAction", user.id);
      return;
    }
    if (writes && !allowWhenRestricted) {
      if (user.status === "pending_deletion") throw new HttpError(403, "account_pending_deletion");
      if ((await store.activeRestrictions(user.id)).has("read_only")) throw new HttpError(403, "account_read_only");
      await limit("write", user.id);
    }
  }

  return async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const forwarded = deps.trustProxy ? String(req.headers["x-forwarded-for"] ?? "").split(",")[0]?.trim() : "";
    const c: Ctx = { req, res, url: new URL(req.url ?? "/", "http://local"), ip: forwarded || (req.socket.remoteAddress ?? "unknown"), setCookies: [], user: null, sid: null, params: {},
      requestId: randomUUID() };
    const method = req.method ?? "GET";
    const path = c.url.pathname;
    try {
      const isApi = path.startsWith("/api/") || path === "/healthz" || path === "/readyz" || path === "/register";
      if (!isApi && statics && (await statics.serve(req, res, path))) return;
      const found = router.match(method, path);
      if (found === null) throw new HttpError(404, "not_found");
      if (found === "method") throw new HttpError(405, "method_not_allowed");
      c.params = found.params;
      if (found.route.access !== "public" || path.startsWith("/api/auth/")) await resolveSession(c);
      await enforce(c, found.route.access, method, found.route.allowWhenRestricted);
      if (found.route.limit) await limit(found.route.limit, c.user?.id ?? c.ip); // declared per-route budget (per user, or per IP when signed out)
      await found.route.handler(c);
    } catch (e) {
      if (res.headersSent) { res.destroy(); return; }
      if (e instanceof HttpError) return send(c, e.status, { error: e.code, ...(e.extra ?? {}) }, e.status === 429 ? { "Retry-After": String(Math.ceil(Number(e.extra?.["retryAfterMs"] ?? 1000) / 1000)) } : {});
      if (e instanceof DomainError) return send(c, e.status, { error: e.code });
      log("error", "unhandled error", { requestId: c.requestId, path, error: (e as Error).message });
      return send(c, 500, { error: "internal_error", requestId: c.requestId }); // no stack traces or internals to the client
    }
  };
}

export type { Role, User };
