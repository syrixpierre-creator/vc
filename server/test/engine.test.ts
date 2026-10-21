import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateReferral, type ReferralInput } from "../src/domain/referral.ts";
import { evaluateProgress, canAward, validateUpdate, validateMonthlySet, type ChallengeDef, type ChallengeEvent } from "../src/domain/challenges.ts";
import { xpToReach, levelFor, titleFor, vipFor, totalXp, currentStreak } from "../src/domain/xp.ts";

/* ---------- referrals ---------- */
const clean: ReferralInput = {
  referrerId: "u1", referredId: "u2", referrerGoogleSub: "g1", referredGoogleSub: "g2",
  referrerEmail: "a@x.com", referredEmail: "b@x.com", registeredViaLink: true, completedGoogleAuth: true, emailVerified: true,
  referredAccountAgeMs: 48 * 3600_000, signupsFromSameNetworkLast24h: 1, referrerRestricted: false, alreadyReferredByAnyone: false,
};
test("referral: a clean, aged, verified referral qualifies", () => {
  assert.deepEqual(evaluateReferral(clean), { decision: "qualified", reasons: [] });
});
test("referral: hard rule violations disqualify", () => {
  assert.deepEqual(evaluateReferral({ ...clean, referredId: "u1" }).reasons, ["self_referral"]);
  assert.ok(evaluateReferral({ ...clean, referredGoogleSub: "g1" }).reasons.includes("same_google_account"));
  assert.ok(evaluateReferral({ ...clean, referredEmail: " A@X.com" }).reasons.includes("same_email"));
  assert.equal(evaluateReferral({ ...clean, alreadyReferredByAnyone: true }).decision, "disqualified");
  assert.equal(evaluateReferral({ ...clean, registeredViaLink: false }).decision, "disqualified", "a click alone is not a referral");
});
test("referral: waiting conditions keep it pending, not lost", () => {
  assert.deepEqual(evaluateReferral({ ...clean, referredAccountAgeMs: 3600_000 }), { decision: "pending", reasons: ["waiting_period"] });
  assert.equal(evaluateReferral({ ...clean, emailVerified: false }).decision, "pending");
  assert.equal(evaluateReferral({ ...clean, completedGoogleAuth: false }).decision, "pending");
});
test("referral: uncertain risk goes to human review, never an automatic ban", () => {
  const r = evaluateReferral({ ...clean, signupsFromSameNetworkLast24h: 9 });
  assert.equal(r.decision, "under_review");
  assert.equal(evaluateReferral({ ...clean, referrerRestricted: true }).decision, "under_review");
});

/* ---------- challenges ---------- */
const DAY = 86_400_000;
const T0 = Date.parse("2026-11-01T00:00:00Z");
const def: ChallengeDef = { id: "ref25", difficulty: "advanced", startsAt: T0, endsAt: T0 + 30 * DAY, metric: "qualified_referrals", threshold: 25, rewardType: "xp" };
const ev = (n: number, t = T0 + DAY): ChallengeEvent[] => Array.from({ length: n }, (_, i) => ({ type: "qualified_referrals", at: t, key: `r${i}` }));

test("challenge: progress counts only in-window events and replayed keys once", () => {
  const events: ChallengeEvent[] = [...ev(10), ...ev(10), { type: "qualified_referrals", at: T0 - 1, key: "early" }, { type: "qualified_referrals", at: T0 + 31 * DAY, key: "late" }];
  assert.equal(evaluateProgress(def, events, T0 + 5 * DAY).progress, 10);
});
test("challenge: statuses upcoming / active / completed / expired", () => {
  assert.equal(evaluateProgress(def, [], T0 - DAY).status, "upcoming");
  assert.equal(evaluateProgress(def, ev(3), T0 + 2 * DAY).status, "active");
  assert.equal(evaluateProgress(def, ev(25), T0 + 2 * DAY).status, "completed");
  assert.equal(evaluateProgress(def, ev(3), T0 + 40 * DAY).status, "expired");
});
test("challenge: consistency metric counts distinct days, not repeated clicks", () => {
  const d: ChallengeDef = { ...def, id: "days", metric: "active_days", threshold: 20, difficulty: "elite" };
  const sameDay: ChallengeEvent[] = Array.from({ length: 50 }, (_, i) => ({ type: "active_days", at: T0 + 1000 * i, key: `e${i}` }));
  assert.equal(evaluateProgress(d, sameDay, T0 + DAY).progress, 1);
  const spread: ChallengeEvent[] = Array.from({ length: 20 }, (_, i) => ({ type: "active_days", at: T0 + i * DAY + 5000, key: `d${i}` }));
  assert.equal(evaluateProgress(d, spread, T0 + 25 * DAY).status, "completed");
});
test("challenge: winner cap and cash budget are enforced", () => {
  const cash: ChallengeDef = { ...def, rewardType: "cash", rewardCents: 500, budgetCents: 1000, maxWinners: 5 };
  assert.equal(canAward(cash, 0, 0).ok, true);
  assert.equal(canAward(cash, 0, 1000).reason, "budget_exhausted");
  assert.equal(canAward(cash, 5, 0).reason, "max_winners_reached");
  assert.equal(canAward({ ...cash, budgetCents: undefined }, 0, 0).reason, "cash_reward_without_budget");
});
test("challenge: terms are frozen once someone qualifies", () => {
  assert.deepEqual(validateUpdate(def, { ...def, threshold: 5 }, false), []);
  assert.ok(validateUpdate(def, { ...def, threshold: 5 }, true).length > 0);
  assert.ok(validateUpdate(def, { ...def, endsAt: def.endsAt - DAY }, true).length > 0);
  assert.deepEqual(validateUpdate(def, { ...def, endsAt: def.endsAt + DAY }, true), []);
});
test("challenge: a month needs at least 8 real challenges", () => {
  const tiers = ["advanced", "expert", "elite", "legendary"] as const;
  const eight = Array.from({ length: 8 }, (_, i): ChallengeDef => ({ ...def, id: `c${i}`, difficulty: tiers[i % 4]!, threshold: 10 + i }));
  assert.deepEqual(validateMonthlySet(eight), []);
  assert.ok(validateMonthlySet(eight.slice(0, 7))[0]!.includes("at least 8"));
  assert.ok(validateMonthlySet([...eight, { ...def, id: "easy", threshold: 1 }]).some(e => e.includes("threshold too low")));
});

/* ---------- XP, levels, VIP, streaks ---------- */
test("xp: level curve is monotonic and titles follow the spec", () => {
  assert.equal(levelFor(0), 1);
  for (let l = 1; l < 60; l++) assert.ok(xpToReach(l + 1) > xpToReach(l));
  assert.equal(levelFor(xpToReach(10)), 10);
  assert.equal(levelFor(xpToReach(10) - 1), 9);
  assert.equal(titleFor(1), "Rookie");
  assert.equal(titleFor(5), "Explorer");
  assert.equal(titleFor(10), "Pro");
  assert.equal(titleFor(20), "Elite");
  assert.equal(titleFor(50), "Legend");
});
test("xp: VIP ranks by threshold; replayed XP events do not pay twice", () => {
  assert.equal(vipFor(0), "Bronze");
  assert.equal(vipFor(1000), "Silver");
  assert.equal(vipFor(20000), "Legend");
  assert.equal(totalXp([{ amount: 50, idempotencyKey: "a" }, { amount: 50, idempotencyKey: "a" }, { amount: 30, idempotencyKey: "b" }]), 80);
});
test("streak: consecutive days, survives until end of today", () => {
  assert.equal(currentStreak(["2026-11-03", "2026-11-02", "2026-11-01"], "2026-11-03"), 3);
  assert.equal(currentStreak(["2026-11-02", "2026-11-01"], "2026-11-03"), 2, "today not yet active");
  assert.equal(currentStreak(["2026-11-03", "2026-11-01"], "2026-11-03"), 1, "gap breaks it");
  assert.equal(currentStreak([], "2026-11-03"), 0);
});
