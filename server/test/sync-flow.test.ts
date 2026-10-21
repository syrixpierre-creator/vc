import { test } from "node:test";
import assert from "node:assert/strict";
import { startHarness, type Session } from "./harness.ts";
import { GoogleAuthError } from "../src/http/google-client.ts";
import { PeopleApiError } from "../src/sync/engine.ts";
import { decrypt } from "../src/security/crypto.ts";
import { KEYRING } from "./harness.ts";

type H = Awaited<ReturnType<typeof startHarness>>;
async function withH(fn: (h: H) => Promise<void>) { const h = await startHarness(); try { await fn(h); } finally { await h.close(); } }
const jobCount = async (h: H) => Number((await h.sql("SELECT count(*) AS c FROM contact_sync_jobs"))[0]!["c"]);
let seq = 20_000_000;
const phone = () => `+336${String(seq++).padStart(8, "0")}`;
const addContact = async (h: H, s: Session, name: string) => {
  const r = await h.send(s, "/api/contacts", { fullName: name, phone: phone() });
  assert.equal(r.status, 201);
  return (await r.json()) as { id: string; syncState: string };
};
const status = async (h: H, s: Session) => (await (await h.get(s, "/api/google-contacts/status")).json()) as { status: string; autoSync: boolean; paused: boolean; counts: Record<string, number>; lastSyncAt: number | null };
const stateOf = async (h: H, s: Session, id: string) => ((await (await h.get(s, `/api/contacts/${id}`)).json()) as { syncState: string }).syncState;
async function connected(h: H, sub: string, o: { access?: string; refresh?: string } = {}) {
  const s = await h.login(sub, `${sub}@x.com`);
  const r = await h.connectContacts(s, { sub, email: `${sub}@x.com`, accessToken: o.access ?? `at-${sub}`, refreshToken: o.refresh ?? `rt-${sub}` });
  assert.equal(r.response.headers.get("location"), "/app/#/sync?e=ok");
  return s;
}

test("connect: Contacts access is a separate, incremental request; tokens are stored encrypted and bound to the user", () => withH(async h => {
  const s = await h.login("c1", "c1@x.com");
  assert.equal((await status(h, s)).status, "not_connected");
  const r = await h.connectContacts(s, { sub: "c1", email: "c1@x.com", accessToken: "at-secret-1", refreshToken: "rt-secret-1" });
  assert.match(r.scopes, /auth\/contacts/);
  assert.match(r.scopes, /openid/);
  assert.equal(r.response.status, 302);
  assert.equal(r.response.headers.get("location"), "/app/#/sync?e=ok");
  assert.equal((await status(h, s)).status, "connected");
  const stored = await h.store.getConnection(s.userId);
  assert.ok(stored.refreshTokenEnc!.startsWith("v1:") && !JSON.stringify(stored).includes("secret"), "no plaintext tokens at rest");
  assert.equal(decrypt(stored.refreshTokenEnc!, KEYRING, `oauth_refresh:${s.userId}`), "rt-secret-1");
  assert.throws(() => decrypt(stored.refreshTokenEnc!, KEYRING, `oauth_refresh:someone-else`), "ciphertext is bound to its owner");
}));

test("connect: unticked Contacts scope, missing refresh token and Cancel are handled without connecting", () => withH(async h => {
  const s = await h.login("c2", "c2@x.com");
  const noScope = await h.connectContacts(s, { sub: "c2", email: "c2@x.com", scope: "openid email" });
  assert.equal(noScope.response.headers.get("location"), "/app/#/sync?e=scope");
  const noRefresh = await h.connectContacts(s, { sub: "c2", email: "c2@x.com", refreshToken: null });
  assert.equal(noRefresh.response.headers.get("location"), "/app/#/sync?e=token");
  const cancelled = await h.connectContacts(s, { sub: "c2", email: "c2@x.com", cancel: true });
  assert.equal(cancelled.response.headers.get("location"), "/app/#/sync?e=denied");
  assert.equal((await status(h, s)).status, "not_connected");
  assert.deepEqual(await h.store.getConnection(s.userId), { status: "not_connected" }, "nothing stored");
}));

test("connect: contacts can only be linked to the Google account the user signed in with, and only by that user's session", () => withH(async h => {
  const a = await h.login("ua", "ua@x.com");
  const b = await h.login("ub", "ub@x.com");
  const wrongAccount = await h.connectContacts(a, { sub: "someone-else", email: "other@x.com" });
  assert.equal(wrongAccount.response.status, 302, "a different Google account is refused with a friendly redirect, not raw JSON");
  assert.equal(wrongAccount.response.headers.get("location"), "/app/#/sync?e=account");
  assert.deepEqual(await h.store.getConnection(a.userId), { status: "not_connected" }, "nothing was stored for the wrong account");
  const wrongSession = await h.connectContacts(a, { sub: "ua", email: "ua@x.com", as: b });
  assert.equal(wrongSession.response.status, 403, "callback replayed from another user's session");
  assert.equal((await status(h, a)).status, "not_connected");
  assert.equal((await status(h, b)).status, "not_connected");
  const r = await h.send(a, "/api/google-contacts/connect", {});
  const state = new URL(((await r.json()) as { url: string }).url).searchParams.get("state")!;
  const anon = await fetch(`${h.base}/api/auth/google/callback?state=${state}&code=x`, { redirect: "manual", headers: { cookie: `__Host-oauth=${state}` } });
  assert.ok(anon.headers.get("location")?.startsWith("/signin-error"), "no session, no connection");
  assert.equal((await status(h, a)).status, "not_connected");
}));

test("auto sync: nothing is queued before connecting; after connecting each save is queued; turning it off stops queueing", () => withH(async h => {
  const s = await h.login("c3", "c3@x.com");
  const early = await addContact(h, s, "Before");
  assert.equal((await jobCount(h)), 0);
  assert.equal(early.syncState, "local_only");
  await h.connectContacts(s, { sub: "c3", email: "c3@x.com" });
  const c = await addContact(h, s, "After");
  assert.equal((await jobCount(h)), 1);
  assert.equal(await stateOf(h, s, c.id), "pending");
  await h.send(s, "/api/google-contacts/settings", { autoSync: false }, "PATCH");
  await addContact(h, s, "Quiet");
  assert.equal((await jobCount(h)), 1, "auto sync off: no new job");
}));

test("worker: a saved contact reaches Google once with the owner's token; edits update it; deleting never touches Google", () => withH(async h => {
  const s = await connected(h, "c4");
  const c = await addContact(h, s, "Amina");
  await h.runSync();
  assert.deepEqual(h.remote.calls.map(x => [x.op, x.token, x.name]), [["create", "at-c4", "Amina"]]);
  assert.equal(await stateOf(h, s, c.id), "synced");
  assert.ok((await status(h, s)).lastSyncAt, "last successful sync is recorded");

  await h.send(s, `/api/contacts/${c.id}`, { organization: "Syrix" }, "PATCH");
  await new Promise(r => setTimeout(r, 5)); // distinct updatedAt, as in real life
  await h.runSync();
  assert.deepEqual(h.remote.calls.map(x => x.op), ["create", "update"]);
  assert.equal(h.remote.calls[1]!.resourceName, "people/c1", "updates the same Google contact, no duplicate");

  await h.runSync();
  assert.equal(h.remote.calls.length, 2, "nothing left to send");
  await h.send(s, `/api/contacts/${c.id}?confirm=true`, {}, "DELETE");
  await h.runSync();
  assert.equal(h.remote.calls.length, 2, "local delete is never mirrored to Google");
}));

test("worker: an expired access token is refreshed with the stored refresh token and saved encrypted", () => withH(async h => {
  const s = await connected(h, "c5");
  let used = "";
  h.fake.refresh = async rt => { used = rt; return { accessToken: "at-fresh", expiresIn: 3600 }; };
  h.advance(2 * 3600_000);
  await addContact(h, s, "Late");
  await h.runSync();
  assert.equal(used, "rt-c5");
  assert.equal(h.remote.calls[0]!.token, "at-fresh");
  assert.ok(!JSON.stringify(await h.store.getConnection(s.userId)).includes("at-fresh"), "refreshed token is encrypted too");
}));

test("revoked access: the job fails without retries, status asks to reconnect, reconnecting and Sync now recovers", () => withH(async h => {
  const s = await connected(h, "c6");
  h.fake.refresh = async () => { throw new GoogleAuthError("invalid_grant"); };
  h.advance(2 * 3600_000);
  const c = await addContact(h, s, "Stuck");
  await h.runSync();
  assert.equal(h.remote.calls.length, 0);
  assert.equal(await stateOf(h, s, c.id), "failed");
  assert.equal((await status(h, s)).status, "revoked");
  assert.equal((await h.store.getConnection(s.userId)).refreshTokenEnc, undefined, "dead tokens are dropped");
  const more = await addContact(h, s, "Also stuck");
  assert.equal((await jobCount(h)), 1, "not connected: no new jobs while revoked");
  assert.equal((await h.send(s, "/api/google-contacts/sync-now", {})).status, 409);

  h.fake.refresh = async () => ({ accessToken: "at-new", expiresIn: 3600 });
  await h.connectContacts(s, { sub: "c6", email: "c6@x.com", accessToken: "at-reconnected", refreshToken: "rt-new" });
  const r = await h.send(s, "/api/google-contacts/sync-now", {});
  assert.deepEqual(await r.json(), { queued: 1 }, "reconnecting already re-queued the failed one; Sync now queues the contact saved while revoked");
  await h.runSync();
  assert.deepEqual(h.remote.calls.map(x => x.token), ["at-reconnected", "at-reconnected"], "the fresh token from the reconnect is used, no refresh needed");
  assert.equal(await stateOf(h, s, c.id), "synced");
  assert.equal(await stateOf(h, s, more.id), "synced");
}));

test("isolation: every contact goes to Google with its own owner's token and nobody else's", () => withH(async h => {
  const a = await connected(h, "iso-a");
  const b = await connected(h, "iso-b");
  for (const n of ["A1", "A2"]) await addContact(h, a, n);
  for (const n of ["B1", "B2", "B3"]) await addContact(h, b, n);
  await h.runSync();
  assert.equal(h.remote.calls.length, 5);
  for (const call of h.remote.calls) assert.equal(call.token, call.name.startsWith("A") ? "at-iso-a" : "at-iso-b", `${call.name} sent with the wrong token`);
}));

test("pause keeps the queue and sends nothing; resume sends what was waiting", () => withH(async h => {
  const s = await connected(h, "c7");
  await h.send(s, "/api/google-contacts/settings", { paused: true }, "PATCH");
  const c = await addContact(h, s, "Waiting");
  await h.runSync();
  assert.equal(h.remote.calls.length, 0);
  assert.equal(await stateOf(h, s, c.id), "paused");
  assert.equal((await h.send(s, "/api/google-contacts/sync-now", {})).status, 409, "Sync now respects the pause");
  await h.send(s, "/api/google-contacts/settings", { paused: false }, "PATCH");
  await h.runSync();
  assert.equal(h.remote.calls.length, 1);
  assert.equal(await stateOf(h, s, c.id), "synced");
}));

test("disconnect: Google is told to revoke, tokens are deleted, queued jobs stop, local contacts stay", () => withH(async h => {
  const s = await connected(h, "c8", { refresh: "rt-to-revoke" });
  const c = await addContact(h, s, "Local");
  const r = await h.send(s, "/api/google-contacts/disconnect", {});
  assert.equal(r.status, 200);
  assert.deepEqual(h.fake.revoked, ["rt-to-revoke"]);
  assert.deepEqual(await h.store.getConnection(s.userId), { status: "not_connected" });
  await h.runSync();
  assert.equal(h.remote.calls.length, 0, "the queued job never runs after disconnecting");
  assert.equal(await stateOf(h, s, c.id), "local_only");
  assert.equal(((await (await h.get(s, "/api/contacts")).json()) as { total: number }).total, 1, "the contact is still here");
  await addContact(h, s, "After");
  assert.equal((await h.sql("SELECT 1 FROM contact_sync_jobs WHERE status = 'pending'")).length, 0);
  assert.ok((await h.store.listAudit({ action: "google_contacts.disconnect", limit: 5, offset: 0 })).length > 0);
}));

test("Sync now backfills contacts saved before connecting, only the caller's own, and needs a connection", () => withH(async h => {
  const s = await h.login("c9", "c9@x.com");
  const other = await h.login("c9-other", "c9o@x.com");
  await addContact(h, s, "Old 1"); await addContact(h, s, "Old 2"); await addContact(h, other, "Not mine");
  assert.equal((await h.send(s, "/api/google-contacts/sync-now", {})).status, 409, "not connected");
  await h.connectContacts(s, { sub: "c9", email: "c9@x.com", accessToken: "at-c9" });
  assert.deepEqual(await (await h.send(s, "/api/google-contacts/sync-now", {})).json(), { queued: 2 });
  assert.deepEqual(await (await h.send(s, "/api/google-contacts/sync-now", {})).json(), { queued: 0 }, "repeating it queues nothing new");
  await h.runSync();
  assert.deepEqual(h.remote.calls.map(x => x.name).sort(), ["Old 1", "Old 2"]);
  const st = await status(h, s);
  assert.deepEqual([st.counts.total, st.counts.synced, st.counts.pending], [2, 2, 0]);
}));

test("a conflict on Google's side is flagged for the user and never retried or overwritten", () => withH(async h => {
  const s = await connected(h, "c10");
  const c = await addContact(h, s, "Conflicted");
  await h.runSync();
  await h.send(s, `/api/contacts/${c.id}`, { notes: "changed here" }, "PATCH");
  h.remote.fail = () => new PeopleApiError("conflict", "412");
  await h.runSync();
  assert.equal(await stateOf(h, s, c.id), "conflict");
  h.remote.fail = null;
  assert.deepEqual(await (await h.send(s, "/api/google-contacts/sync-now", {})).json(), { queued: 0 }, "conflicts wait for the user's decision");
  assert.equal(h.remote.calls.filter(x => x.op === "update").length, 0);
}));

test("a Google outage backs off and recovers by itself", () => withH(async h => {
  const s = await connected(h, "c11");
  const c = await addContact(h, s, "Patient");
  h.remote.fail = () => new PeopleApiError("transient", "503");
  await h.runSync();
  assert.equal(await stateOf(h, s, c.id), "pending", "still pending, not failed");
  assert.equal((await h.runSync()).processed, 0, "backing off: not retried immediately");
  h.remote.fail = null;
  h.advance(3700_000);
  await h.runSync();
  assert.equal(await stateOf(h, s, c.id), "synced");
}));

test("sync endpoints need a session, a CSRF token, and only accept booleans", () => withH(async h => {
  for (const [m, p] of [["GET", "/api/google-contacts/status"], ["POST", "/api/google-contacts/connect"], ["POST", "/api/google-contacts/disconnect"], ["POST", "/api/google-contacts/sync-now"], ["PATCH", "/api/google-contacts/settings"]] as const)
    assert.equal((await fetch(`${h.base}${p}`, { method: m })).status, 401, p);
  const s = await h.login("c12", "c12@x.com");
  assert.equal((await fetch(`${h.base}/api/google-contacts/disconnect`, { method: "POST", headers: { cookie: s.cookie, origin: "https://vcf.example.com" } })).status, 403, "no CSRF token");
  assert.equal((await h.send(s, "/api/google-contacts/settings", { paused: "yes" }, "PATCH")).status, 400);
  assert.equal((await h.send(s, "/api/google-contacts/settings", { userId: "x" }, "PATCH")).status, 400);
}));
