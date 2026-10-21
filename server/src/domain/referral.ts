export type ReferralDecision = "qualified" | "pending" | "under_review" | "disqualified";

export interface ReferralPolicy {
  /** disclosed waiting period before a referral can qualify */
  minAccountAgeMs: number;
  /** more than this many sign-ups from one network in 24h goes to human review (never auto-banned) */
  maxPerNetworkPerDay: number;
}
export const DEFAULT_REFERRAL_POLICY: ReferralPolicy = { minAccountAgeMs: 24 * 3600_000, maxPerNetworkPerDay: 3 };

export interface ReferralInput {
  referrerId: string;
  referredId: string;
  referrerGoogleSub: string;
  referredGoogleSub: string;
  referrerEmail: string;
  referredEmail: string;
  registeredViaLink: boolean;
  completedGoogleAuth: boolean;
  emailVerified: boolean;
  referredAccountAgeMs: number;
  signupsFromSameNetworkLast24h: number;
  referrerRestricted: boolean;
  alreadyReferredByAnyone: boolean;
}
export interface ReferralOutcome { decision: ReferralDecision; reasons: string[] }

/**
 * Hard rule violations disqualify. Uncertain risk signals only send the referral to review.
 * Waiting conditions keep it pending. Only a fully clean referral qualifies. Link clicks never count.
 */
export function evaluateReferral(i: ReferralInput, p: ReferralPolicy = DEFAULT_REFERRAL_POLICY): ReferralOutcome {
  const hard: string[] = [];
  if (i.referrerId === i.referredId) hard.push("self_referral");
  if (i.referrerGoogleSub === i.referredGoogleSub) hard.push("same_google_account");
  if (i.referrerEmail.trim().toLowerCase() === i.referredEmail.trim().toLowerCase()) hard.push("same_email");
  if (i.alreadyReferredByAnyone) hard.push("already_referred");
  if (!i.registeredViaLink) hard.push("not_registered_via_link");
  if (hard.length) return { decision: "disqualified", reasons: hard };

  const review: string[] = [];
  if (i.signupsFromSameNetworkLast24h > p.maxPerNetworkPerDay) review.push("signup_burst_same_network");
  if (i.referrerRestricted) review.push("referrer_restricted");
  if (review.length) return { decision: "under_review", reasons: review };

  const wait: string[] = [];
  if (!i.completedGoogleAuth) wait.push("google_auth_incomplete");
  if (!i.emailVerified) wait.push("email_not_verified");
  if (i.referredAccountAgeMs < p.minAccountAgeMs) wait.push("waiting_period");
  if (wait.length) return { decision: "pending", reasons: wait };

  return { decision: "qualified", reasons: [] };
}
