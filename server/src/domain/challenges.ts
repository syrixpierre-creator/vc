export type Difficulty = "advanced" | "expert" | "elite" | "legendary";
export type Metric = "qualified_referrals" | "active_days" | "verified_operations" | "challenges_completed";
export type RewardType = "xp" | "badge" | "vip" | "premium" | "cash" | "whatsapp_promotion" | "telegram_stars" | "telegram_premium";

export interface ChallengeDef {
  id: string;
  difficulty: Difficulty;
  startsAt: number;
  endsAt: number;
  metric: Metric;
  threshold: number;
  rewardType: RewardType;
  rewardCents?: number;
  budgetCents?: number;
  maxWinners?: number;
}
export interface ChallengeEvent { type: Metric; at: number; key: string; /** distinct-day metrics use the UTC day of `at` */ }

export type ChallengeStatus = "upcoming" | "active" | "completed" | "expired";

/** Backend-computed progress: only events inside the window count, and a replayed key counts once. */
export function evaluateProgress(def: ChallengeDef, events: readonly ChallengeEvent[], now: number): { progress: number; status: ChallengeStatus } {
  const seen = new Set<string>();
  const days = new Set<string>();
  let count = 0;
  for (const e of events) {
    if (e.type !== def.metric || e.at < def.startsAt || e.at >= def.endsAt) continue;
    if (seen.has(e.key)) continue;
    seen.add(e.key);
    count++;
    days.add(new Date(e.at).toISOString().slice(0, 10));
  }
  const progress = def.metric === "active_days" ? days.size : count;
  let status: ChallengeStatus;
  if (progress >= def.threshold) status = "completed";
  else if (now < def.startsAt) status = "upcoming";
  else if (now >= def.endsAt) status = "expired";
  else status = "active";
  return { progress, status };
}

/** Prize limits: winner cap and cash budget are enforced before any award is created. */
export function canAward(def: ChallengeDef, winnersSoFar: number, spentCents: number): { ok: boolean; reason?: string } {
  if (def.maxWinners !== undefined && winnersSoFar >= def.maxWinners) return { ok: false, reason: "max_winners_reached" };
  if (def.rewardType === "cash") {
    if (!def.rewardCents || def.budgetCents === undefined) return { ok: false, reason: "cash_reward_without_budget" };
    if (spentCents + def.rewardCents > def.budgetCents) return { ok: false, reason: "budget_exhausted" };
  }
  return { ok: true };
}

/** Terms cannot change once someone has qualified. Only the end date may be extended, never shortened. */
export function validateUpdate(old: ChallengeDef, next: ChallengeDef, anyoneQualified: boolean): string[] {
  const errs: string[] = [];
  if (!anyoneQualified) return errs;
  for (const k of ["metric", "threshold", "rewardType", "rewardCents", "difficulty", "startsAt"] as const) {
    if (old[k] !== next[k]) errs.push(`${k} cannot change after a participant qualified`);
  }
  if (next.endsAt < old.endsAt) errs.push("endsAt cannot be shortened after a participant qualified");
  return errs;
}

const TIERS: readonly Difficulty[] = ["advanced", "expert", "elite", "legendary"];

/** A month must publish at least `min` challenges, every one hard enough to be real work. */
export function validateMonthlySet(defs: readonly ChallengeDef[], min = 8): string[] {
  const errs: string[] = [];
  if (defs.length < min) errs.push(`at least ${min} challenges are required (got ${defs.length})`);
  for (const d of defs) {
    if (!TIERS.includes(d.difficulty)) errs.push(`${d.id}: unknown difficulty`);
    if (d.endsAt <= d.startsAt) errs.push(`${d.id}: end must be after start`);
    if (!Number.isSafeInteger(d.threshold) || d.threshold < 5) errs.push(`${d.id}: threshold too low for a challenge`);
    if (d.rewardType === "cash" && (!d.rewardCents || d.budgetCents === undefined)) errs.push(`${d.id}: cash reward needs an amount and a budget`);
  }
  return errs;
}
