export interface LimitRule { max: number; windowMs: number }

/** Sliding-window limiter with an injectable clock. Production swaps the Map for Redis behind the same method. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private rule: LimitRule;
  private now: () => number;
  constructor(rule: LimitRule, now: () => number = Date.now) {
    this.rule = rule;
    this.now = now;
  }
  check(key: string): { allowed: boolean; retryAfterMs: number } {
    const t = this.now();
    const recent = (this.hits.get(key) ?? []).filter(x => t - x < this.rule.windowMs);
    if (recent.length >= this.rule.max) {
      this.hits.set(key, recent);
      return { allowed: false, retryAfterMs: this.rule.windowMs - (t - (recent[0] ?? t)) };
    }
    recent.push(t);
    this.hits.set(key, recent);
    return { allowed: true, retryAfterMs: 0 };
  }
}

/** Per-route budgets from the spec (callbacks, imports, claims, support, admin actions...). */
export const RULES: Record<string, LimitRule> = {
  authCallback: { max: 20, windowMs: 60_000 },
  contactCreate: { max: 120, windowMs: 60_000 },
  vcfImport: { max: 5, windowMs: 60_000 },
  syncNow: { max: 6, windowMs: 60_000 },
  referralRegister: { max: 10, windowMs: 3_600_000 },
  rewardClaim: { max: 5, windowMs: 60_000 },
  support: { max: 5, windowMs: 3_600_000 },
  adminAction: { max: 60, windowMs: 60_000 },
};
