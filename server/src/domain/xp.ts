export interface LevelTitle { minLevel: number; title: string }
export const LEVEL_TITLES: readonly LevelTitle[] = [
  { minLevel: 1, title: "Rookie" }, { minLevel: 5, title: "Explorer" }, { minLevel: 10, title: "Pro" },
  { minLevel: 20, title: "Elite" }, { minLevel: 50, title: "Legend" },
];
export interface VipRank { name: string; minXp: number }
export const VIP_RANKS: readonly VipRank[] = [
  { name: "Bronze", minXp: 0 }, { name: "Silver", minXp: 1000 }, { name: "Gold", minXp: 5000 }, { name: "Legend", minXp: 20000 },
];

/** Total XP needed to reach a level (level 1 = 0). Convex curve so high levels stay rare. */
export function xpToReach(level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new RangeError("level must be an integer >= 1");
  return Math.round(100 * Math.pow(level - 1, 1.6));
}
export function levelFor(xp: number): number {
  if (!Number.isFinite(xp) || xp < 0) throw new RangeError("xp must be >= 0");
  let lo = 1, hi = 200;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (xpToReach(mid) <= xp) lo = mid; else hi = mid - 1;
  }
  return lo;
}
export function titleFor(level: number): string {
  let t = LEVEL_TITLES[0]!.title;
  for (const x of LEVEL_TITLES) if (level >= x.minLevel) t = x.title;
  return t;
}
export function vipFor(xp: number, ranks: readonly VipRank[] = VIP_RANKS): string {
  let r = ranks[0]!.name;
  for (const x of ranks) if (xp >= x.minXp) r = x.name;
  return r;
}

/** XP entries are idempotent: the same source event never pays twice. XP is not cash and is not withdrawable. */
export function totalXp(entries: readonly { amount: number; idempotencyKey: string }[]): number {
  const seen = new Set<string>();
  let sum = 0;
  for (const e of entries) {
    if (seen.has(e.idempotencyKey)) continue;
    seen.add(e.idempotencyKey);
    sum += e.amount;
  }
  return Math.max(0, sum);
}

/** Consecutive UTC days of verified activity ending today (or yesterday, so the streak is not lost mid-day). */
export function currentStreak(activityDays: readonly string[], todayUtc: string): number {
  const set = new Set(activityDays);
  const day = 86_400_000;
  let t = Date.parse(todayUtc + "T00:00:00Z");
  if (!set.has(new Date(t).toISOString().slice(0, 10))) t -= day;
  let n = 0;
  while (set.has(new Date(t).toISOString().slice(0, 10))) { n++; t -= day; }
  return n;
}
