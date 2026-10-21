import { randomUUID } from "node:crypto";
import type { AppCtx } from "../app.ts";
import type { ChallengeRec, Participation } from "../../store/types.ts";
import { HttpError, qEnum } from "../kit.ts";
import { DuplicateError } from "../../store/types.ts";
import { evaluateProgress, canAward, MANUAL_REWARDS } from "../../domain/challenges.ts";
import { awardXp, progressFor, grantAchievement, ACHIEVEMENTS } from "../../domain/progress.ts";
import { MISSIONS, missionProgress, missionXpKey } from "../../domain/missions.ts";
import { levelFor } from "../../domain/xp.ts";
import { computeBalances } from "../../domain/ledger.ts";
import { creditableCents } from "../../domain/budget.ts";
import { createCashClaim, loadBudget, loadMilestones } from "../../domain/rewards.ts";
import { DomainError } from "../../domain/errors.ts";
import { notifyStaff, inTx, type Services } from "../../services/notify.ts";

const DAY = 86_400_000;

/** Gives the reward of a completed (and, where required, approved) challenge. Called under the challenge lock. */
export async function deliverChallengeReward(sv: Services, d: ChallengeRec, part: Participation): Promise<{ status: Participation["status"]; awardedCents: number }> {
  const s = sv.store, userId = part.userId, t = sv.now();
  let status: Participation["status"] = "reward_delivered";
  let awardedCents = 0;
  switch (d.rewardType) {
    case "cash": {
      const earned = computeBalances(await s.ledgerFor(userId)).earned;
      if (creditableCents(d.rewardCents!, earned, await s.globalEarnedCents(), await loadBudget(sv)) < d.rewardCents!) throw new DomainError("budget_exhausted");
      const claim = await createCashClaim(sv, userId, `challenge:${d.id}`, d.rewardCents!, { challenge: d.slug }); // withdrawn through the same manual payout flow
      awardedCents = d.rewardCents!;
      if (claim.status === "action_required") status = "reward_pending";
      break;
    }
    case "xp": await awardXp(sv, userId, d.rewardXp ?? 100, `challenge:${d.slug}`, `xp:challenge:${d.id}:${userId}`, t); break;
    case "vip": await awardXp(sv, userId, d.rewardXp ?? 500, `challenge_vip:${d.slug}`, `xp:challenge:${d.id}:${userId}`, t); break; // VIP progression = verified XP toward the next rank
    case "badge":
      await grantAchievement(sv, userId, `challenge:${d.slug}`);
      if (d.rewardXp) await awardXp(sv, userId, d.rewardXp, `challenge:${d.slug}`, `xp:challenge:${d.id}:${userId}`, t);
      break;
    case "premium": await s.setPremiumUntil(userId, Math.max(t, (await s.getUser(userId))?.premiumUntil ?? 0) + 30 * DAY); break;
    default: { // WhatsApp promotion, Telegram Stars, Telegram Premium: a person delivers them; tracked until confirmed
      const { claim } = await s.addRewardClaim({ id: randomUUID(), userId, source: `challenge:${d.id}`, kind: d.rewardType, status: "pending", createdAt: t, detail: { challenge: d.slug },
        idempotencyKey: `challenge:${d.id}:${userId}:${d.rewardType}` });
      await s.ensureFulfillment(claim.id, d.rewardType);
      await notifyStaff(sv, "rewards.fulfil", { task: "fulfilment", claimId: claim.id, kind: d.rewardType });
      status = "reward_pending";
    }
  }
  return { status, awardedCents };
}

export function registerEngage(app: AppCtx) {
  const { router: r, store, now, send, sv } = app;
  const tr = (m: Record<string, string>, lang: string) => m[lang] ?? m["en"] ?? "";

  r.get("/api/me/progress", { summary: "XP, level, VIP rank, streaks and a 35-day activity calendar", tag: "progress", access: "user" }, async c => send(c, 200, await progressFor(sv, c.user!.id, now())));
  r.get("/api/me/xp", { summary: "XP history (not money, not withdrawable)", tag: "progress", access: "user" }, async c => {
    send(c, 200, { items: (await store.xpRows(c.user!.id)).reverse().slice(0, 200).map(x => ({ amount: x.amount, reason: x.reason, at: x.at })) });
  });
  r.get("/api/achievements", { summary: "Achievement catalogue and the ones you earned", tag: "progress", access: "user" }, async c => {
    const mine = new Map((await store.achievementsOf(c.user!.id)).map(a => [a.code, a.at]));
    const catalogue = ACHIEVEMENTS.map(a => ({ code: a.code, group: a.group, xp: a.xp, earnedAt: mine.get(a.code) ?? null }));
    const extra = [...mine.entries()].filter(([k]) => !ACHIEVEMENTS.some(a => a.code === k)).map(([code, at]) => ({ code, group: "challenges", xp: 0, earnedAt: at }));
    send(c, 200, { items: [...catalogue, ...extra] });
  });
  r.get("/api/vip-levels", { summary: "VIP ranks, thresholds and benefits", tag: "progress", access: "user" }, async c => send(c, 200, { items: await store.vipLevels() }));

  r.get("/api/missions", { summary: "Daily, weekly and monthly missions with server-verified progress", tag: "progress", access: "user" }, async c => {
    const u = c.user!;
    const events = await store.listEvents(u.id, now() - 32 * DAY);
    const xpKeys = new Set((await store.xpRows(u.id)).map(x => x.key));
    send(c, 200, { items: MISSIONS.map(m => { const p = missionProgress(m, events, now()); return { code: m.code, period: m.period, target: m.target, xp: m.xp, progress: p.progress, done: p.done, endsAt: p.endsAt, claimed: xpKeys.has(missionXpKey(m.code, p.periodKey, u.id)) }; }) });
  });
  r.post("/api/missions/:kind/claim", { summary: "Claim a completed mission's XP (once per period)", tag: "progress", access: "write", limit: "challenge" }, async c => {
    const u = c.user!;
    const m = MISSIONS.find(x => x.code === c.params["kind"]);
    if (!m) throw new HttpError(404, "not_found");
    const p = missionProgress(m, await store.listEvents(u.id, now() - 32 * DAY), now());
    if (!p.done) throw new HttpError(409, "not_completed");
    if (!(await awardXp(sv, u.id, m.xp, `mission:${m.code}`, missionXpKey(m.code, p.periodKey, u.id), now()))) throw new HttpError(409, "already_claimed");
    send(c, 200, { xp: m.xp });
  });

  r.get("/api/leaderboard", { summary: "Opt-in, pseudonym-only leaderboard", tag: "progress", access: "user", query: "period=weekly|monthly|all, metric=xp|referrals" }, async c => {
    const period = qEnum(c.url, "period", ["weekly", "monthly", "all"] as const) ?? "weekly";
    const metric = qEnum(c.url, "metric", ["xp", "referrals"] as const) ?? "xp";
    const since = period === "weekly" ? now() - 7 * DAY : period === "monthly" ? now() - 30 * DAY : 0;
    const me = c.user!;
    if (metric === "referrals") {
      const rows = await store.referralLeaderboard(since, 50);
      return send(c, 200, { period, metric, me: me.leaderboardOptIn ? me.pseudonym ?? null : null, items: rows.map((x, i) => ({ rank: i + 1, pseudonym: x.pseudonym, value: x.referrals })) });
    }
    const rows = await store.xpLeaderboard(since, 50);
    send(c, 200, { period, metric, me: me.leaderboardOptIn ? me.pseudonym ?? null : null, items: rows.map((x, i) => ({ rank: i + 1, pseudonym: x.pseudonym, value: x.xp, xp: x.xp, level: levelFor(x.totalXp) })) });
  });

  /* ---------- challenges ---------- */
  r.get("/api/challenges", { summary: "Published challenges with your server-computed progress and status", tag: "challenges", access: "user" }, async c => {
    const u = c.user!;
    const events = await store.listEvents(u.id);
    const mine = new Map((await store.participationsOf(u.id)).map(p => [p.challengeId, p]));
    const stats = new Map((await store.challengeStats()).map(x => [x.challengeId, x]));
    const items = (await store.listChallenges(true)).map(d => {
      const part = mine.get(d.id);
      const prog = evaluateProgress(d, events, now());
      let status: string = prog.status;
      if (part?.status && part.status !== "active" && part.status !== "completed") status = part.status;
      else if (part?.completedAt) status = "completed";
      const st = stats.get(d.id);
      return { id: d.id, slug: d.slug, title: tr(d.title, u.language), description: tr(d.description, u.language), difficulty: d.difficulty, startsAt: d.startsAt, endsAt: d.endsAt,
        metric: d.metric, threshold: d.threshold, rewardType: d.rewardType, rewardCents: d.rewardCents ?? null, rewardXp: d.rewardXp ?? null, maxWinners: d.maxWinners ?? null,
        winners: st?.claimed ?? 0, participants: st?.joined ?? 0, reviewRequired: !!d.reviewRequired, terms: d.terms, eligibility: d.eligibility ?? {},
        claimDeadline: d.claimDeadline ?? d.endsAt + 7 * DAY, joined: !!part, claimed: !!part?.claimedAt, progress: part ? Math.min(prog.progress, d.threshold) : 0, status };
    });
    send(c, 200, { items });
  });
  r.post("/api/challenges/:id/join", { summary: "Join a challenge (eligibility checked by the server)", tag: "challenges", access: "write", limit: "challenge" }, async c => {
    const u = c.user!;
    if ((await store.activeRestrictions(u.id)).has("challenges")) throw new HttpError(403, "challenges_restricted");
    const d = await store.getChallenge(c.params["id"]!);
    if (!d || !d.published) throw new HttpError(404, "not_found");
    if (now() < d.startsAt) throw new HttpError(409, "not_started");
    if (now() >= d.endsAt) throw new HttpError(409, "challenge_ended");
    const el = d.eligibility ?? {};
    if (el.minAccountAgeDays && now() - u.createdAt < el.minAccountAgeDays * DAY) throw new HttpError(409, "not_eligible_account_age");
    if (el.minLevel && levelFor(await store.xpTotal(u.id)) < el.minLevel) throw new HttpError(409, "not_eligible_level");
    try { await store.joinChallenge({ challengeId: d.id, userId: u.id, joinedAt: now() }); }
    catch (e) { if (e instanceof DuplicateError) throw new HttpError(409, "already_joined"); throw e; }
    // work already done inside the window counts: if it already meets the goal, record completion now (this freezes the terms too)
    if (evaluateProgress(d, await store.listEvents(u.id), now()).status === "completed") {
      const part = await store.getParticipation(d.id, u.id);
      if (part && !part.completedAt) await store.saveParticipation({ ...part, completedAt: now(), status: "completed" });
    }
    send(c, 201, { ok: true });
  });
  r.post("/api/challenges/:id/claim", { summary: "Claim the reward of a completed challenge (winner cap and budget enforced under a lock)", tag: "challenges", access: "write", limit: "rewardClaim" }, async c => {
    const u = c.user!;
    const id = c.params["id"]!;
    const out = await inTx(sv, async svx => {
      const s = svx.store;
      await s.lock(`challenge:${id}`); // serialises claims so the winner cap and budget cannot be raced (across replicas too)
      if ((await s.activeRestrictions(u.id)).has("challenges")) throw new HttpError(403, "challenges_restricted");
      const d = await s.getChallenge(id);
      if (!d || !d.published) throw new HttpError(404, "not_found");
      const part = await s.getParticipation(id, u.id);
      if (!part) throw new HttpError(409, "not_joined");
      if (part.claimedAt) throw new HttpError(409, "already_claimed");
      const prog = evaluateProgress(d, await s.listEvents(u.id), now());
      if (prog.status !== "completed") throw new HttpError(409, "not_completed");
      const deadline = d.claimDeadline ?? d.endsAt + 7 * DAY;
      if (now() > deadline) throw new HttpError(409, "claim_deadline_passed");
      const all = await s.participationsFor(id);
      const ok = canAward(d, all.filter(x => x.claimedAt).length, all.reduce((a, x) => a + (x.awardedCents ?? 0), 0));
      if (!ok.ok) throw new HttpError(409, ok.reason ?? "cannot_award");
      if (d.reviewRequired) { // a person checks the work first; the slot is held
        await s.saveParticipation({ ...part, completedAt: part.completedAt ?? now(), claimedAt: now(), status: "reward_pending" });
        await notifyStaff(svx, "challenges.manage", { task: "challenge_review", challengeId: id, userId: u.id });
        return { rewardType: d.rewardType, awardedCents: 0, status: "reward_pending" };
      }
      const res = await deliverChallengeReward(svx, d, part);
      await s.saveParticipation({ ...part, completedAt: part.completedAt ?? now(), claimedAt: now(), awardedCents: res.awardedCents, status: res.status });
      return { rewardType: d.rewardType, awardedCents: res.awardedCents, status: res.status };
    });
    send(c, 200, out);
  });

  /* ---------- dashboard: one call with real numbers ---------- */
  r.get("/api/dashboard", { summary: "Everything the overview shows, computed from the database", tag: "progress", access: "user" }, async c => {
    const u = c.user!;
    const [counts, conn, st, last, jobs, refs, ledger, payouts, parts, prog, notes, anns, milestones, claims] = await Promise.all([
      store.syncCounts(u.id), store.getConnection(u.id), store.getSyncSettings(u.id), store.lastSyncAt(u.id), store.jobCountsFor(u.id), store.referralCounts(u.id), store.ledgerFor(u.id),
      store.listPayoutsFor(u.id), store.participationsOf(u.id), progressFor(sv, u.id, now()), store.listNotifications(u.id, 6), store.listAnnouncements({ publishedOnly: true, limit: 3 }),
      loadMilestones(sv), store.listRewardClaimsFor(u.id)]);
    const challenges = await store.listChallenges(true);
    const activeIds = new Set(challenges.filter(d => d.startsAt <= now() && d.endsAt > now()).map(d => d.id));
    const bal = computeBalances(ledger);
    const cash = milestones.find(m => m.cashCents);
    const events = await store.listEvents(u.id, now() - 32 * DAY);
    const xpKeys = new Set((await store.xpRows(u.id)).map(x => x.key));
    send(c, 200, {
      contacts: { total: counts.total, synced: counts.synced, pending: counts.pending, failed: counts.failed, conflict: counts.conflict },
      sync: { status: conn.status, paused: st.paused, autoSync: st.autoSync, lastSyncAt: last, pendingJobs: jobs.pending, failedJobs: jobs.failed },
      referrals: { ...refs, milestone: cash ? { threshold: cash.threshold, cents: cash.cashCents, progress: Math.min(refs.qualified, cash.threshold) } : null,
        next: milestones.find(m => m.threshold > refs.qualified)?.threshold ?? null },
      wallet: { ...bal, currency: "USD", pendingPayoutCents: payouts.filter(p => ["pending", "in_progress", "action_required"].includes(p.status)).reduce((a, p) => a + p.amountCents, 0),
        completedPayoutCents: payouts.filter(p => p.status === "paid").reduce((a, p) => a + p.amountCents, 0), rewardsInProgress: claims.filter(x => x.status === "in_progress" || x.status === "pending" || x.status === "action_required").length },
      challenges: { active: activeIds.size, joinedActive: parts.filter(p => activeIds.has(p.challengeId) && !p.completedAt).length, completed: parts.filter(p => p.completedAt).length },
      progress: { xp: prog.xp, level: prog.level, title: prog.title, vip: prog.vip, nextLevelXp: prog.nextLevelXp, currentLevelXp: prog.currentLevelXp, streakDays: prog.streakDays },
      missions: MISSIONS.filter(m => m.period !== "monthly").map(m => { const p = missionProgress(m, events, now()); return { code: m.code, period: m.period, target: m.target, xp: m.xp, progress: p.progress, done: p.done, claimed: xpKeys.has(missionXpKey(m.code, p.periodKey, u.id)) }; }),
      notifications: notes.map(n => ({ id: n.id, kind: n.kind, payload: n.payload, read: !!n.readAt, createdAt: n.createdAt })),
      announcements: anns.map(a => ({ id: a.id, kind: a.kind, title: tr(a.title, u.language), body: tr(a.body, u.language), pinned: a.pinned, publishedAt: a.publishedAt ?? a.createdAt })),
      onboarded: !!u.onboardedAt,
    });
  });
}
