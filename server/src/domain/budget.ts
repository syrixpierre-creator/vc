export interface BudgetPolicy {
  /** most one user can ever earn (default $10,000 = 1,000,000 referrals at $0.01) */
  perUserCapCents: number;
  /** total reward money the company is willing to hand out ($100 for now; raise it as ad revenue allows) */
  globalCapCents: number;
}
export const DEFAULT_BUDGET: BudgetPolicy = { perUserCapCents: 1_000_000, globalCapCents: 10_000 };

/** How much of `requested` can still be credited without breaking either cap. Never negative. */
export function creditableCents(requested: number, userEarned: number, globalEarned: number, p: BudgetPolicy = DEFAULT_BUDGET): number {
  if (![requested, userEarned, globalEarned].every(Number.isSafeInteger) || requested < 0) throw new RangeError("amounts must be non-negative integers");
  return Math.max(0, Math.min(requested, p.perUserCapCents - userEarned, p.globalCapCents - globalEarned));
}
