import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign, createHmac } from "node:crypto";
import { newOAuthRequest, buildAuthUrl, verifyIdToken, statesMatch, LOGIN_SCOPES, CONTACTS_SCOPES, type Jwks } from "../src/auth/oauth.ts";
import { newSessionId, hashSessionId, evaluateSession, DEFAULT_SESSION_POLICY, sessionCookie, type SessionRow } from "../src/auth/session.ts";
import { can, decideAdmin, permissionsFor } from "../src/auth/rbac.ts";
import { safeRedirectPath } from "../src/security/redirect.ts";
import { RateLimiter } from "../src/security/ratelimit.ts";
import { csrfToken, csrfValid, originAllowed } from "../src/security/csrf.ts";

/* ---------- a local fake "Google": real RSA signatures, no network ---------- */
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...(publicKey.export({ format: "jwk" }) as Record<string, unknown>), kid: "k1" } as unknown as Jwks["keys"][number];
const jwks: Jwks = { keys: [jwk] };
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const NOW = 1_800_000_000_000;
const sec = Math.floor(NOW / 1000);

function token(over: Record<string, unknown> = {}, header: Record<string, unknown> = {}): string {
  const h = b64({ alg: "RS256", kid: "k1", typ: "JWT", ...header });
  const p = b64({ iss: "https://accounts.google.com", aud: "client-123", sub: "109876", email: "Admin@Gmail.com", email_verified: true,
    nonce: "n-1", iat: sec - 10, exp: sec + 3000, name: "Syrix", ...over });
  const s = sign("RSA-SHA256", Buffer.from(`${h}.${p}`), privateKey).toString("base64url");
  return `${h}.${p}.${s}`;
}
const check = { audience: "client-123", nonce: "n-1", now: NOW };

test("id token: valid token yields the identity, email lower-cased", () => {
  const id = verifyIdToken(token(), jwks, check);
  assert.equal(id.sub, "109876");
  assert.equal(id.email, "admin@gmail.com");
});
test("id token: wrong audience, issuer, nonce and expiry are rejected", () => {
  assert.throws(() => verifyIdToken(token({ aud: "someone-else" }), jwks, check), /audience/);
  assert.throws(() => verifyIdToken(token({ iss: "https://evil.example" }), jwks, check), /issuer/);
  assert.throws(() => verifyIdToken(token({ nonce: "other" }), jwks, check), /nonce/);
  assert.throws(() => verifyIdToken(token({ exp: sec - 600 }), jwks, check), /expired/);
  assert.throws(() => verifyIdToken(token({ iat: sec + 3600 }), jwks, check), /future/);
});
test("id token: unverified email is rejected", () => {
  assert.throws(() => verifyIdToken(token({ email_verified: false }), jwks, check), /not verified/);
});
test("id token: alg none, HS256 key-confusion and unknown kid are rejected", () => {
  const p = b64({ iss: "https://accounts.google.com", aud: "client-123", sub: "1", email: "a@b.co", email_verified: true, nonce: "n-1", exp: sec + 100 });
  assert.throws(() => verifyIdToken(`${b64({ alg: "none", kid: "k1" })}.${p}.`, jwks, check), /algorithm/);
  const h = b64({ alg: "HS256", kid: "k1" });
  const mac = createHmac("sha256", JSON.stringify(jwk)).update(`${h}.${p}`).digest("base64url");
  assert.throws(() => verifyIdToken(`${h}.${p}.${mac}`, jwks, check), /algorithm/);
  assert.throws(() => verifyIdToken(token({}, { kid: "nope" }), jwks, check), /unknown signing key/);
});
test("id token: tampered payload fails the signature check", () => {
  const [h, , s] = token().split(".");
  const forged = b64({ iss: "https://accounts.google.com", aud: "client-123", sub: "ATTACKER", email: "admin@gmail.com", email_verified: true, nonce: "n-1", exp: sec + 3000 });
  assert.throws(() => verifyIdToken(`${h}.${forged}.${s}`, jwks, check), /bad signature/);
});

/* ---------- authorization URL ---------- */
test("auth URL: PKCE S256, state and nonce present; login asks for no Contacts scope", () => {
  const req = newOAuthRequest();
  const url = new URL(buildAuthUrl({ clientId: "c", redirectUri: "https://x.example/cb", scopes: LOGIN_SCOPES, req }));
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("state"), req.state);
  assert.equal(url.searchParams.get("nonce"), req.nonce);
  assert.ok(!url.searchParams.get("scope")!.includes("contacts"));
  assert.equal(url.searchParams.get("access_type"), null, "no refresh token for sign-in only");
});
test("auth URL: Contacts connection is a separate, incremental request with offline access", () => {
  const url = new URL(buildAuthUrl({ clientId: "c", redirectUri: "https://x.example/cb", scopes: CONTACTS_SCOPES, req: newOAuthRequest() }));
  assert.ok(url.searchParams.get("scope")!.includes("auth/contacts"));
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("include_granted_scopes"), "true");
});
test("oauth: two requests never share state/nonce; state comparison is exact", () => {
  const a = newOAuthRequest(), b = newOAuthRequest();
  assert.notEqual(a.state, b.state);
  assert.notEqual(a.nonce, b.nonce);
  assert.equal(statesMatch(a.state, a.state), true);
  assert.equal(statesMatch(a.state, b.state), false);
  assert.equal(statesMatch("", ""), false);
});

/* ---------- sessions ---------- */
test("session: only the hash is stored; ids are unique", () => {
  const id = newSessionId();
  assert.notEqual(id, newSessionId());
  assert.equal(hashSessionId(id).length, 32);
  assert.ok(!hashSessionId(id).toString("base64url").includes(id));
});
test("session: valid, rotate, idle expiry, absolute expiry, revoked", () => {
  const day = 24 * 3600_000;
  const base: SessionRow = { createdAt: NOW, rotatedAt: NOW, expiresAt: NOW + 40 * day, revokedAt: null, lastSeenAt: NOW };
  assert.equal(evaluateSession(base, NOW + 1000), "valid");
  assert.equal(evaluateSession({ ...base, lastSeenAt: NOW + 2 * day }, NOW + 2 * day), "rotate");
  assert.equal(evaluateSession({ ...base, lastSeenAt: NOW + 3 * day }, NOW + 20 * day), "expired", "idle");
  assert.equal(evaluateSession({ ...base, lastSeenAt: NOW + 29 * day }, NOW + DEFAULT_SESSION_POLICY.absoluteMs), "expired", "absolute");
  assert.equal(evaluateSession({ ...base, revokedAt: NOW }, NOW + 1), "revoked");
});
test("session cookie is __Host-, HttpOnly, Secure, SameSite", () => {
  const c = sessionCookie("v", 60);
  for (const part of ["__Host-sid=", "HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(c.includes(part));
  assert.ok(!/Domain=/i.test(c));
});

/* ---------- roles and admin bootstrap ---------- */
test("rbac: least privilege, nobody reads contact contents", () => {
  assert.equal(can(["support_agent"], "payouts.mark_paid"), false);
  assert.equal(can(["support_agent"], "ledger.adjust"), false);
  assert.equal(can(["finance_manager"], "payouts.mark_paid"), true);
  assert.equal(can(["finance_manager"], "users.suspend"), false);
  assert.equal(can(["auditor"], "payouts.review"), false);
  assert.equal(can(["challenge_manager"], "payouts.read"), false);
  assert.equal(can(["super_admin"], "roles.manage"), true);
  assert.ok(!permissionsFor(["super_admin"]).some(p => p.startsWith("contacts")));
});
test("admin bootstrap: verified email only, then the Google subject is pinned", () => {
  const me = { email: "SyrixCompany@gmail.com", emailVerified: true, sub: "S1" };
  assert.deepEqual(decideAdmin(me, "syrixcompany@gmail.com", null), { isSuperAdmin: true, pinSub: "S1" });
  assert.deepEqual(decideAdmin(me, "syrixcompany@gmail.com", "S1"), { isSuperAdmin: true });
  assert.equal(decideAdmin({ ...me, sub: "S2" }, "syrixcompany@gmail.com", "S1").isSuperAdmin, false, "same email, other person");
  assert.equal(decideAdmin({ ...me, emailVerified: false }, "syrixcompany@gmail.com", null).isSuperAdmin, false);
  assert.equal(decideAdmin({ ...me, email: "other@gmail.com" }, "syrixcompany@gmail.com", null).isSuperAdmin, false);
});

/* ---------- redirects, rate limit, csrf ---------- */
test("redirect: open-redirect payloads fall back to /app", () => {
  assert.equal(safeRedirectPath("/app/contacts?x=1"), "/app/contacts?x=1");
  for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/%2F%2Fevil.example",
    "/app\r\nSet-Cookie:x=1", "", undefined, 42, "/https://evil.example"]) {
    assert.equal(safeRedirectPath(bad), "/app", String(bad));
  }
});
test("rate limit: blocks after the budget, recovers after the window", () => {
  let t = 0;
  const rl = new RateLimiter({ max: 3, windowMs: 1000 }, () => t);
  assert.equal(rl.check("u1").allowed, true);
  assert.equal(rl.check("u1").allowed, true);
  assert.equal(rl.check("u1").allowed, true);
  const blocked = rl.check("u1");
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterMs > 0);
  assert.equal(rl.check("u2").allowed, true, "other keys unaffected");
  t = 1001;
  assert.equal(rl.check("u1").allowed, true);
});
test("csrf: token is bound to the session; foreign origins are refused", () => {
  const tok = csrfToken("sess-A", "secret-secret-secret-secret-1234");
  assert.equal(csrfValid("sess-A", tok, "secret-secret-secret-secret-1234"), true);
  assert.equal(csrfValid("sess-B", tok, "secret-secret-secret-secret-1234"), false);
  assert.equal(csrfValid("sess-A", "forged", "secret-secret-secret-secret-1234"), false);
  assert.equal(originAllowed("https://vcf.example.com", "https://vcf.example.com"), true);
  assert.equal(originAllowed("https://evil.example", "https://vcf.example.com"), false);
  assert.equal(originAllowed(undefined, "https://vcf.example.com"), false);
});
