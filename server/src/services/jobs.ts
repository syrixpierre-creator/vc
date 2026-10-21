import { statfs } from "node:fs/promises";
import type { Services } from "./notify.ts";
import type { Mailer } from "./mailer.ts";
import type { EmailJob } from "./queue.ts";
import { renderEmail, hasTemplate } from "./email-templates.ts";
import { processJob, type SyncPorts } from "../sync/engine.ts";
import { qualifyPendingReferrals } from "../domain/referral-engine.ts";
import { finalizeDeletion } from "../http/routes/admin-ops.ts";
import { automaticBackup } from "../http/routes/contacts.ts";
import { DELETION_GRACE_MS } from "../http/routes/me.ts";

const DAY = 86_400_000;

/** One queued sync job: PostgreSQL decides (atomic claim), so a duplicate Redis message is harmless. Returns the delay before a retry, if any. */
export async function runSyncJob(sv: Services, ports: SyncPorts, jobId: string): Promise<{ status: string; retryInMs?: number }> {
  const job = await sv.store.getSyncJob(jobId);
  if (!job || job.status !== "pending") return { status: job?.status ?? "missing" };
  if (job.nextAttemptAt > sv.now() + 1000) return { status: "not_due", retryInMs: job.nextAttemptAt - sv.now() };
  const status = await processJob(ports, job);
  const after = await sv.store.getSyncJob(jobId);
  return status === "pending" && after ? { status, retryInMs: Math.max(0, after.nextAttemptAt - sv.now()) } : { status };
}

/** Re-queues due jobs from PostgreSQL (retries after backoff, or messages Redis lost). */
export async function sweepSync(sv: Services, limit = 200): Promise<number> {
  await sv.store.requeueStaleSyncJobs(10 * 60_000);
  const due = await sv.store.dueSyncJobs(sv.now(), limit);
  for (const j of due) await sv.dispatch.syncJob(j.id, j.attempts);
  return due.length;
}

export async function sendEmail(sv: Services, mailer: Mailer, job: EmailJob, o: { appUrl: string; supportEmail: string }): Promise<"sent" | "skipped"> {
  if (!hasTemplate(job.template)) return "skipped";
  let to = job.to, lang = job.lang ?? "en";
  if (job.userId) {
    const u = await sv.store.getUser(job.userId);
    if (!u || u.status === "deleted") return "skipped";
    to = u.email; lang = u.language;
  }
  if (!to) return "skipped";
  await mailer.send(renderEmail(job.template, job.vars, lang, o.appUrl, to, o.supportEmail));
  return "sent";
}

export async function maintenance(sv: Services) {
  const s = sv.store;
  const out = {
    expiredLogins: await s.purgeExpiredPending(), oldSessions: await s.purgeOldSessions(), oldNotifications: await s.purgeOldNotifications(),
    oldSyncData: await s.purgeOldSyncData(), deletedContacts: await s.purgeDeletedContacts(sv.now() - 30 * DAY), backupsPruned: await s.pruneBackups(4),
    expiredParticipations: await s.expireParticipations(),
  };
  return out;
}

export async function deletionsTick(sv: Services) {
  let done = 0, waiting = 0;
  for (const id of await sv.store.dueDeletions(sv.now() - DELETION_GRACE_MS)) {
    if ((await finalizeDeletion(sv, id, null)) === "done") done++; else waiting++;
  }
  return { done, waiting };
}

export async function autoBackupsTick(sv: Services, limit = 100) {
  let n = 0;
  for (const id of await sv.store.usersNeedingBackup(sv.now() - 7 * DAY, limit)) { await automaticBackup({ store: sv.store, now: sv.now, keyRing: sv.keyRing }, id); n++; }
  return n;
}

export const referralsTick = (sv: Services) => qualifyPendingReferrals(sv, { now: sv.now() });

export async function diskUsage(path: string): Promise<{ usedPercent: number; freeBytes: number } | null> {
  try { const st = await statfs(path); const total = st.blocks * st.bsize; const free = st.bavail * st.bsize; return { usedPercent: total ? Math.round(((total - free) / total) * 1000) / 10 : 0, freeBytes: free }; }
  catch { return null; }
}

/**
 * Operational alerts posted to ALERT_WEBHOOK_URL (Slack/Discord/any JSON webhook). Each alert key fires at most once per 6 hours.
 * Conditions: worker sync failures, payouts failing, last database backup failed or too old, disk almost full.
 */
export function createAlerter(o: { webhookUrl?: string; log: Services["log"]; now: () => number }) {
  const last = new Map<string, number>();
  return async function alert(key: string, text: string) {
    o.log("warn", "alert", { key, text });
    if (!o.webhookUrl || (last.get(key) ?? 0) > o.now() - 6 * 3600_000) return;
    last.set(key, o.now());
    try { await fetch(o.webhookUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: `[SYRIX VCF] ${text}`, content: `[SYRIX VCF] ${text}` }), signal: AbortSignal.timeout(5000) }); }
    catch (e) { o.log("error", "alert webhook failed", { error: (e as Error).message }); }
  };
}

export async function checkAlerts(sv: Services, alert: (k: string, t: string) => Promise<void>, diskPath: string) {
  const s = sv.store;
  const jobs = await s.jobCountsGlobal();
  if (jobs.failed > 50 && jobs.failed > jobs.succeeded) await alert("sync_failures", `Google Contacts sync: ${jobs.failed} failed jobs vs ${jobs.succeeded} succeeded in 7 days.`);
  const payouts = await s.payoutCounts();
  if ((payouts["failed"]?.count ?? 0) > 0) await alert("payout_failed", `${payouts["failed"]!.count} payout request(s) are marked failed. Review them in Admin > Payouts.`);
  if ((payouts["pending"]?.count ?? 0) + (payouts["in_progress"]?.count ?? 0) > 0) {
    const oldest = (await s.listPayouts({ status: "pending", limit: 200 })).map(p => p.createdAt ?? sv.now()).sort()[0];
    if (oldest && oldest < sv.now() - 7 * DAY) await alert("payout_waiting", "A payout request has been waiting for more than 7 days.");
  }
  const backups = await s.lastOpsBackups(1);
  if (backups[0]?.status === "failed") await alert("backup_failed", `The last database backup failed: ${backups[0].error ?? "unknown error"}`);
  else if (!backups[0] || backups[0].startedAt < sv.now() - 2 * DAY) await alert("backup_stale", "No successful database backup in the last 48 hours.");
  const disk = await diskUsage(diskPath);
  if (disk && disk.usedPercent > 85) await alert("disk", `Disk ${disk.usedPercent}% full.`);
  const fails = await s.countSecurityEventsSince("login_failed", sv.now() - 3600_000);
  if (fails > 100) await alert("login_failures", `${fails} failed sign-ins in the last hour.`);
}
