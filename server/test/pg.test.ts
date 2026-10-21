import { test } from "node:test";
import assert from "node:assert/strict";
import { PgStore } from "../src/store/pg.ts";
import { DuplicateError } from "../src/store/types.ts";
import type { Db, Queryable, Row } from "../src/store/db.ts";

/**
 * Recording fake: these tests check the SHAPE of the SQL (ownership scoping, bound parameters, idempotency,
 * unique-violation mapping). They do NOT prove the SQL runs on PostgreSQL: that needs a real database.
 */
interface Call { text: string; params: unknown[] }
function fakeDb(respond: (text: string, params: unknown[]) => { rows?: Row[]; rowCount?: number } | Error = () => ({})) {
  const calls: Call[] = [];
  const q: Queryable = {
    async query(text, params = []) {
      calls.push({ text, params });
      const r = respond(text, params);
      if (r instanceof Error) throw r;
      return { rows: r.rows ?? [], rowCount: r.rowCount ?? (r.rows?.length ?? 0) };
    },
  };
  const db: Db = { ...q, async transaction(fn) { calls.push({ text: "BEGIN", params: [] }); const out = await fn(q); calls.push({ text: "COMMIT", params: [] }); return out; }, async close() {} };
  return { db, calls };
}
const uniqueViolation = () => Object.assign(new Error("duplicate key"), { code: "23505" });
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const UID = "11111111-1111-1111-1111-111111111111";
const CID = "22222222-2222-2222-2222-222222222222";

test("contacts: every read and write is scoped by user_id (anti-IDOR at the SQL level)", async () => {
  const { db, calls } = fakeDb();
  const s = new PgStore(db);
  await s.getContact(UID, CID);
  await s.updateContact(UID, CID, { fullName: "X", phone: "+33612345678" });
  await s.deleteContact(UID, CID);
  await s.allContacts(UID);
  await s.listContacts(UID, { q: "am", limit: 10, offset: 0 });
  assert.equal(calls.length, 6, "list = rows + count");
  for (const c of calls) {
    assert.match(c.text, /user_id = \$1/, c.text.slice(0, 60));
    assert.equal(c.params[0], UID);
    assert.match(c.text, /deleted_at IS NULL/);
  }
  assert.deepEqual(calls[0]!.params, [UID, CID]);
});

test("SQL injection: hostile input only ever appears in bound parameters, never in the query text", async () => {
  const evil = "x'; DROP TABLE users; --";
  const contactRow = { id: CID, user_id: UID, full_name: "n", phone_e164: null, emails: [], organization: null, job_title: null, notes: null, sync_state: "local_only", created_ms: "1", updated_ms: "1" };
  const run = async (name: string, phone: string, q: string, code: string, key: string) => {
    const { db, calls } = fakeDb(text => (/RETURNING/.test(text) && /contacts/.test(text) ? { rows: [contactRow] } : {}));
    const s = new PgStore(db);
    await s.createContact(UID, { fullName: name, emails: [], phone });
    await s.updateContact(UID, CID, { fullName: name, notes: name });
    await s.listContacts(UID, { q, limit: 5, offset: 0 });
    await s.findUserBySub(key);
    await s.findUserByPseudonym(name);
    await s.findUserIdByReferralCode(code);
    await s.getSetting(key);
    await s.takePending(key);
    await s.addXp({ userId: UID, amount: 1, reason: name, key, at: 1 });
    return calls;
  };
  const evilCalls = await run(evil, evil, evil, evil, evil);
  const okCalls = await run("Amina", "+33612345678", "am", "ABCDEFGHIJ", "key-1");
  assert.equal(evilCalls.length, okCalls.length);
  evilCalls.forEach((c, i) => {
    assert.equal(norm(c.text), norm(okCalls[i]!.text), "query text must not depend on user input");
    assert.ok(!c.text.includes("DROP TABLE"));
  });
  assert.ok(evilCalls.some(c => c.params.includes(evil)), "the evil string travels as a parameter");
});

test("LIKE wildcards in search are escaped so users cannot scan with % or _", async () => {
  const { db, calls } = fakeDb();
  await new PgStore(db).listContacts(UID, { q: "50%_off\\", limit: 5, offset: 0 });
  assert.equal(calls[0]!.params[1], "%50\\%\\_off\\\\%");
  assert.match(calls[0]!.text, /ESCAPE/);
});

test("update only touches whitelisted columns, whatever keys the caller passes", async () => {
  const { db, calls } = fakeDb();
  await new PgStore(db).updateContact(UID, CID, { fullName: "A", ["user_id = 'x'; --" as never]: "evil", ["id" as never]: "other" } as never);
  const text = norm(calls[0]!.text);
  assert.match(text, /^UPDATE contacts SET full_name = \$3, updated_at = now\(\) WHERE user_id = \$1 AND id = \$2/);
  assert.ok(!text.includes("evil") && !text.includes("DROP"));
});

test("unique violations become DuplicateError (phone, pseudonym, referral, join, open payout)", async () => {
  const { db } = fakeDb(() => uniqueViolation());
  const s = new PgStore(db);
  await assert.rejects(s.createContact(UID, { fullName: "A", emails: [], phone: "+33612345678" }), DuplicateError);
  await assert.rejects(s.updateContact(UID, CID, { phone: "+33612345678" }), DuplicateError);
  await assert.rejects(s.createReferral({ id: CID, referrerId: UID, referredId: CID, status: "pending", networkHash: "ab", createdAt: 1 }), DuplicateError);
  await assert.rejects(s.joinChallenge({ challengeId: CID, userId: UID, joinedAt: 1 }), DuplicateError);
  await assert.rejects(s.saveUser({ id: UID, googleSub: "g", email: "a@b.co", name: "A", language: "en", dialCode: "", status: "active", roles: [], createdAt: 1, phone: "+33612345678" }), DuplicateError);
  await assert.rejects(s.savePayout({ id: CID, userId: UID, amountCents: 1500, status: "pending", maskedHint: "h", idempotencyKey: "k" }), DuplicateError);
});

test("other database errors are not swallowed", async () => {
  const { db } = fakeDb(() => Object.assign(new Error("connection lost"), { code: "08006" }));
  await assert.rejects(new PgStore(db).createContact(UID, { fullName: "A", emails: [] }), /connection lost/);
});

test("ledger, XP, events and claims are insert-only with ON CONFLICT on their idempotency key", async () => {
  const { db, calls } = fakeDb(() => ({ rowCount: 0 }));
  const s = new PgStore(db);
  await s.addLedger({ id: "1", userId: UID, type: "earn", amountCents: 1, idempotencyKey: `referral:${CID}` });
  const added = await s.addXp({ userId: UID, amount: 10, reason: "r", key: "xp:1", at: 1 });
  const ev = await s.addEvent({ userId: UID, type: "active_days", at: 1, key: "act:1" });
  await s.addRewardClaim({ id: CID, userId: UID, source: "challenge:x", kind: "premium", status: "pending", createdAt: 1 });
  assert.equal(added, false, "replayed XP key reports no insert");
  assert.equal(ev, false);
  assert.match(calls[0]!.text, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
  assert.match(calls[1]!.text, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
  assert.match(calls[2]!.text, /ON CONFLICT \(user_id, event_key\) DO NOTHING/);
  assert.match(calls[3]!.text, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
  for (const c of calls) assert.ok(!/\b(UPDATE|DELETE)\b/i.test(c.text), "no UPDATE/DELETE on append-only tables");
});

test("ledger entries tied to a payout carry its id; a fresh payout also writes status history in one transaction", async () => {
  const { db, calls } = fakeDb(text => (text.startsWith("SELECT status") ? { rows: [] } : {}));
  const s = new PgStore(db);
  await s.addLedger({ id: "1", userId: UID, type: "reserve", amountCents: 1500, idempotencyKey: `reserve:${CID}` });
  assert.equal(calls[0]!.params[3], CID);
  calls.length = 0;
  await s.savePayout({ id: CID, userId: UID, amountCents: 1500, status: "pending", maskedHint: "h", methodKind: "paypal", snapshotEnc: "v1:x", idempotencyKey: "k-1" });
  assert.deepEqual(calls.map(c => c.text.split(" ")[0]), ["BEGIN", "SELECT", "INSERT", "INSERT", "COMMIT"]);
  assert.match(calls[1]!.text, /FOR UPDATE/);
});

test("payout status change writes history only when the status actually changed", async () => {
  const mk = (prev: string) => fakeDb(text => (text.startsWith("SELECT status") ? { rows: [{ status: prev }] } : {}));
  const a = mk("in_progress");
  await new PgStore(a.db).savePayout({ id: CID, userId: UID, amountCents: 1500, status: "paid", maskedHint: "h", txReference: "PP-1" });
  assert.ok(a.calls.some(c => /payout_status_history/.test(c.text)));
  const b = mk("pending");
  await new PgStore(b.db).savePayout({ id: CID, userId: UID, amountCents: 1500, status: "pending", maskedHint: "h" });
  assert.ok(!b.calls.some(c => /payout_status_history/.test(c.text)));
});

test("OAuth pending state is consumed with DELETE ... RETURNING and expiry is enforced", async () => {
  const fresh = fakeDb(() => ({ rows: [{ nonce: "n", code_verifier: "v", next_path: "/app", ref_code: null, exp_ms: String(Date.now() + 60_000) }] }));
  const got = await new PgStore(fresh.db).takePending("state-1");
  assert.match(fresh.calls[0]!.text, /DELETE FROM oauth_pending WHERE state = \$1 RETURNING/);
  assert.deepEqual([got?.nonce, got?.next], ["n", "/app"]);
  const stale = fakeDb(() => ({ rows: [{ nonce: "n", code_verifier: "v", next_path: "/app", ref_code: null, exp_ms: String(Date.now() - 1) }] }));
  assert.equal(await new PgStore(stale.db).takePending("s"), null);
  assert.equal(await new PgStore(fakeDb().db).takePending("missing"), null);
});

test("sessions store only the hash, as bytea decoded from hex", async () => {
  const { db, calls } = fakeDb();
  await new PgStore(db).createSession({ idHash: "ab".repeat(32), userId: UID, createdAt: 1, rotatedAt: 1, expiresAt: 2, lastSeenAt: 1, revokedAt: null });
  assert.match(calls[0]!.text, /decode\(\$1, 'hex'\)/);
  assert.equal(calls[0]!.params[0], "ab".repeat(32));
});

test("row mapping: bigint strings become numbers, nulls become absent fields", async () => {
  const { db } = fakeDb(() => ({ rows: [{ id: CID, user_id: UID, full_name: "Amina", phone_e164: "+33612345678", emails: ["a@b.co"], organization: null, job_title: null, notes: null, sync_state: "local_only", created_ms: "1700000000000", updated_ms: "1700000001000" }] }));
  const c = await new PgStore(db).getContact(UID, CID);
  assert.deepEqual(c, { id: CID, userId: UID, fullName: "Amina", phone: "+33612345678", emails: ["a@b.co"], syncState: "local_only", createdAt: 1700000000000, updatedAt: 1700000001000 });
});

test("users: non-active database statuses are treated as suspended; roles and opt-in are mapped", async () => {
  const row = { id: UID, display_name: "A", email: "a@b.co", language: "fr", dial_code: "", phone_e164: null, pseudonym: "Lion", status: "pending_deletion", created_ms: "5", google_sub: "g1", opt_in: true, roles: ["finance_manager"] };
  const u = await new PgStore(fakeDb(() => ({ rows: [row] })).db).getUser(UID);
  assert.deepEqual([u?.status, u?.roles, u?.leaderboardOptIn, u?.pseudonym, u?.googleSub], ["suspended", ["finance_manager"], true, "Lion", "g1"]);
});

test("challenge rows map the JSON rule and text terms back to the domain shape", async () => {
  const row = { id: CID, slug: "s", title: { en: "T" }, description: { en: "D" }, difficulty: "elite", starts_ms: "1", ends_ms: "2", rule: { metric: "active_days", threshold: 20 }, reward_type: "cash",
    reward_cents: 500, reward_xp: null, max_winners: 3, budget_cents: 1500, deadline_ms: null, terms_text: "terms", published: true };
  const c = await new PgStore(fakeDb(() => ({ rows: [row] })).db).getChallenge(CID);
  assert.deepEqual([c?.metric, c?.threshold, c?.rewardCents, c?.maxWinners, c?.budgetCents, c?.rewardXp, c?.claimDeadline, c?.terms], ["active_days", 20, 500, 3, 1500, undefined, undefined, "terms"]);
});

test("sync: a job is claimed atomically (only one worker can win), inserted idempotently, and stale ones are re-queued", async () => {
  const win = fakeDb(() => ({ rowCount: 1 }));
  const lose = fakeDb(() => ({ rowCount: 0 }));
  assert.equal(await new PgStore(win.db).claimSyncJob(CID), true);
  assert.equal(await new PgStore(lose.db).claimSyncJob(CID), false, "second worker gets nothing");
  assert.match(win.calls[0]!.text, /UPDATE contact_sync_jobs SET status = 'running'.* WHERE id = \$1 AND status = 'pending'/);
  const ins = fakeDb();
  await new PgStore(ins.db).insertSyncJob({ id: CID, userId: UID, contactId: CID, operation: "create", status: "pending", attempts: 0, nextAttemptAt: 1, idempotencyKey: `${CID}:1` });
  assert.match(ins.calls[0]!.text, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
  const stale = fakeDb(() => ({ rowCount: 2 }));
  assert.equal(await new PgStore(stale.db).requeueStaleSyncJobs(600_000), 2);
  assert.match(stale.calls[0]!.text, /SET status = 'pending'.* WHERE status = 'running' AND updated_at < \$1/);
});

test("sync: contact sync results and counts are scoped by user_id; a sync result does not count as a user edit", async () => {
  const { db, calls } = fakeDb();
  const s = new PgStore(db);
  await s.setContactSync(UID, CID, { state: "synced", resourceName: "people/c1", etag: "e" });
  await s.syncCounts(UID);
  const set = norm(calls[0]!.text);
  assert.match(set, /WHERE user_id = \$1 AND id = \$2 AND deleted_at IS NULL/);
  assert.ok(!/updated_at/.test(set), "updated_at untouched so the contact is not re-queued by its own sync");
  assert.match(calls[1]!.text, /WHERE user_id = \$1/);
});

test("Google tokens live on the user's own oauth_accounts row, written and read by user_id only", async () => {
  const { db, calls } = fakeDb(() => ({ rows: [{ contacts_status: "connected", refresh_token_enc: "v1:r", access_token_enc: "v1:a", exp_ms: "99" }] }));
  const s = new PgStore(db);
  const c = await s.getConnection(UID);
  await s.saveConnection(UID, { status: "revoked" });
  assert.deepEqual(c, { status: "connected", refreshTokenEnc: "v1:r", accessTokenEnc: "v1:a", accessExpiresAt: 99 });
  assert.match(calls[0]!.text, /WHERE user_id = \$1 AND provider = 'google'/);
  assert.match(calls[1]!.text, /WHERE user_id = \$1 AND provider = 'google'/);
  assert.deepEqual(calls[1]!.params, [UID, "revoked", null, null, null], "revoking drops both tokens");
});

test("pending OAuth keeps the purpose and the bound user, so a Contacts callback cannot be replayed by someone else", async () => {
  const { db, calls } = fakeDb(() => ({ rows: [{ nonce: "n", code_verifier: "v", next_path: "/app/#/sync", ref_code: null, purpose: "contacts", user_id: UID, exp_ms: String(Date.now() + 60_000) }] }));
  const s = new PgStore(db);
  const p = await s.takePending("st");
  assert.deepEqual([p?.purpose, p?.userId], ["contacts", UID]);
  await s.putPending("st2", { nonce: "n", codeVerifier: "v", next: "/app/#/sync", expiresAt: 1, purpose: "contacts", userId: UID });
  assert.deepEqual(calls[1]!.params.slice(-2), ["contacts", UID]);
});
