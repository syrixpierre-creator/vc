/** All money is integer cents (USD). Never floats. */
export type Cents = number;

export interface RewardPolicy {
  /** cents earned per qualified referral (default 1 = $0.01: $5 at 500, $10 at 1000) */
  centsPerReferral: Cents;
  /** minimum available balance needed to request a withdrawal (default 1500 = $15) */
  minWithdrawCents: Cents;
  /** hard ceiling on referrals that can earn money (default 1,000,000) */
  maxRewardedReferrals: number;
}

export const DEFAULT_POLICY: RewardPolicy = {
  centsPerReferral: 1,
  minWithdrawCents: 1500,
  maxRewardedReferrals: 1_000_000,
};

function assertCount(n: number): void {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError("referral count must be a non-negative integer");
}

export function earnedCents(qualifiedReferrals: number, p: RewardPolicy = DEFAULT_POLICY): Cents {
  assertCount(qualifiedReferrals);
  return Math.min(qualifiedReferrals, p.maxRewardedReferrals) * p.centsPerReferral;
}

export function canRequestWithdrawal(availableCents: Cents, p: RewardPolicy = DEFAULT_POLICY): boolean {
  return Number.isSafeInteger(availableCents) && availableCents >= p.minWithdrawCents;
}

/** Referrals needed before the available balance reaches the withdrawal minimum. */
export function referralsForWithdrawal(p: RewardPolicy = DEFAULT_POLICY): number {
  return Math.ceil(p.minWithdrawCents / p.centsPerReferral);
}

export function formatUsd(cents: Cents): string {
  if (!Number.isSafeInteger(cents)) throw new RangeError("cents must be an integer");
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars.toLocaleString("en-US")}.${rest}`;
}
