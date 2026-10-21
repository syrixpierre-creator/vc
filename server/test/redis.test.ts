import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Redis } from "ioredis";
import { Worker, Queue } from "bullmq";
import { redisLimiter } from "../src/security/ratelimit.ts";
import { bullDispatcher, redisConnection, QUEUES } from "../src/services/queue.ts";
import { runSyncJob, sweepSync } from "../src/services/jobs.ts";
import { createSyncPorts } from "../src/sync/ports.ts";
import type { PeopleApi } from "../src/sync/engine.ts";
import { startHarness, KEYRING } from "./harness.ts";

/** Runs against a real Redis (TEST_REDIS_URL, default redis://127.0.0.1:6379/15). Skipped when none is reachable. */
const URL_ = process.env["TEST_REDIS_URL"] ?? "redis://127.0.0.1:6379/15";
const probe = new Redis(URL_, { lazyConnect: true, maxRetriesPerRequest: 0, retryStrategy: () => null });
const available = await probe.connect().then(() => true, () => false);
after(async () => { if (available) await probe.quit(); else probe.disconnect(); });

test("redis rate limiter: shared sliding window, per key, atomic under parallel calls", { skip: !available && "no Redis" }, async () => {
  const prefix = `t${Date.now()}`;
  const lim = redisLimiter(probe, { [prefix]: { max: 5, windowMs: 2000 } });
  const res = await Promise.all(Array.from({ length: 12 }, () => lim.check(prefix, "user-1")));
  assert.equal(res.filter(r => r.allowed).length, 5, "exactly the budget, even in parallel");
  assert.ok(res.find(r => !r.allowed)!.retryAfterMs > 0);
  assert.equal((await lim.check(prefix, "user-2")).allowed, true, "keys are independent");
});

test("redis rate limiter fails open (and reports) when Redis is unreachable", async () => {
  const dead = new Redis("redis://127.0.0.1:1/0", { lazyConnect: true, maxRetriesPerRequest: 0, retryStrategy: () => null, enableOfflineQueue: false });
  const errors: unknown[] = [];
  const lim = redisLimiter(dead, { x: { max: 1, windowMs: 1000 } }, e => errors.push(e));
  assert.equal((await lim.check("x", "k")).allowed, true);
  assert.equal(errors.length, 1);
  dead.disconnect();
});

test("BullMQ: a saved contact's job goes through Redis to the worker and reaches Google exactly once", { skip: !available && "no Redis", timeout: 30_000 }, async () => {
  const h = await startHarness();
  await probe.flushdb();
  const connection = redisConnection(URL_);
  const dispatch = bullDispatcher(connection);
  const calls: string[] = [];
  const people: PeopleApi = {
    async createContact(_t, c) { calls.push(c.fullName); return { resourceName: `people/c${calls.length}`, etag: "e" }; },
    async updateContact() { return { etag: "e2" }; },
  };
  const sv = { ...h.sv, dispatch };
  const ports = createSyncPorts({ store: h.store, people, google: { async refreshAccessToken() { return { accessToken: "at", expiresIn: 3600 }; } }, keyRing: KEYRING, now: h.now });
  const done: string[] = [];
  const worker = new Worker(QUEUES.sync, async job => { const r = await runSyncJob(sv, ports, String(job.data.jobId)); done.push(r.status); return r.status; }, { connection, concurrency: 4 });
  try {
    const s = await h.login("bq", "bq@x.com");
    await h.connectContacts(s, { sub: "bq", email: "bq@x.com" });
    const created = await h.json<{ id: string }>(h.send(s, "/api/contacts", { fullName: "Via Redis", phones: ["+33612000001"] }));
    // the app used the in-memory dispatcher; push the same PostgreSQL job through BullMQ twice (a duplicate message)
    const job = (await h.store.listSyncJobsFor(s.userId))[0]!;
    await dispatch.syncJob(job.id, 0);
    await dispatch.syncJob(job.id, 0);
    await sweepSync(sv); // the sweeper may push it again too: still harmless
    const t0 = Date.now();
    while ((await h.store.getContact(s.userId, created.id))!.syncState !== "synced" && Date.now() - t0 < 10_000) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 300));
    assert.equal((await h.store.getContact(s.userId, created.id))!.syncState, "synced");
    assert.deepEqual(calls, ["Via Redis"], "one Google call despite duplicate queue messages");
    assert.ok(done.includes("succeeded"));
  } finally {
    await worker.close(); await dispatch.close();
    const q = new Queue(QUEUES.sync, { connection });
    await q.obliterate({ force: true }).catch(() => undefined);
    await q.close();
    await h.close();
  }
});
