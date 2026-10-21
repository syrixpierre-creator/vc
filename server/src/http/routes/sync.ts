import type { AppCtx } from "../app.ts";
import type { Contact } from "../../store/types.ts";
import { HttpError, pick, readJson, v } from "../kit.ts";
import { newOAuthRequest, buildAuthUrl, CONTACTS_SCOPES } from "../../auth/oauth.ts";
import { enqueueSync } from "../../sync/engine.ts";
import { createJobPorts, toSyncContact, refreshContext } from "../../sync/ports.ts";
import { decrypt } from "../../security/crypto.ts";
import { recordEvent } from "../../domain/progress.ts";

/**
 * After a save: create a sync job (PostgreSQL) and wake the worker (BullMQ) when the user connected Google Contacts
 * and kept automatic sync on. While sync is paused the job waits in the queue; nothing is sent.
 */
export async function queueSync(app: AppCtx, userId: string, c: Contact, force = false): Promise<boolean> {
  const [conn, st] = await Promise.all([app.store.getConnection(userId), app.store.getSyncSettings(userId)]);
  if (conn.status !== "connected" || (!st.autoSync && !force)) return false;
  const job = await enqueueSync(createJobPorts(app.store, app.now), toSyncContact(c));
  if (job && !st.paused) await app.sv.dispatch.syncJob(job.id, 0);
  return !!job;
}

export function registerSync(app: AppCtx) {
  const { router: r, store, config, now, send, sv } = app;

  r.get("/api/google-contacts/status", { summary: "Connection state, counts, last sync and recent errors", tag: "sync", access: "user" }, async c => {
    const u = c.user!;
    const [conn, st, counts, last, jobs, logs] = await Promise.all([store.getConnection(u.id), store.getSyncSettings(u.id), store.syncCounts(u.id), store.lastSyncAt(u.id),
      store.jobCountsFor(u.id), store.listSyncLogs(u.id, 30)]);
    send(c, 200, { status: conn.status, autoSync: st.autoSync, paused: st.paused, counts, jobs, lastSyncAt: last, scopes: [...CONTACTS_SCOPES],
      errors: logs.filter(l => l.outcome !== "synced").slice(0, 20), recent: logs.slice(0, 20) });
  });

  r.post("/api/google-contacts/connect", { summary: "Start the separate Google Contacts consent (incremental authorization)", tag: "sync", access: "write", limit: "authCallback" }, async c => {
    const u = c.user!;
    const o = newOAuthRequest();
    await store.putPending(o.state, { nonce: o.nonce, codeVerifier: o.codeVerifier, next: "/app/#/sync", expiresAt: now() + 10 * 60_000, purpose: "contacts", userId: u.id });
    c.setCookies.push(`__Host-oauth=${o.state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    // only the Contacts scope is added now, separately from sign-in, and only for the account the user signed in with
    const url = buildAuthUrl({ clientId: config.google.clientId, redirectUri: config.google.redirectUri, scopes: ["openid", "email", ...CONTACTS_SCOPES], req: o, loginHint: u.email,
      ...(config.google.authEndpoint ? { endpoint: config.google.authEndpoint } : {}) });
    send(c, 200, { url });
  });

  r.patch("/api/google-contacts/settings", { summary: "Automatic sync on/off, pause/resume", tag: "sync", access: "write", body: "{autoSync?, paused?}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["autoSync", "paused"]);
    const cur = await store.getSyncSettings(u.id);
    const next = { ...cur };
    const a = v.bool(b, "autoSync"); if (a !== undefined) next.autoSync = a;
    const p = v.bool(b, "paused"); if (p !== undefined) next.paused = p;
    await store.saveSyncSettings(u.id, next);
    if (cur.paused && !next.paused) { // resume: send what was waiting
      await store.resetSyncStates(u.id, ["paused"], "pending");
      for (const j of await store.listSyncJobsFor(u.id)) if (j.status === "pending") { await store.saveSyncJob({ ...j, nextAttemptAt: now() }); await sv.dispatch.syncJob(j.id, j.attempts); }
    }
    send(c, 200, next);
  });

  r.post("/api/google-contacts/disconnect", { summary: "Disconnect: revokes access at Google, deletes tokens, keeps every local contact", tag: "sync", access: "write", allowWhenRestricted: true }, async c => {
    const u = c.user!;
    const conn = await store.getConnection(u.id);
    if (conn.refreshTokenEnc) { try { await app.deps.google.revokeToken(decrypt(conn.refreshTokenEnc, app.deps.keyRing, refreshContext(u.id))); } catch { /* local disconnect never depends on Google */ } }
    await store.saveConnection(u.id, { status: "not_connected" }); // tokens are deleted
    for (const j of await store.listSyncJobsFor(u.id)) if (j.status === "pending" || j.status === "running") await store.saveSyncJob({ ...j, status: "failed", lastError: "disconnected" });
    await store.resetSyncStates(u.id, ["pending", "paused", "failed"], "local_only");
    await store.addSecurityEvent({ userId: u.id, kind: "google_contacts_disconnected", detail: {}, at: now() });
    await store.addAudit({ actorId: u.id, action: "google_contacts.disconnect", resourceType: "oauth_account", resourceId: u.id, from: conn.status, to: "not_connected", at: now() });
    send(c, 200, { status: "not_connected" }); // local contacts and anything already in Google are left untouched
  });

  r.post("/api/google-contacts/sync-now", { summary: "Queue every contact not yet in sync (up to 2,000 per call)", tag: "sync", access: "write", limit: "syncNow" }, async c => {
    const u = c.user!;
    if ((await store.getConnection(u.id)).status !== "connected") throw new HttpError(409, "not_connected");
    if ((await store.getSyncSettings(u.id)).paused) throw new HttpError(409, "sync_paused");
    let queued = 0;
    const ports = createJobPorts(store, now);
    for (const x of (await store.allContacts(u.id)).filter(k => ["local_only", "pending", "failed"].includes(k.syncState)).slice(0, 2000)) {
      const key = `${x.id}:${x.updatedAt}`;
      const existing = await store.findSyncJobByKey(key);
      if (!existing) { const j = await enqueueSync(ports, toSyncContact(x)); if (j) { queued++; await sv.dispatch.syncJob(j.id, 0); } }
      else if (existing.status === "failed" || existing.status === "dead") {
        await store.saveSyncJob({ ...existing, status: "pending", attempts: 0, nextAttemptAt: now() });
        await store.setContactSync(u.id, x.id, { state: "pending" });
        await sv.dispatch.syncJob(existing.id, now()); // a fresh attempt id: BullMQ keeps finished ids for a while
        queued++;
      } else if (existing.status === "pending") { await sv.dispatch.syncJob(existing.id, existing.attempts); }
    }
    send(c, 200, { queued });
  });

  r.post("/api/google-contacts/retry-failed", { summary: "Retry failed synchronizations (conflicts excluded: they need a decision)", tag: "sync", access: "write", limit: "syncNow" }, async c => {
    const u = c.user!;
    if ((await store.getConnection(u.id)).status !== "connected") throw new HttpError(409, "not_connected");
    const n = await store.retryFailedSyncJobs(u.id);
    for (const j of (await store.listSyncJobsFor(u.id, 500)).filter(j => j.status === "pending")) await sv.dispatch.syncJob(j.id, now());
    send(c, 200, { retried: n });
  });

  r.post("/api/google-contacts/review-access", { summary: "Security check-up: confirm you reviewed what SYRIX VCF can access", tag: "sync", access: "write" }, async c => {
    await recordEvent(sv, c.user!.id, "security_tasks", now(), `sec:connected_access:${new Date(now()).toISOString().slice(0, 7)}`);
    send(c, 200, { ok: true });
  });
}
