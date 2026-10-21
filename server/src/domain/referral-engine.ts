import { randomUUID } from "node:crypto";
import type { Store, Referral } from "../store/types.ts";
import { evaluateReferral, DEFAULT_REFERRAL_POLICY, type ReferralPolicy } from "./referral.ts";
import { DEFAULT_POLICY, type RewardPolicy } from "./money.ts";
import { DEFAULT_BUDGET, creditableCents, type BudgetPolicy } from "./budget.ts";
import { computeBalances } from "./ledger.ts";
import { recordEvent, awardXp } from "./progress.ts";

export interface EngineOptions { now: number; policy?: ReferralPolicy; reward?: RewardPolicy; budget?: BudgetPolicy }
export interface EngineReport { qualified: number; underReview: number; disqualified: number; pending: number; budgetCapped: number }

/** Marks a referral qualified and credits exactly one ledger entry (idempotent on the referral id). */
export async function creditQualified(store: Store, r: Referral, now: number, reward: RewardPolicy, budget: BudgetPolicy): Promise<boolean> {
  const qualifiedBefore = (await store.listReferralsByReferrer(r.referrerId)).filter(x => x.status === "qualified" && x.id !== r.id).length;
  const rewarded = qualifiedBefore < reward.maxRewardedReferrals;
  const earned = computeBalances(await store.ledgerFor(r.referrerId)).earned;
  const amount = rewarded ? creditableCents(reward.centsPerReferral, earned, await store.globalEarnedCents(), budget) : 0;
  r.status = "qualified";
  r.qualifiedAt = now;
  if (amount < reward.centsPerReferral) r.reason = rewarded ? "budget_capped" : "reward_cap_reached";
  await store.saveReferral(r);
  await recordEvent(store, r.referrerId, "qualified_referrals", now, `referral:${r.id}`); // counts for challenges even if the budget is exhausted
  await awardXp(store, r.referrerId, 10, "referral_qualified", `xp:referral:${r.id}`, now);
  if (amount > 0) await store.addLedger({ id: randomUUID(), userId: r.referrerId, type: "earn", amountCents: amount, idempotencyKey: `referral:${r.id}` });
  return amount < reward.centsPerReferral;
}

/** Background job: evaluates every pending referral against the published rules. Safe to run repeatedly. */
export async function qualifyPendingReferrals(store: Store, o: EngineOptions): Promise<EngineReport> {
  const policy = o.policy ?? DEFAULT_REFERRAL_POLICY;
  const reward = o.reward ?? DEFAULT_POLICY;
  const budget = o.budget ?? DEFAULT_BUDGET;
  const rep: EngineReport = { qualified: 0, underReview: 0, disqualified: 0, pending: 0, budgetCapped: 0 };
  for (const r of await store.listReferralsByStatus("pending")) {
    const [referrer, referred] = await Promise.all([store.getUser(r.referrerId), store.getUser(r.referredId)]);
    if (!referrer || !referred) { r.status = "disqualified"; r.reason = "account_missing"; await store.saveReferral(r); rep.disqualified++; continue; }
    const out = evaluateReferral({
      referrerId: referrer.id, referredId: referred.id, referrerGoogleSub: referrer.googleSub, referredGoogleSub: referred.googleSub,
      referrerEmail: referrer.email, referredEmail: referred.email, registeredViaLink: true,
      completedGoogleAuth: true, emailVerified: true, // both are guaranteed by the login flow (verified Google identity)
      referredAccountAgeMs: o.now - referred.createdAt,
      // burst = sign-ups from one network within 24h of THIS sign-up, whenever the job happens to run
      signupsFromSameNetworkLast24h: await store.countByNetworkBetween(r.networkHash, r.createdAt - 24 * 3600_000, r.createdAt + 24 * 3600_000),
      referrerRestricted: referrer.status !== "active", alreadyReferredByAnyone: false,
    }, policy);
    if (out.decision === "pending") { rep.pending++; continue; }
    if (out.decision === "qualified") { if (await creditQualified(store, r, o.now, reward, budget)) rep.budgetCapped++; rep.qualified++; continue; }
    r.status = out.decision; r.reason = out.reasons.join(",");
    await store.saveReferral(r);
    if (out.decision === "under_review") rep.underReview++; else rep.disqualified++;
  }
  return rep;
}
