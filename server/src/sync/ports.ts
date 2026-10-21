import type { Store, Contact } from "../store/types.ts";
import { encrypt, decrypt, type KeyRing } from "../security/crypto.ts";
import { PeopleApiError, type PeopleApi, type SyncPorts, type SyncContact } from "./engine.ts";
import { GoogleAuthError } from "../http/google-client.ts";

export const refreshContext = (userId: string) => `oauth_refresh:${userId}`;
export const accessContext = (userId: string) => `oauth_access:${userId}`;
const SKEW_MS = 60_000;

/** The user's own contact, as the engine sees it. `version` = last user edit, so every edit gets its own job. */
export function toSyncContact(c: Contact): SyncContact {
  const s: SyncContact = { id: c.id, userId: c.userId, fullName: c.fullName, emails: c.emails, version: c.updatedAt };
  if (c.phone) s.phone = c.phone;
  if (c.organization) s.organization = c.organization;
  if (c.title) s.title = c.title;
  if (c.notes) s.notes = c.notes;
  if (c.googleResourceName) s.googleResourceName = c.googleResourceName;
  if (c.googleEtag) s.googleEtag = c.googleEtag;
  return s;
}

/** Job queue + contact access only: enough to enqueue from the web app without any Google credentials. */
export function createJobPorts(store: Store, now: () => number): Pick<SyncPorts, "jobs" | "contacts" | "now"> {
  return {
    now,
    jobs: {
      due: (n, limit) => store.dueSyncJobs(n, limit),
      claim: id => store.claimSyncJob(id),
      save: j => store.saveSyncJob(j),
      findByKey: k => store.findSyncJobByKey(k),
      insert: j => store.insertSyncJob(j),
    },
    contacts: {
      async get(userId, id) { const c = await store.getContact(userId, id); return c ? toSyncContact(c) : null; },
      markSynced: (userId, id, remote) => store.setContactSync(userId, id, { state: "synced", resourceName: remote.resourceName, etag: remote.etag }),
      setState: (userId, id, state) => store.setContactSync(userId, id, { state }),
    },
  };
}

export interface SyncDeps {
  store: Store;
  people: PeopleApi;
  google: { refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> };
  keyRing: KeyRing;
  now: () => number;
  random?: () => number;
}

/** Full engine ports for the worker. Tokens are decrypted only here, only for the owning user, and never logged. */
export function createSyncPorts(d: SyncDeps): SyncPorts {
  const base = createJobPorts(d.store, d.now);
  return {
    ...base,
    people: d.people,
    ...(d.random ? { random: d.random } : {}),
    connection: {
      async get(userId) {
        const [c, s] = await Promise.all([d.store.getConnection(userId), d.store.getSyncSettings(userId)]);
        return { status: c.status === "reconnect_requested" ? "revoked" : c.status, paused: s.paused };
      },
      async markRevoked(userId) { await d.store.saveConnection(userId, { status: "revoked" }); }, // tokens are dropped, the user must reconnect
      async accessToken(userId) {
        const c = await d.store.getConnection(userId);
        if (c.status !== "connected" || !c.refreshTokenEnc) throw new PeopleApiError("auth_revoked", "not connected");
        if (c.accessTokenEnc && c.accessExpiresAt && c.accessExpiresAt - SKEW_MS > d.now()) return decrypt(c.accessTokenEnc, d.keyRing, accessContext(userId));
        try {
          const r = await d.google.refreshAccessToken(decrypt(c.refreshTokenEnc, d.keyRing, refreshContext(userId)));
          await d.store.saveConnection(userId, { ...c, accessTokenEnc: encrypt(r.accessToken, d.keyRing, accessContext(userId)), accessExpiresAt: d.now() + r.expiresIn * 1000 });
          return r.accessToken;
        } catch (e) {
          if (e instanceof GoogleAuthError) throw new PeopleApiError("auth_revoked", "invalid_grant");
          throw new PeopleApiError("transient", "token_refresh_failed"); // Google unreachable: try again later
        }
      },
    },
    log: (userId, outcome) => d.store.addSyncLog(userId, outcome, d.now()),
  };
}
