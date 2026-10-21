import { randomUUID } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { ChallengeRec, AnnouncementRow, TicketRow } from "../../store/types.ts";
import { HttpError, pick, readJson, v, qInt, qEnum, qUuid, csvEscape, LANGS, UUID, type Ctx } from "../kit.ts";
import { validateUpdate, validateMonthlySet, METRICS, DIFFICULTIES, REWARD_TYPES, type Difficulty, type Metric, type RewardType } from "../../domain/challenges.ts";
import { TEMPLATES, DEFAULT_TERMS } from "../../domain/challenge-templates.ts";
import { DEFAULT_MILESTONES, type Milestone } from "../../domain/rewards.ts";
import { DEFAULT_POLICY } from "../../domain/money.ts";
import { DEFAULT_BUDGET } from "../../domain/budget.ts";
import { deliverChallengeReward } from "./engage.ts";
import { notify, inTx, type Services } from "../../services/notify.ts";
import { DELETION_GRACE_MS } from "./me.ts";

/** Erases a user's personal data after the grace period. Refused while money is still moving for them. */
export async function finalizeDeletion(sv: Services, userId: string, actorId: string | null): Promise<"done" | "payout_open"> {
  if (await sv.store.openPayoutFor(userId)) return "payout_open";
  await sv.store.anonymizeUser(userId);
  await sv.store.addSecurityEvent({ userId, kind: "account_deleted", detail: { by: actorId ? "admin" : "schedule" }, at: sv.now() });
  if (actorId) await sv.store.addAudit({ actorId, action: "user.delete_finalize", resourceType: "user", resourceId: userId, from: "pending_deletion", to: "deleted", at: sv.now() });
  return "done";
}

export function registerAdminOps(app: AppCtx) {
  const { router: r, store, now, send, sv } = app;
  const audit = (c: Ctx, action: string, resourceType: string, resourceId: string, from: unknown, to: unknown, reason?: string) =>
    store.addAudit({ actorId: c.user!.id, action, resourceType, resourceId, from, to, ...(reason ? { reason } : {}), correlationId: c.requestId, at: now() });

  /* ---------- overview & health ---------- */
  r.get("/api/admin/overview", { summary: "Platform numbers, money obligations, queues, support and service health (all live)", tag: "admin", access: { perm: "users.read" } }, async c => {
    const [counts, signups, finance, payouts, claims, refs, tickets, syncRate, jobs, beats, backups, failedLogins, denied, health] = await Promise.all([
      store.platformCounts(), store.signupsPerDay(30), store.financeTotals(), store.payoutCounts(), store.claimCounts(), store.referralTotals(), store.ticketCounts(), store.syncSuccessRate(),
      store.jobCountsGlobal(), store.heartbeats(), store.lastOpsBackups(5), store.countSecurityEventsSince("login_failed", now() - 86_400_000),
      store.countSecurityEventsSince("admin_denied", now() - 86_400_000), app.deps.health ? app.deps.health() : Promise.resolve({})]);
    const open = (s: string) => payouts[s] ?? { count: 0, cents: 0 };
    send(c, 200, {
      users: counts, signups,
      sync: { ...jobs, successRate7d: syncRate.attempts ? Math.round((syncRate.synced / syncRate.attempts) * 1000) / 10 : null, attempts7d: syncRate.attempts },
      referrals: refs, suspiciousReferrals: refs["under_review"] ?? 0,
      money: { ...finance, pendingObligationsCents: open("pending").cents + open("in_progress").cents + open("action_required").cents,
        pendingCount: open("pending").count + open("in_progress").count + open("action_required").count, paidCents: open("paid").cents, paidCount: open("paid").count,
        failedCount: open("failed").count, rejectedCount: open("rejected").count },
      fulfilmentBacklog: (claims["pending"] ?? 0) + (claims["in_progress"] ?? 0) + (claims["action_required"] ?? 0),
      support: tickets, security: { failedLogins24h: failedLogins, deniedAdminRequests24h: denied },
      health: { ...health, workers: beats.map(b => ({ name: b.name, lastBeatAt: b.at, ageSeconds: Math.round((now() - b.at) / 1000), ok: now() - b.at < 120_000, info: b.info })), backups },
    });
  });

  /* ---------- challenges ---------- */
  function parseChallenge(raw: Record<string, unknown>, id: string): Omit<ChallengeRec, "published"> {
    const b = pick(raw, ["title", "description", "difficulty", "startsAt", "endsAt", "metric", "threshold", "rewardType", "rewardCents", "rewardXp", "budgetCents", "maxWinners", "terms", "claimDeadline", "slug", "reviewRequired", "eligibility"]);
    const text = (k: string) => {
      const x = b[k];
      if (typeof x !== "object" || x === null || Array.isArray(x)) throw new HttpError(400, `invalid_${k}`);
      const o = x as Record<string, unknown>;
      if (typeof o["en"] !== "string" || !o["en"].trim()) throw new HttpError(400, `${k}_en_required`);
      for (const [l, t] of Object.entries(o)) if (!(LANGS as readonly string[]).includes(l) || typeof t !== "string" || t.length > 2000) throw new HttpError(400, `invalid_${k}`);
      return o as Record<string, string>;
    };
    const difficulty = v.oneOf(b, "difficulty", DIFFICULTIES, true)! as Difficulty;
    const metric = v.oneOf(b, "metric", METRICS, true)! as Metric;
    const rewardType = v.oneOf(b, "rewardType", REWARD_TYPES, true)! as RewardType;
    const terms = v.str(b, "terms", { min: 10, max: 4000 }) ?? (() => { throw new HttpError(400, "terms_required"); })();
    const startsAt = v.int(b, "startsAt", { min: 0, max: 8.64e15, required: true })!, endsAt = v.int(b, "endsAt", { min: 0, max: 8.64e15, required: true })!;
    if (endsAt <= startsAt) throw new HttpError(400, "end_before_start");
    const rewardCents = v.int(b, "rewardCents", { min: 1, max: 1_000_000 }), budgetCents = v.int(b, "budgetCents", { min: 1, max: 100_000_000 });
    if (rewardType === "cash" && (rewardCents === undefined || budgetCents === undefined)) throw new HttpError(400, "cash_reward_needs_amount_and_budget"); // no cash without a budget
    const slug = v.str(b, "slug", { min: 3, max: 60, pattern: /^[a-z0-9-]+$/ }) ?? `ch-${id.slice(0, 8)}`;
    const def: Omit<ChallengeRec, "published"> = { id, slug, title: text("title"), description: text("description"), terms, difficulty, metric, threshold: v.int(b, "threshold", { min: 1, max: 1_000_000, required: true })!,
      startsAt, endsAt, rewardType, reviewRequired: v.bool(b, "reviewRequired") ?? metric === "admin_verified" };
    if (rewardCents !== undefined) def.rewardCents = rewardCents;
    if (budgetCents !== undefined) def.budgetCents = budgetCents;
    const mw = v.int(b, "maxWinners", { min: 1, max: 1_000_000 }); if (mw !== undefined) def.maxWinners = mw;
    const rx = v.int(b, "rewardXp", { min: 1, max: 100_000 }); if (rx !== undefined) def.rewardXp = rx;
    const cd = v.int(b, "claimDeadline", { min: endsAt, max: 8.64e15 }); if (cd !== undefined) def.claimDeadline = cd;
    const el = b["eligibility"];
    if (el !== undefined) {
      if (typeof el !== "object" || el === null) throw new HttpError(400, "invalid_eligibility");
      const e = pick(el as Record<string, unknown>, ["minAccountAgeDays", "minLevel"]);
      const age = v.int(e, "minAccountAgeDays", { min: 0, max: 3650 }), lvl = v.int(e, "minLevel", { min: 1, max: 200 });
      def.eligibility = { ...(age ? { minAccountAgeDays: age } : {}), ...(lvl ? { minLevel: lvl } : {}) };
    }
    return def;
  }
  r.get("/api/admin/challenges", { summary: "All challenges (drafts included) with participation numbers", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    const stats = new Map((await store.challengeStats()).map(x => [x.challengeId, x]));
    send(c, 200, { items: (await store.listChallenges(false)).map(d => ({ ...d, stats: stats.get(d.id) ?? { joined: 0, completed: 0, claimed: 0, spentCents: 0 } })), templates: TEMPLATES.map(t => t.slug) });
  });
  r.post("/api/admin/challenges", { summary: "Create a draft challenge", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    const def = parseChallenge(await readJson(c.req), randomUUID());
    try { await store.saveChallenge({ ...def, published: false }, c.user!.id); }
    catch (e) { if ((e as { code?: string }).code === "23505") throw new HttpError(409, "slug_taken"); throw e; }
    await audit(c, "challenge.create", "challenge", def.id, null, "draft");
    send(c, 201, { id: def.id });
  });
  r.put("/api/admin/challenges/:id", { summary: "Edit a challenge (terms frozen once someone qualified; end date can only be extended)", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    const old = await store.getChallenge(c.params["id"]!);
    if (!old) throw new HttpError(404, "not_found");
    const next = parseChallenge(await readJson(c.req), old.id);
    const errs = validateUpdate(old, next, (await store.participationsFor(old.id)).some(p => p.completedAt));
    if (errs.length) throw new HttpError(409, errs[0]!.replace(/\s+/g, "_").slice(0, 80));
    await store.saveChallenge({ ...next, published: old.published });
    await audit(c, "challenge.update", "challenge", old.id, { threshold: old.threshold, endsAt: old.endsAt }, { threshold: next.threshold, endsAt: next.endsAt });
    send(c, 200, { id: old.id });
  });
  r.delete("/api/admin/challenges/:id", { summary: "Delete a draft nobody joined", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    if (!(await store.deleteDraftChallenge(c.params["id"]!))) throw new HttpError(409, "only_unused_drafts_can_be_deleted");
    await audit(c, "challenge.delete", "challenge", c.params["id"]!, "draft", null);
    send(c, 200, { ok: true });
  });
  r.post("/api/admin/challenges/templates", { summary: "Create this month's drafts from the 10 standard templates", tag: "admin-challenges", access: { perm: "challenges.manage" }, body: "{month: YYYY-MM}" }, async c => {
    const b = pick(await readJson(c.req), ["month"]);
    const m = v.str(b, "month", { max: 7, required: true, pattern: /^\d{4}-(0[1-9]|1[0-2])$/ })!;
    const [y, mo] = m.split("-").map(Number) as [number, number];
    const start = Date.UTC(y, mo - 1, 1), end = Date.UTC(y, mo, 1);
    const existing = new Set((await store.listChallenges(false)).map(d => d.slug));
    const ids: string[] = [];
    for (const t of TEMPLATES) {
      const slug = `${t.slug}-${m}`;
      if (existing.has(slug)) continue;
      const id = randomUUID();
      await store.saveChallenge({ id, slug, title: t.title, description: t.description, terms: DEFAULT_TERMS, difficulty: t.difficulty, metric: t.metric, threshold: t.threshold, startsAt: Math.max(start, now()), endsAt: end,
        rewardType: t.rewardType, ...(t.rewardXp ? { rewardXp: t.rewardXp } : {}), reviewRequired: !!t.reviewRequired, published: false }, c.user!.id);
      ids.push(id);
    }
    await audit(c, "challenge.templates", "challenge", m, null, { created: ids.length });
    send(c, 201, { created: ids.length, ids });
  });
  r.post("/api/admin/challenges/publish-month", { summary: "Publish a monthly set (at least 8, every one hard enough)", tag: "admin-challenges", access: { perm: "challenges.manage" }, body: "{ids: uuid[]}" }, async c => {
    const ids = v.ids(await readJson(c.req), "ids", 50);
    const defs: ChallengeRec[] = [];
    for (const id of ids) { const d = await store.getChallenge(id); if (!d) throw new HttpError(404, "not_found"); defs.push(d); }
    const errs = validateMonthlySet(defs);
    if (errs.length) return send(c, 422, { error: "invalid_month", problems: errs });
    for (const d of defs) { d.published = true; await store.saveChallenge(d); }
    await audit(c, "challenge.publish_month", "challenge", ids.join(",").slice(0, 2000), "draft", "published");
    send(c, 200, { published: defs.length });
  });
  r.post("/api/admin/challenges/:id/publish", { summary: "Publish one more challenge in a month that already has its set", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    const d = await store.getChallenge(c.params["id"]!);
    if (!d) throw new HttpError(404, "not_found");
    const errs = validateMonthlySet([d], 1);
    if (errs.length) return send(c, 422, { error: "invalid_challenge", problems: errs });
    await store.saveChallenge({ ...d, published: true });
    await audit(c, "challenge.publish", "challenge", d.id, "draft", "published");
    send(c, 200, { ok: true });
  });
  r.get("/api/admin/challenges/reviews", { summary: "Claims waiting for a person's review", tag: "admin-challenges", access: { perm: "challenges.manage" } }, async c => {
    const list = await store.participationsWithStatus("reward_pending");
    const out = [];
    for (const p of list) { const d = await store.getChallenge(p.challengeId); if (d?.reviewRequired) out.push({ ...p, challenge: { id: d.id, slug: d.slug, title: d.title["en"], rewardType: d.rewardType } }); }
    send(c, 200, { items: out });
  });
  r.post("/api/admin/challenges/:id/participants/:id2/review", { summary: "Approve (reward is delivered) or reject a reviewed claim", tag: "admin-challenges", access: { perm: "challenges.manage" },
    body: "{decision: approve|reject, reason}" }, async c => {
    const b = pick(await readJson(c.req), ["decision", "reason"]);
    const decision = v.oneOf(b, "decision", ["approve", "reject"] as const, true)!;
    const reason = v.reason(b);
    const res = await inTx(sv, async svx => {
      await svx.store.lock(`challenge:${c.params["id"]}`);
      const d = await svx.store.getChallenge(c.params["id"]!);
      const part = await svx.store.getParticipation(c.params["id"]!, c.params["id2"]!);
      if (!d || !part) throw new HttpError(404, "not_found");
      if (part.status !== "reward_pending" || !d.reviewRequired) throw new HttpError(409, "not_waiting_for_review");
      if (decision === "reject") { await svx.store.saveParticipation({ ...part, status: "rejected", reviewNote: reason }); return "rejected"; }
      const out = await deliverChallengeReward(svx, d, part);
      await svx.store.saveParticipation({ ...part, status: out.status, awardedCents: out.awardedCents, reviewNote: reason });
      return out.status;
    });
    await audit(c, "challenge.review", "challenge", c.params["id"]!, "reward_pending", res, reason);
    await notify(sv, c.params["id2"]!, "challenge_review", { challengeId: c.params["id"], decision });
    send(c, 200, { status: res });
  });

  /* ---------- settings: reward policy, budget, milestones, referral rules, VIP ---------- */
  r.get("/api/admin/settings", { summary: "Reward policy, budgets, milestones, referral rules, VIP levels", tag: "admin-settings", access: { perm: "settings.manage" } }, async c => {
    send(c, 200, {
      reward_policy: await store.getJsonSetting("reward_policy", DEFAULT_POLICY), reward_budget: await store.getJsonSetting("reward_budget", DEFAULT_BUDGET),
      referral_milestones: await store.getJsonSetting("referral_milestones", DEFAULT_MILESTONES), referral_policy: await store.getJsonSetting("referral_policy", { minAccountAgeHours: 24, maxPerNetworkPerDay: 3 }),
      intro_first_visit_only: (await store.getSetting("intro_first_visit_only")) !== "false", vip_levels: await store.vipLevels(), globalEarnedCents: await store.globalEarnedCents(),
    });
  });
  r.put("/api/admin/settings/:kind", { summary: "Change one setting (reward_policy, reward_budget, referral_milestones, referral_policy, intro_first_visit_only, vip_levels). Audited.", tag: "admin-settings",
    access: { perm: "settings.manage" }, body: "{value, reason}" }, async c => {
    const key = c.params["kind"]!;
    const b = pick(await readJson(c.req), ["value", "reason"]);
    const reason = v.reason(b);
    const val = b["value"];
    const obj = (x: unknown) => { if (typeof x !== "object" || x === null || Array.isArray(x)) throw new HttpError(400, "invalid_value"); return x as Record<string, unknown>; };
    let before: unknown, after: unknown;
    if (key === "reward_policy") {
      const o = pick(obj(val), ["centsPerReferral", "minWithdrawCents", "maxRewardedReferrals"]);
      after = { centsPerReferral: v.int(o, "centsPerReferral", { min: 0, max: 1000, required: true }), minWithdrawCents: v.int(o, "minWithdrawCents", { min: 100, max: 1_000_000, required: true }),
        maxRewardedReferrals: v.int(o, "maxRewardedReferrals", { min: 0, max: 10_000_000, required: true }) };
    } else if (key === "reward_budget") {
      const o = pick(obj(val), ["perUserCapCents", "globalCapCents"]);
      after = { perUserCapCents: v.int(o, "perUserCapCents", { min: 0, max: 100_000_000, required: true }), globalCapCents: v.int(o, "globalCapCents", { min: 0, max: 1_000_000_000, required: true }) };
    } else if (key === "referral_policy") {
      const o = pick(obj(val), ["minAccountAgeHours", "maxPerNetworkPerDay"]);
      after = { minAccountAgeHours: v.int(o, "minAccountAgeHours", { min: 0, max: 24 * 90, required: true }), maxPerNetworkPerDay: v.int(o, "maxPerNetworkPerDay", { min: 1, max: 1000, required: true }) };
    } else if (key === "referral_milestones") {
      if (!Array.isArray(val) || val.length < 1 || val.length > 20) throw new HttpError(400, "invalid_value");
      const list: Milestone[] = val.map(x => { const o = pick(obj(x), ["threshold", "xp", "badge", "cashCents"]); const m: Milestone = { threshold: v.int(o, "threshold", { min: 1, max: 1_000_000, required: true })! };
        const xp = v.int(o, "xp", { min: 0, max: 100_000 }); if (xp) m.xp = xp; const badge = v.str(o, "badge", { max: 40, pattern: /^[a-z0-9_]+$/ }); if (badge) m.badge = badge;
        const cash = v.int(o, "cashCents", { min: 1, max: 100_000 }); if (cash) m.cashCents = cash; return m; }).sort((a, b2) => a.threshold - b2.threshold);
      if (new Set(list.map(m => m.threshold)).size !== list.length) throw new HttpError(400, "duplicate_threshold");
      // published milestones cannot lose a cash reward people are working toward
      const old = await store.getJsonSetting<Milestone[]>("referral_milestones", DEFAULT_MILESTONES);
      for (const o of old.filter(m => m.cashCents)) { const n = list.find(m => m.threshold === o.threshold); if (!n || (n.cashCents ?? 0) < o.cashCents!) throw new HttpError(409, "cannot_reduce_published_cash_milestone"); }
      after = list;
    } else if (key === "intro_first_visit_only") {
      if (typeof val !== "boolean") throw new HttpError(400, "invalid_value");
      before = (await store.getSetting(key)) !== "false"; await store.setSetting(key, String(val));
      await audit(c, "settings.update", "setting", key, before, val, reason);
      return send(c, 200, { ok: true });
    } else if (key === "vip_levels") {
      if (!Array.isArray(val) || val.length < 2 || val.length > 10) throw new HttpError(400, "invalid_value");
      const levels = val.map(x => { const o = pick(obj(x), ["name", "minXp", "benefits"]); const ben = o["benefits"];
        if (ben !== undefined && (typeof ben !== "object" || ben === null || Object.entries(ben).some(([l, t]) => !(LANGS as readonly string[]).includes(l) || typeof t !== "string" || (t as string).length > 300))) throw new HttpError(400, "invalid_benefits");
        return { name: v.str(o, "name", { min: 2, max: 30, required: true })!, minXp: v.int(o, "minXp", { min: 0, max: 100_000_000, required: true })!, benefits: (ben ?? {}) as Record<string, string> }; }).sort((a, b2) => a.minXp - b2.minXp);
      if (levels[0]!.minXp !== 0) throw new HttpError(400, "first_level_must_start_at_0");
      before = await store.vipLevels(); await store.saveVipLevels(levels);
      await audit(c, "settings.update", "setting", key, before, levels, reason);
      return send(c, 200, { ok: true });
    } else throw new HttpError(404, "not_found");
    before = await store.getJsonSetting(key, null);
    await store.setJsonSetting(key, after);
    await audit(c, "settings.update", "setting", key, before, after, reason);
    send(c, 200, { ok: true, value: after });
  });

  /* ---------- announcements ---------- */
  const ANN_KINDS = ["product", "feature", "challenge", "reward", "maintenance", "security"] as const;
  function parseAnnouncement(raw: Record<string, unknown>) {
    const b = pick(raw, ["kind", "title", "body", "status", "pinned", "showOnSite"]);
    const text = (k: string, max: number) => { const x = b[k]; if (typeof x !== "object" || x === null) throw new HttpError(400, `invalid_${k}`); const o = x as Record<string, unknown>;
      if (typeof o["en"] !== "string" || !o["en"].trim()) throw new HttpError(400, `${k}_en_required`);
      for (const [l, t] of Object.entries(o)) if (!(LANGS as readonly string[]).includes(l) || typeof t !== "string" || t.length > max) throw new HttpError(400, `invalid_${k}`); return o as Record<string, string>; };
    return { kind: v.oneOf(b, "kind", ANN_KINDS, true)!, title: text("title", 140), body: text("body", 4000), status: v.oneOf(b, "status", ["draft", "published", "archived"] as const) ?? "draft",
      pinned: v.bool(b, "pinned") ?? false, showOnSite: v.bool(b, "showOnSite") ?? false };
  }
  r.get("/api/admin/announcements", { summary: "All announcements", tag: "admin-community", access: { perm: "announcements.manage" } }, async c => send(c, 200, { items: await store.listAnnouncements({ publishedOnly: false, limit: 200 }) }));
  r.post("/api/admin/announcements", { summary: "Create an announcement", tag: "admin-community", access: { perm: "announcements.manage" } }, async c => {
    const a = parseAnnouncement(await readJson(c.req));
    const row: AnnouncementRow = { id: randomUUID(), ...a, createdAt: now(), createdBy: c.user!.id, ...(a.status === "published" ? { publishedAt: now() } : {}) };
    await store.saveAnnouncement(row);
    await audit(c, "announcement.create", "announcement", row.id, null, a.status);
    send(c, 201, { id: row.id });
  });
  r.put("/api/admin/announcements/:id", { summary: "Edit, publish or archive an announcement", tag: "admin-community", access: { perm: "announcements.manage" } }, async c => {
    const old = await store.getAnnouncement(c.params["id"]!);
    if (!old) throw new HttpError(404, "not_found");
    const a = parseAnnouncement(await readJson(c.req));
    await store.saveAnnouncement({ ...old, ...a, ...(a.status === "published" && !old.publishedAt ? { publishedAt: now() } : {}) });
    await audit(c, "announcement.update", "announcement", old.id, old.status, a.status);
    send(c, 200, { ok: true });
  });

  /* ---------- support desk ---------- */
  r.get("/api/admin/tickets", { summary: "Support queue", tag: "admin-support", access: { perm: "tickets.read" }, query: "status, category, mine=1" }, async c => {
    const status = qEnum(c.url, "status", ["open", "pending", "closed"] as const), category = qEnum(c.url, "category", ["bug", "payment", "account", "partnership", "feature", "other"] as const);
    send(c, 200, { counts: await store.ticketCounts(), items: await store.listTickets({ ...(status ? { status } : {}), ...(category ? { category } : {}), ...(c.url.searchParams.get("mine") === "1" ? { assignedTo: c.user!.id } : {}),
      limit: qInt(c.url, "limit", 100, 1, 200), offset: qInt(c.url, "offset", 0, 0, 100_000) }) });
  });
  r.get("/api/admin/tickets/:id", { summary: "Ticket with the full conversation (internal notes included)", tag: "admin-support", access: { perm: "tickets.read" } }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t) throw new HttpError(404, "not_found");
    const u = await store.getUser(t.userId);
    send(c, 200, { ...t, user: u ? { id: u.id, name: u.name, email: u.email, status: u.status } : null, messages: await store.ticketMessages(t.id, true), staff: (await store.usersWithRole()).map(s => ({ id: s.id, name: s.name, roles: s.roles })) });
  });
  r.post("/api/admin/tickets/:id/reply", { summary: "Answer the user (or add an internal note)", tag: "admin-support", access: { perm: "tickets.respond" }, body: "{body, internal?}" }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t) throw new HttpError(404, "not_found");
    const b = pick(await readJson(c.req), ["body", "internal"]);
    const body = v.str(b, "body", { min: 1, max: 5000, required: true })!;
    const internal = v.bool(b, "internal") ?? false;
    await store.addTicketMessage({ ticketId: t.id, authorId: c.user!.id, isStaff: true, internal, body });
    if (!internal) {
      await store.updateTicket(t.id, { status: "pending", ...(t.assignedTo ? {} : { assignedTo: c.user!.id }) });
      await notify(sv, t.userId, "ticket_reply", { ticketId: t.id, subject: t.subject });
    }
    send(c, 200, { ok: true });
  });
  r.patch("/api/admin/tickets/:id", { summary: "Status, priority, assignment", tag: "admin-support", access: { perm: "tickets.respond" }, body: "{status?, priority?, assignedTo? (uuid|null)}" }, async c => {
    const t = await store.getTicket(c.params["id"]!);
    if (!t) throw new HttpError(404, "not_found");
    const b = pick(await readJson(c.req), ["status", "priority", "assignedTo"]);
    const patch: { status?: TicketRow["status"]; priority?: TicketRow["priority"]; assignedTo?: string | null } = {};
    const st = v.oneOf(b, "status", ["open", "pending", "closed"] as const); if (st) patch.status = st;
    const pr = v.oneOf(b, "priority", ["low", "normal", "high", "urgent"] as const); if (pr) patch.priority = pr;
    if ("assignedTo" in b) {
      if (b["assignedTo"] !== null && (typeof b["assignedTo"] !== "string" || !UUID.test(b["assignedTo"]))) throw new HttpError(400, "invalid_assignedTo");
      if (b["assignedTo"]) { const s = await store.getUser(b["assignedTo"] as string); if (!s || !s.roles.length) throw new HttpError(400, "assignee_not_staff"); }
      patch.assignedTo = (b["assignedTo"] as string | null);
    }
    await store.updateTicket(t.id, patch);
    send(c, 200, { ok: true });
  });

  /* ---------- account deletion requests ---------- */
  r.get("/api/admin/deletions", { summary: "Accounts waiting for deletion", tag: "admin-users", access: { perm: "deletions.manage" } }, async c => {
    const list = await store.listDeletionRequests();
    send(c, 200, { items: await Promise.all(list.map(async u => ({ id: u.id, name: u.name, email: u.email, requestedAt: u.deletionRequestedAt, dueAt: (u.deletionRequestedAt ?? 0) + DELETION_GRACE_MS, openPayout: !!(await store.openPayoutFor(u.id)) }))) });
  });
  r.post("/api/admin/deletions/:id/process", { summary: "Erase now (before the end of the grace period)", tag: "admin-users", access: { perm: "deletions.manage" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const u = await store.getUser(c.params["id"]!);
    if (!u || u.status !== "pending_deletion") throw new HttpError(404, "not_found");
    const res = await finalizeDeletion(sv, u.id, c.user!.id);
    if (res === "payout_open") throw new HttpError(409, "payout_open");
    await audit(c, "user.delete_process", "user", u.id, "pending_deletion", "deleted", reason);
    send(c, 200, { status: "deleted" });
  });
  r.post("/api/admin/deletions/:id/cancel", { summary: "Cancel a deletion request (e.g. at the user's request)", tag: "admin-users", access: { perm: "deletions.manage" }, body: "{reason}" }, async c => {
    const reason = v.reason(pick(await readJson(c.req), ["reason"]));
    const u = await store.getUser(c.params["id"]!);
    if (!u || u.status !== "pending_deletion") throw new HttpError(404, "not_found");
    await store.setDeletionRequested(u.id, null);
    await audit(c, "user.delete_cancel", "user", u.id, "pending_deletion", "active", reason);
    send(c, 200, { status: "active" });
  });

  /* ---------- audit, security events, reports ---------- */
  r.get("/api/admin/audit", { summary: "Audit log (read-only; the database refuses edits)", tag: "admin", access: { perm: "audit.read" }, query: "actor, resourceType, resourceId, action, limit, offset" }, async c => {
    const actorId = qUuid(c.url, "actor"), resourceType = c.url.searchParams.get("resourceType")?.slice(0, 40), resourceId = c.url.searchParams.get("resourceId")?.slice(0, 100), action = c.url.searchParams.get("action")?.slice(0, 60);
    send(c, 200, { items: await store.listAudit({ ...(actorId ? { actorId } : {}), ...(resourceType ? { resourceType } : {}), ...(resourceId ? { resourceId } : {}), ...(action ? { action } : {}),
      limit: qInt(c.url, "limit", 100, 1, 500), offset: qInt(c.url, "offset", 0, 0, 1_000_000) }) });
  });
  r.get("/api/admin/security-events", { summary: "Security events (sign-ins, failures, denied admin requests...)", tag: "admin", access: { perm: "audit.read" }, query: "kind, user, limit, offset" }, async c => {
    const kind = c.url.searchParams.get("kind")?.slice(0, 40) || undefined, userId = qUuid(c.url, "user");
    send(c, 200, { items: await store.listSecurityEvents({ ...(kind ? { kind } : {}), ...(userId ? { userId } : {}), limit: qInt(c.url, "limit", 100, 1, 500), offset: qInt(c.url, "offset", 0, 0, 1_000_000) }) });
  });
  r.get("/api/admin/reports/:kind", { summary: "CSV export: users | payouts | referrals | claims (never contact contents)", tag: "admin", access: { perm: "reports.export" }, produces: "text/csv" }, async c => {
    const kind = c.params["kind"]!;
    let header: string[], rows: unknown[][];
    if (kind === "users") {
      const all = (await store.listUsers({ limit: 10_000, offset: 0 })).rows;
      header = ["id", "name", "email", "status", "review", "country", "language", "created", "last_seen", "contacts", "qualified_referrals", "xp", "pending_cents", "paid_cents", "google_contacts"];
      rows = all.map(u => [u.id, u.name, u.email, u.status, u.reviewStatus, u.countryCode ?? "", u.language, new Date(u.createdAt).toISOString(), u.lastSeenAt ? new Date(u.lastSeenAt).toISOString() : "", u.contactCount, u.qualifiedReferrals, u.xp, u.pendingCents, u.paidCents, u.contactsStatus]);
    } else if (kind === "payouts") {
      const all = await store.listPayouts({ limit: 10_000 });
      header = ["id", "user_id", "user", "amount_cents", "status", "method", "masked_recipient", "source", "tx_reference", "created", "paid"];
      rows = all.map(p => [p.id, p.userId, p.userName, p.amountCents, p.status, p.methodKind ?? "", p.maskedHint, p.source ?? "", p.txReference ?? "", p.createdAt ? new Date(p.createdAt).toISOString() : "", p.paidAt ? new Date(p.paidAt).toISOString() : ""]);
    } else if (kind === "referrals") {
      const all = [...await store.listReferralsForAdmin({ limit: 10_000 })];
      header = ["id", "referrer", "referred", "status", "reason", "created", "qualified"];
      rows = all.map(x => [x.id, x.referrerName, x.referredName, x.status, x.reason ?? "", new Date(x.createdAt).toISOString(), x.qualifiedAt ? new Date(x.qualifiedAt).toISOString() : ""]);
    } else if (kind === "claims") {
      const all = await store.listRewardClaims({ limit: 10_000 });
      header = ["id", "user", "source", "kind", "status", "amount_cents", "created"];
      rows = all.map(x => [x.id, x.userName, x.source, x.kind, x.status, x.amountCents ?? "", new Date(x.createdAt).toISOString()]);
    } else throw new HttpError(404, "not_found");
    await audit(c, "report.export", "report", kind, null, { rows: rows.length });
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
    send(c, 200, "﻿" + csv, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="syrix-${kind}-${new Date(now()).toISOString().slice(0, 10)}.csv"` });
  });
}
