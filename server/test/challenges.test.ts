import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startHarness, type Session } from "./harness.ts";
import { creditQualified } from "../src/domain/rewards.ts";
import type { ChallengeRec } from "../src/store/types.ts";

const h = await startHarness();
after(() => h.close());
const DAY = 86_400_000;
const T = Date.now();
let phoneSeq = 10_000_000;
const nextPhone = () => `+336${String(phoneSeq++).padStart(8, "0")}`;

const body = (over: Record<string, unknown> = {}) => ({
  title: { en: "Operator", fr: "Opérateur" }, description: { en: "Do real work", fr: "Un vrai travail" }, difficulty: "advanced",
  startsAt: T - DAY, endsAt: T + 30 * DAY, metric: "verified_operations", threshold: 5, rewardType: "xp", rewardXp: 50,
  terms: "Complete five verified operations during the period.", ...over,
});
async function admin(sub = `adm-${randomUUID().slice(0, 6)}`): Promise<Session> {
  const a = await h.login(sub, `${sub}@x.com`);
  await h.setRoles(a.userId, ["challenge_manager"]);
  return a;
}
const seed = async (over: Partial<ChallengeRec> = {}): Promise<ChallengeRec> => {
  const c: ChallengeRec = { id: randomUUID(), slug: `seeded-${randomUUID().slice(0, 8)}`, title: { en: "Seeded" }, description: { en: "d" }, terms: "terms terms terms", published: true, difficulty: "advanced",
    startsAt: T - DAY, endsAt: T + 30 * DAY, metric: "verified_operations", threshold: 5, rewardType: "xp", rewardXp: 50, ...over };
  await h.store.saveChallenge(c);
  return c;
};
async function doWork(u: Session, n: number) {
  for (let i = 0; i < n; i++) assert.equal((await h.send(u, "/api/contacts", { fullName: `P${i}`, phone: nextPhone() })).status, 201);
}
async function user(sub: string) { return h.login(sub, `${sub}@x.com`); }
const join = (u: Session, id: string) => h.send(u, `/api/challenges/${id}/join`, {});
const claim = (u: Session, id: string) => h.send(u, `/api/challenges/${id}/claim`, {});
const progress = async (u: Session) => (await (await h.get(u, "/api/me/progress")).json()) as { xp: number; level: number; title: string; vip: string; streakDays: number };
/** XP from one source only (contacts and achievements also give XP, which these tests do not look at). */
const xpFrom = async (u: Session, prefix: string) => (await h.store.xpRows(u.userId)).filter(x => x.reason.startsWith(prefix)).reduce((a, x) => a + x.amount, 0);

test("admin: only challenge managers create challenges; invalid or incomplete bodies are rejected", async () => {
  const a = await admin(); const u = await user("c-u1");
  assert.equal((await h.send(u, "/api/admin/challenges", body())).status, 403);
  assert.equal((await h.send(a, "/api/admin/challenges", body({ difficulty: "easy" }))).status, 400);
  assert.equal((await h.send(a, "/api/admin/challenges", body({ title: { fr: "x" } }))).status, 400, "English title required");
  assert.equal((await h.send(a, "/api/admin/challenges", body({ rewardType: "cash", rewardCents: 500 }))).status, 400, "cash without budget");
  assert.equal((await h.send(a, "/api/admin/challenges", body({ published: true }))).status, 400, "cannot self-publish through create");
  assert.equal((await h.send(a, "/api/admin/challenges", body())).status, 201);
});

test("a month needs at least 8 challenges before anything is published; users then see them in their language", async () => {
  const a = await admin();
  const ids: string[] = [];
  const diffs = ["advanced", "expert", "elite", "legendary"];
  for (let i = 0; i < 8; i++) {
    const r = await h.send(a, "/api/admin/challenges", body({ difficulty: diffs[i % 4], metric: "active_days", threshold: 10 + i, title: { en: `Challenge ${i}`, fr: `Défi ${i}` } }));
    ids.push(((await r.json()) as { id: string }).id);
  }
  const short = await h.send(a, "/api/admin/challenges/publish-month", { ids: ids.slice(0, 7) });
  assert.equal(short.status, 422);
  assert.match(JSON.stringify(await short.json()), /at least 8/);
  assert.equal((await h.send(a, "/api/admin/challenges/publish-month", { ids })).status, 200);

  const fr = await user("c-fr");
  await h.send(fr, "/api/me", { language: "fr" }, "PATCH");
  const list = await (await h.get(fr, "/api/challenges")).json() as { items: { title: string }[] };
  assert.ok(list.items.some(i => i.title === "Défi 3"));
  assert.ok((await h.store.listAudit({ action: "challenge.publish_month", limit: 5, offset: 0 })).length > 0);
});

test("progress is computed by the server from verified work; claim pays once and only when complete", async () => {
  const c = await seed();
  const u = await user("c-work");
  assert.equal((await claim(u, c.id)).status, 409, "not joined");
  assert.equal((await join(u, c.id)).status, 201);
  assert.equal((await join(u, c.id)).status, 409, "no double join");
  await doWork(u, 3);
  assert.equal((await claim(u, c.id)).status, 409, "3/5 is not complete");
  await doWork(u, 2);
  const list = await (await h.get(u, "/api/challenges")).json() as { items: { id: string; progress: number; status: string }[] };
  const mine = list.items.find(i => i.id === c.id)!;
  assert.deepEqual([mine.progress, mine.status], [5, "completed"]);

  assert.equal((await claim(u, c.id)).status, 200);
  assert.equal((await claim(u, c.id)).status, 409, "replayed claim is refused");
  assert.equal(await xpFrom(u, "challenge:"), 50, "50 XP exactly once");
  assert.equal((await progress(u)).vip, "Bronze");
  assert.equal(((await (await h.get(u, "/api/challenges")).json()) as { items: { id: string; status: string }[] }).items.find(i => i.id === c.id)!.status, "reward_delivered");
});

test("consistency challenge counts distinct days: many actions on one day count once", async () => {
  const c = await seed({ metric: "active_days", threshold: 5, difficulty: "elite" });
  const u = await user("c-days");
  await join(u, c.id);
  await doWork(u, 12);
  const list = await (await h.get(u, "/api/challenges")).json() as { items: { id: string; progress: number }[] };
  assert.equal(list.items.find(i => i.id === c.id)!.progress, 1);
  assert.equal((await progress(u)).streakDays, 1);
});

test("terms are frozen once a participant qualifies; before that an admin may edit", async () => {
  const a = await admin();
  const c = await seed();
  const edit = (threshold: number) => h.send(a, `/api/admin/challenges/${c.id}`, body({ threshold }), "PUT");
  assert.equal((await edit(8)).status, 200, "nobody qualified yet");
  const u = await user("c-frozen");
  await join(u, c.id);
  await doWork(u, 8);
  assert.equal((await edit(3)).status, 409, "cannot lower the bar after someone qualified");
  assert.equal((await h.store.getChallenge(c.id))!.threshold, 8);
});

test("cash challenge: winner cap and budget are enforced, money goes through the ledger", async () => {
  const c = await seed({ rewardType: "cash", rewardCents: 50, budgetCents: 100, maxWinners: 5 });
  const us = [await user("cash1"), await user("cash2"), await user("cash3")];
  for (const u of us) { await join(u, c.id); await doWork(u, 5); }
  assert.equal((await claim(us[0]!, c.id)).status, 200);
  assert.equal((await claim(us[1]!, c.id)).status, 200);
  const third = await claim(us[2]!, c.id);
  assert.equal(third.status, 409);
  assert.deepEqual(await third.json(), { error: "budget_exhausted" });
  const w = await (await h.get(us[0]!, "/api/wallet")).json() as { earned: number; available: number };
  assert.deepEqual([w.earned, w.available], [50, 50]);
});

test("parallel claims cannot exceed the winner cap", async () => {
  const c = await seed({ rewardType: "cash", rewardCents: 50, budgetCents: 5000, maxWinners: 1 });
  const us = [await user("race1"), await user("race2"), await user("race3")];
  for (const u of us) { await join(u, c.id); await doWork(u, 5); }
  const res = await Promise.all(us.map(u => claim(u, c.id)));
  assert.equal(res.filter(r => r.status === 200).length, 1, res.map(r => r.status).join(","));
  assert.equal((await h.store.participationsFor(c.id)).filter(p => p.claimedAt).length, 1);
});

test("non-cash rewards create a pending fulfilment record and are never shown as delivered", async () => {
  const c = await seed({ rewardType: "telegram_stars" });
  const u = await user("c-tg");
  await join(u, c.id); await doWork(u, 5);
  assert.equal((await claim(u, c.id)).status, 200);
  const claims = await h.store.listRewardClaimsFor(u.userId);
  assert.ok(claims.some(r => r.kind === "telegram_stars" && r.status === "pending"));
  assert.equal((await h.store.fulfillmentForClaim(claims.find(r => r.kind === "telegram_stars")!.id))!.status, "pending", "a fulfilment record waits for a person");
  assert.equal(((await (await h.get(u, "/api/challenges")).json()) as { items: { id: string; status: string }[] }).items.find(i => i.id === c.id)!.status, "reward_pending");
});

test("joining is limited to the challenge window and to published challenges", async () => {
  const ended = await seed({ startsAt: T - 10 * DAY, endsAt: T - DAY });
  const future = await seed({ startsAt: T + DAY, endsAt: T + 5 * DAY });
  const draft = await seed({ published: false });
  const u = await user("c-window");
  assert.equal((await join(u, ended.id)).status, 409);
  assert.equal((await join(u, future.id)).status, 409);
  assert.equal((await join(u, draft.id)).status, 404);
});

test("leaderboard: opt-in only, pseudonym only, no personal data", async () => {
  const quiet = await user("lb-quiet");
  const loud = await user("lb-loud");
  for (const u of [quiet, loud]) { const c = await seed({ rewardXp: 500 }); await join(u, c.id); await doWork(u, 5); await claim(u, c.id); }
  const before = JSON.stringify(await (await h.get(loud, "/api/leaderboard?period=all")).json());
  assert.ok(!before.includes("lb-loud"), "not listed before opting in");

  assert.equal((await h.send(loud, "/api/me", { leaderboardOptIn: true }, "PATCH")).status, 400, "pseudonym required first");
  assert.equal((await h.send(loud, "/api/me", { pseudonym: "a@b.com" }, "PATCH")).status, 400, "no email-like names");
  assert.equal((await h.send(loud, "/api/me", { pseudonym: "Loud_Lion" }, "PATCH")).status, 200);
  assert.equal((await h.send(quiet, "/api/me", { pseudonym: "loud_lion" }, "PATCH")).status, 409, "pseudonyms are unique, case-insensitively");
  assert.equal((await h.send(loud, "/api/me", { leaderboardOptIn: true }, "PATCH")).status, 200);

  const board = await (await h.get(quiet, "/api/leaderboard?period=weekly")).json() as { items: { rank: number; pseudonym: string; xp: number; level: number }[] };
  const raw = JSON.stringify(board);
  assert.ok(board.items.some(i => i.pseudonym === "Loud_Lion" && i.xp >= 500));
  assert.ok(!raw.includes("lb-loud") && !raw.includes("@x.com") && !raw.includes(loud.userId), "no email, name or id");
  assert.ok(!board.items.some(i => i.xp === undefined));
  assert.equal((await h.get(quiet, "/api/leaderboard?period=forever")).status, 400);
});

test("a qualified referral gives 10 XP once and counts as challenge progress", async () => {
  const c = await seed({ metric: "qualified_referrals", threshold: 1, rewardXp: 1 });
  const referrer = await user("x-ref");
  const friend = await user("x-friend");
  await join(referrer, c.id);
  const r = { id: randomUUID(), referrerId: referrer.userId, referredId: friend.userId, status: "pending" as const, networkHash: "ab".repeat(32), createdAt: 0 };
  await h.store.createReferral(r);
  await creditQualified(h.sv, r, T);
  await creditQualified(h.sv, r, T);
  assert.equal(await xpFrom(referrer, "referral_qualified"), 10, "XP not duplicated");
  const part = await h.store.getParticipation(c.id, referrer.userId);
  assert.ok(part?.completedAt, "challenge completion recorded by the backend");
});

test("unauthenticated users cannot see challenges or the leaderboard", async () => {
  for (const p of ["/api/challenges", "/api/leaderboard", "/api/me/progress"]) assert.equal((await fetch(`${h.base}${p}`)).status, 401, p);
});

test("work done before joining still counts: the user can join, the completion is recorded, terms freeze, and the reward can be claimed", async () => {
  const c = await seed();
  const u = await user("c-early");
  await doWork(u, 6);
  assert.equal(((await (await h.get(u, "/api/challenges")).json()) as { items: { id: string; status: string; joined: boolean }[] }).items.find(i => i.id === c.id)!.status, "completed");
  assert.equal((await claim(u, c.id)).status, 409, "must join first");
  assert.equal((await join(u, c.id)).status, 201);
  assert.ok((await h.store.getParticipation(c.id, u.userId))?.completedAt, "completion recorded at join time");
  const a = await admin();
  assert.equal((await h.send(a, `/api/admin/challenges/${c.id}`, body({ threshold: 1 }), "PUT")).status, 409, "terms frozen once someone qualified");
  assert.equal((await claim(u, c.id)).status, 200);
  assert.equal(await xpFrom(u, "challenge:"), 50);
});
