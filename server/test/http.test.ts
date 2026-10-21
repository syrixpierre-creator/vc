import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startHarness, APP, type Session } from "./harness.ts";

const h = await startHarness();
after(() => h.close());
const { base, login } = h;
const post = (s: Session, path: string, body: unknown, method = "POST", origin = APP, text = false) =>
  fetch(`${base}${path}`, { method, headers: { cookie: s.cookie, origin, "x-csrf-token": s.csrf, "content-type": text ? "text/plain" : "application/json" }, body: text ? String(body) : JSON.stringify(body) });
const codes = h.codes;
const idToken = h.idToken;

test("health check and security headers", async () => {
  const r = await fetch(`${base}/healthz`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.match(r.headers.get("content-security-policy")!, /frame-ancestors 'none'/);
  assert.equal(r.headers.get("cache-control"), "no-store");
});

test("unauthenticated requests are refused", async () => {
  for (const p of ["/api/me", "/api/contacts", "/api/wallet", "/api/contacts/export"]) assert.equal((await fetch(`${base}${p}`)).status, 401, p);
});

test("login: callback without the browser-bound cookie or with a replayed state is refused", async () => {
  const start = await fetch(`${base}/api/auth/google/start`, { redirect: "manual" });
  const loc = new URL(start.headers.get("location")!);
  const state = loc.searchParams.get("state")!;
  codes.set("c-x", { idToken: idToken(loc.searchParams.get("nonce")!, "sX", "x@x.com") });
  assert.equal((await fetch(`${base}/api/auth/google/callback?state=${state}&code=c-x`, { redirect: "manual" })).status, 400, "no cookie");
  const ok = await fetch(`${base}/api/auth/google/callback?state=${state}&code=c-x`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.equal(ok.status, 302);
  const replay = await fetch(`${base}/api/auth/google/callback?state=${state}&code=c-x`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.equal(replay.status, 400, "state is one-time use");
});

test("login: unverified Google email is refused", async () => {
  const start = await fetch(`${base}/api/auth/google/start`, { redirect: "manual" });
  const loc = new URL(start.headers.get("location")!);
  const state = loc.searchParams.get("state")!;
  codes.set("c-u", { idToken: idToken(loc.searchParams.get("nonce")!, "sU", "u@x.com", false) });
  const r = await fetch(`${base}/api/auth/google/callback?state=${state}&code=c-u`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.equal(r.status, 401);
});

test("login: session cookie flags and redirect target are safe", async () => {
  const start = await fetch(`${base}/api/auth/google/start?next=https://evil.example`, { redirect: "manual" });
  const loc = new URL(start.headers.get("location")!);
  const state = loc.searchParams.get("state")!;
  codes.set("c-r", { idToken: idToken(loc.searchParams.get("nonce")!, "sR", "r@x.com") });
  const cb = await fetch(`${base}/api/auth/google/callback?state=${state}&code=c-r`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.equal(cb.headers.get("location"), "/app/#/onboarding", "open redirect neutralised (a new account goes to onboarding inside the app)");
  const sid = cb.headers.getSetCookie().find(c => c.startsWith("__Host-sid=") && !c.includes("Max-Age=0"))!;
  for (const f of ["HttpOnly", "Secure", "SameSite=Lax", "Path=/"]) assert.ok(sid.includes(f), f);
});

test("CSRF and origin: state-changing calls without a valid token or origin are refused", async () => {
  const a = await login("sA", "a@x.com");
  const body = JSON.stringify({ fullName: "Test", phone: "+33612345678" });
  assert.equal((await fetch(`${base}/api/contacts`, { method: "POST", headers: { cookie: a.cookie, origin: APP }, body })).status, 403, "no csrf token");
  assert.equal((await fetch(`${base}/api/contacts`, { method: "POST", headers: { cookie: a.cookie, origin: "https://evil.example", "x-csrf-token": a.csrf }, body })).status, 403, "foreign origin");
  assert.equal((await fetch(`${base}/api/contacts`, { method: "POST", headers: { cookie: a.cookie, origin: APP, "x-csrf-token": "forged" }, body })).status, 403, "forged token");
  assert.equal((await post(a, "/api/contacts", { fullName: "Test", phone: "+33612345678" })).status, 201);
});

test("contacts: validation, duplicate phone, search, pagination cap", async () => {
  const a = await login("sB", "b@x.com");
  assert.equal((await post(a, "/api/contacts", { fullName: "", phone: "+33612345678" })).status, 400);
  assert.equal((await post(a, "/api/contacts", { fullName: "Bad", phone: "123" })).status, 400);
  assert.equal((await post(a, "/api/contacts", { fullName: "Ok", phone: "+33611111111" })).status, 201);
  assert.equal((await post(a, "/api/contacts", { fullName: "Dup", phone: "+33 6 11 11 11 11" })).status, 409, "same number twice");
  const list = await (await fetch(`${base}/api/contacts?q=ok&limit=9999`, { headers: { cookie: a.cookie } })).json() as { total: number; items: { fullName: string }[] };
  assert.equal(list.total, 1);
  assert.equal(list.items[0]!.fullName, "Ok");
});

test("IDOR: another user cannot read, edit or delete my contact, and gets a plain 404", async () => {
  const a = await login("sC", "c@x.com");
  const b = await login("sD", "d@x.com");
  const created = await (await post(a, "/api/contacts", { fullName: "Private", phone: "+33622222222" })).json() as { id: string };
  assert.equal((await fetch(`${base}/api/contacts/${created.id}`, { headers: { cookie: b.cookie } })).status, 404);
  assert.equal((await post(b, `/api/contacts/${created.id}`, { fullName: "Hacked" }, "PATCH")).status, 404);
  assert.equal((await post(b, `/api/contacts/${created.id}?confirm=true`, {}, "DELETE")).status, 404);
  const mine = await (await fetch(`${base}/api/contacts/${created.id}`, { headers: { cookie: a.cookie } })).json() as { fullName: string };
  assert.equal(mine.fullName, "Private");
  const bList = await (await fetch(`${base}/api/contacts`, { headers: { cookie: b.cookie } })).json() as { total: number };
  assert.equal(bList.total, 0);
  const bExport = await (await fetch(`${base}/api/contacts/export`, { headers: { cookie: b.cookie } })).text();
  assert.ok(!bExport.includes("Private"), "export only contains my own contacts");
});

test("delete needs explicit confirmation", async () => {
  const a = await login("sE", "e@x.com");
  const c = await (await post(a, "/api/contacts", { fullName: "Del", phone: "+33633333333" })).json() as { id: string };
  assert.equal((await post(a, `/api/contacts/${c.id}`, {}, "DELETE")).status, 400);
  assert.equal((await post(a, `/api/contacts/${c.id}?confirm=true`, {}, "DELETE")).status, 200);
});

test("mass assignment: privileged or unknown fields are rejected", async () => {
  const a = await login("sF", "f@x.com");
  assert.equal((await post(a, "/api/me", { roles: ["super_admin"] }, "PATCH")).status, 400);
  assert.equal((await post(a, "/api/me", { xp: 99999, balance: 1e6 }, "PATCH")).status, 400);
  assert.equal((await post(a, "/api/contacts", { fullName: "X", userId: "someone-else" })).status, 400);
  assert.equal((await post(a, "/api/me", { language: "ar" }, "PATCH")).status, 200);
  const me = await (await fetch(`${base}/api/me`, { headers: { cookie: a.cookie } })).json() as { permissions: string[]; language: string };
  assert.equal(me.language, "ar");
  assert.deepEqual(me.permissions, []);
});

test("VCF import: preview writes nothing, commit skips duplicates and reports invalid records; export round-trips", async () => {
  const a = await login("sG", "g@x.com");
  await post(a, "/api/contacts", { fullName: "Existing", phone: "+33644444444" });
  const vcf = "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Existing Again\r\nTEL:+33644444444\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Nouvelle Personne\r\nTEL:+33655555555\r\nEND:VCARD\r\n" +
    "BEGIN:VCARD\r\nVERSION:3.0\r\nTEL:+33666666666\r\nEND:VCARD\r\n";
  const prev = await (await post(a, "/api/contacts/import?mode=preview", vcf, "POST", APP, true)).json() as { toImport: number; duplicates: number; invalid: unknown[]; imported?: number };
  assert.deepEqual([prev.toImport, prev.duplicates, prev.invalid.length, prev.imported], [1, 1, 1, undefined]);
  assert.equal(((await (await fetch(`${base}/api/contacts`, { headers: { cookie: a.cookie } })).json()) as { total: number }).total, 1, "preview persisted nothing");
  const done = await (await post(a, "/api/contacts/import?mode=commit", vcf, "POST", APP, true)).json() as { imported: number };
  assert.equal(done.imported, 1);
  const out = await fetch(`${base}/api/contacts/export?version=4.0`, { headers: { cookie: a.cookie } });
  assert.match(out.headers.get("content-type")!, /text\/vcard/);
  const text = await out.text();
  assert.ok(text.includes("VERSION:4.0") && text.includes("Nouvelle Personne") && text.includes("+33655555555"));
});

test("VCF notes survive import and export", async () => {
  const a = await login("sN", "n@x.com");
  const vcf = "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Avec Note\r\nTEL:+33677777777\r\nNOTE:Rencontré à Paris\\, 2026\r\nEND:VCARD\r\n";
  await post(a, "/api/contacts/import?mode=commit", vcf, "POST", APP, true);
  const list = await (await fetch(`${base}/api/contacts`, { headers: { cookie: a.cookie } })).json() as { items: { notes: string | null }[] };
  assert.equal(list.items[0]!.notes, "Rencontré à Paris, 2026");
  const out = await (await fetch(`${base}/api/contacts/export`, { headers: { cookie: a.cookie } })).text();
  assert.ok(out.includes("NOTE:Rencontr"), "note exported");
});

test("VCF import: oversized body is refused", async () => {
  const a = await login("sH", "h@x.com");
  const big = "x".repeat(5 * 1024 * 1024 + 10);
  const r = await post(a, "/api/contacts/import?mode=preview", big, "POST", APP, true).catch(() => null);
  assert.ok(r === null || r.status === 413, "413 or connection closed");
});

test("admin bootstrap: only the verified ADMIN_EMAIL identity is super admin, and the subject is pinned", async () => {
  const admin = await login("G-ADMIN", "SyrixCompany@gmail.com");
  const me = await (await fetch(`${base}/api/me`, { headers: { cookie: admin.cookie } })).json() as { permissions: string[] };
  assert.ok(me.permissions.includes("payouts.mark_paid"));
  const impostor = await login("G-OTHER", "syrixcompany@gmail.com");
  const me2 = await (await fetch(`${base}/api/me`, { headers: { cookie: impostor.cookie } })).json() as { permissions: string[] };
  assert.deepEqual(me2.permissions, [], "same email, different Google subject");
});

test("payouts: role checks, confirmation + reference required, ledger and audit, no double payment", async () => {
  const user = await login("sP", "p@x.com");
  const finance = await login("sFin", "fin@x.com");
  const support = await login("sSup", "sup@x.com");
  await h.setRoles(finance.userId, ["finance_manager"]);
  await h.setRoles(support.userId, ["support_agent"]);
  const id = await h.makePayout(user, 1500);
  const url = `/api/admin/payouts/${id}/status`;
  assert.equal((await post(finance, url, { to: "in_progress" })).status, 200);
  assert.equal((await post(user, url, { to: "paid", confirmPaid: true, txReference: "PP-1" })).status, 403, "regular user");
  assert.equal((await post(support, url, { to: "paid", confirmPaid: true, txReference: "PP-1" })).status, 403, "support cannot pay");
  assert.equal((await post(finance, url, { to: "paid" })).status, 409, "needs confirmation");
  assert.equal((await post(finance, url, { to: "paid", confirmPaid: true })).status, 409, "needs reference");
  assert.equal((await h.store.getPayout(id))!.status, "in_progress");

  assert.equal((await post(finance, url, { to: "paid", confirmPaid: true, txReference: "PP-8841" })).status, 200);
  assert.equal((await post(finance, url, { to: "paid", confirmPaid: true, txReference: "PP-8841" })).status, 409, "paid is terminal");
  assert.equal((await post(finance, url, { to: "failed", reason: "oops" })).status, 409, "paid cannot become failed");

  const w = await (await fetch(`${base}/api/wallet`, { headers: { cookie: user.cookie } })).json() as { earned: number; available: number; reserved: number; paid: number };
  assert.deepEqual([w.earned, w.available, w.reserved, w.paid], [1500, 0, 0, 1500]);
  const entries = await h.store.listAudit({ resourceId: id, limit: 10, offset: 0 });
  const paid = entries.find(e => e.to === "paid")!;
  assert.deepEqual([paid.actorId, paid.from, paid.to], [finance.userId, "in_progress", "paid"]);
  assert.ok((await h.sql("SELECT 1 FROM payout_status_history WHERE payout_id = $1 AND to_status = 'paid' AND tx_reference = 'PP-8841'", [id])).length, "status history keeps the evidence");
});

test("payouts: a failed transfer releases the reservation and is never counted as paid; retry reserves again", async () => {
  const user = await login("sQ", "q@x.com");
  const finance = await login("sFin2", "fin2@x.com");
  await h.setRoles(finance.userId, ["finance_manager"]);
  const id = await h.makePayout(user, 1500);
  const url = `/api/admin/payouts/${id}/status`;
  await post(finance, url, { to: "in_progress" });
  assert.equal((await post(finance, url, { to: "failed" })).status, 409, "a reason is required");
  assert.equal((await post(finance, url, { to: "failed", reason: "recipient account closed" })).status, 200);
  let w = await (await fetch(`${base}/api/wallet`, { headers: { cookie: user.cookie } })).json() as { available: number; reserved: number; paid: number; failedOrRejectedCents: number };
  assert.deepEqual([w.available, w.reserved, w.paid, w.failedOrRejectedCents], [1500, 0, 0, 1500]);
  // retry after review: the amount is reserved again, then paid exactly once
  assert.equal((await post(finance, url, { to: "pending", reason: "user confirmed new details" })).status, 200);
  w = await (await fetch(`${base}/api/wallet`, { headers: { cookie: user.cookie } })).json() as typeof w;
  assert.deepEqual([w.available, w.reserved, w.paid], [0, 1500, 0]);
  await post(finance, url, { to: "in_progress" });
  assert.equal((await post(finance, url, { to: "paid", confirmPaid: true, txReference: "PP-RETRY-1" })).status, 200);
  w = await (await fetch(`${base}/api/wallet`, { headers: { cookie: user.cookie } })).json() as typeof w;
  assert.deepEqual([w.available, w.reserved, w.paid], [0, 0, 1500]);
});

test("rate limit: import is capped per user", async () => {
  const a = await login("sRL", "rl@x.com");
  const statuses: number[] = [];
  for (let i = 0; i < 7; i++) statuses.push((await post(a, "/api/contacts/import?mode=preview", "", "POST", APP, true)).status);
  assert.ok(statuses.includes(429), `expected a 429 in ${statuses.join(",")}`);
});

test("logout revokes the session", async () => {
  const a = await login("sLO", "lo@x.com");
  assert.equal((await post(a, "/api/auth/logout", {})).status, 200);
  assert.equal((await fetch(`${base}/api/me`, { headers: { cookie: a.cookie } })).status, 401);
});

test("errors never leak internals", async () => {
  const r = await fetch(`${base}/api/does-not-exist`);
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: "not_found" });
});
