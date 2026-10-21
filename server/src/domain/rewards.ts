import { randomUUID } from "node:crypto";
import type { Payout, PayoutMethod, Referral, RewardClaimRow } from "../store/types.ts";
import { DuplicateError } from "../store/types.ts";
import { DEFAULT_POLICY, type RewardPolicy } from "./money.ts";
import { DEFAULT_BUDGET, creditableCents, type BudgetPolicy } from "./budget.ts";
import { computeBalances } from "./ledger.ts";
import { assertTransition, type PayoutStatus } from "./payout.ts";
import { DomainError } from "./errors.ts";
import { recordEvent, awardXp, grantAchievement } from "./progress.ts";
import { notify, notifyStaff, inTx, type Services } from "../services/notify.ts";
import { encrypt, decrypt } from "../security/crypto.ts";

export interface Milestone { threshold: number; xp?: number; badge?: string; cashCents?: number }
/** Published defaults: badges and XP along the way, and the one-time $10.00 USD cash reward at 500 qualified referrals. */
export const DEFAULT_MILESTONES: Milestone[] = [
  { threshold: 10, xp: 50, badge: "referrals_10" }, { threshold: 25, xp: 100, badge: "referrals_25" }, { threshold: 50, xp: 200, badge: "referrals_50" },
  { threshold: 100, xp: 400, badge: "referrals_100" }, { threshold: 250, xp: 800, badge: "referrals_250" }, { threshold: 500, xp: 1500, badge: "referrals_500", cashCents: 1000 },
];

export async function loadPolicy(sv: Services): Promise<RewardPolicy> { return { ...DEFAULT_POLICY, ...(await sv.store.getJsonSetting<Partial<RewardPolicy>>("reward_policy", {})) }; }
export async function loadBudget(sv: Services): Promise<BudgetPolicy> { return { ...DEFAULT_BUDGET, ...(await sv.store.getJsonSetting<Partial<BudgetPolicy>>("reward_budget", {})) }; }
export async function loadMilestones(sv: Services): Promise<Milestone[]> {
  const m = await sv.store.getJsonSetting<Milestone[]>("referral_milestones", DEFAULT_MILESTONES);
  return (Array.isArray(m) ? m : DEFAULT_MILESTONES).slice().sort((a, b) => a.threshold - b.threshold);
}

/**
 * Marks a referral qualified and credits it, exactly once (a lock per referrer + the referral's current status +
 * idempotency keys on every ledger and XP row). Then checks the referrer's milestones.
 */
export async function creditQualified(sv: Services, r: Referral, now: number): Promise<{ budgetCapped: boolean }> {
  return inTx(sv, async svx => {
    const s = svx.store;
    await s.lock(`rewards:${r.referrerId}`);
    const cur = await s.getReferral(r.id);
    if (!cur || cur.status === "qualified" || cur.status === "disqualified") return { budgetCapped: false };
    const policy = await loadPolicy(svx);
    let budgetCapped = false;
    let amount = 0;
    if (policy.centsPerReferral > 0) {
      const qualifiedBefore = (await s.referralCounts(r.referrerId)).qualified;
      if (qualifiedBefore < policy.maxRewardedReferrals) {
        amount = creditableCents(policy.centsPerReferral, computeBalances(await s.ledgerFor(r.referrerId)).earned, await s.globalEarnedCents(), await loadBudget(svx));
        budgetCapped = amount < policy.centsPerReferral;
      }
    }
    cur.status = "qualified";
    cur.qualifiedAt = now;
    if (budgetCapped) cur.reason = "budget_capped";
    await s.saveReferral(cur);
    if (amount > 0) await s.addLedger({ id: randomUUID(), userId: r.referrerId, type: "earn", amountCents: amount, idempotencyKey: `referral:${r.id}`, reason: "qualified_referral" });
    await recordEvent(svx, r.referrerId, "qualified_referrals", now, `referral:${r.id}`); // counts for challenges even when no money is attached
    await awardXp(svx, r.referrerId, 10, "referral_qualified", `xp:referral:${r.id}`, now);
    await checkReferralMilestones(svx, r.referrerId);
    return { budgetCapped };
  });
}

/** Badges/XP for each milestone reached, and the cash claim where the milestone carries one. Idempotent. */
export async function checkReferralMilestones(sv: Services, userId: string): Promise<void> {
  const s = sv.store;
  const qualified = (await s.referralCounts(userId)).qualified;
  for (const m of await loadMilestones(sv)) {
    if (qualified < m.threshold) break;
    if (!(await s.reachMilestone(userId, m.threshold))) continue;
    if (m.xp) await awardXp(sv, userId, m.xp, `referral_milestone:${m.threshold}`, `xp:milestone:${m.threshold}:${userId}`, sv.now());
    if (m.badge) await grantAchievement(sv, userId, m.badge);
    await notify(sv, userId, "referral_milestone", { threshold: m.threshold, ...(m.cashCents ? { cashCents: m.cashCents } : {}) });
    if (m.cashCents) await createCashClaim(sv, userId, `milestone:${m.threshold}`, m.cashCents, { threshold: m.threshold, qualified });
  }
}

/**
 * Exactly one claim per (source, user): the idempotency key is unique in the database.
 * A claim is funded only if the user may receive rewards and the budget covers it; otherwise it waits for review
 * ("action_required"), visibly, instead of being silently dropped or silently paid.
 */
export async function createCashClaim(sv: Services, userId: string, source: string, cents: number, detail: Record<string, unknown> = {}): Promise<RewardClaimRow> {
  return inTx(sv, async svx => {
    const s = svx.store;
    await s.lock(`rewards:${userId}`);
    const { claim, created } = await s.addRewardClaim({ id: randomUUID(), userId, source, kind: "cash", status: "pending", amountCents: cents, detail, createdAt: svx.now(), idempotencyKey: `${source}:${userId}` });
    if (!created) return claim;
    if ((await s.activeRestrictions(userId)).has("rewards")) {
      await s.updateRewardClaim(claim.id, { status: "action_required", note: "rewards_restricted" });
      await notify(svx, userId, "reward_review", { source, amountCents: cents });
      await notifyStaff(svx, "ledger.adjust", { task: "claim_review", claimId: claim.id });
      return { ...claim, status: "action_required" };
    }
    const fundable = creditableCents(cents, computeBalances(await s.ledgerFor(userId)).earned, await s.globalEarnedCents(), await loadBudget(svx));
    if (fundable < cents) {
      await s.updateRewardClaim(claim.id, { status: "action_required", note: "budget_review" });
      await notify(svx, userId, "reward_review", { source, amountCents: cents });
      await notifyStaff(svx, "ledger.adjust", { task: "claim_budget", claimId: claim.id });
      return { ...claim, status: "action_required" };
    }
    await fundClaim(svx, claim);
    return { ...claim, status: "in_progress" };
  });
}

/** Credits a claim to the wallet (one ledger row keyed on the claim) and starts the payout when the claim is a milestone. */
export async function fundClaim(sv: Services, claim: RewardClaimRow, actorId?: string): Promise<void> {
  const s = sv.store;
  await s.addLedger({ id: randomUUID(), userId: claim.userId, type: "earn", amountCents: claim.amountCents!, idempotencyKey: `claim:${claim.id}`, reason: claim.source, ...(actorId ? { actorId } : {}) });
  await s.updateRewardClaim(claim.id, { status: "in_progress" });
  await notify(sv, claim.userId, "reward_eligible", { amountCents: claim.amountCents, source: claim.source });
  if (claim.source.startsWith("milestone:")) await autoPayout(sv, claim.userId);
}

/**
 * Milestone cash goes straight into a payout request ("Payment in progress") when the user has a payout method.
 * Without one, the user is asked to add one; adding it calls this again.
 */
export async function autoPayout(sv: Services, userId: string): Promise<Payout | null> {
  return inTx(sv, async svx => {
    const s = svx.store;
    await s.lock(`rewards:${userId}`);
    if ((await s.activeRestrictions(userId)).has("rewards")) return null;
    const waiting: RewardClaimRow[] = [];
    for (const c of await s.listRewardClaimsFor(userId)) if (c.kind === "cash" && c.status === "in_progress" && c.source.startsWith("milestone:") && !(await s.payoutForClaim(c.id))) waiting.push(c);
    const claim = waiting.sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!claim) return null;
    if (await s.openPayoutFor(userId)) return null;
    const methods = await s.listPayoutMethods(userId);
    const method = methods[methods.length - 1];
    if (!method) {
      if (!claim.detail?.["askedForMethod"]) {
        await s.updateRewardClaim(claim.id, { detail: { ...(claim.detail ?? {}), askedForMethod: true } });
        await notify(svx, userId, "add_payout_method", { amountCents: claim.amountCents });
      }
      return null;
    }
    const bal = computeBalances(await s.ledgerFor(userId));
    if (bal.available < claim.amountCents!) return null;
    return createPayoutRequest(svx, userId, method, claim.amountCents!, { source: "milestone", claimId: claim.id, idempotencyKey: `claim-payout:${claim.id}` });
  });
}

/**
 * Creates a payout request and reserves the amount, in one transaction under the user's rewards lock.
 * The recipient is copied (encrypted, bound to the request id): editing or deleting the payout method later cannot redirect it.
 */
export async function createPayoutRequest(sv: Services, userId: string, m: PayoutMethod, amount: number,
  o: { source: "withdrawal" | "milestone" | "challenge"; claimId?: string; idempotencyKey: string; minCents?: number }): Promise<Payout> {
  return inTx(sv, async svx => {
    const s = svx.store;
    await s.lock(`rewards:${userId}`);
    const replay = await s.getPayoutByIdem(userId, o.idempotencyKey);
    if (replay) return replay;
    const u = await s.getUser(userId);
    if (!u || u.status !== "active") throw new DomainError("account_not_active", 403);
    if ((await s.activeRestrictions(userId)).has("rewards")) throw new DomainError("rewards_restricted", 403);
    if (await s.openPayoutFor(userId)) throw new DomainError("payout_already_open");
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new DomainError("invalid_amount", 400);
    if (o.minCents !== undefined && amount < o.minCents) throw new DomainError("below_withdrawal_minimum", 400);
    const bal = computeBalances(await s.ledgerFor(userId));
    if (amount > bal.available) throw new DomainError("insufficient_available_balance");
    const id = randomUUID();
    const snapshot = encrypt(decrypt(m.detailsEnc, svx.keyRing, `payout_method:${m.id}`), svx.keyRing, `payout_request:${id}`);
    const p: Payout = { id, userId, amountCents: amount, status: "pending", maskedHint: m.maskedHint, methodKind: m.kind, snapshotEnc: snapshot, idempotencyKey: o.idempotencyKey,
      createdAt: svx.now(), source: o.source, ...(o.claimId ? { rewardClaimId: o.claimId } : {}), ...(m.recipientName ? { recipientName: m.recipientName } : {}) };
    try { await s.savePayout(p); } catch (e) { if (e instanceof DuplicateError) throw new DomainError("payout_already_open"); throw e; }
    await s.addLedger({ id: randomUUID(), userId, type: "reserve", amountCents: amount, idempotencyKey: `reserve:${id}`, reason: o.source });
    await notify(svx, userId, "payout_update", { payoutId: id, status: "pending", amountCents: amount });
    return p;
  });
}

/**
 * Admin moves a payout through its state machine. "paid" needs explicit confirmation + a transaction reference.
 * Ledger effects: paid -> pay (reserved -> paid total); failed/rejected -> release (back to available);
 * failed -> pending (retry after review) -> reserve again. A rejected milestone payout also voids its claim with an
 * auditable negative adjustment. Nothing is ever edited or deleted.
 */
export async function changePayoutStatus(sv: Services, actorId: string, payoutId: string, to: PayoutStatus, o: { reason?: string; txReference?: string; confirmPaid?: boolean }) {
  return inTx(sv, async svx => {
    const s = svx.store;
    const first = await s.getPayout(payoutId);
    if (!first) throw new DomainError("not_found", 404);
    await s.lock(`rewards:${first.userId}`);
    const p = (await s.getPayout(payoutId))!;
    try { assertTransition({ from: p.status, to, ...(o.reason ? { reason: o.reason } : {}), ...(o.txReference ? { txReference: o.txReference } : {}), confirmedPaid: o.confirmPaid === true }); }
    catch (e) { throw new DomainError((e as Error).message.replace(/\s+/g, "_").replace(/[^\w>-]/g, "").slice(0, 80)); }
    const before = p.status;
    const n = (await s.payoutHistory(p.id)).length; // makes each reserve/release cycle's key unique and deterministic
    if (before === "failed" && to === "pending") {
      if ((await s.openPayoutFor(p.userId))) throw new DomainError("payout_already_open");
      if (computeBalances(await s.ledgerFor(p.userId)).available < p.amountCents) throw new DomainError("insufficient_available_balance");
    }
    p.status = to;
    if (to === "paid") p.txReference = o.txReference!.trim();
    if (o.reason) p.adminNotes = o.reason;
    await s.savePayout(p, actorId);
    if (to === "paid") await s.addLedger({ id: randomUUID(), userId: p.userId, type: "pay", amountCents: p.amountCents, idempotencyKey: `pay:${p.id}`, reference: p.txReference!, actorId });
    if (to === "failed" || to === "rejected") await s.addLedger({ id: randomUUID(), userId: p.userId, type: "release", amountCents: p.amountCents, idempotencyKey: `release:${p.id}:${n}`, reason: o.reason ?? to, actorId });
    if (before === "failed" && to === "pending") await s.addLedger({ id: randomUUID(), userId: p.userId, type: "reserve", amountCents: p.amountCents, idempotencyKey: `reserve:${p.id}:${n}`, reason: "retry_after_review", actorId });
    if (p.rewardClaimId) {
      if (to === "paid") await s.updateRewardClaim(p.rewardClaimId, { status: "completed" });
      if (to === "rejected") {
        await s.updateRewardClaim(p.rewardClaimId, { status: "rejected", note: o.reason ?? "rejected" });
        await s.addLedger({ id: randomUUID(), userId: p.userId, type: "adjustment", amountCents: -p.amountCents, idempotencyKey: `void-claim:${p.rewardClaimId}`, reason: `claim rejected: ${o.reason ?? ""}`.slice(0, 300), actorId });
      }
    }
    await s.addAudit({ actorId, action: "payout.status", resourceType: "payout", resourceId: p.id, from: before, to, ...(o.reason ? { reason: o.reason } : {}), at: svx.now() });
    await notify(svx, p.userId, "payout_update", { payoutId: p.id, status: to, amountCents: p.amountCents, ...(to === "failed" || to === "rejected" || to === "action_required" ? { reason: o.reason } : {}) });
    return p;
  });
}
