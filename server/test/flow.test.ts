import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { startHarness, KEYRING, type Session } from "./harness.ts";
import { qualifyPendingReferrals } from "../src/domain/referral-engine.ts";
import { creditQualified } from "../src/domain/rewards.ts";
import { creditableCents } from "../src/domain/budget.ts";
import { decrypt } from "../src/security/crypto.ts";

const h = await startHarness();
after(() => h.close());
const HOUR = 3600_000;
const wallet = (s: Session) => h.json<{ earned: number; available: number; reserved: number; paid: number; claims: { source: string; status: string; amountCents: number }[] }>(h.get(s, "/api/wallet"));

/** Creates `n` referred accounts directly in the database (fast) and returns the referral rows, still pending. */
async function referredAccounts(referrerId: string, n: number, network = () => randomBytes(32).toString("hex")) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const tag = randomBytes(5).toString("hex");
    const f = await h.store.createUser({ googleSub: `g-${tag}`, email: `f-${tag}@x.com`, name: `F ${tag}`, language: "en", dialCode: "", status: "active", roles: [] });
    const r = { id: randomUUID(), referrerId, referredId: f.id, status: "pending" as const, networkHash: network(), createdAt: h.now() - 48 * HOUR };
    await h.store.createReferral(r);
    out.push(r);
  }
  return out;
}

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
  const me = await h.json<{ phoneMasked: string }>(h.get(a, "/api/me"));
  assert.equal(me.phoneMasked, "+33 •• •• •• 99");
  assert.ok(!JSON.stringify(me).includes("699999"), "full number never returned");
});

/* ---------- referrals ---------- */
test("referral: attribution at registration, waiting period, then exactly one qualification (no double on re-run)", async () => {
  const ref = await h.login("rA", "ra@x.com");
  const info = await h.json<{ code: string; link: string }>(h.get(ref, "/api/referrals/me"));
  assert.match(info.code, /^[A-Z0-9]{10}$/);
  assert.ok(info.link.endsWith(`/register?ref=${info.code}`));
  await h.login("rB", "rb@x.com", info.code);
  assert.deepEqual((await h.json<{ counts: object }>(h.get(ref, "/api/referrals/me"))).counts, { pending: 1, qualified: 0, under_review: 0, disqualified: 0 });

  const t0 = Date.now();
  const early = await qualifyPendingReferrals(h.sv, { now: t0 + HOUR });
  assert.equal(early.qualified, 0, "24h waiting period not over");
  assert.equal(early.pending, 1);
  const later = await qualifyPendingReferrals(h.sv, { now: t0 + 25 * HOUR });
  assert.equal(later.qualified, 1);
  await qualifyPendingReferrals(h.sv, { now: t0 + 26 * HOUR });
  const xp = (await h.store.xpRows(ref.userId)).filter(x => x.reason === "referral_qualified");
  assert.equal(xp.length, 1, "one XP credit per qualified referral, never twice");
  assert.equal((await wallet(ref)).earned, 0, "no per-referral cash by default: the cash reward is the 500 milestone");
});

test("referral: clicks are counted (once per network per hour) but never qualify anything", async () => {
  const a = await h.login("clk", "clk@x.com");
  const code = (await h.json<{ code: string }>(h.get(a, "/api/referrals/me"))).code;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`${h.base}/register?ref=${code}`, { redirect: "manual" });
    assert.equal(r.status, 302);
    assert.ok(r.headers.getSetCookie().some(c => c.startsWith(`__Host-ref=${code}`)), "code remembered for sign-up");
  }
  const me = await h.json<{ clicks: number; counts: { qualified: number; pending: number } }>(h.get(a, "/api/referrals/me"));
  assert.equal(me.clicks, 1);
  assert.deepEqual([me.counts.qualified, me.counts.pending], [0, 0]);
});

test("referral: self-referral and unknown codes create nothing; a person can only be referred once", async () => {
  const a = await h.login("sr1", "sr1@x.com");
  const code = (await h.json<{ code: string }>(h.get(a, "/api/referrals/me"))).code;
  await h.login("sr1", "sr1@x.com", code); // an existing account logging in again with its own code is not new
  await h.login("sr2", "sr2@x.com", "ZZZZZZZZZZ");
  assert.equal((await h.store.listReferralsByReferrer(a.userId)).length, 0);
  const other = await h.login("sr3", "sr3@x.com");
  const otherCode = (await h.json<{ code: string }>(h.get(other, "/api/referrals/me"))).code;
  await h.login("sr1", "sr1@x.com", otherCode); // existing user: no late attribution
  assert.equal((await h.store.listReferralsByReferrer(other.userId)).length, 0);
  await assert.rejects(h.sql("INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $1)", [a.userId]), /check constraint/, "the database itself refuses self-referral");
});

test("referral: a burst from one network goes to human review, admin resolves with a reason, once", async () => {
  const boss = await h.login("bA", "ba@x.com");
  const code = (await h.json<{ code: string }>(h.get(boss, "/api/referrals/me"))).code;
  for (let i = 0; i < 5; i++) await h.login(`burst${i}`, `burst${i}@x.com`, code);
  const rep = await qualifyPendingReferrals(h.sv, { now: Date.now() + 30 * HOUR });
  assert.ok(rep.underReview >= 5);
  assert.equal((await h.json<{ counts: { qualified: number } }>(h.get(boss, "/api/referrals/me"))).counts.qualified, 0, "nothing counted while under review");

  const reviewer = await h.login("bAdm", "badm@x.com");
  await h.setRoles(reviewer.userId, ["user_manager"]);
  const target = (await h.store.listReferralsByReferrer(boss.userId))[0]!;
  assert.equal((await h.send(boss, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "x" })).status, 403, "owner cannot approve own referral");
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified" })).status, 400, "reason required");
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "checked, genuine" })).status, 200);
  assert.equal((await h.send(reviewer, `/api/admin/referrals/${target.id}/resolve`, { decision: "qualified", reason: "again" })).status, 409, "no second resolution");
  assert.equal((await h.json<{ counts: { qualified: number } }>(h.get(boss, "/api/referrals/me"))).counts.qualified, 1);
  assert.ok((await h.store.listAudit({ action: "referral.resolve", limit: 10, offset: 0 })).some(a => a.actorId === reviewer.userId));
});

test("referral: a referrer with a referral restriction goes to review instead of qualifying", async () => {
  const r = await h.login("rr1", "rr1@x.com");
  const admin = await h.login("rrAdm", "rradm@x.com");
  await h.setRoles(admin.userId, ["user_manager"]);
  assert.equal((await h.send(admin, `/api/admin/users/${r.userId}/restrictions`, { scope: "referrals", reason: "suspicious pattern" })).status, 201);
  await referredAccounts(r.userId, 1);
  const rep = await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR });
  assert.ok(rep.underReview >= 1);
  assert.equal((await h.store.referralCounts(r.userId)).qualified, 0);
});

/* ---------- the $10 milestone at 500 qualified referrals ---------- */
test("milestone: 500 qualified referrals create exactly one $10.00 claim and a payout request (Payment in progress)", { timeout: 180_000 }, async () => {
  const u = await h.login("m500", "m500@x.com");
  const m = await h.json<{ id: string }>(h.send(u, "/api/payout-methods", { kind: "pix", details: "m500@example.com", recipientName: "Maria" }));
  await referredAccounts(u.userId, 499);
  await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR });
  let me = await h.json<{ counts: { qualified: number }; cashReward: { progress: number; claim: unknown } }>(h.get(u, "/api/referrals/me"));
  assert.equal(me.counts.qualified, 499);
  assert.equal(me.cashReward.claim, null, "nothing at 499");
  await referredAccounts(u.userId, 3);
  await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR });
  await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR }); // a re-run changes nothing
  me = await h.json(h.get(u, "/api/referrals/me"));
  const full = me as unknown as { counts: { qualified: number }; cashReward: { progress: number; threshold: number; cents: number; claim: { status: string }; payout: { status: string; maskedHint: string } } };
  assert.equal(full.counts.qualified, 502);
  assert.deepEqual([full.cashReward.progress, full.cashReward.threshold, full.cashReward.cents], [500, 500, 1000]);
  assert.equal(full.cashReward.claim.status, "in_progress");
  assert.equal(full.cashReward.payout.status, "pending", "shown as Payment in progress");
  const claims = await h.sql("SELECT * FROM reward_claims WHERE user_id = $1 AND kind = 'cash'", [u.userId]);
  assert.equal(claims.length, 1, "exactly one claim");
  const w = await wallet(u);
  assert.deepEqual([w.earned, w.available, w.reserved, w.paid], [1000, 0, 1000, 0], "reserved for the payout");
  const payouts = await h.store.listPayoutsFor(u.userId);
  assert.equal(payouts.length, 1);
  assert.equal(payouts[0]!.source, "milestone");
  assert.equal(decrypt(payouts[0]!.snapshotEnc!, KEYRING, `payout_request:${payouts[0]!.id}`), "m500@example.com", "frozen recipient");
  void m;
  // admin pays it: the claim completes, history stays
  const fin = await h.login("m500fin", "m500fin@x.com");
  await h.setRoles(fin.userId, ["finance_manager"]);
  const url = `/api/admin/payouts/${payouts[0]!.id}/status`;
  assert.equal((await h.send(fin, url, { to: "in_progress" })).status, 200);
  assert.equal((await h.send(fin, url, { to: "paid", confirmPaid: true, txReference: "PIX-E2E-123" })).status, 200);
  const after = await wallet(u);
  assert.deepEqual([after.available, after.reserved, after.paid], [0, 0, 1000]);
  assert.equal((await h.store.claimByKey(`milestone:500:${u.userId}`))!.status, "completed");
  const notes = (await h.store.listNotifications(u.userId, 50)).map(n => n.kind);
  assert.ok(notes.includes("reward_eligible") && notes.includes("payout_update") && notes.includes("referral_milestone"));
  assert.ok(h.dispatch.emails.some(e => e.userId === u.userId && e.template === "reward_eligible"), "e-mail queued");
});

test("milestone: without payout details the user is asked to add one; adding it creates the payout request", async () => {
  await h.store.setJsonSetting("referral_milestones", [{ threshold: 3, xp: 5, badge: "referrals_10", cashCents: 1000 }]);
  try {
    const u = await h.login("mNo", "mno@x.com");
    await referredAccounts(u.userId, 3);
    await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR });
    assert.equal((await h.store.listPayoutsFor(u.userId)).length, 0);
    assert.ok((await h.store.listNotifications(u.userId, 20)).some(n => n.kind === "add_payout_method"));
    assert.equal((await wallet(u)).available, 1000, "credited, waiting for a destination");
    assert.equal((await h.send(u, "/api/payout-methods", { kind: "paypal", details: "mno@example.com" })).status, 201);
    const p = await h.store.listPayoutsFor(u.userId);
    assert.equal(p.length, 1);
    assert.deepEqual([p[0]!.status, p[0]!.amountCents, p[0]!.source], ["pending", 1000, "milestone"]);
    // a second method does not create a second request
    await h.send(u, "/api/payout-methods", { kind: "pix", details: "mno2@example.com" });
    assert.equal((await h.store.listPayoutsFor(u.userId)).length, 1);
  } finally { await h.store.setJsonSetting("referral_milestones", (await import("../src/domain/rewards.ts")).DEFAULT_MILESTONES); }
});

test("milestone: when the budget cannot cover it the claim waits for review; an admin funds it after raising the budget", async () => {
  await h.store.setJsonSetting("referral_milestones", [{ threshold: 2, cashCents: 1000 }]);
  const before = await h.store.getJsonSetting("reward_budget", {});
  await h.store.setJsonSetting("reward_budget", { perUserCapCents: 1_000_000, globalCapCents: (await h.store.globalEarnedCents()) + 500 });
  try {
    const u = await h.login("mBud", "mbud@x.com");
    await h.send(u, "/api/payout-methods", { kind: "paypal", details: "mbud@example.com" });
    await referredAccounts(u.userId, 2);
    await qualifyPendingReferrals(h.sv, { now: h.now() + 25 * HOUR });
    const claim = (await h.store.claimByKey(`milestone:2:${u.userId}`))!;
    assert.equal(claim.status, "action_required");
    assert.equal((await wallet(u)).earned, 0, "nothing credited without budget");
    const fin = await h.login("mBudFin", "mbudfin@x.com");
    await h.setRoles(fin.userId, ["finance_manager"]);
    assert.equal((await h.send(fin, `/api/admin/claims/${claim.id}/fund`, { reason: "budget raised" })).status, 409, "still over budget");
    await h.store.setJsonSetting("reward_budget", { perUserCapCents: 1_000_000, globalCapCents: 100_000_000 });
    assert.equal((await h.send(fin, `/api/admin/claims/${claim.id}/fund`, { reason: "budget raised" })).status, 200);
    assert.equal((await h.send(fin, `/api/admin/claims/${claim.id}/fund`, { reason: "again" })).status, 409, "funded once");
    assert.equal((await wallet(u)).reserved, 1000, "payout request created");
  } finally {
    await h.store.setJsonSetting("reward_budget", before);
    await h.store.setJsonSetting("referral_milestones", (await import("../src/domain/rewards.ts")).DEFAULT_MILESTONES);
  }
});

/* ---------- budget caps (optional per-referral rate) ---------- */
test("budget: global and per-user caps are never exceeded, referrals still count as qualified", async () => {
  assert.equal(creditableCents(1, 0, 0), 1);
  assert.equal(creditableCents(1, 1_000_000, 0), 0, "per-user cap");
  assert.equal(creditableCents(1, 0, 10_000), 0, "global cap ($100)");
  const oldPolicy = await h.store.getJsonSetting("reward_policy", {});
  const oldBudget = await h.store.getJsonSetting("reward_budget", {});
  await h.store.setJsonSetting("reward_policy", { centsPerReferral: 1, minWithdrawCents: 1000, maxRewardedReferrals: 1_000_000 });
  await h.store.setJsonSetting("reward_budget", { perUserCapCents: 1_000_000, globalCapCents: (await h.store.globalEarnedCents()) + 3 }); // exactly 3 cents left
  try {
    const a = await h.login("bg1", "bg1@x.com");
    let capped = 0;
    for (const r of await referredAccounts(a.userId, 5)) if ((await creditQualified(h.sv, r, h.now())).budgetCapped) capped++;
    assert.equal((await wallet(a)).earned, 3, "only 3 of 5 could be paid within the cap");
    assert.equal(capped, 2);
    assert.equal((await h.store.referralCounts(a.userId)).qualified, 5);
  } finally { await h.store.setJsonSetting("reward_policy", oldPolicy); await h.store.setJsonSetting("reward_budget", oldBudget); }
});

/* ---------- payout methods and requests ---------- */
async function fundedUser(sub: string, cents = 1500) {
  const u = await h.login(sub, `${sub}@x.com`);
  await h.credit(u.userId, cents);
  return u;
}
async function addMethod(u: Session, details = "amina.secret@paypal.example") {
  const r = await h.send(u, "/api/payout-methods", { kind: "paypal", recipientName: "Amina M", details });
  assert.equal(r.status, 201);
  return await r.json() as { id: string; maskedHint: string };
}
test("payout method: encrypted at rest, only a masked hint is ever returned, secrets refused", async () => {
  const u = await fundedUser("pm1");
  const m = await addMethod(u);
  assert.equal(m.maskedHint, "a••••@paypal.example");
  const stored = (await h.store.getPayoutMethod(u.userId, m.id))!;
  assert.ok(!stored.detailsEnc.includes("amina") && stored.detailsEnc.startsWith("v1:"));
  assert.equal(decrypt(stored.detailsEnc, KEYRING, `payout_method:${m.id}`), "amina.secret@paypal.example");
  const raw = await h.sql("SELECT details_enc FROM payout_methods WHERE id = $1", [m.id]);
  assert.ok(!String(raw[0]!["details_enc"]).includes("amina"), "ciphertext in the database too");
  const list = JSON.stringify(await (await h.get(u, "/api/payout-methods")).json());
  assert.ok(!list.includes("secret"));
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "paypal", details: "not-an-email" })).status, 400);
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "bitcoin", details: "abc" })).status, 400);
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "binance_pay", details: "abandon ability able about above absent absorb abstract absurd abuse access accident" })).status, 400, "a recovery phrase is refused");
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "pix", details: "123.456.789-09" })).status, 201, "CPF Pix key");
  assert.equal((await h.send(u, "/api/payout-methods", { kind: "binance_pay", details: "354812345" })).status, 201, "Binance Pay ID");
});
test("withdrawal: minimum, ownership, idempotent replay, one open request, frozen recipient snapshot", async () => {
  const poor = await fundedUser("wd0", 999);
  const pm0 = await addMethod(poor);
  assert.equal((await h.send(poor, "/api/payouts/request", { methodId: pm0.id }, "POST", { "idempotency-key": "key-poor-0001" })).status, 400, "below $10");

  const u = await fundedUser("wd1");
  const other = await fundedUser("wd2");
  const pm = await addMethod(u);
  const otherPm = await addMethod(other, "someone@else.example");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: pm.id })).status, 400, "idempotency key required");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: otherPm.id }, "POST", { "idempotency-key": "key-0000001" })).status, 404, "someone else's method");

  const first = await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0001" });
  assert.equal(first.status, 201);
  const p = await first.json() as { id: string; status: string; amountCents: number };
  assert.deepEqual([p.status, p.amountCents], ["pending", 1500]);
  const replay = await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0001" });
  assert.equal(replay.status, 200);
  assert.equal(((await replay.json()) as { id: string }).id, p.id, "same request, same payout");
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "key-wd1-0002" })).status, 409, "one open request");

  const w = await wallet(u);
  assert.deepEqual([w.available, w.reserved, w.paid], [0, 1500, 0]);
  // the snapshot is a frozen, separately encrypted copy bound to the request id; deleting the method does not redirect it
  assert.equal((await h.send(u, `/api/payout-methods/${pm.id}`, {}, "DELETE")).status, 200);
  const snap = (await h.store.getPayout(p.id))!.snapshotEnc!;
  assert.equal(decrypt(snap, KEYRING, `payout_request:${p.id}`), "amina.secret@paypal.example");
  assert.throws(() => decrypt(snap, KEYRING, `payout_method:${pm.id}`));
});
test("withdrawal: parallel requests cannot reserve the same money twice (database lock)", async () => {
  const u = await fundedUser("race");
  const pm = await addMethod(u);
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": `race-key-${i}-xxxx` })));
  const created = results.filter(r => r.status === 201).length;
  assert.equal(created, 1, results.map(r => r.status).join(","));
  const w = await wallet(u);
  assert.deepEqual([w.available, w.reserved], [0, 1500]);
  await assert.rejects(h.sql("UPDATE reward_ledger SET amount_cents = 1 WHERE user_id = $1", [u.userId]), /append-only/, "the ledger cannot be edited");
});
test("admin payout list: finance sees masked hints only; full recipient only through an audited reveal", async () => {
  const u = await fundedUser("lr");
  const pm = await addMethod(u, "reveal.me@paypal.example");
  const pr = await h.json<{ id: string }>(h.send(u, "/api/payouts/request", { methodId: pm.id }, "POST", { "idempotency-key": "reveal-key-01" }));
  const fin = await h.login("lf", "lf@x.com");
  await h.setRoles(fin.userId, ["finance_manager"]);
  const res = await h.get(fin, "/api/admin/payouts?status=pending");
  assert.equal(res.status, 200);
  const body = JSON.stringify(await res.json());
  assert.ok(body.includes("maskedHint") && !body.includes("reveal.me") && !body.includes("snapshot"));
  const auditor = await h.login("la", "la@x.com");
  await h.setRoles(auditor.userId, ["auditor"]);
  assert.equal((await h.send(auditor, `/api/admin/payouts/${pr.id}/reveal`, { reason: "curious" })).status, 403, "auditors cannot see recipients");
  assert.equal((await h.send(fin, `/api/admin/payouts/${pr.id}/reveal`, {})).status, 400, "reason required");
  const rev = await h.json<{ recipient: string }>(h.send(fin, `/api/admin/payouts/${pr.id}/reveal`, { reason: "sending the transfer" }));
  assert.equal(rev.recipient, "reveal.me@paypal.example");
  assert.ok((await h.store.listAudit({ action: "payout.reveal_recipient", limit: 5, offset: 0 })).some(a => a.actorId === fin.userId));
  const user = await h.login("lu", "lu@x.com");
  assert.equal((await h.get(user, "/api/admin/payouts")).status, 403);
});

test("public config: ads are disabled unless configured, and no secret is exposed", async () => {
  const r = await fetch(`${h.base}/api/public-config`);
  assert.equal(r.status, 200);
  const body = await r.json() as Record<string, unknown>;
  assert.deepEqual(body["ads"], { enabled: false });
  assert.ok(!JSON.stringify(body).match(/secret|key|password/i));
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
  } finally { await h2.close(); }
});

test("a user's payout history lists only their own requests, masked", async () => {
  const a = await fundedUser("hist-a");
  const b = await fundedUser("hist-b");
  const pmA = await addMethod(a, "history.a@paypal.example");
  await h.send(a, "/api/payouts/request", { methodId: pmA.id }, "POST", { "idempotency-key": "hist-a-key-0001" });
  const mine = await h.json<{ items: { id: string; maskedHint: string; status: string }[] }>(h.get(a, "/api/payouts"));
  assert.equal(mine.items.length, 1);
  assert.equal(mine.items[0]!.status, "pending");
  assert.ok(!JSON.stringify(mine).includes("history.a@paypal"), "only a masked hint");
  assert.equal((await h.get(b, `/api/payouts/${mine.items[0]!.id}`)).status, 404, "not someone else's");
  const theirs = await h.json<{ items: unknown[] }>(h.get(b, "/api/payouts"));
  assert.equal(theirs.items.length, 0, "other users see nothing of it");
  assert.equal((await fetch(`${h.base}/api/payouts`)).status, 401);
});
