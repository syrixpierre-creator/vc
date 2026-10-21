import type { Row } from "./db.ts";
import type { GoogleConn, ConnStatus, SyncCounts, SyncLogRow, SyncJob } from "./types.ts";
import type { JobStatus } from "../sync/engine.ts";
import { PgContacts } from "./pg-contacts.ts";
import { ms, num, d } from "./pg-base.ts";

const JOB_COLS = `id, user_id, contact_id, operation, status, attempts, ${ms("next_attempt_at")} AS next_ms, idempotency_key, last_error`;
function mapJob(x: Row): SyncJob {
  const j: SyncJob = { id: x["id"], userId: x["user_id"], contactId: x["contact_id"], operation: x["operation"], status: x["status"] as JobStatus, attempts: num(x["attempts"]), nextAttemptAt: num(x["next_ms"]), idempotencyKey: x["idempotency_key"] };
  if (x["last_error"]) j.lastError = x["last_error"];
  return j;
}

export class PgSync extends PgContacts {
  /* ---- Google Contacts connection (tokens are AES-GCM envelopes, bound to their owner) ---- */
  async getConnection(userId: string): Promise<GoogleConn> {
    const x = await this.one(`SELECT contacts_status, refresh_token_enc, access_token_enc, ${ms("access_expires_at")} AS exp_ms FROM oauth_accounts WHERE user_id = $1 AND provider = 'google'`, [userId]);
    if (!x) return { status: "not_connected" };
    const c: GoogleConn = { status: x["contacts_status"] as ConnStatus };
    if (x["refresh_token_enc"]) c.refreshTokenEnc = x["refresh_token_enc"];
    if (x["access_token_enc"]) c.accessTokenEnc = x["access_token_enc"];
    if (x["exp_ms"] !== null) c.accessExpiresAt = num(x["exp_ms"]);
    return c;
  }
  async saveConnection(userId: string, c: GoogleConn) {
    await this.db.query("UPDATE oauth_accounts SET contacts_status = $2, contacts_scope = ($2 = 'connected'), refresh_token_enc = $3, access_token_enc = $4, access_expires_at = $5, updated_at = $6 WHERE user_id = $1 AND provider = 'google'",
      [userId, c.status, c.refreshTokenEnc ?? null, c.accessTokenEnc ?? null, d(c.accessExpiresAt), d(this.now())]);
  }
  /** Admin "request reconnection": keeps nothing usable, the user sees a reconnect prompt. */
  async requestReconnect(userId: string) {
    await this.db.query("UPDATE oauth_accounts SET contacts_status = 'reconnect_requested', refresh_token_enc = NULL, access_token_enc = NULL, access_expires_at = NULL, updated_at = $2 WHERE user_id = $1 AND contacts_status <> 'not_connected'", [userId, d(this.now())]);
  }

  /** A sync result is not a user edit: updated_at is left alone. */
  async setContactSync(userId: string, contactId: string, p: { state?: string; resourceName?: string; etag?: string }) {
    await this.db.query("UPDATE contacts SET sync_state = COALESCE($3, sync_state), google_resource_name = COALESCE($4, google_resource_name), google_etag = COALESCE($5, google_etag) WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL",
      [userId, contactId, p.state ?? null, p.resourceName ?? null, p.etag ?? null]);
  }
  async resetSyncStates(userId: string, from: readonly string[], to: string) {
    return (await this.db.query("UPDATE contacts SET sync_state = $3 WHERE user_id = $1 AND deleted_at IS NULL AND sync_state = ANY($2::text[])", [userId, from, to])).rowCount;
  }
  async syncCounts(userId: string): Promise<SyncCounts> {
    const by = new Map((await this.all("SELECT sync_state, count(*) AS c FROM contacts WHERE user_id = $1 AND deleted_at IS NULL GROUP BY sync_state", [userId])).map(x => [x["sync_state"] as string, num(x["c"])]));
    const total = [...by.values()].reduce((a, b) => a + b, 0);
    return { total, synced: by.get("synced") ?? 0, pending: (by.get("pending") ?? 0) + (by.get("paused") ?? 0), failed: by.get("failed") ?? 0, conflict: by.get("conflict") ?? 0, localOnly: by.get("local_only") ?? 0 };
  }

  /* ---- job queue state (PostgreSQL is the source of truth; Redis/BullMQ only wakes the workers up) ---- */
  async insertSyncJob(j: SyncJob) {
    await this.db.query("INSERT INTO contact_sync_jobs (id, user_id, contact_id, operation, status, attempts, next_attempt_at, idempotency_key, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) ON CONFLICT (idempotency_key) DO NOTHING",
      [j.id, j.userId, j.contactId, j.operation, j.status, j.attempts, d(j.nextAttemptAt), j.idempotencyKey, d(this.now())]);
  }
  async findSyncJobByKey(key: string) { const r = await this.one(`SELECT ${JOB_COLS} FROM contact_sync_jobs WHERE idempotency_key = $1`, [key]); return r ? mapJob(r) : null; }
  async getSyncJob(id: string) { const r = await this.one(`SELECT ${JOB_COLS} FROM contact_sync_jobs WHERE id = $1`, [id]); return r ? mapJob(r) : null; }
  /** Atomic: exactly one worker wins a pending job. */
  async claimSyncJob(id: string) { return (await this.db.query("UPDATE contact_sync_jobs SET status = 'running', updated_at = $2 WHERE id = $1 AND status = 'pending'", [id, d(this.now())])).rowCount === 1; }
  async dueSyncJobs(now: number, limit: number) { return (await this.all(`SELECT ${JOB_COLS} FROM contact_sync_jobs WHERE status = 'pending' AND next_attempt_at <= $1 ORDER BY next_attempt_at LIMIT $2`, [d(now), limit])).map(mapJob); }
  async saveSyncJob(j: SyncJob) {
    const done = j.status === "succeeded" || j.status === "dead" || j.status === "failed";
    await this.db.query("UPDATE contact_sync_jobs SET status = $2, attempts = $3, next_attempt_at = $4, last_error = $5, updated_at = $6::timestamptz, finished_at = CASE WHEN $7::boolean THEN $6::timestamptz ELSE NULL END WHERE id = $1",
      [j.id, j.status, j.attempts, d(j.nextAttemptAt), j.lastError ?? null, d(this.now()), done]);
  }
  async listSyncJobsFor(userId: string, limit = 500) { return (await this.all(`SELECT ${JOB_COLS} FROM contact_sync_jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit])).map(mapJob); }
  async failedSyncJobs(userId: string) { return (await this.all(`SELECT ${JOB_COLS} FROM contact_sync_jobs WHERE user_id = $1 AND status IN ('failed','dead') AND COALESCE(last_error, '') <> 'contact_deleted' ORDER BY updated_at DESC LIMIT 200`, [userId])).map(mapJob); }
  /** Jobs left 'running' by a crashed worker go back to pending. */
  async requeueStaleSyncJobs(olderThanMs: number) { return (await this.db.query("UPDATE contact_sync_jobs SET status = 'pending', updated_at = $2 WHERE status = 'running' AND updated_at < $1", [d(this.now() - olderThanMs), d(this.now())])).rowCount; }
  /** Puts failed jobs back in the queue (after the user reconnected, or an admin retried). Returns how many. */
  async retryFailedSyncJobs(userId: string) {
    return this.tx(async s => {
      const r = await s.all("UPDATE contact_sync_jobs SET status = 'pending', attempts = 0, next_attempt_at = $2, last_error = NULL, updated_at = $2 WHERE user_id = $1 AND status IN ('failed','dead') AND COALESCE(last_error, '') NOT IN ('contact_deleted','conflict') RETURNING contact_id", [userId, d(this.now())]);
      for (const x of r) await s.setContactSync(userId, x["contact_id"], { state: "pending" });
      return r.length;
    });
  }
  async jobCountsGlobal() {
    const r = await this.all("SELECT status, count(*) AS c FROM contact_sync_jobs WHERE updated_at > $1::timestamptz - interval '7 days' OR status IN ('pending','running') GROUP BY status", [d(this.now())]);
    const by = Object.fromEntries(r.map(x => [x["status"], num(x["c"])])) as Record<string, number>;
    return { pending: by["pending"] ?? 0, running: by["running"] ?? 0, succeeded: by["succeeded"] ?? 0, failed: (by["failed"] ?? 0) + (by["dead"] ?? 0) };
  }
  async jobCountsFor(userId: string) {
    const r = await this.all("SELECT status, count(*) AS c FROM contact_sync_jobs WHERE user_id = $1 GROUP BY status", [userId]);
    const by = Object.fromEntries(r.map(x => [x["status"], num(x["c"])])) as Record<string, number>;
    return { pending: (by["pending"] ?? 0) + (by["running"] ?? 0), failed: (by["failed"] ?? 0) + (by["dead"] ?? 0), succeeded: by["succeeded"] ?? 0 };
  }

  async addSyncLog(userId: string, outcome: string, at: number, contactId?: string) {
    await this.db.query("INSERT INTO contact_sync_logs (user_id, outcome, contact_id, created_at) VALUES ($1, $2, $3, $4)", [userId, outcome, contactId ?? null, d(at)]);
  }
  async listSyncLogs(userId: string, limit = 50): Promise<SyncLogRow[]> {
    return (await this.all(`SELECT outcome, contact_id, ${ms("created_at")} AS at FROM contact_sync_logs WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2`, [userId, limit]))
      .map(x => ({ outcome: x["outcome"], ...(x["contact_id"] ? { contactId: x["contact_id"] } : {}), at: num(x["at"]) }));
  }
  async lastSyncAt(userId: string) { const r = await this.one(`SELECT ${ms("max(created_at)")} AS t FROM contact_sync_logs WHERE user_id = $1 AND outcome = 'synced'`, [userId]); return r?.["t"] === null || r?.["t"] === undefined ? null : num(r["t"]); }
  /** Success rate of sync attempts over the last 7 days (admin overview). */
  async syncSuccessRate(): Promise<{ attempts: number; synced: number }> {
    const r = await this.one("SELECT count(*) AS a, count(*) FILTER (WHERE outcome = 'synced') AS s FROM contact_sync_logs WHERE created_at > $1::timestamptz - interval '7 days'", [d(this.now())]);
    return { attempts: num(r?.["a"] ?? 0), synced: num(r?.["s"] ?? 0) };
  }
  async purgeOldSyncData() {
    const a = (await this.db.query("DELETE FROM contact_sync_logs WHERE created_at < $1::timestamptz - interval '90 days'", [d(this.now())])).rowCount;
    const b = (await this.db.query("DELETE FROM contact_sync_jobs WHERE status IN ('succeeded','dead') AND updated_at < $1::timestamptz - interval '30 days'", [d(this.now())])).rowCount;
    return a + b;
  }
}
