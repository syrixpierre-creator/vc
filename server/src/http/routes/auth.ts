import { randomUUID, createHash } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { Role } from "../../auth/rbac.ts";
import { HttpError, parseCookies, ipPrefix, LANGS, type Ctx } from "../kit.ts";
import { DuplicateError } from "../../store/types.ts";
import { newOAuthRequest, buildAuthUrl, verifyIdToken, statesMatch, LOGIN_SCOPES, CONTACTS_SCOPES } from "../../auth/oauth.ts";
import { newSessionId, hashSessionId, sessionCookie, DEFAULT_SESSION_POLICY } from "../../auth/session.ts";
import { decideAdmin } from "../../auth/rbac.ts";
import { safeRedirectPath } from "../../security/redirect.ts";
import { encrypt } from "../../security/crypto.ts";
import { refreshContext, accessContext } from "../../sync/ports.ts";
import { notify } from "../../services/notify.ts";

export const SID = "__Host-sid";
const OAUTH_COOKIE = "__Host-oauth";
const REF_COOKIE = "__Host-ref";
const REF_RE = /^[A-Z0-9]{8,12}$/;

export async function startSession(app: AppCtx, c: Ctx, userId: string, createdAt = app.now()): Promise<string> {
  const id = newSessionId();
  const t = app.now();
  await app.store.createSession({ idHash: hashSessionId(id).toString("hex"), userId, createdAt, rotatedAt: t, expiresAt: createdAt + DEFAULT_SESSION_POLICY.absoluteMs, lastSeenAt: t, revokedAt: null,
    userAgent: String(c.req.headers["user-agent"] ?? "").slice(0, 200), ipPrefix: ipPrefix(c.ip) });
  c.setCookies.push(sessionCookie(id, Math.floor(DEFAULT_SESSION_POLICY.absoluteMs / 1000)));
  return id;
}

/** Visible failure page for people (not raw JSON) when the browser is sent back from Google. */
const fail = (app: AppCtx, c: Ctx, code: string) => app.send(c, 302, "", { Location: `/signin-error?e=${encodeURIComponent(code)}` });

export function registerAuth(app: AppCtx) {
  const { router: r, store, config, now, send } = app;
  const networkHash = (ip: string) => createHash("sha256").update(`${config.sessionSecret}:net:${ip}`).digest("hex");

  r.get("/api/auth/google/start", { summary: "Start Google sign-in (OpenID Connect + PKCE). Optional ?ref=CODE&next=/path&lang=xx", tag: "auth", access: "public", limit: "authCallback" }, async c => {
    const o = newOAuthRequest();
    const refParam = c.url.searchParams.get("ref") ?? parseCookies(c.req.headers.cookie)[REF_COOKIE] ?? "";
    await store.putPending(o.state, { nonce: o.nonce, codeVerifier: o.codeVerifier, next: safeRedirectPath(c.url.searchParams.get("next")), expiresAt: now() + 10 * 60_000,
      ...(REF_RE.test(refParam) ? { ref: refParam } : {}) });
    c.setCookies.push(`${OAUTH_COOKIE}=${o.state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`); // binds the flow to this browser
    const lang = c.url.searchParams.get("lang");
    if (lang && (LANGS as readonly string[]).includes(lang)) c.setCookies.push(`lang=${lang}; Path=/; Secure; SameSite=Lax; Max-Age=31536000`);
    send(c, 302, "", { Location: buildAuthUrl({ clientId: config.google.clientId, redirectUri: config.google.redirectUri, scopes: LOGIN_SCOPES, req: o, ...(config.google.authEndpoint ? { endpoint: config.google.authEndpoint } : {}) }) });
  });

  r.get("/api/auth/google/callback", { summary: "Google redirect target (sign-in and Contacts consent)", tag: "auth", access: "public", limit: "authCallback" }, async c => {
    const state = c.url.searchParams.get("state") ?? "";
    const code = c.url.searchParams.get("code") ?? "";
    const bound = parseCookies(c.req.headers.cookie)[OAUTH_COOKIE] ?? "";
    const clearOauth = `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
    if (!state || !statesMatch(state, bound)) {
      await store.addSecurityEvent({ kind: "oauth_state_mismatch", detail: {}, ipPrefix: ipPrefix(c.ip), at: now() });
      return fail(app, c, "expired"); // a browser navigation: show a page, not JSON
    }
    const pending = await store.takePending(state);
    if (!pending) return fail(app, c, "expired");
    if (c.url.searchParams.get("error")) { // the user pressed Cancel at Google
      c.setCookies.push(clearOauth);
      if (pending.purpose === "contacts") return send(c, 302, "", { Location: `${pending.next}?e=denied` });
      return fail(app, c, "denied");
    }
    if (!code) return fail(app, c, "expired");
    let ident, tok;
    try {
      tok = await app.deps.google.exchangeCode(code, pending.codeVerifier, config.google.redirectUri);
      ident = verifyIdToken(tok.idToken, await app.deps.google.getJwks(), { audience: config.google.clientId, nonce: pending.nonce, now: now() });
    } catch {
      await store.addSecurityEvent({ kind: "login_failed", detail: { reason: "google_verification_failed" }, ipPrefix: ipPrefix(c.ip), at: now() });
      c.setCookies.push(clearOauth);
      return fail(app, c, "verification");
    }

    if (pending.purpose === "contacts") { // connecting Google Contacts: bound to the signed-in user, never to someone else's account
      const me = c.user;
      if (!me || pending.userId !== me.id) throw new HttpError(403, "session_mismatch");
      c.setCookies.push(clearOauth);
      if (ident.sub !== me.googleSub) return send(c, 302, "", { Location: `${pending.next}?e=account` }); // contacts only go to the account the user signed in with; nothing stored
      const granted = (tok.scope ?? "").split(" ").includes(CONTACTS_SCOPES[0]);
      if (!granted) return send(c, 302, "", { Location: `${pending.next}?e=scope` }); // granular consent: the user unticked Contacts
      if (!tok.refreshToken || !tok.accessToken) return send(c, 302, "", { Location: `${pending.next}?e=token` });
      await store.saveConnection(me.id, { status: "connected", refreshTokenEnc: encrypt(tok.refreshToken, app.deps.keyRing, refreshContext(me.id)),
        accessTokenEnc: encrypt(tok.accessToken, app.deps.keyRing, accessContext(me.id)), accessExpiresAt: now() + (tok.expiresIn ?? 3600) * 1000 });
      await store.addSecurityEvent({ userId: me.id, kind: "google_contacts_connected", detail: {}, ipPrefix: ipPrefix(c.ip), at: now() });
      const retried = await store.retryFailedSyncJobs(me.id); // jobs that failed while access was missing go again
      if (retried) for (const j of (await store.listSyncJobsFor(me.id, 200)).filter(j => j.status === "pending")) await app.sv.dispatch.syncJob(j.id, j.attempts);
      return send(c, 302, "", { Location: `${pending.next}?e=ok` });
    }

    let user = await store.findUserBySub(ident.sub);
    const isNew = !user;
    if (!user) {
      const cookieLang = parseCookies(c.req.headers.cookie)["lang"];
      const accept = String(c.req.headers["accept-language"] ?? "").slice(0, 2).toLowerCase();
      const language = (LANGS as readonly string[]).includes(cookieLang ?? "") ? cookieLang! : (LANGS as readonly string[]).includes(accept) ? accept : "en";
      user = await store.createUser({ googleSub: ident.sub, email: ident.email, name: (ident.name ?? ident.email.split("@")[0] ?? "").slice(0, 120), language, dialCode: "", status: "active", roles: [],
        ...(ident.picture && /^https:\/\/lh3\.googleusercontent\.com\//.test(ident.picture) ? { avatarUrl: ident.picture.slice(0, 500) } : {}) });
    }
    if (user.status === "suspended" && !(user.suspendedUntil && user.suspendedUntil <= now())) {
      await store.addSecurityEvent({ userId: user.id, kind: "login_blocked_suspended", detail: {}, ipPrefix: ipPrefix(c.ip), at: now() });
      c.setCookies.push(clearOauth);
      return fail(app, c, "suspended");
    }
    if (user.status === "suspended") await store.setUserStatus(user.id, "active");
    if (user.status === "deleted") { c.setCookies.push(clearOauth); return fail(app, c, "deleted"); }
    const decision = decideAdmin(ident, config.adminEmail, await store.getSetting("admin_sub"));
    if (decision.pinSub) await store.setSetting("admin_sub", decision.pinSub);
    const roles: Role[] = user.roles.filter(x => x !== "super_admin");
    if (decision.isSuperAdmin) roles.push("super_admin");
    if (roles.join() !== user.roles.join()) await store.setRoles(user.id, roles, null);
    if (ident.email !== user.email) await store.saveUser({ ...user, email: ident.email }); // e-mail is an attribute; the Google subject is the identity
    user = (await store.getUser(user.id))!;

    if (isNew && pending.ref) { // server-side attribution at registration; clicks alone are never counted
      const referrerId = await store.findUserIdByReferralCode(pending.ref);
      if (referrerId && referrerId !== user.id) {
        try { await store.createReferral({ id: randomUUID(), referrerId, referredId: user.id, status: "pending", networkHash: networkHash(c.ip), createdAt: now() }); }
        catch (e) { if (!(e instanceof DuplicateError)) throw e; }
      }
    }
    await startSession(app, c, user.id); // a fresh id at login: no session fixation
    await store.addSecurityEvent({ userId: user.id, kind: isNew ? "account_created" : "login", detail: { ua: String(c.req.headers["user-agent"] ?? "").slice(0, 120) }, ipPrefix: ipPrefix(c.ip), at: now() });
    if (user.status === "pending_deletion") await notify(app.sv, user.id, "account_deletion", { status: "pending", canCancel: true });
    c.setCookies.push(clearOauth, `${REF_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    const next = !user.onboardedAt && pending.next.startsWith("/app") ? "/app/#/onboarding" : pending.next;
    send(c, 302, "", { Location: next });
  });

  r.post("/api/auth/logout", { summary: "Sign out (revokes this session)", tag: "auth", access: "write", allowWhenRestricted: true }, async c => {
    const rec = await store.getSession(hashSessionId(c.sid!).toString("hex"));
    if (rec) { rec.revokedAt = now(); await store.saveSession(rec); }
    c.setCookies.push(`${SID}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    send(c, 200, { ok: true });
  });

  /** Referral link: counts the click (once per network per hour; a click never qualifies anything), remembers the code for 30 days, shows the home page. */
  r.get("/register", { summary: "Referral link landing (?ref=CODE)", tag: "referrals", access: "public", limit: "referralClick" }, async c => {
    const ref = c.url.searchParams.get("ref") ?? "";
    if (REF_RE.test(ref)) {
      const referrerId = await store.findUserIdByReferralCode(ref);
      if (referrerId) {
        const ipHash = networkHash(c.ip);
        if (!(await store.recentClickFrom(referrerId, ipHash, now() - 3600_000))) await store.addReferralClick(referrerId, ref, ipHash);
        c.setCookies.push(`${REF_COOKIE}=${ref}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}`);
        return send(c, 302, "", { Location: `/?ref=${ref}#join` });
      }
    }
    send(c, 302, "", { Location: "/" });
  });
}
