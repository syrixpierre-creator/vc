import { loadConfig } from "./config/env.ts";
import { createPgDb } from "./store/db.ts";
import { PgStore } from "./store/pg.ts";
import { qualifyPendingReferrals } from "./domain/referral-engine.ts";
import { createGoogleClient } from "./http/google-client.ts";
import { createPeopleApi } from "./sync/people-api.ts";
import { createSyncPorts } from "./sync/ports.ts";
import { runDueJobs } from "./sync/engine.ts";

/**
 * Background worker (single instance). Two jobs:
 *  - every 10 s: Google Contacts sync (queue state lives in PostgreSQL, so nothing is lost if the process or Redis restarts)
 *  - every 5 min: qualify pending referrals against the published rules
 * Jobs left "running" by a crashed worker are put back in the queue at start-up and every minute.
 */
const cfg = loadConfig();
const db = await createPgDb(cfg.databaseUrl, { max: 4 });
const store = new PgStore(db);
const google = createGoogleClient({ clientId: cfg.google.clientId, clientSecret: cfg.google.clientSecret });
const ports = createSyncPorts({ store, people: createPeopleApi(), google, keyRing: { current: 1, keys: { 1: cfg.encryptionKey } }, now: Date.now });
const log = (level: string, msg: string, extra: object = {}) => console.log(JSON.stringify({ level, msg, ...extra }));

let stopping = false;
let syncing = false;
async function syncTick() {
  if (syncing || stopping) return; // never overlap two ticks
  syncing = true;
  try { const r = await runDueJobs(ports, 20); if (r.processed) log("info", "sync tick", r); }
  catch (e) { log("error", "sync tick failed", { error: (e as Error).message }); }
  finally { syncing = false; }
}
async function referralTick() {
  try { log("info", "referrals evaluated", await qualifyPendingReferrals(store, { now: Date.now() })); }
  catch (e) { log("error", "referral job failed", { error: (e as Error).message }); }
}
async function recoverTick() {
  try { const n = await store.requeueStaleSyncJobs(10 * 60_000); if (n) log("warn", "requeued stale sync jobs", { n }); }
  catch (e) { log("error", "recover failed", { error: (e as Error).message }); }
}

log("info", "worker started");
await recoverTick();
await referralTick();
const timers = [setInterval(() => void syncTick(), 10_000), setInterval(() => void referralTick(), 5 * 60_000), setInterval(() => void recoverTick(), 60_000)];
for (const sig of ["SIGTERM", "SIGINT"] as const) process.on(sig, () => { stopping = true; timers.forEach(clearInterval); void db.close().then(() => process.exit(0)); });
