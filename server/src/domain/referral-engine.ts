import { evaluateReferral, DEFAULT_REFERRAL_POLICY, type ReferralPolicy } from "./referral.ts";
import { creditQualified } from "./rewards.ts";
import { notifyStaff, type Services } from "../services/notify.ts";

export interface EngineReport { qualified: number; underReview: number; disqualified: number; pending: number; budgetCapped: number }

export async function loadReferralPolicy(sv: Services): Promise<ReferralPolicy> {
  const p = await sv.store.getJsonSetting<{ minAccountAgeHours?: number; maxPerNetworkPerDay?: number }>("referral_policy", {});
  return {
    minAccountAgeMs: typeof p.minAccountAgeHours === "number" ? p.minAccountAgeHours * 3600_000 : DEFAULT_REFERRAL_POLICY.minAccountAgeMs,
    maxPerNetworkPerDay: typeof p.maxPerNetworkPerDay === "number" ? p.maxPerNetworkPerDay : DEFAULT_REFERRAL_POLICY.maxPerNetworkPerDay,
  };
}

/** Background job: evaluates every pending referral against the published rules. Safe to run repeatedly and concurrently. */
export async function qualifyPendingReferrals(sv: Services, o: { now: number; policy?: ReferralPolicy }): Promise<EngineReport> {
  const policy = o.policy ?? (await loadReferralPolicy(sv));
  const rep: EngineReport = { qualified: 0, underReview: 0, disqualified: 0, pending: 0, budgetCapped: 0 };
  const s = sv.store;
  for (const r of await s.listReferralsByStatus("pending")) {
    const [referrer, referred] = await Promise.all([s.getUser(r.referrerId), s.getUser(r.referredId)]);
    if (!referrer || !referred || referred.status === "deleted") { r.status = "disqualified"; r.reason = "account_missing"; await s.saveReferral(r); rep.disqualified++; continue; }
    const restricted = referrer.status !== "active" || (await s.activeRestrictions(referrer.id)).has("referrals") || referrer.reviewStatus === "flagged" || referrer.reviewStatus === "under_review";
    const out = evaluateReferral({
      referrerId: referrer.id, referredId: referred.id, referrerGoogleSub: referrer.googleSub, referredGoogleSub: referred.googleSub,
      referrerEmail: referrer.email, referredEmail: referred.email, registeredViaLink: true,
      completedGoogleAuth: true, emailVerified: true, // both are guaranteed by the login flow (verified Google identity)
      referredAccountAgeMs: o.now - referred.createdAt,
      // burst = sign-ups from one network within 24h of THIS sign-up, whenever the job happens to run
      signupsFromSameNetworkLast24h: await s.countByNetworkBetween(r.networkHash, r.createdAt - 24 * 3600_000, r.createdAt + 24 * 3600_000),
      referrerRestricted: restricted, alreadyReferredByAnyone: false,
    }, policy);
    if (out.decision === "pending") { rep.pending++; continue; }
    if (out.decision === "qualified") { if ((await creditQualified(sv, r, o.now)).budgetCapped) rep.budgetCapped++; rep.qualified++; continue; }
    r.status = out.decision; r.reason = out.reasons.join(",");
    await s.saveReferral(r);
    if (out.decision === "under_review") rep.underReview++; else rep.disqualified++;
  }
  if (rep.underReview) await notifyStaff(sv, "fraud.review", { task: "referral_review", count: rep.underReview });
  return rep;
}
