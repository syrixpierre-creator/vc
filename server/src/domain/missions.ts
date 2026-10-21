import type { EventRow } from "../store/types.ts";
import type { Metric } from "./challenges.ts";

export type Period = "daily" | "weekly" | "monthly";
export interface MissionDef { code: string; period: Period; metric: Metric; target: number; xp: number; distinctDays?: boolean }

/**
 * Small recurring goals. Progress is computed only from verified server events (replays never count twice),
 * and each mission's XP can be claimed once per period (the XP idempotency key contains the period).
 * Unlike monthly challenges these are deliberately modest: they reward regular use, not volume.
 */
export const MISSIONS: readonly MissionDef[] = [
  { code: "daily_organize", period: "daily", metric: "verified_operations", target: 3, xp: 15 },
  { code: "daily_label", period: "daily", metric: "contacts_labeled", target: 2, xp: 10 },
  { code: "weekly_active", period: "weekly", metric: "active_days", target: 4, xp: 60, distinctDays: true },
  { code: "weekly_backup", period: "weekly", metric: "backups_created", target: 1, xp: 25 },
  { code: "weekly_review", period: "weekly", metric: "duplicates_reviewed", target: 1, xp: 20 },
  { code: "monthly_challenges", period: "monthly", metric: "challenges_completed", target: 2, xp: 100 },
  { code: "monthly_sync", period: "monthly", metric: "sync_successes", target: 20, xp: 50 },
];

const DAY = 86_400_000;
/** [start, end) of the UTC period containing `now`, and a stable key for it. Weeks start on Monday. */
export function periodBounds(period: Period, now: number): { start: number; end: number; key: string } {
  const d = new Date(now);
  if (period === "daily") { const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); return { start, end: start + DAY, key: new Date(start).toISOString().slice(0, 10) }; }
  if (period === "weekly") {
    const day0 = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const start = day0 - ((d.getUTCDay() + 6) % 7) * DAY;
    return { start, end: start + 7 * DAY, key: `W${new Date(start).toISOString().slice(0, 10)}` };
  }
  const start = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  return { start, end: Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1), key: new Date(start).toISOString().slice(0, 7) };
}

export function missionProgress(m: MissionDef, events: readonly EventRow[], now: number) {
  const b = periodBounds(m.period, now);
  const inWindow = events.filter(e => e.type === m.metric && e.at >= b.start && e.at < b.end);
  const progress = m.distinctDays ? new Set(inWindow.map(e => new Date(e.at).toISOString().slice(0, 10))).size : new Set(inWindow.map(e => e.key)).size;
  return { progress: Math.min(progress, m.target), done: progress >= m.target, periodKey: b.key, endsAt: b.end };
}
export const missionXpKey = (code: string, periodKey: string, userId: string) => `xp:mission:${code}:${periodKey}:${userId}`;
