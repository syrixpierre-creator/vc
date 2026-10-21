import { randomUUID } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { RestrictionScope, ReviewStatus, ReferralStatus } from "../../store/types.ts";
import { HttpError, pick, readJson, v, qInt, qEnum, type Ctx } from "../kit.ts";
import { ROLES, can, type Role } from "../../auth/rbac.ts";
import { maskPhone } from "../../domain/phone.ts";
import { computeBalances } from "../../domain/ledger.ts";
import { progressFor, recordEvent } from "../../domain/progress.ts";
import { creditQualified, changePayoutStatus, fundClaim, loadBudget } from "../../domain/rewards.ts";
import { creditableCents } from "../../domain/budget.ts";
import { decrypt } from "../../security/crypto.ts";
import { notify, inTx } from "../../services/notify.ts";
import type { PayoutStatus } from "../../domain/payout.ts";

const SCOPES: readonly RestrictionScope[] = ["account", "referrals", "rewards", "challenges", "read_only"];
const REVIEW: readonly ReviewStatus[] = ["none", "flagged", "under_review", "cleared", "confirmed_fraud"];
const PAYOUT_STATUSES: readonly PayoutStatus[] = ["pending", "in_progress", "action_required", "paid", "failed", "rejected"];

export function registerAdmin(app: AppCtx) {
  const { router: r, store, now, send, sv } = app;
  const audit = (c: Ctx, action: string, resourceType: string, resourceId: string, from: unknown, to: unknown, reason?: string) =>
    store.addAudit({ actorId: c.user!.id, action, resourceType, resourceId, from, to, ...(reason ? { reason } : {}), correlationId: c.requestId, at: now() });
  async function target(c: Ctx) {
    const u = await store.getUser(c.params["id"]!);
    if (!u || u.status === "deleted") throw new HttpError(404, "not_found");
    return u;
  }
  /** Nobody acts on their own account through admin tools, and only a super admin can act on another super admin. */
  function guardTarget(c: Ctx, t: { id: string; roles: Role[] }) {
    if (t.id === c.user!.id) throw new HttpError(409, "cannot_target_self");
    if (t.roles.includes("super_admin") && !c.user!.roles.includes("super_admin")) throw new HttpError(403, "forbidden");
  }

  /* ---------- users ---------- */
  r.get("/api/admin/users", { summary: "Search, filter, sort and page users", tag: "admin-users", access: { perm: "users.read" }, query: "q, status, review, role, sort, limit, offset" }, async c => {
    const q = c.url.searchParams.get("q")?.slice(0, 100) || undefined;
    const status = qEnum(c.url, "status", ["active", "suspended", "pending_deletion"] as const), review = qEnum(c.url, "review", REVIEW);
    const role = qEnum(c.url, "role", [...ROLES, "any"] as const), sort = qEnum(c.url, "sort", ["created", "-created", "name", "-name", "last_seen", "-last_seen"] as const);
    const res = await store.listUsers({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(review ? { review } : {}), ...(role ? { role } : {}), ...(sort ? { sort } : {}),
      limit: qInt(c.url, "limit", 25, 1, 100), offset: qInt(c.url, "offset", 0, 0, 1_000_000) });
    send(c, 200, { total: res.total, items: res.rows });
  });

  r.get("/api/admin/users/:id", { summary: "User detail: account, contacts summary (never contents), referrals, progression, wallet, security", tag: "admin-users", access: { perm: "users.read" } }, async c => {
    const u = await target(c);
    const me = c.user!;
    const [settings, counts, conn, jobs, logs, refCounts, refs, prog, ach, parts, ledger, payouts, claims, sessions, events, restrictions, tickets] = await Promise.all([
      store.getSettings(u.id), store.syncCounts(u.id), store.getConnection(u.id), store.jobCountsFor(u.id), store.listSyncLogs(u.id, 20), store.referralCounts(u.id),
      store.listReferralsForAdmin({ userId: u.id, limit: 50 }), progressFor(sv, u.id, now()), store.achievementsOf(u.id), store.participationsOf(u.id), store.ledgerFor(u.id),
      store.listPayoutsFor(u.id), store.listRewardClaimsFor(u.id), store.listSessions(u.id), store.listSecurityEvents({ userId: u.id, limit: 30 }), store.listRestrictions(u.id), store.listTicketsFor(u.id)]);
    const finance = can(me.roles, "payouts.read");
    send(c, 200, {
      account: { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl ?? null, status: u.status, suspendedUntil: u.suspendedUntil ?? null, suspensionReason: u.suspensionReason ?? null,
        reviewStatus: u.reviewStatus ?? "none", reviewReason: u.reviewReason ?? null, roles: u.roles, language: u.language, countryCode: u.countryCode ?? null, timeZone: u.timeZone ?? null,
        phoneMasked: u.phone ? maskPhone(u.phone) : null, pseudonym: u.pseudonym ?? null, createdAt: u.createdAt, lastSeenAt: u.lastSeenAt ?? null, onboardedAt: u.onboardedAt ?? null,
        deletionRequestedAt: u.deletionRequestedAt ?? null, premiumUntil: u.premiumUntil ?? null, settings: { leaderboardOptIn: settings.leaderboardOptIn, autoSync: settings.autoSync, paused: settings.paused } },
      contacts: { counts, google: conn.status, jobs, recentSync: logs.map(l => ({ outcome: l.outcome, at: l.at })) }, // counts and statuses only: an address book is never shown
      referrals: { counts: refCounts, items: refs.filter(x => x.referrerId === u.id).slice(0, 30).map(x => ({ id: x.id, status: x.status, reason: x.reason ?? null, referred: x.referredName, createdAt: x.createdAt })),
        referredBy: refs.find(x => x.referredId === u.id)?.referrerName ?? null },
      progression: { ...prog, calendar: undefined, achievements: ach, challenges: parts },
      wallet: finance ? { balances: computeBalances(ledger), ledger: ledger.slice(-50).reverse().map(l => ({ type: l.type, amountCents: l.amountCents, reason: l.reason ?? null, at: l.createdAt })),
        payouts: payouts.map(p => ({ id: p.id, amountCents: p.amountCents, status: p.status, method: p.methodKind, maskedHint: p.maskedHint, createdAt: p.createdAt })),
        claims: claims.map(x => ({ id: x.id, source: x.source, kind: x.kind, status: x.status, amountCents: x.amountCents ?? null, createdAt: x.createdAt })) } : null,
      security: { sessions: sessions.map(s => ({ id: s.idHash.slice(0, 16), userAgent: s.userAgent ?? null, network: s.ipPrefix ?? null, lastSeenAt: s.lastSeenAt, createdAt: s.createdAt })),
        events: events.map(e => ({ kind: e.kind, network: e.ipPrefix ?? null, at: e.at })), restrictions },
      support: tickets.map(t => ({ id: t.id, subject: t.subject, status: t.status, createdAt: t.createdAt })),
    });
  });

  r.post("/api/admin/users/:id/suspend", { summary: "Suspend (temporary with `until`, or indefinite). Signs the user out everywhere.", tag: "admin-users", access: { perm: "users.suspend" }, body: "{reason, until?}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const b = pick(await readJson(c.req), ["reason", "until"]);
    const reason = v.reason(b);
    const until = v.int(b, "until", { min: now() + 60_000, max: now() + 5 * 365 * 86_400_000 });
    await store.setUserStatus(u.id, "suspended", { until: until ?? null, reason });
    const n = await store.revokeSessions(u.id);
    await store.addSecurityEvent({ userId: u.id, kind: "suspended", detail: { until: until ?? null, sessionsRevoked: n }, at: now() });
    await audit(c, "user.suspend", "user", u.id, u.status, { status: "suspended", until: until ?? null }, reason);
    await notify(sv, u.id, "security", { event: "suspended", until: until ?? null });
    send(c, 200, { status: "suspended", until: until ?? null });
  });
  r.post("/api/admin/users/:id/unsuspend", { summary: "Reinstate a suspended account", tag: "admin-users", access: { perm: "users.suspend" }, body: "{reason}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    if (u.status !== "suspended") throw new HttpError(409, "not_suspended");
    await store.setUserStatus(u.id, "active");
    await audit(c, "user.unsuspend", "user", u.id, "suspended", "active", reason);
    send(c, 200, { status: "active" });
  });
  r.post("/api/admin/users/:id/restrictions", { summary: "Restrict referrals, rewards, challenges, or make the account read-only", tag: "admin-users", access: { perm: "users.restrict" },
    body: "{scope, reason, expiresAt?}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const b = pick(await readJson(c.req), ["scope", "reason", "expiresAt"]);
    const scope = v.oneOf(b, "scope", SCOPES, true)!;
    const reason = v.reason(b);
    const expiresAt = v.int(b, "expiresAt", { min: now() + 60_000, max: now() + 5 * 365 * 86_400_000 });
    const id = await store.addRestriction({ userId: u.id, scope, reason, adminId: c.user!.id, ...(expiresAt ? { expiresAt } : {}) });
    await audit(c, "user.restrict", "user", u.id, null, { scope, expiresAt: expiresAt ?? null }, reason);
    send(c, 201, { id });
  });
  r.post("/api/admin/restrictions/:id/lift", { summary: "Lift a restriction", tag: "admin-users", access: { perm: "users.restrict" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const x = await store.getRestriction(c.params["id"]!);
    if (!x) throw new HttpError(404, "not_found");
    if (!(await store.liftRestriction(x.id, c.user!.id, reason))) throw new HttpError(409, "already_lifted");
    await audit(c, "user.restriction_lift", "user", x.userId, x.scope, null, reason);
    send(c, 200, { ok: true });
  });
  r.post("/api/admin/users/:id/review", { summary: "Fraud review status (flag, under review, cleared, confirmed fraud). Never an automatic ban.", tag: "admin-users", access: { perm: "fraud.review" },
    body: "{status, reason}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const b = pick(await readJson(c.req), ["status", "reason"]);
    const status = v.oneOf(b, "status", REVIEW, true)!;
    const reason = v.reason(b);
    await store.setReview(u.id, status, reason);
    await audit(c, "user.review", "user", u.id, u.reviewStatus ?? "none", status, reason);
    send(c, 200, { reviewStatus: status });
  });
  r.post("/api/admin/users/:id/revoke-sessions", { summary: "Sign the user out of every device", tag: "admin-users", access: { perm: "sessions.revoke" }, body: "{reason}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const n = await store.revokeSessions(u.id);
    await store.addSecurityEvent({ userId: u.id, kind: "sessions_revoked", detail: { by: "admin", count: n }, at: now() });
    await audit(c, "user.revoke_sessions", "user", u.id, null, { revoked: n }, reason);
    await notify(sv, u.id, "security", { event: "sessions_revoked" });
    send(c, 200, { revoked: n });
  });
  r.post("/api/admin/users/:id/request-reconnect", { summary: "Drop the Google Contacts tokens and ask the user to reconnect", tag: "admin-users", access: { perm: "sync.manage" }, body: "{reason}" }, async c => {
    const u = await target(c);
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const before = (await store.getConnection(u.id)).status;
    if (before === "not_connected") throw new HttpError(409, "not_connected");
    await store.requestReconnect(u.id);
    await audit(c, "sync.request_reconnect", "user", u.id, before, "reconnect_requested", reason);
    await notify(sv, u.id, "sync_reconnect_requested", {});
    send(c, 200, { status: "reconnect_requested" });
  });
  r.post("/api/admin/users/:id/retry-sync", { summary: "Retry the user's failed sync jobs", tag: "admin-users", access: { perm: "sync.manage" }, body: "{reason}" }, async c => {
    const u = await target(c);
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const n = await store.retryFailedSyncJobs(u.id);
    for (const j of (await store.listSyncJobsFor(u.id, 500)).filter(j => j.status === "pending")) await sv.dispatch.syncJob(j.id, now());
    await audit(c, "sync.retry", "user", u.id, null, { retried: n }, reason);
    send(c, 200, { retried: n });
  });
  r.put("/api/admin/users/:id/roles", { summary: "Grant or revoke administrator roles", tag: "admin-users", access: { perm: "roles.manage" }, body: "{roles: Role[], reason}" }, async c => {
    const u = await target(c);
    const b = pick(await readJson(c.req), ["roles", "reason"]);
    const reason = v.reason(b);
    const roles = b["roles"];
    if (!Array.isArray(roles) || roles.some(x => !ROLES.includes(x as Role))) throw new HttpError(400, "invalid_roles");
    const next = [...new Set(roles as Role[])];
    if (u.id === c.user!.id && !next.includes("super_admin")) throw new HttpError(409, "cannot_remove_own_super_admin");
    if (next.includes("super_admin") !== u.roles.includes("super_admin")) throw new HttpError(409, "super_admin_is_bootstrap_only"); // the super admin comes from ADMIN_EMAIL only
    await store.setRoles(u.id, next, c.user!.id);
    await audit(c, "user.roles", "user", u.id, u.roles, next, reason);
    await store.addSecurityEvent({ userId: u.id, kind: "roles_changed", detail: { roles: next }, at: now() });
    send(c, 200, { roles: next });
  });
  r.post("/api/admin/users/:id/ledger-adjustment", { summary: "Auditable correction entry (never edits history). Positive or negative cents.", tag: "admin-finance", access: { perm: "ledger.adjust" },
    body: "{amountCents, reason, confirm: true}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const b = pick(await readJson(c.req), ["amountCents", "reason", "confirm"]);
    const amount = v.int(b, "amountCents", { min: -1_000_000, max: 1_000_000, required: true })!;
    const reason = v.reason(b);
    if (amount === 0) throw new HttpError(400, "invalid_amountCents");
    if (b["confirm"] !== true) throw new HttpError(400, "confirmation_required");
    await inTx(sv, async svx => {
      await svx.store.lock(`rewards:${u.id}`);
      const bal = computeBalances(await svx.store.ledgerFor(u.id));
      if (bal.available + amount < 0) throw new HttpError(409, "would_make_balance_negative");
      if (amount > 0 && creditableCents(amount, bal.earned, await svx.store.globalEarnedCents(), await loadBudget(svx)) < amount) throw new HttpError(409, "budget_exhausted");
      await svx.store.addLedger({ id: randomUUID(), userId: u.id, type: "adjustment", amountCents: amount, idempotencyKey: `adjust:${c.requestId}`, reason, actorId: c.user!.id });
      await svx.store.addAudit({ actorId: c.user!.id, action: "ledger.adjust", resourceType: "user", resourceId: u.id, from: bal.available, to: bal.available + amount, reason, correlationId: c.requestId, at: now() });
    });
    send(c, 200, { ok: true });
  });
  r.post("/api/admin/users/:id/verified-activity", { summary: "Record a community activity verified by a person (Community Champion challenges)", tag: "admin-users", access: { perm: "challenges.manage" },
    body: "{reason (what was verified), ref (unique reference, e.g. ticket id)}" }, async c => {
    const u = await target(c); guardTarget(c, u);
    const b = pick(await readJson(c.req), ["reason", "ref"]);
    const reason = v.reason(b);
    const ref = v.str(b, "ref", { min: 3, max: 80, required: true, pattern: /^[\w:.-]+$/ })!;
    if (!(await recordEvent(sv, u.id, "admin_verified", now(), `verified:${ref}`))) throw new HttpError(409, "already_recorded");
    await audit(c, "user.verified_activity", "user", u.id, null, ref, reason);
    send(c, 201, { ok: true });
  });

  /* ---------- bulk (preview first, then confirm) ---------- */
  r.post("/api/admin/bulk", { summary: "Bulk action with preview: suspend | restrict_referrals | flag | notify", tag: "admin-users", access: { perm: "users.read" },
    body: "{action, userIds (<=500), reason, preview: true|false, message? (notify)}" }, async c => {
    const b = pick(await readJson(c.req, 128 * 1024), ["action", "userIds", "reason", "preview", "message"]);
    const action = v.oneOf(b, "action", ["suspend", "restrict_referrals", "flag", "notify"] as const, true)!;
    const perm = action === "suspend" ? "users.suspend" : action === "restrict_referrals" ? "users.restrict" : action === "flag" ? "fraud.review" : "announcements.manage";
    if (!can(c.user!.roles, perm)) throw new HttpError(403, "forbidden");
    const ids = v.ids(b, "userIds", 500).filter(id => id !== c.user!.id);
    const users = (await Promise.all(ids.map(id => store.getUser(id)))).filter((u): u is NonNullable<typeof u> => !!u && u.status !== "deleted" && !(u.roles.includes("super_admin") && !c.user!.roles.includes("super_admin")));
    if (b["preview"] !== false) return send(c, 200, { action, count: users.length, sample: users.slice(0, 20).map(u => ({ id: u.id, name: u.name, status: u.status })) });
    const reason = v.reason(b);
    const message = action === "notify" ? v.str(b, "message", { min: 3, max: 500, required: true })! : undefined;
    for (const u of users) {
      if (action === "suspend") { await store.setUserStatus(u.id, "suspended", { reason }); await store.revokeSessions(u.id); }
      if (action === "restrict_referrals") await store.addRestriction({ userId: u.id, scope: "referrals", reason, adminId: c.user!.id });
      if (action === "flag") await store.setReview(u.id, "flagged", reason);
      if (action === "notify") await store.addNotification({ userId: u.id, kind: "service_message", payload: { message }, essential: true });
    }
    await audit(c, `bulk.${action}`, "user", users.map(u => u.id).join(",").slice(0, 2000), null, { count: users.length }, reason);
    send(c, 200, { action, affected: users.length });
  });

  /* ---------- referral review ---------- */
  r.get("/api/admin/referrals", { summary: "Referrals by status (under_review by default)", tag: "admin-fraud", access: { perm: "fraud.review" }, query: "status" }, async c => {
    const status = qEnum(c.url, "status", ["pending", "qualified", "disqualified", "under_review"] as const) ?? "under_review";
    send(c, 200, { items: await store.listReferralsForAdmin({ status: status as ReferralStatus, limit: 200 }), totals: await store.referralTotals() });
  });
  r.post("/api/admin/referrals/:id/resolve", { summary: "Decide a referral under review", tag: "admin-fraud", access: { perm: "fraud.review" }, body: "{decision: qualified|disqualified, reason}" }, async c => {
    const b = pick(await readJson(c.req), ["decision", "reason"]);
    const decision = v.oneOf(b, "decision", ["qualified", "disqualified"] as const, true)!;
    const reason = v.reason(b);
    const ref = await store.getReferral(c.params["id"]!);
    if (!ref) throw new HttpError(404, "not_found");
    if (ref.status !== "under_review") throw new HttpError(409, "not_under_review");
    if (decision === "qualified") await creditQualified(sv, ref, now());
    else { ref.status = "disqualified"; ref.reason = reason; await store.saveReferral(ref); }
    await audit(c, "referral.resolve", "referral", ref.id, "under_review", decision, reason);
    send(c, 200, { id: ref.id, status: decision });
  });

  /* ---------- payouts ---------- */
  r.get("/api/admin/payouts", { summary: "Payout requests (masked recipients)", tag: "admin-finance", access: { perm: "payouts.read" }, query: "status, limit, offset" }, async c => {
    const status = qEnum(c.url, "status", PAYOUT_STATUSES);
    const list = await store.listPayouts({ ...(status ? { status } : {}), limit: qInt(c.url, "limit", 100, 1, 200), offset: qInt(c.url, "offset", 0, 0, 100_000) });
    send(c, 200, { counts: await store.payoutCounts(), items: list.map(p => ({ id: p.id, userId: p.userId, userName: p.userName, amountCents: p.amountCents, currency: "USD", status: p.status, method: p.methodKind ?? null,
      maskedHint: p.maskedHint, source: p.source, txReference: p.txReference ?? null, adminNotes: p.adminNotes ?? null, createdAt: p.createdAt, paidAt: p.paidAt ?? null })) });
  });
  r.get("/api/admin/payouts/:id", { summary: "Payout detail with status history", tag: "admin-finance", access: { perm: "payouts.read" } }, async c => {
    const p = await store.getPayout(c.params["id"]!);
    if (!p) throw new HttpError(404, "not_found");
    const u = await store.getUser(p.userId);
    send(c, 200, { id: p.id, userId: p.userId, userName: u?.name ?? null, amountCents: p.amountCents, status: p.status, method: p.methodKind, maskedHint: p.maskedHint, recipientName: p.recipientName ?? null,
      source: p.source, rewardClaimId: p.rewardClaimId ?? null, txReference: p.txReference ?? null, adminNotes: p.adminNotes ?? null, createdAt: p.createdAt, paidAt: p.paidAt ?? null, history: await store.payoutHistory(p.id) });
  });
  r.post("/api/admin/payouts/:id/reveal", { summary: "Show the full frozen recipient to send the money (audited)", tag: "admin-finance", access: { perm: "payouts.mark_paid" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const p = await store.getPayout(c.params["id"]!);
    if (!p || !p.snapshotEnc || p.snapshotEnc === "erased") throw new HttpError(404, "not_found");
    if (!["pending", "in_progress", "action_required"].includes(p.status)) throw new HttpError(409, "payout_not_open");
    const recipient = decrypt(p.snapshotEnc, app.deps.keyRing, `payout_request:${p.id}`);
    await audit(c, "payout.reveal_recipient", "payout", p.id, null, null, reason);
    send(c, 200, { method: p.methodKind, recipient, recipientName: p.recipientName ?? null });
  });
  r.post("/api/admin/payouts/:id/status", { summary: "Move a payout: in_progress | action_required | paid (confirmPaid + txReference) | failed | rejected | pending (retry)", tag: "admin-finance",
    access: { perm: "payouts.review" }, body: "{to, reason?, txReference?, confirmPaid?}" }, async c => {
    const b = pick(await readJson(c.req), ["to", "reason", "txReference", "confirmPaid"]);
    const to = v.oneOf(b, "to", PAYOUT_STATUSES, true)!;
    if (to === "paid" && !can(c.user!.roles, "payouts.mark_paid")) throw new HttpError(403, "forbidden");
    const reason = v.str(b, "reason", { max: 500 }), txReference = v.str(b, "txReference", { max: 200 });
    const p = await changePayoutStatus(sv, c.user!.id, c.params["id"]!, to, { ...(reason ? { reason } : {}), ...(txReference ? { txReference } : {}), confirmPaid: b["confirmPaid"] === true });
    send(c, 200, { id: p.id, status: p.status });
  });

  /* ---------- reward claims and manual fulfilment ---------- */
  r.get("/api/admin/claims", { summary: "Reward claims (cash milestones, challenge prizes, Telegram/WhatsApp fulfilment)", tag: "admin-finance", access: { perm: "rewards.fulfil" }, query: "status, kind" }, async c => {
    const status = qEnum(c.url, "status", ["pending", "in_progress", "completed", "failed", "action_required", "rejected"] as const);
    const kind = qEnum(c.url, "kind", ["cash", "whatsapp_promotion", "telegram_stars", "telegram_premium", "premium", "vip"] as const);
    const list = await store.listRewardClaims({ ...(status ? { status } : {}), ...(kind ? { kind } : {}) });
    const items = await Promise.all(list.map(async x => ({ ...x, fulfilment: x.kind !== "cash" ? await store.fulfillmentForClaim(x.id) : null })));
    send(c, 200, { items, counts: await store.claimCounts() });
  });
  r.post("/api/admin/claims/:id/fund", { summary: "Fund a cash claim that waited for budget review (budget must cover it)", tag: "admin-finance", access: { perm: "ledger.adjust" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    await inTx(sv, async svx => {
      const claim = await svx.store.getRewardClaim(c.params["id"]!);
      if (!claim || claim.kind !== "cash") throw new HttpError(404, "not_found");
      await svx.store.lock(`rewards:${claim.userId}`);
      const fresh = (await svx.store.getRewardClaim(claim.id))!;
      if (fresh.status !== "action_required") throw new HttpError(409, "claim_not_waiting");
      if ((await svx.store.activeRestrictions(claim.userId)).has("rewards")) throw new HttpError(409, "rewards_restricted");
      const earned = computeBalances(await svx.store.ledgerFor(claim.userId)).earned;
      if (creditableCents(fresh.amountCents!, earned, await svx.store.globalEarnedCents(), await loadBudget(svx)) < fresh.amountCents!) throw new HttpError(409, "budget_exhausted");
      await fundClaim(svx, fresh, c.user!.id);
      await svx.store.addAudit({ actorId: c.user!.id, action: "claim.fund", resourceType: "reward_claim", resourceId: claim.id, from: "action_required", to: "in_progress", reason, correlationId: c.requestId, at: now() });
    });
    send(c, 200, { status: "in_progress" });
  });
  r.post("/api/admin/claims/:id/reject", { summary: "Reject a claim that has not been paid or delivered", tag: "admin-finance", access: { perm: "rewards.fulfil" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const claim = await store.getRewardClaim(c.params["id"]!);
    if (!claim) throw new HttpError(404, "not_found");
    if (!["pending", "action_required", "failed"].includes(claim.status)) throw new HttpError(409, "claim_not_rejectable");
    await store.updateRewardClaim(claim.id, { status: "rejected", note: reason });
    if (claim.kind !== "cash" && (await store.fulfillmentForClaim(claim.id))) await store.updateFulfillment(claim.id, { status: "failed", notes: `rejected: ${reason}`, adminId: c.user!.id });
    await audit(c, "claim.reject", "reward_claim", claim.id, claim.status, "rejected", reason);
    await notify(sv, claim.userId, "fulfilment_update", { claimId: claim.id, kind: claim.kind, status: "rejected", reason });
    send(c, 200, { status: "rejected" });
  });
  r.post("/api/admin/claims/:id/fulfilment", { summary: "Update a manual delivery (Telegram Stars/Premium, WhatsApp promotion). 'completed' needs a delivery confirmation.", tag: "admin-finance",
    access: { perm: "rewards.fulfil" }, body: "{status: in_progress|completed|failed|action_required, deliveryConfirmation?, notes?}" }, async c => {
    const b = pick(await readJson(c.req), ["status", "deliveryConfirmation", "notes"]);
    const status = v.oneOf(b, "status", ["in_progress", "completed", "failed", "action_required"] as const, true)!;
    const confirmation = v.str(b, "deliveryConfirmation", { min: 3, max: 300 });
    const notes = v.str(b, "notes", { max: 1000 });
    if (status === "completed" && !confirmation) throw new HttpError(400, "delivery_confirmation_required"); // never "delivered" without evidence
    if ((status === "failed" || status === "action_required") && !notes) throw new HttpError(400, "notes_required");
    const claim = await store.getRewardClaim(c.params["id"]!);
    if (!claim || claim.kind === "cash") throw new HttpError(404, "not_found");
    if (claim.status === "completed" || claim.status === "rejected") throw new HttpError(409, "claim_closed");
    const f = await store.ensureFulfillment(claim.id, claim.kind);
    await store.updateFulfillment(claim.id, { status, ...(confirmation ? { deliveryConfirmation: confirmation } : {}), ...(notes ? { notes } : {}), adminId: c.user!.id });
    await store.updateRewardClaim(claim.id, { status });
    const ch = /^challenge:([0-9a-f-]{36})$/.exec(claim.source);
    if (ch) {
      const part = await store.getParticipation(ch[1]!, claim.userId);
      if (part) await store.saveParticipation({ ...part, status: status === "completed" ? "reward_delivered" : status === "in_progress" ? "reward_in_progress" : "reward_pending" });
    }
    await audit(c, "fulfilment.update", "reward_claim", claim.id, f.status, status, notes ?? confirmation);
    await notify(sv, claim.userId, "fulfilment_update", { claimId: claim.id, kind: claim.kind, status });
    send(c, 200, { status });
  });
}
