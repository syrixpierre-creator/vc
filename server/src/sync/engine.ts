import { randomUUID } from "node:crypto";

/**
 * Google Contacts sync engine. All I/O goes through ports so it is testable without Google, Redis or PostgreSQL.
 * Rules: PostgreSQL contact is the source of truth; we only create/update remote contacts, never delete them;
 * a revoked authorization stops retries instead of hammering Google.
 */
export type SyncErrorKind = "rate_limited" | "auth_revoked" | "transient" | "invalid" | "conflict";
export class PeopleApiError extends Error {
  kind: SyncErrorKind;
  retryAfterMs: number | undefined;
  constructor(kind: SyncErrorKind, message: string, retryAfterMs?: number) { super(message); this.kind = kind; this.retryAfterMs = retryAfterMs; }
}

export interface SyncContact { id: string; userId: string; fullName: string; phones: string[]; emails: string[]; organization?: string; title?: string; notes?: string; googleResourceName?: string; googleEtag?: string; version: number }
export interface PeopleApi {
  createContact(accessToken: string, c: SyncContact): Promise<{ resourceName: string; etag: string }>;
  updateContact(accessToken: string, resourceName: string, etag: string, c: SyncContact): Promise<{ etag: string }>;
}
export type JobStatus = "pending" | "running" | "succeeded" | "failed" | "dead";
export interface SyncJob { id: string; userId: string; contactId: string; operation: "create" | "update"; status: JobStatus; attempts: number; nextAttemptAt: number; idempotencyKey: string; lastError?: string }
export interface Connection { status: "connected" | "revoked" | "not_connected" | "refresh_failed"; paused: boolean }

export interface SyncPorts {
  jobs: {
    due(now: number, limit: number): Promise<SyncJob[]>;
    claim(id: string): Promise<boolean>; // atomic pending -> running; false if someone else got it
    save(j: SyncJob): Promise<void>;
    findByKey(key: string): Promise<SyncJob | null>;
    insert(j: SyncJob): Promise<void>;
  };
  contacts: {
    get(userId: string, id: string): Promise<SyncContact | null>;
    markSynced(userId: string, id: string, remote: { resourceName: string; etag: string }): Promise<void>;
    setState(userId: string, id: string, state: "pending" | "failed" | "paused" | "conflict"): Promise<void>;
  };
  connection: {
    get(userId: string): Promise<Connection>;
    markRevoked(userId: string): Promise<void>;
    accessToken(userId: string): Promise<string>; // refreshes when needed; throws PeopleApiError("auth_revoked") if impossible
  };
  people: PeopleApi;
  log(userId: string, outcome: string, contactId?: string): Promise<void>; // never contact contents or tokens
  /** optional hook: a verified sync success (counts for challenges) */
  onSynced?(userId: string, contactId: string, version: number): Promise<void>;
  now(): number;
  random?(): number;
}

export const MAX_ATTEMPTS = 8;
const BASE_MS = 30_000;
const CAP_MS = 3600_000;

/** Exponential backoff with jitter in [d/2, d]. */
export function backoffMs(attempt: number, random: () => number = Math.random): number {
  const d = Math.min(BASE_MS * 2 ** Math.max(0, attempt - 1), CAP_MS);
  return Math.round(d / 2 + random() * (d / 2));
}

/** Enqueue a job for a saved contact. The key (contact + version) makes double clicks and retries harmless. */
export async function enqueueSync(p: Pick<SyncPorts, "jobs" | "contacts" | "now">, c: SyncContact): Promise<SyncJob | null> {
  const key = `${c.id}:${c.version}`;
  if (await p.jobs.findByKey(key)) return null;
  const j: SyncJob = { id: randomUUID(), userId: c.userId, contactId: c.id, operation: c.googleResourceName ? "update" : "create", status: "pending", attempts: 0, nextAttemptAt: p.now(), idempotencyKey: key };
  await p.jobs.insert(j);
  await p.contacts.setState(c.userId, c.id, "pending");
  return j;
}

export async function processJob(p: SyncPorts, job: SyncJob): Promise<JobStatus> {
  if (!(await p.jobs.claim(job.id))) return job.status;
  const finish = async (status: JobStatus, patch: Partial<SyncJob> = {}) => { Object.assign(job, patch, { status }); await p.jobs.save(job); return status; };

  const conn = await p.connection.get(job.userId);
  if (conn.paused) { // user paused sync: keep the job, do not spend an attempt
    await p.contacts.setState(job.userId, job.contactId, "paused");
    return finish("pending", { nextAttemptAt: p.now() + 3600_000 });
  }
  if (conn.status !== "connected") {
    await p.contacts.setState(job.userId, job.contactId, "failed");
    await p.log(job.userId, "not_connected", job.contactId);
    return finish("failed", { lastError: `connection_${conn.status}` }); // no retries until the user reconnects
  }
  const contact = await p.contacts.get(job.userId, job.contactId);
  if (!contact) return finish("dead", { lastError: "contact_deleted" }); // local delete never deletes the Google contact

  job.attempts++;
  try {
    const token = await p.connection.accessToken(job.userId);
    if (contact.googleResourceName && contact.googleEtag) {
      const r = await p.people.updateContact(token, contact.googleResourceName, contact.googleEtag, contact);
      await p.contacts.markSynced(job.userId, contact.id, { resourceName: contact.googleResourceName, etag: r.etag });
    } else {
      const r = await p.people.createContact(token, contact); // resource name is stored at once: a retry updates instead of duplicating
      await p.contacts.markSynced(job.userId, contact.id, r);
    }
    await p.log(job.userId, "synced", contact.id);
    if (p.onSynced) await p.onSynced(job.userId, contact.id, contact.version);
    return finish("succeeded", { lastError: undefined as never });
  } catch (e) {
    const err = e instanceof PeopleApiError ? e : new PeopleApiError("transient", "unexpected");
    await p.log(job.userId, err.kind, job.contactId);
    if (err.kind === "auth_revoked") {
      await p.connection.markRevoked(job.userId);
      await p.contacts.setState(job.userId, job.contactId, "failed");
      return finish("failed", { lastError: "auth_revoked" });
    }
    if (err.kind === "conflict") { // changed or removed on Google's side: never overwrite blindly, never delete; the user decides
      await p.contacts.setState(job.userId, job.contactId, "conflict");
      return finish("failed", { lastError: "conflict" });
    }
    if (err.kind === "invalid") { await p.contacts.setState(job.userId, job.contactId, "failed"); return finish("dead", { lastError: "invalid_contact" }); }
    if (job.attempts >= MAX_ATTEMPTS) { await p.contacts.setState(job.userId, job.contactId, "failed"); return finish("dead", { lastError: `${err.kind}_max_attempts` }); }
    const wait = Math.max(backoffMs(job.attempts, p.random), err.kind === "rate_limited" ? (err.retryAfterMs ?? 0) : 0);
    return finish("pending", { nextAttemptAt: p.now() + wait, lastError: err.kind });
  }
}

/** One worker tick. `maxPerTick` is the per-tick budget that keeps us under Google's quota. */
export async function runDueJobs(p: SyncPorts, maxPerTick = 20): Promise<{ processed: number }> {
  const due = await p.jobs.due(p.now(), maxPerTick);
  for (const j of due) await processJob(p, j);
  return { processed: due.length };
}
