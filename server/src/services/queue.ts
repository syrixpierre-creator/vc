import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

/**
 * Background work goes through BullMQ queues on Redis. PostgreSQL stays the source of truth for every job's state:
 * a sync job row is created first, then its id is pushed to Redis. If Redis loses a message, the worker's sweeper
 * finds due rows in PostgreSQL and pushes them again, so nothing depends on Redis keeping data.
 */
export interface EmailJob { userId?: string; to?: string; template: string; vars: Record<string, unknown>; lang?: string }
export interface Dispatcher {
  syncJob(jobId: string, attempt: number, delayMs?: number): Promise<void>;
  email(job: EmailJob): Promise<void>;
  close(): Promise<void>;
}
export const QUEUES = { sync: "contact-sync", email: "email", maintenance: "maintenance" } as const;

export function redisConnection(url: string): ConnectionOptions {
  const u = new URL(url);
  return { host: u.hostname, port: Number(u.port || 6379), ...(u.password ? { password: decodeURIComponent(u.password) } : {}), ...(u.username ? { username: decodeURIComponent(u.username) } : {}),
    ...(u.protocol === "rediss:" ? { tls: {} } : {}), db: Number(u.pathname.slice(1) || 0), maxRetriesPerRequest: null };
}

export function bullDispatcher(connection: ConnectionOptions, onError: (e: unknown) => void = () => undefined): Dispatcher {
  const sync = new Queue(QUEUES.sync, { connection });
  const email = new Queue(QUEUES.email, { connection });
  for (const q of [sync, email]) q.on("error", onError);
  return {
    async syncJob(jobId, attempt, delayMs = 0) {
      // jobId makes the push idempotent: the same PostgreSQL job + attempt is queued at most once
      try { await sync.add("sync", { jobId }, { jobId: `${jobId}-${attempt}`, delay: Math.max(0, delayMs), removeOnComplete: 1000, removeOnFail: 1000 }); }
      catch (e) { onError(e); } // the sweeper will pick the row up from PostgreSQL
    },
    async email(job) {
      await email.add("email", job, { attempts: 5, backoff: { type: "exponential", delay: 30_000 }, removeOnComplete: 1000, removeOnFail: 5000 });
    },
    async close() { await Promise.all([sync.close(), email.close()]); },
  };
}

/** In-process dispatcher for tests and the no-Redis local demo: records what would be queued. */
export function memoryDispatcher(): Dispatcher & { emails: EmailJob[]; syncIds: string[] } {
  const emails: EmailJob[] = [];
  const syncIds: string[] = [];
  return { emails, syncIds, async syncJob(id) { syncIds.push(id); }, async email(j) { emails.push(j); }, async close() { /* nothing */ } };
}
