import { test } from "node:test";
import assert from "node:assert/strict";
import { PeopleApiError, backoffMs, enqueueSync, processJob, runDueJobs, MAX_ATTEMPTS, type SyncPorts, type SyncJob, type SyncContact, type Connection } from "../src/sync/engine.ts";

function rig(over: { conn?: Connection; api?: Partial<SyncPorts["people"]> } = {}) {
  let t = 1_000_000;
  const jobs = new Map<string, SyncJob>();
  const contacts = new Map<string, SyncContact & { state?: string }>();
  const state = { conn: over.conn ?? ({ status: "connected", paused: false } as Connection), creates: 0, updates: 0, revoked: false, logs: [] as string[] };
  const ports: SyncPorts = {
    jobs: {
      async due(now, limit) { return [...jobs.values()].filter(j => j.status === "pending" && j.nextAttemptAt <= now).slice(0, limit); },
      async claim(id) { const j = jobs.get(id); if (!j || j.status !== "pending") return false; j.status = "running"; return true; },
      async save(j) { jobs.set(j.id, j); },
      async findByKey(k) { return [...jobs.values()].find(j => j.idempotencyKey === k) ?? null; },
      async insert(j) { jobs.set(j.id, j); },
    },
    contacts: {
      async get(u, id) { const c = contacts.get(id); return c && c.userId === u ? c : null; },
      async markSynced(_u, id, r) { const c = contacts.get(id)!; c.googleResourceName = r.resourceName; c.googleEtag = r.etag; c.state = "synced"; },
      async setState(_u, id, s) { const c = contacts.get(id); if (c) c.state = s; },
    },
    connection: {
      async get() { return state.conn; },
      async markRevoked() { state.revoked = true; state.conn = { status: "revoked", paused: false }; },
      async accessToken() { return "tok"; },
    },
    people: {
      async createContact() { state.creates++; return { resourceName: "people/c1", etag: "e1" }; },
      async updateContact() { state.updates++; return { etag: "e2" }; },
      ...over.api,
    },
    async log(_u, outcome) { state.logs.push(outcome); },
    now: () => t,
    random: () => 0.5,
  };
  const addContact = (id = "c1", extra: Partial<SyncContact> = {}) => { const c: SyncContact & { state?: string } = { id, userId: "u1", fullName: "Amina", phone: "+33612345678", emails: [], version: 1, ...extra }; contacts.set(id, c); return c; };
  return { ports, jobs, contacts, state, addContact, advance: (ms: number) => { t += ms; } };
}

test("backoff grows exponentially with jitter and is capped at one hour", () => {
  assert.equal(backoffMs(1, () => 0), 15_000);
  assert.equal(backoffMs(1, () => 1), 30_000);
  assert.ok(backoffMs(3, () => 1) === 120_000);
  assert.equal(backoffMs(20, () => 1), 3_600_000);
});

test("happy path: enqueue, process, remote id stored, contact marked synced", async () => {
  const r = rig(); const c = r.addContact();
  const job = (await enqueueSync(r.ports, c))!;
  assert.equal(job.operation, "create");
  assert.equal(r.contacts.get("c1")!.state, "pending");
  assert.equal(await processJob(r.ports, job), "succeeded");
  assert.deepEqual([r.contacts.get("c1")!.googleResourceName, r.contacts.get("c1")!.state, r.state.creates], ["people/c1", "synced", 1]);
});

test("idempotency: same contact version is queued once; a processed job is never run twice", async () => {
  const r = rig(); const c = r.addContact();
  const j = (await enqueueSync(r.ports, c))!;
  assert.equal(await enqueueSync(r.ports, c), null, "double click");
  await processJob(r.ports, j);
  await processJob(r.ports, j);
  await runDueJobs(r.ports);
  assert.equal(r.state.creates, 1, "no duplicate Google contact");
});

test("an already-synced contact is updated, never created again", async () => {
  const r = rig(); const c = r.addContact("c1", { googleResourceName: "people/c1", googleEtag: "e1", version: 2 });
  const j = (await enqueueSync(r.ports, c))!;
  assert.equal(j.operation, "update");
  await processJob(r.ports, j);
  assert.deepEqual([r.state.creates, r.state.updates], [0, 1]);
});

test("rate limit: retried later, honouring Retry-After; transient errors back off; attempts are counted", async () => {
  let n = 0;
  const r = rig({ api: { async createContact() { n++; throw new PeopleApiError("rate_limited", "429", 600_000); } } });
  const j = (await enqueueSync(r.ports, r.addContact()))!;
  assert.equal(await processJob(r.ports, j), "pending");
  assert.ok(j.nextAttemptAt - 1_000_000 >= 600_000, "Retry-After respected");
  assert.equal(j.attempts, 1);
  assert.equal((await runDueJobs(r.ports)).processed, 0, "not due yet");
  r.advance(600_001);
  assert.equal((await runDueJobs(r.ports)).processed, 1);
  assert.equal(n, 2);
});

test("transient failures stop after the maximum number of attempts and surface as failed", async () => {
  const r = rig({ api: { async createContact() { throw new PeopleApiError("transient", "503"); } } });
  const j = (await enqueueSync(r.ports, r.addContact()))!;
  for (let i = 0; i < MAX_ATTEMPTS; i++) { r.advance(3_700_000); await runDueJobs(r.ports); }
  assert.equal(j.status, "dead");
  assert.equal(j.attempts, MAX_ATTEMPTS);
  assert.equal(r.contacts.get("c1")!.state, "failed");
});

test("revoked authorization: no retries, connection flagged for reconnection", async () => {
  const r = rig({ api: { async createContact() { throw new PeopleApiError("auth_revoked", "401"); } } });
  const j = (await enqueueSync(r.ports, r.addContact()))!;
  assert.equal(await processJob(r.ports, j), "failed");
  assert.equal(r.state.revoked, true);
  const j2 = (await enqueueSync(r.ports, r.addContact("c2")))!;
  assert.equal(await processJob(r.ports, j2), "failed", "later jobs do not even call Google");
  assert.equal(r.state.creates, 0);
});

test("conflict (changed or removed on Google's side): no retry, no overwrite, contact flagged for the user", async () => {
  const r = rig({ api: { async updateContact() { throw new PeopleApiError("conflict", "412"); } } });
  const j = (await enqueueSync(r.ports, r.addContact("c1", { googleResourceName: "people/c1", googleEtag: "old", version: 2 })))!;
  assert.equal(await processJob(r.ports, j), "failed");
  assert.equal(j.lastError, "conflict");
  assert.equal(r.contacts.get("c1")!.state, "conflict");
  assert.equal((await runDueJobs(r.ports)).processed, 0, "not retried automatically");
});

test("pause: job is kept, no attempt spent, nothing sent to Google; resume works", async () => {
  const r = rig({ conn: { status: "connected", paused: true } });
  const j = (await enqueueSync(r.ports, r.addContact()))!;
  assert.equal(await processJob(r.ports, j), "pending");
  assert.deepEqual([j.attempts, r.state.creates, r.contacts.get("c1")!.state], [0, 0, "paused"]);
  r.state.conn = { status: "connected", paused: false };
  r.advance(3_700_000);
  await runDueJobs(r.ports);
  assert.equal(r.state.creates, 1);
});

test("a contact deleted locally never triggers a remote delete; job ends quietly", async () => {
  const r = rig(); const c = r.addContact();
  const j = (await enqueueSync(r.ports, c))!;
  r.contacts.delete("c1");
  assert.equal(await processJob(r.ports, j), "dead");
  assert.equal(j.lastError, "contact_deleted");
  assert.deepEqual([r.state.creates, r.state.updates], [0, 0]);
});

test("invalid contact data is not retried; logs never contain contact details", async () => {
  const r = rig({ api: { async createContact() { throw new PeopleApiError("invalid", "400 bad phone +33612345678"); } } });
  const j = (await enqueueSync(r.ports, r.addContact()))!;
  assert.equal(await processJob(r.ports, j), "dead");
  assert.ok(r.state.logs.every(l => !l.includes("+33") && !l.includes("Amina")));
});

test("per-tick budget caps how many jobs hit Google at once", async () => {
  const r = rig();
  for (let i = 0; i < 30; i++) await enqueueSync(r.ports, r.addContact(`c${i}`));
  assert.equal((await runDueJobs(r.ports, 20)).processed, 20);
  assert.equal(r.state.creates, 20);
});
