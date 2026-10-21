import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { request } from "node:http";
import { startHarness, APP } from "./harness.ts";

const web = mkdtempSync(join(tmpdir(), "syrix-web-"));
mkdirSync(join(web, "app")); mkdirSync(join(web, "admin")); mkdirSync(join(web, "assets"));
writeFileSync(join(web, "index.html"), `<!doctype html><link rel="canonical" href="%APP_URL%/"><title>home</title>`);
writeFileSync(join(web, "app", "index.html"), "<!doctype html><title>app</title>");
writeFileSync(join(web, "admin", "index.html"), "<!doctype html><title>admin</title>");
writeFileSync(join(web, "privacy.html"), "<!doctype html><title>privacy</title>");
writeFileSync(join(web, "404.html"), "<!doctype html><title>not found</title>");
writeFileSync(join(web, ".env"), "SECRET=1");
writeFileSync(join(web, "assets", "app.js"), "console.log(1)".repeat(200));
const h = await startHarness({ webRoot: web });
after(() => h.close());

/** Raw HTTP request (fetch normalises "..", which would hide traversal attempts). */
function raw(path: string, headers: Record<string, string> = {}): Promise<{ status: number; headers: Record<string, string | string[] | undefined>; body: string }> {
  const u = new URL(h.base);
  return new Promise((res, rej) => {
    const r = request({ host: u.hostname, port: u.port, path, method: "GET", headers }, x => { let b = ""; x.on("data", c => (b += c)); x.on("end", () => res({ status: x.statusCode!, headers: x.headers, body: b })); });
    r.on("error", rej); r.end();
  });
}

test("static: pages are served with a strict CSP (no inline script/style), anti-framing and the canonical URL filled in", async () => {
  const r = await raw("/");
  assert.equal(r.status, 200);
  const csp = String(r.headers["content-security-policy"]);
  assert.match(csp, /script-src 'self'(;|$)/);
  assert.ok(!csp.includes("unsafe-inline") && !csp.includes("unsafe-eval"));
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(r.headers["x-frame-options"], "DENY");
  assert.ok(r.body.includes(`href="${APP}/"`), "%APP_URL% replaced");
  assert.equal((await raw("/privacy")).body.includes("privacy"), true, "clean URLs");
  assert.ok((await raw("/app/")).body.includes("<title>app"));
  assert.ok((await raw("/app/anything/deep")).body.includes("<title>app"), "single-page app fallback");
  assert.ok((await raw("/admin/users")).body.includes("<title>admin"));
  assert.equal((await raw("/app")).status, 308);
});

test("static: path traversal, encoded traversal and dotfiles are refused", async () => {
  for (const p of ["/../../etc/passwd", "/..%2f..%2fetc%2fpasswd", "/%2e%2e/%2e%2e/etc/passwd", "/assets/..%5c..%5cpackage.json", "/.env", "/assets/%00.js"]) {
    const r = await raw(p);
    assert.ok(r.status === 404 || r.status === 400 || r.status === 403, `${p} -> ${r.status}`);
    assert.ok(!r.body.includes("root:") && !r.body.includes("SECRET"), p);
  }
});

test("static: compression, caching validators and a friendly 404", async () => {
  const r = await raw("/assets/app.js", { "accept-encoding": "br, gzip" });
  assert.equal(r.headers["content-encoding"], "br");
  const etag = String(r.headers["etag"]);
  assert.equal((await raw("/assets/app.js", { "if-none-match": etag })).status, 304);
  const nf = await raw("/missing-page", { accept: "text/html" });
  assert.equal(nf.status, 404);
  assert.ok(nf.body.includes("not found"));
  assert.equal((await raw("/missing.js")).status, 404);
});

test("sitemap and robots point to the configured site; the app, admin and API are not indexed", async () => {
  const sm = await raw("/sitemap.xml");
  assert.ok(sm.body.includes(`<loc>${APP}/</loc>`) && sm.body.includes("/legal/privacy"));
  const rb = await raw("/robots.txt");
  assert.ok(rb.body.includes("Disallow: /app/") && rb.body.includes("Disallow: /admin/") && rb.body.includes(`Sitemap: ${APP}/sitemap.xml`));
});

test("API hygiene: bad JSON, oversized JSON, unknown routes and methods give clean errors without internals", async () => {
  const s = await h.login("hy1", "hy1@x.com");
  const bad = await fetch(`${h.base}/api/contacts`, { method: "POST", headers: { cookie: s.cookie, origin: APP, "x-csrf-token": s.csrf, "content-type": "application/json" }, body: "{not json" });
  assert.deepEqual([bad.status, await bad.json()], [400, { error: "invalid_json" }]);
  const big = await h.send(s, "/api/contacts", { fullName: "x".repeat(70_000) });
  assert.equal(big.status, 413);
  const nf = await fetch(`${h.base}/api/nothing-here`);
  assert.deepEqual([nf.status, await nf.json()], [404, { error: "not_found" }]);
  assert.equal((await fetch(`${h.base}/api/contacts`, { method: "PUT" })).status, 405);
  assert.equal((await h.send(s, "/api/contacts/not-a-uuid", {}, "PATCH")).status, 404, "ids are validated by the router");
  const e = await h.send(s, "/api/contacts", { fullName: "A", __proto__: { admin: true }, constructor: "x" });
  assert.equal(e.status, 400, "unknown fields (prototype tricks) are refused");
});

test("XSS: stored text is returned as JSON data, escaped in vCards; the API never answers HTML", async () => {
  const s = await h.login("xss1", "xss1@x.com");
  const payload = `<img src=x onerror=alert(1)><script>alert(2)</script>`;
  const c = await h.json<{ id: string; fullName: string }>(h.send(s, "/api/contacts", { fullName: payload, notes: payload }));
  assert.equal(c.fullName, payload, "kept as data; the UI renders it with textContent only");
  const r = await h.get(s, `/api/contacts/${c.id}`);
  assert.match(r.headers.get("content-type")!, /application\/json/);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("content-security-policy"), "default-src 'none'; frame-ancestors 'none'");
  const vcf = await (await h.get(s, "/api/contacts/export")).text();
  assert.ok(!/\r\n(BEGIN|END):VCARD.*onerror/.test(vcf));
  assert.equal((await h.send(s, "/api/me", { name: "Ok\u0000Name" }, "PATCH")).status, 400, "control characters refused");
});

test("session fixation and cookie theft limits: a new session id at login; the session cookie is HttpOnly + Secure + __Host-", async () => {
  const start = await fetch(`${h.base}/api/auth/google/start`, { redirect: "manual" });
  const oauth = start.headers.getSetCookie().find(c => c.startsWith("__Host-oauth="))!;
  for (const f of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(oauth.includes(f), f);
  const s1 = await h.login("fx1", "fx1@x.com");
  const s2 = await h.login("fx1", "fx1@x.com");
  assert.notEqual(s1.cookie, s2.cookie, "every login issues a fresh id");
  const stored = await h.sql("SELECT encode(id_hash, 'hex') AS h FROM sessions WHERE user_id = $1", [s1.userId]);
  assert.ok(stored.every(r => !s1.cookie.includes(String(r["h"]))), "only the hash is stored");
});

test("secrets never leave the server: /api/me, contacts status and errors expose no token, key or stack", async () => {
  const s = await h.login("sec1", "sec1@x.com");
  await h.connectContacts(s, { sub: "sec1", email: "sec1@x.com", accessToken: "at-SUPERSECRET", refreshToken: "rt-SUPERSECRET" });
  for (const p of ["/api/me", "/api/google-contacts/status", "/api/dashboard", "/api/me/export"]) {
    const body = await (await h.get(s, p)).text();
    assert.ok(!body.includes("SUPERSECRET") && !body.includes("v1:"), p);
  }
  const rows = await h.sql("SELECT refresh_token_enc FROM oauth_accounts WHERE user_id = $1", [s.userId]);
  assert.ok(!String(rows[0]!["refresh_token_enc"]).includes("SUPERSECRET"));
});

test("privilege escalation: a user cannot grant themselves roles or reach admin data through any user route", async () => {
  const s = await h.login("pe1", "pe1@x.com");
  for (const body of [{ roles: ["super_admin"] }, { status: "active" }, { reviewStatus: "cleared" }, { premiumUntil: 9e12 }]) assert.equal((await h.send(s, "/api/me", body, "PATCH")).status, 400, JSON.stringify(body));
  assert.equal((await h.send(s, `/api/admin/users/${s.userId}/roles`, { roles: ["auditor"], reason: "please" }, "PUT")).status, 403);
  assert.equal((await h.send(s, "/api/me/settings", { profilePublic: true, leaderboardOptIn: true }, "PATCH")).status, 400, "unknown field");
});

test("route table: every admin route requires an admin permission, every state change requires CSRF, no route exposes contact contents to staff", async () => {
  const doc = await h.json<{ paths: Record<string, Record<string, { security: unknown[]; description?: string; tags: string[] }>> }>(fetch(`${h.base}/api/openapi.json`));
  for (const [p, ops] of Object.entries(doc.paths)) for (const [m, op] of Object.entries(ops)) {
    if (p.startsWith("/api/admin")) assert.match(op.description ?? "", /Requires admin permission/, `${m} ${p}`);
    if (m !== "get" && p !== "/api/auth/google/callback") assert.ok(op.security.length === 0 ? ["/api/auth/google/start"].includes(p) || false : /CSRF|x-csrf-token/.test(op.description ?? ""), `${m} ${p} should need CSRF`);
    if (p.startsWith("/api/admin")) assert.ok(!/contacts\/\{|address book/i.test(p), `${p} must not expose contacts`);
  }
});

test("rate limiting: sign-in attempts per address are capped", async () => {
  const h2 = await startHarness({ rules: { authCallback: { max: 3, windowMs: 60_000 } } });
  try {
    const st = [];
    for (let i = 0; i < 5; i++) st.push((await fetch(`${h2.base}/api/auth/google/start`, { redirect: "manual" })).status);
    assert.deepEqual(st, [302, 302, 302, 429, 429]);
    const r = await fetch(`${h2.base}/api/auth/google/start`, { redirect: "manual" });
    assert.ok(Number(r.headers.get("retry-after")) >= 1, "Retry-After header");
  } finally { await h2.close(); }
});

test("referral landing: only well-formed codes are remembered; anything else goes home", async () => {
  for (const ref of ["<script>", "abc", "../../x", "AAAAAAAAAAAAAAAAAAAAAAA"]) {
    const r = await fetch(`${h.base}/register?ref=${encodeURIComponent(ref)}`, { redirect: "manual" });
    assert.equal(r.headers.get("location"), "/", ref);
    assert.ok(!r.headers.getSetCookie().some(c => c.startsWith("__Host-ref=")), ref);
  }
});

test("payout details: a recovery phrase is refused with an explicit warning, whatever the method", async () => {
  const u = await h.login("phrase-1", "phrase@example.com");
  const phrase = "abandon ability able about above absent absorb abstract absurd abuse access accident";
  for (const kind of ["paypal", "binance_pay", "pix"]) {
    const r = await h.send(u, "/api/payout-methods", { kind, details: phrase, recipientName: "Someone" });
    assert.equal(r.status, 400, kind);
    assert.equal(((await r.json()) as { error: string }).error, "looks_like_secret", kind);
  }
});

test("profile: UTC is an accepted time zone (browsers report it; Intl's list omits it)", async () => {
  const u = await h.login("tz-1", "tz@example.com");
  const r = await h.send(u, "/api/me", { timeZone: "UTC" }, "PATCH");
  assert.equal(r.status, 200);
  assert.equal((await h.json<{ timeZone: string }>(h.get(u, "/api/me"))).timeZone, "UTC");
  assert.equal((await h.send(u, "/api/me", { timeZone: "Mars/Olympus" }, "PATCH")).status, 400);
});
