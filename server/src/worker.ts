import { Worker, Queue } from "bullmq";
import { loadConfig } from "./config/env.ts";
import { createPgDb } from "./store/db.ts";
import { PgStore } from "./store/pg.ts";
import { createGoogleClient } from "./http/google-client.ts";
import { createPeopleApi } from "./sync/people-api.ts";
import { createSyncPorts } from "./sync/ports.ts";
import { bullDispatcher, redisConnection, QUEUES, type EmailJob } from "./services/queue.ts";
import { resendMailer, logMailer } from "./services/mailer.ts";
import { notify, type Services } from "./services/notify.ts";
import { recordEvent, checkAchievements } from "./domain/progress.ts";
import { runSyncJob, sweepSync, sendEmail, maintenance, deletionsTick, autoBackupsTick, referralsTick, createAlerter, checkAlerts } from "./services/jobs.ts";

/**
 * Background worker. Queues live in Redis (BullMQ); the state of every job lives in PostgreSQL.
 *  - contact-sync: one message per sync job, concurrency + a global rate limit that keeps us inside Google's quota
 *  - email: transactional e-mails with retries
 *  - maintenance (repeatable): sync sweeper, referral qualification, retention clean-up, deletions, automatic backups, alerts
 * Several worker containers can run: PostgreSQL's atomic claim makes a job run once.
 */
const cfg = loadConfig();
const log = (level: string, msg: string, extra: object = {}) => { if (level !== "debug" || cfg.logLevel === "debug") console.log(JSON.stringify({ t: new Date().toISOString(), level, msg, svc: "worker", ...extra })); };
const db = createPgDb(cfg.databaseUrl, { max: cfg.workerConcurrency + 4 });
const store = new PgStore(db);
const connection = redisConnection(cfg.redisUrl);
const dispatch = bullDispatcher(connection, e => log("error", "queue error", { error: (e as Error).message }));
const keyRing = { current: cfg.encryptionKeyVersion, keys: cfg.encryptionKeys };
const sv: Services = { store, dispatch, now: Date.now, keyRing, log };
const google = createGoogleClient({ clientId: cfg.google.clientId, clientSecret: cfg.google.clientSecret });
const mailer = cfg.emailProvider === "resend" ? resendMailer({ apiKey: cfg.emailProviderApiKey!, from: cfg.emailFrom! }) : logMailer((msg, extra) => log("warn", msg, extra));
const ports = createSyncPorts({ store, people: createPeopleApi(), google, keyRing, now: Date.now,
  async onSynced(userId, contactId, version) { if (await recordEvent(sv, userId, "sync_successes", Date.now(), `sync:${contactId}:${version}`)) await checkAchievements(sv, userId); },
  async onRevoked(userId) { await notify(sv, userId, "sync_revoked", {}); },
});
const alert = createAlerter({ ...(cfg.alertWebhookUrl ? { webhookUrl: cfg.alertWebhookUrl } : {}), log, now: Date.now });
const stats = { synced: 0, failed: 0, emails: 0 };

const syncWorker = new Worker(QUEUES.sync, async job => {
  const id = String(job.data.jobId);
  const r = await runSyncJob(sv, ports, id);
  if (r.status === "succeeded") stats.synced++; else if (r.status === "failed" || r.status === "dead") stats.failed++;
  if (r.retryInMs !== undefined) { const j = await store.getSyncJob(id); if (j) await dispatch.syncJob(id, j.attempts, r.retryInMs); }
  return r.status;
}, { connection, concurrency: cfg.workerConcurrency, limiter: { max: cfg.syncRatePerSecond, duration: 1000 } });

const emailWorker = new Worker(QUEUES.email, async job => {
  const r = await sendEmail(sv, mailer, job.data as EmailJob, { appUrl: cfg.appUrl, supportEmail: cfg.supportEmail });
  if (r === "sent") stats.emails++;
  return r;
}, { connection, concurrency: 2, limiter: { max: 10, duration: 1000 } });

const TASKS: Record<string, { every: number; run: () => Promise<unknown> }> = {
  "sync-sweep": { every: 30_000, run: () => sweepSync(sv) },
  "referrals": { every: 5 * 60_000, run: () => referralsTick(sv) },
  "maintenance": { every: 60 * 60_000, run: () => maintenance(sv) },
  "deletions": { every: 60 * 60_000, run: () => deletionsTick(sv) },
  "auto-backups": { every: 6 * 60 * 60_000, run: () => autoBackupsTick(sv) },
  "alerts": { every: 10 * 60_000, run: () => checkAlerts(sv, alert, "/") },
};
const maintenanceQueue = new Queue(QUEUES.maintenance, { connection });
for (const [name, t] of Object.entries(TASKS)) await maintenanceQueue.upsertJobScheduler(name, { every: t.every }, { name, opts: { removeOnComplete: 50, removeOnFail: 50 } });
const maintenanceWorker = new Worker(QUEUES.maintenance, async job => {
  const t = TASKS[job.name];
  if (!t) return "unknown";
  const out = await t.run();
  if (out && typeof out === "object" && Object.values(out).some(x => typeof x === "number" && x > 0)) log("info", `task ${job.name}`, { out });
  return out;
}, { connection, concurrency: 1 });

for (const w of [syncWorker, emailWorker, maintenanceWorker]) {
  w.on("failed", (job, e) => log("error", "job failed", { queue: w.name, job: job?.name, error: e.message }));
  w.on("error", e => log("error", "worker error", { queue: w.name, error: e.message }));
}

async function beat() {
  try { await store.heartbeat("worker", { pid: process.pid, ...stats, emailProvider: mailer.configured ? cfg.emailProvider : "none" }); }
  catch (e) { log("error", "heartbeat failed", { error: (e as Error).message }); }
}
await beat();
await sweepSync(sv).catch(e => log("error", "initial sweep failed", { error: (e as Error).message }));
const beatTimer = setInterval(() => void beat(), 30_000);
log("info", "worker started", { concurrency: cfg.workerConcurrency, syncRatePerSecond: cfg.syncRatePerSecond, email: mailer.configured ? cfg.emailProvider : "log only" });

for (const sig of ["SIGTERM", "SIGINT"] as const) process.on(sig, () => {
  clearInterval(beatTimer);
  void Promise.allSettled([syncWorker.close(), emailWorker.close(), maintenanceWorker.close(), maintenanceQueue.close(), dispatch.close()]).then(() => db.close()).then(() => process.exit(0));
  setTimeout(() => process.exit(1), 15_000).unref();
});
