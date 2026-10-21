export interface LimitRule { max: number; windowMs: number }
export interface Limiter { check(name: string, key: string): Promise<{ allowed: boolean; retryAfterMs: number }> }

/** Sliding-window limiter with an injectable clock (single process: tests and the local demo). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private rule: LimitRule;
  private now: () => number;
  constructor(rule: LimitRule, now: () => number = Date.now) { this.rule = rule; this.now = now; }
  check(key: string): { allowed: boolean; retryAfterMs: number } {
    const t = this.now();
    const recent = (this.hits.get(key) ?? []).filter(x => t - x < this.rule.windowMs);
    if (recent.length >= this.rule.max) {
      this.hits.set(key, recent);
      return { allowed: false, retryAfterMs: this.rule.windowMs - (t - (recent[0] ?? t)) };
    }
    recent.push(t);
    this.hits.set(key, recent);
    if (this.hits.size > 50_000) for (const [k, v] of this.hits) if (!v.some(x => t - x < this.rule.windowMs)) this.hits.delete(k); // bounded memory
    return { allowed: true, retryAfterMs: 0 };
  }
}

export function memoryLimiter(rules: Record<string, LimitRule>, now: () => number = Date.now): Limiter {
  const by = new Map(Object.entries(rules).map(([k, r]) => [k, new RateLimiter(r, now)]));
  return { async check(name, key) { const l = by.get(name); if (!l) throw new Error(`unknown rate limit rule ${name}`); return l.check(key); } };
}

interface RedisLike { eval(script: string, nkeys: number, ...args: (string | number)[]): Promise<unknown> }
/**
 * Redis sliding window (sorted set per key), shared by every app replica. Atomic in one Lua script.
 * If Redis is unreachable the request is allowed (fail-open) and the error is reported: availability over strictness,
 * because money-moving operations are additionally protected by database locks and idempotency keys.
 */
export function redisLimiter(redis: RedisLike, rules: Record<string, LimitRule>, onError: (e: unknown) => void = () => undefined, now: () => number = Date.now): Limiter {
  const LUA = `local k=KEYS[1] local t=tonumber(ARGV[1]) local w=tonumber(ARGV[2]) local m=tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE',k,0,t-w) local n=redis.call('ZCARD',k)
if n>=m then local o=redis.call('ZRANGE',k,0,0,'WITHSCORES') return {0, (tonumber(o[2]) or t)+w-t} end
redis.call('ZADD',k,t,ARGV[4]) redis.call('PEXPIRE',k,w) return {1,0}`;
  let seq = 0;
  return {
    async check(name, key) {
      const rule = rules[name];
      if (!rule) throw new Error(`unknown rate limit rule ${name}`);
      try {
        const t = now();
        const r = (await redis.eval(LUA, 1, `rl:${name}:${key}`, t, rule.windowMs, rule.max, `${t}-${process.pid}-${seq++}`)) as [number, number];
        return { allowed: r[0] === 1, retryAfterMs: Number(r[1]) };
      } catch (e) { onError(e); return { allowed: true, retryAfterMs: 0 }; }
    },
  };
}

/** Per-route budgets (auth callbacks, contact writes, imports, sync, referrals, claims, support, admin actions...). */
export const RULES: Record<string, LimitRule> = {
  authCallback: { max: 20, windowMs: 60_000 },
  contactCreate: { max: 120, windowMs: 60_000 },
  bulk: { max: 20, windowMs: 60_000 },
  vcfImport: { max: 5, windowMs: 60_000 },
  export: { max: 20, windowMs: 60_000 },
  backup: { max: 10, windowMs: 3_600_000 },
  syncNow: { max: 6, windowMs: 60_000 },
  referralClick: { max: 30, windowMs: 3_600_000 },
  referralRegister: { max: 10, windowMs: 3_600_000 },
  rewardClaim: { max: 5, windowMs: 60_000 },
  challenge: { max: 30, windowMs: 60_000 },
  support: { max: 5, windowMs: 3_600_000 },
  supportReply: { max: 30, windowMs: 3_600_000 },
  account: { max: 10, windowMs: 3_600_000 },
  write: { max: 300, windowMs: 60_000 },
  adminAction: { max: 60, windowMs: 60_000 },
  read: { max: 600, windowMs: 60_000 },
};
