import type { Metric } from "./challenges.ts";
import { evaluateProgress } from "./challenges.ts";
import { totalXp, currentStreak, longestStreak, levelFor, titleFor, xpToReach } from "./xp.ts";
import { notify, type Services } from "../services/notify.ts";

const DAY = 86_400_000;
const utcDay = (t: number) => new Date(t).toISOString().slice(0, 10);

/**
 * Records a verified server-side event. A replayed key is ignored (database unique key).
 * Marks participations completed the first time the backend sees the threshold reached (this freezes the challenge's terms).
 */
export async function recordEvent(sv: Services, userId: string, type: Metric, at: number, key: string): Promise<boolean> {
  if (!(await sv.store.addEvent({ userId, type, at, key }))) return false;
  const parts = (await sv.store.participationsOf(userId)).filter(p => !p.completedAt);
  if (parts.length) {
    const events = await sv.store.listEvents(userId);
    for (const part of parts) {
      const def = await sv.store.getChallenge(part.challengeId);
      if (!def || !def.published || def.metric !== type) continue;
      if (evaluateProgress(def, events, at).status === "completed") {
        await sv.store.saveParticipation({ ...part, completedAt: at, status: "completed" });
        await notify(sv, userId, "challenge_completed", { challengeId: def.id, title: def.title });
        await recordEvent(sv, userId, "challenges_completed", at, `challenge:${def.id}`);
      }
    }
  }
  return true;
}

/** One verified action = one active day (per UTC day) and one verified operation. */
export async function recordActivity(sv: Services, userId: string, at: number, opKey: string): Promise<void> {
  if (await recordEvent(sv, userId, "active_days", at, `act:${userId}:${utcDay(at)}`)) await checkAchievements(sv, userId);
  await recordEvent(sv, userId, "verified_operations", at, `op:${opKey}`);
}

export async function awardXp(sv: Services, userId: string, amount: number, reason: string, key: string, at: number): Promise<boolean> {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError("xp amount must be a positive integer");
  const before = await sv.store.xpTotal(userId);
  const added = await sv.store.addXp({ userId, amount, reason, key, at });
  if (added) {
    const from = levelFor(before), to = levelFor(before + amount);
    if (to > from) { await notify(sv, userId, "level_up", { level: to, title: titleFor(to) }); await checkAchievements(sv, userId); }
  }
  return added;
}

export async function vipFor(sv: Services, xp: number) {
  const levels = await sv.store.vipLevels();
  let cur = levels[0] ?? { id: 0, name: "Bronze", minXp: 0, benefits: {} };
  for (const l of levels) if (xp >= l.minXp) cur = l;
  const next = levels.find(l => l.minXp > xp) ?? null;
  return { current: cur, next, levels };
}

export async function progressFor(sv: Services, userId: string, now: number) {
  const xp = totalXp((await sv.store.xpRows(userId)).map(r => ({ amount: r.amount, idempotencyKey: r.key })));
  const level = levelFor(xp);
  const days = [...new Set((await sv.store.listEvents(userId)).filter(e => e.type === "active_days").map(e => utcDay(e.at)))];
  const set = new Set(days);
  const today = utcDay(now);
  const calendar = Array.from({ length: 35 }, (_, i) => { const day = utcDay(now - (34 - i) * DAY); return { day, active: set.has(day) }; });
  const vip = await vipFor(sv, xp);
  return {
    xp, level, title: titleFor(level), currentLevelXp: xpToReach(level), nextLevelXp: xpToReach(level + 1),
    vip: vip.current.name, vipBenefits: vip.current.benefits, nextVip: vip.next ? { name: vip.next.name, minXp: vip.next.minXp } : null,
    streakDays: currentStreak(days, today), longestStreak: longestStreak(days), activeDays: days.length, calendar,
  };
}

/* ---------- achievements ---------- */
export interface AchievementDef { code: string; xp: number; group: "contacts" | "sync" | "referrals" | "progress" | "challenges" | "security" }
export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { code: "first_contact", xp: 10, group: "contacts" }, { code: "contacts_100", xp: 50, group: "contacts" }, { code: "contacts_1000", xp: 150, group: "contacts" },
  { code: "organizer", xp: 40, group: "contacts" }, { code: "first_backup", xp: 20, group: "contacts" }, { code: "first_import", xp: 15, group: "contacts" },
  { code: "first_sync", xp: 20, group: "sync" }, { code: "sync_100", xp: 60, group: "sync" },
  { code: "referrals_10", xp: 0, group: "referrals" }, { code: "referrals_25", xp: 0, group: "referrals" }, { code: "referrals_50", xp: 0, group: "referrals" },
  { code: "referrals_100", xp: 0, group: "referrals" }, { code: "referrals_250", xp: 0, group: "referrals" }, { code: "referrals_500", xp: 0, group: "referrals" },
  { code: "streak_7", xp: 40, group: "progress" }, { code: "streak_30", xp: 150, group: "progress" },
  { code: "level_5", xp: 0, group: "progress" }, { code: "level_10", xp: 0, group: "progress" }, { code: "level_20", xp: 0, group: "progress" }, { code: "level_50", xp: 0, group: "progress" },
  { code: "first_challenge", xp: 30, group: "challenges" }, { code: "monthly_champion", xp: 100, group: "challenges" },
  { code: "security_review", xp: 25, group: "security" },
];

async function grant(sv: Services, userId: string, code: string) {
  if (!(await sv.store.grantAchievement(userId, code))) return;
  const def = ACHIEVEMENTS.find(a => a.code === code);
  await notify(sv, userId, "achievement", { code });
  if (def && def.xp > 0) await awardXp(sv, userId, def.xp, `achievement:${code}`, `xp:achievement:${code}:${userId}`, sv.now());
}

/** Idempotent: grants whatever the user's verified records now justify. Badges for referral milestones come from the referral engine. */
export async function checkAchievements(sv: Services, userId: string): Promise<void> {
  const have = new Set((await sv.store.achievementsOf(userId)).map(a => a.code));
  const want = async (code: string, test: () => Promise<boolean>) => { if (!have.has(code) && (await test())) { have.add(code); await grant(sv, userId, code); } };
  const events = await sv.store.listEvents(userId);
  const count = (t: Metric) => new Set(events.filter(e => e.type === t).map(e => e.key)).size;
  const contacts = await sv.store.countContacts(userId);
  await want("first_contact", async () => contacts >= 1);
  await want("contacts_100", async () => contacts >= 100);
  await want("contacts_1000", async () => contacts >= 1000);
  await want("organizer", async () => count("contacts_labeled") >= 25);
  await want("first_backup", async () => count("backups_created") >= 1);
  await want("first_import", async () => count("vcf_imports") >= 1);
  await want("first_sync", async () => count("sync_successes") >= 1);
  await want("sync_100", async () => count("sync_successes") >= 100);
  await want("first_challenge", async () => count("challenges_completed") >= 1);
  await want("security_review", async () => count("security_tasks") >= 4);
  const days = [...new Set(events.filter(e => e.type === "active_days").map(e => utcDay(e.at)))];
  const streak = longestStreak(days);
  await want("streak_7", async () => streak >= 7);
  await want("streak_30", async () => streak >= 30);
  const level = levelFor(await sv.store.xpTotal(userId));
  for (const l of [5, 10, 20, 50]) await want(`level_${l}`, async () => level >= l);
  // Monthly Champion: six challenges completed within one calendar month
  const byMonth = new Map<string, number>();
  for (const e of events.filter(x => x.type === "challenges_completed")) { const m = utcDay(e.at).slice(0, 7); byMonth.set(m, (byMonth.get(m) ?? 0) + 1); }
  await want("monthly_champion", async () => [...byMonth.values()].some(n => n >= 6));
}
export { grant as grantAchievement };
