import type { Store } from "../store/types.ts";
import type { Metric } from "./challenges.ts";
import { evaluateProgress } from "./challenges.ts";
import { totalXp, currentStreak, levelFor, titleFor, vipFor, xpToReach } from "./xp.ts";

/**
 * Records a verified server-side event. A replayed key is ignored. Marks participations as completed
 * the first time the backend sees the threshold reached (this is what freezes a challenge's terms).
 */
export async function recordEvent(store: Store, userId: string, type: Metric, at: number, key: string): Promise<void> {
  if (!(await store.addEvent({ userId, type, at, key }))) return;
  const events = await store.listEvents(userId);
  for (const part of await store.participationsOf(userId)) {
    if (part.completedAt) continue;
    const def = await store.getChallenge(part.challengeId);
    if (!def || !def.published || def.metric !== type) continue;
    if (evaluateProgress(def, events, at).status === "completed") { part.completedAt = at; await store.saveParticipation(part); }
  }
}

/** One verified action = one active day (per UTC day) and one verified operation. */
export async function recordActivity(store: Store, userId: string, at: number, opKey: string): Promise<void> {
  const day = new Date(at).toISOString().slice(0, 10);
  await recordEvent(store, userId, "active_days", at, `act:${userId}:${day}`);
  await recordEvent(store, userId, "verified_operations", at, `op:${opKey}`);
}

export async function awardXp(store: Store, userId: string, amount: number, reason: string, key: string, at: number): Promise<boolean> {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError("xp amount must be a positive integer");
  return store.addXp({ userId, amount, reason, key, at });
}

export async function progressFor(store: Store, userId: string, now: number) {
  const xp = totalXp((await store.xpRows(userId)).map(r => ({ amount: r.amount, idempotencyKey: r.key })));
  const level = levelFor(xp);
  const days = (await store.listEvents(userId)).filter(e => e.type === "active_days").map(e => new Date(e.at).toISOString().slice(0, 10));
  return { xp, level, title: titleFor(level), vip: vipFor(xp), nextLevelXp: xpToReach(level + 1), streakDays: currentStreak(days, new Date(now).toISOString().slice(0, 10)) };
}
