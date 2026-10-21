import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startHarness, APP, type Session } from "./harness.ts";

const h = await startHarness();
after(() => h.close());
const DAY = 86_400_000;
const superAdmin = await h.login("G-ROOT", "syrixcompany@gmail.com");
async function staff(role: Parameters<typeof h.setRoles>[1][number]) {
  const s = await h.login(`st-${role}-${randomUUID().slice(0, 6)}`, `${role}-${randomUUID().slice(0, 6)}@x.com`);
  await h.setRoles(s.userId, [role]);
  return s;
}

test("admin access: every admin route refuses ordinary users, and denials are recorded as security events", async () => {
  const u = await h.login("plain", "plain@x.com");
  for (const p of ["/api/admin/overview", "/api/admin/users", `/api/admin/users/${u.userId}`, "/api/admin/payouts", "/api/admin/audit", "/api/admin/settings", "/api/admin/tickets", "/api/admin/reports/users"]) {
    assert.equal((await h.get(u, p)).status, 403, p);
  }
  assert.equal((await fetch(`${h.base}/api/admin/users`)).status, 401);
  assert.ok((await h.store.listSecurityEvents({ kind: "admin_denied", limit: 50 })).some(e => e.userId === u.userId));
});

test("user directory: search, filters, sort and pages; detail shows counts and statuses, never contact contents", async () => {
  const mgr = await staff("user_manager");
  const u = await h.login("dir1", "dir1.special@x.com");
  await h.send(u, "/api/contacts", { fullName: "Very Private Person", phones: ["+33611100001"], notes: "private notes" });
  const found = await h.json<{ total: number; items: { id: string; contactCount: number }[] }>(h.get(mgr, "/api/admin/users?q=dir1.special"));
  assert.equal(found.total, 1);
  assert.equal(found.items[0]!.contactCount, 1);
  assert.equal((await h.get(mgr, "/api/admin/users?sort=-name&limit=5")).status, 200);
  assert.equal((await h.get(mgr, "/api/admin/users?status=bogus")).status, 400);
  const detail = await (await h.get(mgr, `/api/admin/users/${u.userId}`)).text();
  assert.ok(detail.includes('"total":1'), "contact count present");
  assert.ok(!detail.includes("Very Private Person") && !detail.includes("private notes") && !detail.includes("611100001"), "no address book contents");
  assert.ok(!detail.includes("refresh") && !detail.includes("token"), "no OAuth secrets");
  assert.ok(detail.includes('"wallet":null'), "a user manager does not see the wallet");
  const fin = await staff("finance_manager");
  assert.ok((await (await h.get(fin, `/api/admin/users/${u.userId}`)).text()).includes('"balances"'), "finance sees the wallet");
  const support = await staff("support_agent");
  assert.equal((await h.send(support, `/api/admin/users/${u.userId}/suspend`, { reason: "nope nope" })).status, 403, "support cannot suspend");
});

test("suspension: signs the user out, blocks sign-in with a clear page; a temporary one ends by itself; audited with reason", async () => {
  const mgr = await staff("user_manager");
  const u = await h.login("susp1", "susp1@x.com");
  assert.equal((await h.send(mgr, `/api/admin/users/${u.userId}/suspend`, {})).status, 400, "reason required");
  assert.equal((await h.send(mgr, `/api/admin/users/${mgr.userId}/suspend`, { reason: "self test" })).status, 409, "not yourself");
  assert.equal((await h.send(mgr, `/api/admin/users/${superAdmin.userId}/suspend`, { reason: "coup attempt" })).status, 403, "not the super admin");
  assert.equal((await h.send(mgr, `/api/admin/users/${u.userId}/suspend`, { reason: "spam reports", until: h.now() + DAY })).status, 200);
  assert.equal((await h.get(u, "/api/me")).status, 401, "signed out everywhere");
  const start = await fetch(`${h.base}/api/auth/google/start`, { redirect: "manual" });
  const loc = new URL(start.headers.get("location")!);
  h.codes.set("susp-code", { idToken: h.idToken(loc.searchParams.get("nonce")!, "susp1", "susp1@x.com") });
  const cb = await fetch(`${h.base}/api/auth/google/callback?state=${loc.searchParams.get("state")}&code=susp-code`, { redirect: "manual", headers: { cookie: `__Host-oauth=${loc.searchParams.get("state")}` } });
  assert.equal(cb.headers.get("location"), "/signin-error?e=suspended");
  assert.ok(!cb.headers.getSetCookie().some(c => c.startsWith("__Host-sid=") && !c.includes("Max-Age=0")), "no session");
  h.advance(DAY + 60_000);
  try { await h.login("susp1", "susp1@x.com"); } finally { h.advance(-(DAY + 60_000)); } // the temporary suspension has ended
  const log = await h.store.listAudit({ action: "user.suspend", resourceId: u.userId, limit: 5, offset: 0 });
  assert.equal(log[0]!.reason, "spam reports");
  assert.equal(log[0]!.actorId, mgr.userId);
});

test("restrictions: read-only blocks writes (support still allowed), challenges and rewards restrictions are enforced, lifting is audited", async () => {
  const mgr = await staff("user_manager");
  const u = await h.login("rst1", "rst1@x.com");
  const ro = await h.json<{ id: string }>(h.send(mgr, `/api/admin/users/${u.userId}/restrictions`, { scope: "read_only", reason: "investigating" }));
  assert.equal((await h.send(u, "/api/contacts", { fullName: "Blocked" })).status, 403);
  assert.equal((await h.send(u, "/api/support/tickets", { category: "account", subject: "Why read-only?", body: "Please explain the restriction." })).status, 201, "can still ask support");
  assert.equal((await h.get(u, "/api/contacts")).status, 200, "can still read");
  assert.equal((await h.send(mgr, `/api/admin/restrictions/${ro.id}/lift`, { reason: "resolved" })).status, 200);
  assert.equal((await h.send(mgr, `/api/admin/restrictions/${ro.id}/lift`, { reason: "again" })).status, 409);
  assert.equal((await h.send(u, "/api/contacts", { fullName: "Allowed again" })).status, 201);
  await h.send(mgr, `/api/admin/users/${u.userId}/restrictions`, { scope: "rewards", reason: "fraud review" });
  await h.credit(u.userId, 2000);
  const m = await h.json<{ id: string }>(h.send(u, "/api/payout-methods", { kind: "paypal", details: "rst1@example.com" }));
  assert.equal((await h.send(u, "/api/payouts/request", { methodId: m.id }, "POST", { "idempotency-key": "rst-key-0001" })).status, 403);
  assert.equal((await h.json<{ canWithdraw: boolean; restricted: boolean }>(h.get(u, "/api/wallet"))).restricted, true);
  await h.send(mgr, `/api/admin/users/${u.userId}/restrictions`, { scope: "challenges", reason: "abuse" });
  const c = { id: randomUUID(), slug: `rst-${randomUUID().slice(0, 6)}`, title: { en: "R" }, description: { en: "d" }, terms: "terms terms", published: true, difficulty: "advanced" as const,
    startsAt: h.now() - DAY, endsAt: h.now() + DAY, metric: "verified_operations" as const, threshold: 5, rewardType: "xp" as const };
  await h.store.saveChallenge(c);
  assert.equal((await h.send(u, `/api/challenges/${c.id}/join`, {})).status, 403);
  assert.equal((await h.send(mgr, `/api/admin/users/${u.userId}/restrictions`, { scope: "everything", reason: "x x x" })).status, 400);
});

test("roles: only the super admin manages roles; super admin cannot be granted (bootstrap only) or removed from yourself", async () => {
  const target = await h.login("role1", "role1@x.com");
  const mgr = await staff("user_manager");
  assert.equal((await h.send(mgr, `/api/admin/users/${target.userId}/roles`, { roles: ["finance_manager"], reason: "hire" }, "PUT")).status, 403);
  assert.equal((await h.send(superAdmin, `/api/admin/users/${target.userId}/roles`, { roles: ["finance_manager", "auditor"], reason: "new finance hire" }, "PUT")).status, 200);
  assert.deepEqual((await h.store.getUser(target.userId))!.roles.sort(), ["auditor", "finance_manager"]);
  assert.equal((await h.send(superAdmin, `/api/admin/users/${target.userId}/roles`, { roles: ["super_admin"], reason: "promote" }, "PUT")).status, 409);
  assert.equal((await h.send(superAdmin, `/api/admin/users/${superAdmin.userId}/roles`, { roles: [], reason: "oops" }, "PUT")).status, 409);
  assert.equal((await h.send(superAdmin, `/api/admin/users/${target.userId}/roles`, { roles: ["god"], reason: "x x x" }, "PUT")).status, 400);
  const me = await h.json<{ permissions: string[] }>(h.get(await h.login("role1", "role1@x.com"), "/api/me"));
  assert.ok(me.permissions.includes("payouts.mark_paid") && !me.permissions.includes("users.suspend"));
});

test("ledger adjustment: reason + confirmation, auditable entry, never a negative balance, budget respected", async () => {
  const fin = await staff("finance_manager");
  const u = await h.login("adj1", "adj1@x.com");
  await h.credit(u.userId, 500);
  const url = `/api/admin/users/${u.userId}/ledger-adjustment`;
  assert.equal((await h.send(fin, url, { amountCents: -100, reason: "duplicate credit" })).status, 400, "confirmation");
  assert.equal((await h.send(fin, url, { amountCents: -900, reason: "too much", confirm: true })).status, 409, "would go negative");
  assert.equal((await h.send(fin, url, { amountCents: -100, reason: "duplicate credit", confirm: true })).status, 200);
  const w = await h.json<{ available: number; earned: number }>(h.get(u, "/api/wallet"));
  assert.deepEqual([w.earned, w.available], [500, 400], "history kept: earned unchanged, correction separate");
  const rows = await h.sql("SELECT type, amount_cents, reason, actor_id FROM reward_ledger WHERE user_id = $1 AND type = 'adjustment'", [u.userId]);
  assert.deepEqual([rows[0]!["amount_cents"], rows[0]!["reason"], rows[0]!["actor_id"]], [-100, "duplicate credit", fin.userId]);
});

test("audit log: written for sensitive actions, readable by auditors, and the database refuses to edit or delete it", async () => {
  const auditor = await staff("auditor");
  const list = await h.json<{ items: { action: string; actorId: string }[] }>(h.get(auditor, "/api/admin/audit?limit=50"));
  assert.ok(list.items.length > 0);
  await assert.rejects(h.sql("UPDATE admin_audit_logs SET reason = 'rewritten'"), /append-only/);
  await assert.rejects(h.sql("DELETE FROM admin_audit_logs"), /append-only/);
  assert.equal((await h.send(auditor, `/api/admin/users/${auditor.userId}/suspend`, { reason: "read only role" })).status, 403);
});

test("bulk actions: preview first, then confirm with a reason; super admin and self are excluded", async () => {
  const mgr = await staff("user_manager");
  const a = await h.login("bulk1", "bulk1@x.com"), b = await h.login("bulk2", "bulk2@x.com");
  const ids = [a.userId, b.userId, superAdmin.userId, mgr.userId];
  const prev = await h.json<{ count: number }>(h.send(mgr, "/api/admin/bulk", { action: "restrict_referrals", userIds: ids }));
  assert.equal(prev.count, 2);
  assert.equal((await h.send(mgr, "/api/admin/bulk", { action: "restrict_referrals", userIds: ids, preview: false })).status, 400, "reason");
  assert.equal((await h.json<{ affected: number }>(h.send(mgr, "/api/admin/bulk", { action: "restrict_referrals", userIds: ids, preview: false, reason: "ring detected" }))).affected, 2);
  assert.ok((await h.store.activeRestrictions(a.userId)).has("referrals"));
  assert.equal((await h.send(mgr, "/api/admin/bulk", { action: "notify", userIds: ids, preview: false, reason: "x x x", message: "hello" })).status, 403, "needs announcements permission");
});

test("fulfilment: Telegram/WhatsApp rewards are delivered by a person; 'completed' requires a delivery confirmation", async () => {
  const cm = await staff("challenge_manager");
  const u = await h.login("ful1", "ful1@x.com");
  const c = { id: randomUUID(), slug: `ful-${randomUUID().slice(0, 6)}`, title: { en: "Stars" }, description: { en: "d" }, terms: "terms terms", published: true, difficulty: "expert" as const,
    startsAt: h.now() - DAY, endsAt: h.now() + DAY, metric: "verified_operations" as const, threshold: 2, rewardType: "telegram_stars" as const };
  await h.store.saveChallenge(c);
  await h.send(u, `/api/challenges/${c.id}/join`, {});
  for (let i = 0; i < 2; i++) await h.send(u, "/api/contacts", { fullName: `F${i}` });
  assert.equal((await h.send(u, `/api/challenges/${c.id}/claim`, {})).status, 200);
  const claims = await h.json<{ items: { id: string; kind: string; status: string }[] }>(h.get(cm, "/api/admin/claims?kind=telegram_stars"));
  const claim = claims.items.find(x => x.kind === "telegram_stars")!;
  const url = `/api/admin/claims/${claim.id}/fulfilment`;
  assert.equal((await h.send(cm, url, { status: "completed" })).status, 400, "no completion without evidence");
  assert.equal((await h.send(cm, url, { status: "failed" })).status, 400, "failure needs notes");
  assert.equal((await h.send(cm, url, { status: "in_progress", notes: "gift prepared" })).status, 200);
  assert.equal((await h.send(cm, url, { status: "completed", deliveryConfirmation: "Telegram gift receipt #A12" })).status, 200);
  assert.equal((await h.send(cm, url, { status: "in_progress", notes: "again" })).status, 409, "closed");
  const mine = await h.json<{ items: { id: string; status: string }[] }>(h.get(u, "/api/challenges"));
  assert.equal(mine.items.find(x => x.id === c.id)!.status, "reward_delivered");
  assert.ok((await h.store.listNotifications(u.userId, 20)).some(n => n.kind === "fulfilment_update"));
});

test("challenge admin: monthly templates create 10 drafts once; publishing needs 8; review-required claims wait for a person", async () => {
  const cm = await staff("challenge_manager");
  const month = new Date(h.now()).toISOString().slice(0, 7);
  const made = await h.json<{ created: number; ids: string[] }>(h.send(cm, "/api/admin/challenges/templates", { month }));
  assert.equal(made.created, 10);
  assert.equal((await h.json<{ created: number }>(h.send(cm, "/api/admin/challenges/templates", { month }))).created, 0, "idempotent");
  assert.equal((await h.send(cm, "/api/admin/challenges/publish-month", { ids: made.ids })).status, 200);
  const u = await h.login("rev1", "rev1@x.com");
  const list = await h.json<{ items: { id: string; slug: string; reviewRequired: boolean; title: string }[] }>(h.get(u, "/api/challenges"));
  const community = list.items.find(x => x.slug.startsWith("community-champion"))!;
  assert.ok(community.reviewRequired);
  assert.equal((await h.send(u, `/api/challenges/${community.id}/join`, {})).status, 201);
  for (let i = 0; i < 10; i++) assert.equal((await h.send(cm, `/api/admin/users/${u.userId}/verified-activity`, { reason: "confirmed bug report", ref: `ticket-${i}` })).status, 201);
  assert.equal((await h.send(cm, `/api/admin/users/${u.userId}/verified-activity`, { reason: "dup", ref: "ticket-0" })).status, 409, "each activity once");
  assert.equal((await h.json<{ status: string }>(h.send(u, `/api/challenges/${community.id}/claim`, {}))).status, "reward_pending");
  const reviews = await h.json<{ items: { userId: string; challengeId: string }[] }>(h.get(cm, "/api/admin/challenges/reviews"));
  assert.ok(reviews.items.some(r => r.userId === u.userId));
  assert.equal((await h.send(cm, `/api/admin/challenges/${community.id}/participants/${u.userId}/review`, { decision: "approve", reason: "verified contributions" })).status, 200);
  assert.ok((await h.store.achievementsOf(u.userId)).some(a => a.code.startsWith("challenge:community-champion")));
  assert.equal((await h.send(cm, `/api/admin/challenges/${community.id}/participants/${u.userId}/review`, { decision: "approve", reason: "twice" })).status, 409);
});

test("settings: validated and audited; a published cash milestone can never be reduced", async () => {
  const sa = superAdmin;
  assert.equal((await h.send(sa, "/api/admin/settings/reward_budget", { value: { perUserCapCents: 1_000_000, globalCapCents: 500_000 }, reason: "Q4 budget approved" }, "PUT")).status, 200);
  assert.equal((await h.send(sa, "/api/admin/settings/reward_budget", { value: { perUserCapCents: -1, globalCapCents: 1 }, reason: "x x x" }, "PUT")).status, 400);
  assert.equal((await h.send(sa, "/api/admin/settings/referral_milestones", { value: [{ threshold: 500, cashCents: 500 }], reason: "cut costs" }, "PUT")).status, 409);
  assert.equal((await h.send(sa, "/api/admin/settings/referral_milestones", { value: [{ threshold: 10, xp: 60, badge: "referrals_10" }, { threshold: 500, xp: 1500, badge: "referrals_500", cashCents: 1000 }], reason: "more XP" }, "PUT")).status, 200);
  assert.equal((await h.send(sa, "/api/admin/settings/vip_levels", { value: [{ name: "Bronze", minXp: 0 }, { name: "Silver", minXp: 2000, benefits: { en: "Badge" } }], reason: "rebalance" }, "PUT")).status, 200);
  assert.equal((await h.json<{ items: { name: string }[] }>(h.get(sa, "/api/vip-levels"))).items.length, 2);
  assert.equal((await h.send(sa, "/api/admin/settings/vip_levels", { value: [{ name: "Silver", minXp: 10 }, { name: "Gold", minXp: 20 }], reason: "x x x" }, "PUT")).status, 400, "first level starts at 0");
  assert.equal((await h.send(sa, "/api/admin/settings/anything", { value: 1, reason: "x x x" }, "PUT")).status, 404);
  const fin = await staff("finance_manager");
  assert.equal((await h.send(fin, "/api/admin/settings/reward_budget", { value: { perUserCapCents: 1, globalCapCents: 1 }, reason: "x x x" }, "PUT")).status, 403);
  assert.ok((await h.store.listAudit({ action: "settings.update", limit: 10, offset: 0 })).length >= 3);
});

test("reports: CSV for permitted roles only, formula injection neutralised, export audited", async () => {
  const u = await h.login("csv2", "csv2@x.com");
  await h.send(u, "/api/me", { name: "=cmd|' /C calc'!A0" }, "PATCH");
  const fin = await staff("finance_manager");
  const r = await h.get(fin, "/api/admin/reports/users");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type")!, /text\/csv/);
  const csv = await r.text();
  assert.ok(csv.includes("'=cmd"), "a leading = is prefixed so spreadsheets do not execute it");
  assert.equal((await h.get(await staff("support_agent"), "/api/admin/reports/users")).status, 403);
  assert.equal((await h.get(fin, "/api/admin/reports/contacts")).status, 404, "no address-book export exists");
  assert.ok((await h.store.listAudit({ action: "report.export", limit: 5, offset: 0 })).length > 0);
});

test("overview: live numbers and health, including the worker heartbeat", async () => {
  await h.store.heartbeat("worker", { pid: 1 });
  const o = await h.json<{ users: { users: number }; money: object; health: { workers: { name: string; ok: boolean }[] } }>(h.get(superAdmin, "/api/admin/overview"));
  assert.ok(o.users.users > 5);
  assert.ok(o.health.workers.some(w => w.name === "worker" && w.ok));
});

test("deletion queue: admins see requests and can process or cancel them, with reasons", async () => {
  const mgr = await staff("user_manager");
  const u = await h.login("dq1", "dq1@x.com");
  await h.send(u, "/api/me/delete", { confirm: "DELETE" });
  const q = await h.json<{ items: { id: string }[] }>(h.get(mgr, "/api/admin/deletions"));
  assert.ok(q.items.some(x => x.id === u.userId));
  assert.equal((await h.send(mgr, `/api/admin/deletions/${u.userId}/process`, {})).status, 400);
  assert.equal((await h.send(mgr, `/api/admin/deletions/${u.userId}/process`, { reason: "user asked by e-mail to hurry" })).status, 200);
  assert.equal((await h.store.getUser(u.userId))!.status, "deleted");
  void APP;
});
