import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startHarness, KEYRING } from "./harness.ts";
import { qualifyPendingReferrals, creditQualified } from "../src/domain/referral-engine.ts";
import { DEFAULT_POLICY } from "../src/domain/money.ts";
import { creditableCents } from "../src/domain/budget.ts";
import { decrypt } from "../src/security/crypto.ts";

const h = await startHarness();
after(() => h.close());
const HOUR = 3600_000;
const big = { perUserCapCents: 1_000_000, globalCapCents: 10_000_000 };

/* ---------- one phone number per account ---------- */
test("phone: one number per account, unique across accounts, always masked in responses", async () => {
  const a = await h.login("pA", "pa@x.com");
  const b = await h.login("pB", "pb@x.com");
  const r = await h.send(a, "/api/me/phone", { phone: "+33 6 12 34 56 78" }, "PUT");
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { phoneMasked: "+33 •• •• •• 78" });
  assert.equal((await h.send(b, "/api/me/phone", { phone: "+33612345678" }, "PUT")).status, 409, "same number on another account");
  assert.equal((await h.send(a, "/api/me/phone", { phone: "+33612345678" }, "PUT")).status, 200, "same account may re-save its own");
  assert.equal((await h.send(a, "/api/me/phone", { phone: "12" }, "PUT")).status, 400);
  assert.equal((await h.send(a, "/api/me/phone", { phone: "+33699999999" }, "PUT")).status, 200, "saving replaces: still one number");
  assert.equal((await h.send(b, "/api/me/phone", { phone: "+33612345678" }, "PUT")).status, 200, "the old number is free again");
  const me = await (await h.get(a, "/api/me")).json() as { phoneMasked: string };
  assert.equal(me.phoneMasked, "+33 •• •• •• 99");
  assert.ok(!JSON.stringify(me).includes("699999"), "full number never returned");
});

/* ---------- referrals ---------- */
test("referral: attribution at registration, waiting period, then exactly one credit (no double on re-run)", async () => {
  const ref = await h.login("rA", "ra@x.com");
  const info = await (await h.get(ref, "/api/referrals/me")).json() as { code: string; link: string };
  assert.match(info.code, /^[A-Z0-9]{10}$/);
  assert.ok(info.link.endsWith(`/register?ref=${info.code}`));
  const friend = await h.login("rB", "rb@x.com", info.code);
  assert.deepEqual(((await (await h.get(ref, "/api/referrals/me")).json()) as { counts: object }).counts, { pending: 1, qualified: 0, under_review: 0, disqualified: 0 });

  const t0 = Date.now();
  const early = await qualifyPendingReferrals(h.store, { now: t0 + HOUR, budget: big });
  assert.equal(early.qualified, 0, "24h waiting period not over");
  assert.equal(early.pending, 1);

  const later = await qualifyPendingReferrals(h.store, { now: t0 + 25 * HOUR, budget: big });
  assert.equal(later.qualified, 1);
  await qualifyPendingReferrals(h.store, { now: t0 + 26 * HOUR, budget: big });
  const w = await (await h.get(ref, "/api/wallet")).json() as { earned: number; available: number };
  assert.deepEqual([w.earned, w.available], [1, 1], "one qualified referral = $0.01, credited once");
  void friend;
});
test("referral: self-referral and unknown codes create nothing; a person can only be referred once", async () => {
  const a = await h.login("sr1", "sr1@x.com");
  const code = ((await (await h.get(a, "/api/referrals/me")).json()) as { code: string }).code;
  // an existing account logging in again with its own code is not new: nothing is attributed
  await h.login("sr1", "sr1@x.com", code);
  await h.login("sr2", "sr2@x.com", "ZZZZZZZZZZ");
  assert.equal((await h.store.listReferralsByReferrer(a.userId)).length, 0);
  const other = await h.login("sr3", "sr3@x.com");
  const otherCode = ((await (await h.get(other, "/api/referrals/me")).json()) as { code: string }).code;
  await h.login("sr1", "sr1@x.com", otherCode); // existing user: no late attribution
  assert.equal((await h.store.listReferralsByReferrer(other.userId)).length, 0);
});
test("referral: a burst from one network goes to human review, admin resolves with a reason, one credit only", async () => {
  const boss = await h.login("bA", "ba@x.com");
  const code = ((await (await h.get(boss, "/api/referrals/me")).json()) as { code: string }).code;
  for (let i = 0; i < 5; i++) await h.login(`burst${i}`, `burst${i}@x.com`, code);
  const rep = await qualifyPendingReferrals(h.store, { now: Date.now() + 30 * HOUR, budget: big });
  assert.ok(rep.underReview >= 5);
  assert.equal(((await (await h.get(boss, "/api/wallet")).json()) as { earned: number }).earned, 0, "nothing credited while under review");

  const reviewer = await h.login("bAdm", "badm@x.com");
  h.store.users.get(reviewer.userId)!.roles = ["user_manager"];
  const target = (await h.store.listReferralsByReferrer(boss.userId))[0]!;
  assert.equal((await h.send(boss, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "x" })).status, 403, "owner cannot approve own referral");
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified" })).status, 400, "reason required");
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "checked, genuine" })).status, 200);
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "again" })).status, 409, "no second resolution");
  assert.equal(((await (await h.get(boss, "/api/wallet")).json()) as { earned: number }).earned, 1);
  assert.ok(h.store.audit.some(a => a.action === "referral.resolve" && a.actorId === reviewer.userId));
});

/* ---------- budget caps ---------- */
test("budget: global and per-user caps are never exceeded, referrals still count as qualified", async () => {
  assert.equal(creditableCents(1, 0, 0), 1);
  assert.equal(creditableCents(1, 1_000_000, 0), 0, "per-user cap");
  assert.equal(creditableCents(1, 0, 10_000), 0, "global cap ($100)");
  const a = await h.login("bg1", "bg1@x.com");
  const users = [];
  for (let i = 0; i < 5; i++) users.push(await h.login(`bgf${i}`, `bgf${i}@x.com`));
  let capped = 0;
  const globalCap = (await h.store.globalEarnedCents()) + 3; // fixed once: exactly 3 cents of budget left
  for (const [i, u] of users.entries()) {
    const r = { id: `00000000-0000-0000-0000-00000000000${i}`, referrerId: a.userId, referredId: u.userId, status: "pending" as const, networkHash: `n${i}`, createdAt: 0 };
    await h.store.createReferral(r);
    if (await creditQualified(h.store, r, 1, DEFAULT_POLICY, { perUserCapCents: 1_000_000, globalCapCents: globalCap })) capped++;
  }
  const w = await (await h.get(a, "/api/wallet")).json() as { earned: number };
  assert.equal(w.earned, 3, "only 3 of 5 could be paid out within the cap");
  assert.equal(capped, 2);
  assert.equal((await h.store.listReferralsByReferrer(a.userId)).filter(r => r.status === "qualified").length, 5);
});

/* ---------- payout methods and requests ---------- */
async function fundedUser(sub: string, cents = 1500) {
  const u = await h.login(sub, `${sub}@x.com`);
  await h.store.addLedger({ id: `e-${sub}`, userId: u.userId, type: "earn", amountCents: cents, idempotencyKey: `seed:${sub}` });
  return u;
}
async function addMethod(u: Awaited<ReturnType<typeof fundedUser>>, details = "amina.secret@paypal.example") {
  const r = await h.send(u, "/api/payout-methods", { kind: "paypal", recipientName: "Amina M", details });
  assert.equal(r.status, 201);
  return await r.json() as { id: string; maskedHint: string };
}
test("payout method: encrypted at rest, only a masked hint is ever returned", async () => {
  const u = await fundedUser("pm1");
  const m = await addMethod(u);
  assert.equal(m.maskedHint, "a••••@paypal.example");
  const stored = h.store.methods.get(m.id)!;
  assert.ok(!stored.detailsEnc.includes("amina") && stored.detailsEnc.startsWith("v1:"));
  assert.equal(decrypt(stored.detailsEnc, KEYRING, `payout_method:${m.id}`), "amina.secret@paypal.example");
  const list = JSON.stringify(await (await h.get(u, "/api/payout-methods")).json());
  assert.ok(!list.includes("secret"));
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "paypal", details: "not-an-email" })).status, 400);
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "bitcoin", details: "abc" })).status, 400);
});
test("withdrawal: minimum, ownership, idempotent replay, one open request, frozen recipient snapshot", async () => {
  const poor = await fundedUser("wd0", 1499);
  const pm0 = await addMethod(poor);
  assert.equal((await h.send(poor, "/api/payouts/request", { methodId: pm0.id }, "POST", { "idempotency-key": "key-poor-0001" })).status, 400, "below $15");

  const u = await fundedUser("wd1");
  const other = await fundedUser("wd2");
  const pm = await addMethod(u);
  const otherPm = await addMethod(other, "someone@else.example");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: pm.id })).status, 400, "idempotency key required");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: otherPm.id }, "POST", { "idempotency-key": "key-0000001" })).status, 404, "someone else's method");

  const first = await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0001" });
  assert.equal(first.status, 201);
  const p = await first.json() as { id: string; status: string; amountCents: number; maskedHint: string };
  assert.deepEqual([p.status, p.amountCents], ["pending", 1500]);
  const replay = await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0001" });
  assert.equal(replay.status, 200);
  assert.equal(((await replay.json()) as { id: string }).id, p.id, "same request, same payout");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0002" })).status, 409, "one open request");

  const w = await (await h.get(u, "/api/wallet")).json() as { available: number; reserved: number; paid: number };
  assert.deepEqual([w.available, w.reserved, w.paid], [0, 1500, 0]);

  // the snapshot is a frozen, separately encrypted copy bound to the request id
  const snap = h.store.payouts.get(p.id)!.snapshotEnc!;
  assert.equal(decrypt(snap, KEYRING, `payout_request:${p.id}`), "amina.secret@paypal.example");
  assert.throws(() => decrypt(snap, KEYRING, `payout_method:${pm.id}`));
});
test("withdrawal: parallel requests cannot reserve the same money twice", async () => {
  const u = await fundedUser("race");
  const pm = await addMethod(u);
  const results = await Promise.all(Array.from({ length: 6 }, (_, i) => h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": `race-key-${i}-xxxx` })));
  const created = results.filter(r => r.status === 201).length;
  assert.equal(created, 1, results.map(r => r.status).join(","));
  const w = await (await h.get(u, "/api/wallet")).json() as { available: number; reserved: number };
  assert.deepEqual([w.available, w.reserved], [0, 1500]);
});
test("admin payout list: finance sees masked hints only; regular users are refused", async () => {
  const fin = await h.login("lf", "lf@x.com");
  h.store.users.get(fin.userId)!.roles = ["finance_manager"];
  const res = await h.get(fin, "/api/admin/payouts?status=pending");
  assert.equal(res.status, 200);
  const body = JSON.stringify(await res.json());
  assert.ok(body.includes("maskedHint") && !body.includes("amina.secret") && !body.includes("snapshot"));
  const user = await h.login("lu", "lu@x.com");
  assert.equal((await h.get(user, "/api/admin/payouts")).status, 403);
});

test("public config: ads are disabled unless configured, and no secret is exposed", async () => {
  const r = await fetch(`${h.base}/api/public-config`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ads: { enabled: false } });
});

test("readiness probe reflects the real dependency state; liveness stays cheap", async () => {
  let up = true;
  const h2 = await startHarness({ ready: async () => { if (!up) throw new Error("db down"); return true; } });
  try {
    assert.equal((await fetch(`${h2.base}/readyz`)).status, 200);
    up = false;
    const r = await fetch(`${h2.base}/readyz`);
    assert.equal(r.status, 503);
    assert.deepEqual(await r.json(), { ok: false }, "no error details leaked");
    assert.equal((await fetch(`${h2.base}/healthz`)).status, 200);
  } finally { h2.close(); }
});

test("a user's payout history lists only their own requests, masked", async () => {
  const a = await fundedUser("hist-a");
  const b = await fundedUser("hist-b");
  const pmA = await addMethod(a, "history.a@paypal.example");
  await h.send(a, "/api/payouts/request", { methodId: pmA.id }, "POST", { "idempotency-key": "hist-a-key-0001" });
  const mine = await (await h.get(a, "/api/payouts")).json() as { items: { maskedHint: string; status: string }[] };
  assert.equal(mine.items.length, 1);
  assert.equal(mine.items[0]!.status, "pending");
  assert.ok(!JSON.stringify(mine).includes("history.a@paypal"), "only a masked hint");
  const theirs = await (await h.get(b, "/api/payouts")).json() as { items: unknown[] };
  assert.equal(theirs.items.length, 0, "other users see nothing of it");
  assert.equal((await fetch(`${h.base}/api/payouts`)).status, 401);
});
