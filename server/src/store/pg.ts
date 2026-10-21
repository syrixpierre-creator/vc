import type { Db, Queryable, Row } from "./db.ts";
import type { Store, User, Contact, SessionRec, Payout, LedgerRow, AuditRow, PendingOAuth, Referral, ReferralStatus, PayoutMethod,
  ChallengeRec, Participation, EventRow, XpRow, RewardClaimRow, GoogleConn, SyncSettings, SyncCounts, ConnStatus } from "./types.ts";
import type { SyncJob, JobStatus } from "../sync/engine.ts";
import { DuplicateError } from "./types.ts";
import type { PayoutStatus } from "../domain/payout.ts";
import type { Role } from "../auth/rbac.ts";
import type { Metric } from "../domain/challenges.ts";

/**
 * PostgreSQL implementation of Store.
 * Safety rules kept here: every value goes through bound parameters (never string-built SQL),
 * every contact query is scoped by user_id, ledgers are insert-only with ON CONFLICT on the idempotency key.
 * NOTE: not yet run against a live database; query shapes are covered by tests with a recording fake.
 */
const ms = (col: string) => `(extract(epoch from ${col}) * 1000)::bigint`;
const n = (v: unknown) => Number(v);
const opt = <T>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);
const isUnique = (e: unknown) => typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";
const uniqueOr = async <T>(fn: () => Promise<T>, msg: string): Promise<T> => { try { return await fn(); } catch (e) { if (isUnique(e)) throw new DuplicateError(msg); throw e; } };
const escapeLike = (s: string) => s.replace(/[\\%_]/g, c => `\\${c}`);

const USER_SQL = `
  SELECT u.id, u.display_name, u.email::text AS email, u.language, COALESCE(u.dial_code, '') AS dial_code, u.phone_e164, u.pseudonym, u.status,
         ${ms("u.created_at")} AS created_ms, oa.provider_subject AS google_sub,
         COALESCE(us.leaderboard_opt_in, false) AS opt_in,
         COALESCE((SELECT array_agg(ar.role) FROM admin_roles ar WHERE ar.user_id = u.id), '{}') AS roles
  FROM users u
  JOIN oauth_accounts oa ON oa.user_id = u.id AND oa.provider = 'google'
  LEFT JOIN user_settings us ON us.user_id = u.id`;

function mapUser(r: Row): User {
  const u: User = { id: r.id, googleSub: r.google_sub, email: r.email, name: r.display_name, language: r.language, dialCode: r.dial_code,
    status: r.status === "active" ? "active" : "suspended", roles: (r.roles ?? []) as Role[], createdAt: n(r.created_ms), leaderboardOptIn: !!r.opt_in };
  if (r.phone_e164) u.phone = r.phone_e164;
  if (r.pseudonym) u.pseudonym = r.pseudonym;
  return u;
}

const CONTACT_COLS = `id, user_id, full_name, phone_e164, emails, organization, job_title, notes, sync_state, google_resource_name, google_etag, ${ms("created_at")} AS created_ms, ${ms("updated_at")} AS updated_ms`;
function mapContact(r: Row): Contact {
  const c: Contact = { id: r.id, userId: r.user_id, fullName: r.full_name, emails: r.emails ?? [], syncState: r.sync_state, createdAt: n(r.created_ms), updatedAt: n(r.updated_ms) };
  if (r.phone_e164) c.phone = r.phone_e164;
  if (r.organization) c.organization = r.organization;
  if (r.job_title) c.title = r.job_title;
  if (r.notes) c.notes = r.notes;
  if (r.google_resource_name) c.googleResourceName = r.google_resource_name;
  if (r.google_etag) c.googleEtag = r.google_etag;
  return c;
}
const CONTACT_PATCH_COLUMNS: Record<string, string> = { fullName: "full_name", phone: "phone_e164", emails: "emails", organization: "organization", title: "job_title", notes: "notes", syncState: "sync_state" };

const PAYOUT_COLS = `id, user_id, amount_cents, status, masked_hint, tx_reference, admin_notes, method_kind, recipient_snapshot_enc, idempotency_key, ${ms("created_at")} AS created_ms`;
function mapPayout(r: Row): Payout {
  const p: Payout = { id: r.id, userId: r.user_id, amountCents: n(r.amount_cents), status: r.status as PayoutStatus, maskedHint: r.masked_hint, methodKind: r.method_kind,
    snapshotEnc: r.recipient_snapshot_enc, idempotencyKey: r.idempotency_key, createdAt: n(r.created_ms) };
  if (r.tx_reference) p.txReference = r.tx_reference;
  if (r.admin_notes) p.adminNotes = r.admin_notes;
  return p;
}

function mapReferral(r: Row): Referral {
  const x: Referral = { id: r.id, referrerId: r.referrer_id, referredId: r.referred_id, status: r.status as ReferralStatus, networkHash: r.network_hex ?? "", createdAt: n(r.created_ms) };
  if (r.disqualified_reason) x.reason = r.disqualified_reason;
  if (r.qualified_ms) x.qualifiedAt = n(r.qualified_ms);
  return x;
}
const REFERRAL_COLS = `id, referrer_id, referred_id, status, disqualified_reason, encode(network_hash, 'hex') AS network_hex, ${ms("created_at")} AS created_ms, ${ms("qualified_at")} AS qualified_ms`;

const CHALLENGE_COLS = `id, slug, title, description, difficulty, ${ms("starts_at")} AS starts_ms, ${ms("ends_at")} AS ends_ms, rule, reward_type, reward_cents, reward_xp,
  max_winners, budget_cents, ${ms("claim_deadline")} AS deadline_ms, terms #>> '{}' AS terms_text, published`;
function mapChallenge(r: Row): ChallengeRec {
  const c: ChallengeRec = { id: r.id, slug: r.slug, title: r.title, description: r.description, difficulty: r.difficulty, startsAt: n(r.starts_ms), endsAt: n(r.ends_ms),
    metric: r.rule.metric as Metric, threshold: n(r.rule.threshold), rewardType: r.reward_type, terms: r.terms_text ?? "", published: !!r.published };
  if (r.reward_cents !== null) c.rewardCents = n(r.reward_cents);
  if (r.reward_xp !== null) c.rewardXp = n(r.reward_xp);
  if (r.max_winners !== null) c.maxWinners = n(r.max_winners);
  if (r.budget_cents !== null) c.budgetCents = n(r.budget_cents);
  if (r.deadline_ms !== null) c.claimDeadline = n(r.deadline_ms);
  return c;
}
const PART_COLS = `challenge_id, user_id, ${ms("joined_at")} AS joined_ms, ${ms("completed_at")} AS completed_ms, ${ms("claimed_at")} AS claimed_ms, awarded_cents`;
function mapPart(r: Row): Participation {
  const p: Participation = { challengeId: r.challenge_id, userId: r.user_id, joinedAt: n(r.joined_ms), awardedCents: n(r.awarded_cents) };
  if (r.completed_ms !== null) p.completedAt = n(r.completed_ms);
  if (r.claimed_ms !== null) p.claimedAt = n(r.claimed_ms);
  return p;
}

export class PgStore implements Store {
  private db: Db;
  constructor(db: Db) { this.db = db; }

  async ping(): Promise<boolean> { const r = await this.db.query("SELECT 1 AS ok"); return r.rows[0]?.ok === 1; }

  /* ---- users ---- */
  async findUserBySub(sub: string) { const r = await this.db.query(`${USER_SQL} WHERE oa.provider_subject = $1`, [sub]); return r.rows[0] ? mapUser(r.rows[0]) : null; }
  async getUser(id: string) { const r = await this.db.query(`${USER_SQL} WHERE u.id = $1`, [id]); return r.rows[0] ? mapUser(r.rows[0]) : null; }
  async findUserByPhone(phone: string) { const r = await this.db.query(`${USER_SQL} WHERE u.phone_e164 = $1`, [phone]); return r.rows[0] ? mapUser(r.rows[0]) : null; }
  async findUserByPseudonym(name: string) { const r = await this.db.query(`${USER_SQL} WHERE lower(u.pseudonym) = lower($1)`, [name]); return r.rows[0] ? mapUser(r.rows[0]) : null; }

  async createUser(u: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = await this.db.transaction(async q => {
      const ins = await q.query("INSERT INTO users (display_name, email, language, dial_code, status) VALUES ($1, $2, $3, NULLIF($4, ''), 'active') RETURNING id", [u.name, u.email, u.language, u.dialCode]);
      const uid = ins.rows[0]!.id as string;
      await q.query("INSERT INTO oauth_accounts (user_id, provider, provider_subject) VALUES ($1, 'google', $2)", [uid, u.googleSub]);
      await q.query("INSERT INTO user_settings (user_id) VALUES ($1)", [uid]);
      return uid;
    });
    return (await this.getUser(id))!;
  }
  async saveUser(u: User): Promise<void> {
    await uniqueOr(() => this.db.transaction(async q => {
      await q.query("UPDATE users SET display_name = $2, email = $3, language = $4, dial_code = NULLIF($5, ''), phone_e164 = $6, pseudonym = $7, status = $8, updated_at = now() WHERE id = $1",
        [u.id, u.name, u.email, u.language, u.dialCode, u.phone ?? null, u.pseudonym ?? null, u.status]);
      await q.query("INSERT INTO user_settings (user_id, leaderboard_opt_in) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET leaderboard_opt_in = EXCLUDED.leaderboard_opt_in, updated_at = now()", [u.id, !!u.leaderboardOptIn]);
      await q.query("DELETE FROM admin_roles WHERE user_id = $1 AND NOT (role = ANY($2::text[]))", [u.id, u.roles]);
      await q.query("INSERT INTO admin_roles (user_id, role) SELECT $1, r FROM unnest($2::text[]) AS r ON CONFLICT DO NOTHING", [u.id, u.roles]);
    }), "phone or pseudonym already used");
  }

  async getSetting(key: string) { const r = await this.db.query("SELECT value #>> '{}' AS v FROM system_settings WHERE key = $1", [key]); return r.rows[0] ? (r.rows[0].v as string) : null; }
  async setSetting(key: string, value: string) {
    await this.db.query("INSERT INTO system_settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [key, JSON.stringify(value)]);
  }

  /* ---- OAuth login attempts (single use) ---- */
  async putPending(state: string, p: PendingOAuth) {
    await this.db.query("INSERT INTO oauth_pending (state, nonce, code_verifier, next_path, ref_code, expires_at, purpose, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [state, p.nonce, p.codeVerifier, p.next, p.ref ?? null, new Date(p.expiresAt), p.purpose ?? "login", p.userId ?? null]);
  }
  async takePending(state: string): Promise<PendingOAuth | null> {
    const r = await this.db.query(`DELETE FROM oauth_pending WHERE state = $1 RETURNING nonce, code_verifier, next_path, ref_code, purpose, user_id, ${ms("expires_at")} AS exp_ms`, [state]);
    const row = r.rows[0];
    if (!row || n(row.exp_ms) <= Date.now()) return null;
    const p: PendingOAuth = { nonce: row.nonce, codeVerifier: row.code_verifier, next: row.next_path, expiresAt: n(row.exp_ms) };
    if (row.ref_code) p.ref = row.ref_code;
    p.purpose = row.purpose === "contacts" ? "contacts" : "login";
    if (row.user_id) p.userId = row.user_id;
    return p;
  }

  /* ---- sessions (only the hash is stored) ---- */
  async createSession(s: SessionRec) {
    await this.db.query("INSERT INTO sessions (id_hash, user_id, created_at, rotated_at, expires_at, last_seen_at, revoked_at) VALUES (decode($1, 'hex'), $2, $3, $4, $5, $6, $7)",
      [s.idHash, s.userId, new Date(s.createdAt), new Date(s.rotatedAt), new Date(s.expiresAt), new Date(s.lastSeenAt), s.revokedAt === null ? null : new Date(s.revokedAt)]);
  }
  async getSession(idHash: string): Promise<SessionRec | null> {
    const r = await this.db.query(`SELECT encode(id_hash, 'hex') AS h, user_id, ${ms("created_at")} AS c, ${ms("rotated_at")} AS ro, ${ms("expires_at")} AS ex, ${ms("last_seen_at")} AS ls, ${ms("revoked_at")} AS rv FROM sessions WHERE id_hash = decode($1, 'hex')`, [idHash]);
    const x = r.rows[0];
    return x ? { idHash: x.h, userId: x.user_id, createdAt: n(x.c), rotatedAt: n(x.ro), expiresAt: n(x.ex), lastSeenAt: n(x.ls), revokedAt: x.rv === null ? null : n(x.rv) } : null;
  }
  async saveSession(s: SessionRec) {
    await this.db.query("UPDATE sessions SET rotated_at = $2, expires_at = $3, last_seen_at = $4, revoked_at = $5 WHERE id_hash = decode($1, 'hex')",
      [s.idHash, new Date(s.rotatedAt), new Date(s.expiresAt), new Date(s.lastSeenAt), s.revokedAt === null ? null : new Date(s.revokedAt)]);
  }

  /* ---- contacts: every statement is scoped by user_id ---- */
  async allContacts(userId: string) { const r = await this.db.query(`SELECT ${CONTACT_COLS} FROM contacts WHERE user_id = $1 AND deleted_at IS NULL ORDER BY lower(full_name)`, [userId]); return r.rows.map(mapContact); }
  async listContacts(userId: string, o: { q?: string; limit: number; offset: number }) {
    const like = o.q ? `%${escapeLike(o.q)}%` : null;
    const where = "user_id = $1 AND deleted_at IS NULL AND ($2::text IS NULL OR full_name ILIKE $2 ESCAPE '\\' OR phone_e164 LIKE $2 ESCAPE '\\')";
    const rows = await this.db.query(`SELECT ${CONTACT_COLS} FROM contacts WHERE ${where} ORDER BY lower(full_name) LIMIT $3 OFFSET $4`, [userId, like, o.limit, o.offset]);
    const total = await this.db.query(`SELECT count(*) AS c FROM contacts WHERE ${where}`, [userId, like]);
    return { rows: rows.rows.map(mapContact), total: n(total.rows[0]?.c ?? 0) };
  }
  async getContact(userId: string, id: string) { const r = await this.db.query(`SELECT ${CONTACT_COLS} FROM contacts WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL`, [userId, id]); return r.rows[0] ? mapContact(r.rows[0]) : null; }
  async createContact(userId: string, c: Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt" | "syncState">) {
    return uniqueOr(async () => {
      const r = await this.db.query(`INSERT INTO contacts (user_id, full_name, phone_e164, emails, organization, job_title, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${CONTACT_COLS}`,
        [userId, c.fullName, c.phone ?? null, c.emails, c.organization ?? null, c.title ?? null, c.notes ?? null]);
      return mapContact(r.rows[0]!);
    }, "duplicate phone");
  }
  async updateContact(userId: string, id: string, patch: Partial<Omit<Contact, "id" | "userId">>) {
    const sets: string[] = []; const params: unknown[] = [userId, id];
    for (const [k, col] of Object.entries(CONTACT_PATCH_COLUMNS)) { // column names come from this constant map, never from input
      if (k in patch) { params.push((patch as Record<string, unknown>)[k] ?? null); sets.push(`${col} = $${params.length}`); }
    }
    if (!sets.length) return this.getContact(userId, id);
    return uniqueOr(async () => {
      const r = await this.db.query(`UPDATE contacts SET ${sets.join(", ")}, updated_at = now() WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING ${CONTACT_COLS}`, params);
      return r.rows[0] ? mapContact(r.rows[0]) : null;
    }, "duplicate phone");
  }
  async deleteContact(userId: string, id: string) { const r = await this.db.query("UPDATE contacts SET deleted_at = now() WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL", [userId, id]); return r.rowCount > 0; }

  /* ---- money: insert-only ledger, idempotent ---- */
  async ledgerFor(userId: string): Promise<LedgerRow[]> {
    const r = await this.db.query("SELECT id, user_id, type, amount_cents, idempotency_key FROM reward_ledger WHERE user_id = $1 ORDER BY id", [userId]);
    return r.rows.map(x => ({ id: String(x.id), userId: x.user_id, type: x.type, amountCents: n(x.amount_cents), idempotencyKey: x.idempotency_key }));
  }
  async addLedger(row: LedgerRow) {
    const m = /^(?:reserve|release|pay):([0-9a-f-]{36})$/.exec(row.idempotencyKey);
    await this.db.query("INSERT INTO reward_ledger (user_id, type, amount_cents, payout_id, idempotency_key) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (idempotency_key) DO NOTHING",
      [row.userId, row.type, row.amountCents, m ? m[1] : null, row.idempotencyKey]);
  }
  async globalEarnedCents() { const r = await this.db.query("SELECT COALESCE(SUM(amount_cents), 0) AS s FROM reward_ledger WHERE type = 'earn'"); return n(r.rows[0]?.s ?? 0); }

  async addPayoutMethod(m: PayoutMethod) {
    await this.db.query("INSERT INTO payout_methods (id, user_id, kind, recipient_name, details_enc, masked_hint) VALUES ($1, $2, $3, $4, $5, $6)", [m.id, m.userId, m.kind, m.recipientName ?? null, m.detailsEnc, m.maskedHint]);
  }
  private mapMethod(r: Row): PayoutMethod { const m: PayoutMethod = { id: r.id, userId: r.user_id, kind: r.kind, detailsEnc: r.details_enc, maskedHint: r.masked_hint }; if (r.recipient_name) m.recipientName = r.recipient_name; return m; }
  async getPayoutMethod(userId: string, id: string) { const r = await this.db.query("SELECT * FROM payout_methods WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL", [userId, id]); return r.rows[0] ? this.mapMethod(r.rows[0]) : null; }
  async listPayoutMethods(userId: string) { const r = await this.db.query("SELECT * FROM payout_methods WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at", [userId]); return r.rows.map(x => this.mapMethod(x)); }

  async getPayout(id: string) { const r = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payout_requests WHERE id = $1`, [id]); return r.rows[0] ? mapPayout(r.rows[0]) : null; }
  async listPayoutsFor(userId: string) { const r = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payout_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`, [userId]); return r.rows.map(mapPayout); }
  async openPayoutFor(userId: string) { const r = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payout_requests WHERE user_id = $1 AND status IN ('pending','in_progress','action_required') LIMIT 1`, [userId]); return r.rows[0] ? mapPayout(r.rows[0]) : null; }
  async getPayoutByIdem(userId: string, key: string) { const r = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payout_requests WHERE user_id = $1 AND idempotency_key = $2`, [userId, key]); return r.rows[0] ? mapPayout(r.rows[0]) : null; }
  async listPayouts(status?: PayoutStatus) { const r = await this.db.query(`SELECT ${PAYOUT_COLS} FROM payout_requests WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC LIMIT 500`, [status ?? null]); return r.rows.map(mapPayout); }
  /** Insert or update; a second open request for the same user hits the partial unique index and becomes DuplicateError. */
  async savePayout(p: Payout) {
    await uniqueOr(() => this.db.transaction(async q => {
      const prev = await q.query("SELECT status FROM payout_requests WHERE id = $1 FOR UPDATE", [p.id]);
      if (!prev.rows[0]) {
        await q.query("INSERT INTO payout_requests (id, user_id, amount_cents, status, method_kind, recipient_snapshot_enc, masked_hint, idempotency_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [p.id, p.userId, p.amountCents, p.status, p.methodKind ?? null, p.snapshotEnc ?? null, p.maskedHint, p.idempotencyKey ?? null]);
        await q.query("INSERT INTO payout_status_history (payout_id, from_status, to_status, actor_id) VALUES ($1, NULL, $2, $3)", [p.id, p.status, p.userId]);
      } else {
        await q.query("UPDATE payout_requests SET status = $2, tx_reference = $3, admin_notes = $4, updated_at = now() WHERE id = $1", [p.id, p.status, p.txReference ?? null, p.adminNotes ?? null]);
        if (prev.rows[0].status !== p.status) await q.query("INSERT INTO payout_status_history (payout_id, from_status, to_status, reason) VALUES ($1, $2, $3, $4)", [p.id, prev.rows[0].status, p.status, p.adminNotes ?? null]);
      }
    }), "payout already open or duplicate request");
  }
  async addAudit(a: AuditRow) {
    await this.db.query("INSERT INTO admin_audit_logs (actor_id, action, resource_type, resource_id, from_value, to_value, reason, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)",
      [a.actorId, a.action, a.resourceType, a.resourceId, JSON.stringify(a.from ?? null), JSON.stringify(a.to ?? null), a.reason ?? null, new Date(a.at)]);
  }

  /* ---- referrals ---- */
  async getReferralCode(userId: string) { const r = await this.db.query("SELECT code FROM referral_codes WHERE user_id = $1", [userId]); return r.rows[0] ? (r.rows[0].code as string) : null; }
  async setReferralCode(userId: string, code: string) { await this.db.query("INSERT INTO referral_codes (user_id, code) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING", [userId, code]); }
  async findUserIdByReferralCode(code: string) { const r = await this.db.query("SELECT user_id FROM referral_codes WHERE code = $1", [code]); return r.rows[0] ? (r.rows[0].user_id as string) : null; }
  async createReferral(r: Referral) {
    await uniqueOr(() => this.db.query("INSERT INTO referrals (id, referrer_id, referred_id, status, network_hash, created_at) VALUES ($1, $2, $3, $4, decode($5, 'hex'), $6)",
      [r.id, r.referrerId, r.referredId, r.status, r.networkHash, new Date(r.createdAt)]), "already referred");
  }
  async getReferral(id: string) { const r = await this.db.query(`SELECT ${REFERRAL_COLS} FROM referrals WHERE id = $1`, [id]); return r.rows[0] ? mapReferral(r.rows[0]) : null; }
  async listReferralsByReferrer(userId: string) { const r = await this.db.query(`SELECT ${REFERRAL_COLS} FROM referrals WHERE referrer_id = $1`, [userId]); return r.rows.map(mapReferral); }
  async listReferralsByStatus(status: ReferralStatus) { const r = await this.db.query(`SELECT ${REFERRAL_COLS} FROM referrals WHERE status = $1 ORDER BY created_at LIMIT 1000`, [status]); return r.rows.map(mapReferral); }
  async saveReferral(r: Referral) {
    await this.db.query("UPDATE referrals SET status = $2, disqualified_reason = $3, qualified_at = $4 WHERE id = $1", [r.id, r.status, r.reason ?? null, r.qualifiedAt ? new Date(r.qualifiedAt) : null]);
  }
  async countByNetworkBetween(hash: string, from: number, to: number) {
    const r = await this.db.query("SELECT count(*) AS c FROM referrals WHERE network_hash = decode($1, 'hex') AND created_at BETWEEN $2 AND $3", [hash, new Date(from), new Date(to)]);
    return n(r.rows[0]?.c ?? 0);
  }

  /* ---- challenges, events, XP ---- */
  async saveChallenge(c: ChallengeRec) {
    await this.db.query(`INSERT INTO challenge_definitions (id, slug, title, description, difficulty, starts_at, ends_at, rule, reward_type, reward_cents, reward_xp, max_winners, budget_cents, claim_deadline, terms, published)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15::jsonb, $16)
      ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, starts_at = EXCLUDED.starts_at,
        ends_at = EXCLUDED.ends_at, rule = EXCLUDED.rule, reward_type = EXCLUDED.reward_type, reward_cents = EXCLUDED.reward_cents, reward_xp = EXCLUDED.reward_xp,
        max_winners = EXCLUDED.max_winners, budget_cents = EXCLUDED.budget_cents, claim_deadline = EXCLUDED.claim_deadline, terms = EXCLUDED.terms, published = EXCLUDED.published`,
      [c.id, c.slug, JSON.stringify(c.title), JSON.stringify(c.description), c.difficulty, new Date(c.startsAt), new Date(c.endsAt), JSON.stringify({ metric: c.metric, threshold: c.threshold }),
        c.rewardType, c.rewardCents ?? null, c.rewardXp ?? null, c.maxWinners ?? null, c.budgetCents ?? null, c.claimDeadline ? new Date(c.claimDeadline) : null, JSON.stringify(c.terms), c.published]);
  }
  async getChallenge(id: string) { const r = await this.db.query(`SELECT ${CHALLENGE_COLS} FROM challenge_definitions WHERE id = $1`, [id]); return r.rows[0] ? mapChallenge(r.rows[0]) : null; }
  async listChallenges(onlyPublished: boolean) { const r = await this.db.query(`SELECT ${CHALLENGE_COLS} FROM challenge_definitions WHERE ($1::boolean = false OR published) ORDER BY starts_at`, [onlyPublished]); return r.rows.map(mapChallenge); }
  async joinChallenge(p: Participation) { await uniqueOr(() => this.db.query("INSERT INTO challenge_participation (challenge_id, user_id, joined_at) VALUES ($1, $2, $3)", [p.challengeId, p.userId, new Date(p.joinedAt)]), "already joined"); }
  async getParticipation(challengeId: string, userId: string) { const r = await this.db.query(`SELECT ${PART_COLS} FROM challenge_participation WHERE challenge_id = $1 AND user_id = $2`, [challengeId, userId]); return r.rows[0] ? mapPart(r.rows[0]) : null; }
  async participationsOf(userId: string) { const r = await this.db.query(`SELECT ${PART_COLS} FROM challenge_participation WHERE user_id = $1`, [userId]); return r.rows.map(mapPart); }
  async participationsFor(challengeId: string) { const r = await this.db.query(`SELECT ${PART_COLS} FROM challenge_participation WHERE challenge_id = $1`, [challengeId]); return r.rows.map(mapPart); }
  async saveParticipation(p: Participation) {
    await this.db.query("UPDATE challenge_participation SET completed_at = $3, claimed_at = $4, awarded_cents = $5 WHERE challenge_id = $1 AND user_id = $2",
      [p.challengeId, p.userId, p.completedAt ? new Date(p.completedAt) : null, p.claimedAt ? new Date(p.claimedAt) : null, p.awardedCents ?? 0]);
  }
  async addEvent(e: EventRow) { const r = await this.db.query("INSERT INTO user_events (user_id, type, at, event_key) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, event_key) DO NOTHING", [e.userId, e.type, new Date(e.at), e.key]); return r.rowCount === 1; }
  async listEvents(userId: string): Promise<EventRow[]> { const r = await this.db.query(`SELECT user_id, type, ${ms("at")} AS at_ms, event_key FROM user_events WHERE user_id = $1`, [userId]); return r.rows.map(x => ({ userId: x.user_id, type: x.type as Metric, at: n(x.at_ms), key: x.event_key })); }
  async addXp(x: XpRow) { const r = await this.db.query("INSERT INTO user_xp_ledger (user_id, amount, reason, idempotency_key, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (idempotency_key) DO NOTHING", [x.userId, x.amount, x.reason, x.key, new Date(x.at)]); return r.rowCount === 1; }
  async xpRows(userId: string): Promise<XpRow[]> { const r = await this.db.query(`SELECT user_id, amount, reason, idempotency_key, ${ms("created_at")} AS at_ms FROM user_xp_ledger WHERE user_id = $1`, [userId]); return r.rows.map(x => ({ userId: x.user_id, amount: n(x.amount), reason: x.reason, key: x.idempotency_key, at: n(x.at_ms) })); }
  async xpRowsSince(since: number): Promise<XpRow[]> { const r = await this.db.query(`SELECT user_id, amount, reason, idempotency_key, ${ms("created_at")} AS at_ms FROM user_xp_ledger WHERE created_at >= $1`, [new Date(since)]); return r.rows.map(x => ({ userId: x.user_id, amount: n(x.amount), reason: x.reason, key: x.idempotency_key, at: n(x.at_ms) })); }
  async addRewardClaim(c: RewardClaimRow) {
    await this.db.query("INSERT INTO reward_claims (id, user_id, source, kind, status, idempotency_key, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (idempotency_key) DO NOTHING",
      [c.id, c.userId, c.source, c.kind, c.status, `${c.source}:${c.userId}:${c.kind}`, new Date(c.createdAt)]);
  }

  /* ---- Google Contacts connection, settings and sync jobs ---- */
  async getConnection(userId: string): Promise<GoogleConn> {
    const r = await this.db.query(`SELECT contacts_status, refresh_token_enc, access_token_enc, ${ms("access_expires_at")} AS exp_ms FROM oauth_accounts WHERE user_id = $1 AND provider = 'google'`, [userId]);
    const x = r.rows[0];
    if (!x) return { status: "not_connected" };
    const c: GoogleConn = { status: x.contacts_status as ConnStatus };
    if (x.refresh_token_enc) c.refreshTokenEnc = x.refresh_token_enc;
    if (x.access_token_enc) c.accessTokenEnc = x.access_token_enc;
    if (x.exp_ms !== null) c.accessExpiresAt = n(x.exp_ms);
    return c;
  }
  async saveConnection(userId: string, c: GoogleConn) {
    await this.db.query("UPDATE oauth_accounts SET contacts_status = $2, contacts_scope = ($2 = 'connected'), refresh_token_enc = $3, access_token_enc = $4, access_expires_at = $5, updated_at = now() WHERE user_id = $1 AND provider = 'google'",
      [userId, c.status, c.refreshTokenEnc ?? null, c.accessTokenEnc ?? null, c.accessExpiresAt ? new Date(c.accessExpiresAt) : null]);
  }
  async getSyncSettings(userId: string): Promise<SyncSettings> {
    const r = await this.db.query("SELECT auto_sync, sync_paused FROM user_settings WHERE user_id = $1", [userId]);
    return r.rows[0] ? { autoSync: !!r.rows[0].auto_sync, paused: !!r.rows[0].sync_paused } : { autoSync: true, paused: false };
  }
  async saveSyncSettings(userId: string, s: SyncSettings) {
    await this.db.query("INSERT INTO user_settings (user_id, auto_sync, sync_paused) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET auto_sync = EXCLUDED.auto_sync, sync_paused = EXCLUDED.sync_paused, updated_at = now()", [userId, s.autoSync, s.paused]);
  }
  /** A sync result is not a user edit: updated_at is left alone. */
  async setContactSync(userId: string, contactId: string, p: { state?: string; resourceName?: string; etag?: string }) {
    await this.db.query("UPDATE contacts SET sync_state = COALESCE($3, sync_state), google_resource_name = COALESCE($4, google_resource_name), google_etag = COALESCE($5, google_etag) WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL",
      [userId, contactId, p.state ?? null, p.resourceName ?? null, p.etag ?? null]);
  }
  async syncCounts(userId: string): Promise<SyncCounts> {
    const r = await this.db.query("SELECT sync_state, count(*) AS c FROM contacts WHERE user_id = $1 AND deleted_at IS NULL GROUP BY sync_state", [userId]);
    const by = new Map(r.rows.map(x => [x.sync_state as string, n(x.c)]));
    const total = [...by.values()].reduce((a, b) => a + b, 0);
    return { total, synced: by.get("synced") ?? 0, pending: by.get("pending") ?? 0, failed: by.get("failed") ?? 0, conflict: by.get("conflict") ?? 0 };
  }
  private mapJob(x: Row): SyncJob {
    const j: SyncJob = { id: x.id, userId: x.user_id, contactId: x.contact_id, operation: x.operation, status: x.status as JobStatus, attempts: n(x.attempts), nextAttemptAt: n(x.next_ms), idempotencyKey: x.idempotency_key };
    if (x.last_error) j.lastError = x.last_error;
    return j;
  }
  private static JOB_COLS = `id, user_id, contact_id, operation, status, attempts, ${ms("next_attempt_at")} AS next_ms, idempotency_key, last_error`;
  async insertSyncJob(j: SyncJob) {
    await this.db.query("INSERT INTO contact_sync_jobs (id, user_id, contact_id, operation, status, attempts, next_attempt_at, idempotency_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (idempotency_key) DO NOTHING",
      [j.id, j.userId, j.contactId, j.operation, j.status, j.attempts, new Date(j.nextAttemptAt), j.idempotencyKey]);
  }
  async findSyncJobByKey(key: string) { const r = await this.db.query(`SELECT ${PgStore.JOB_COLS} FROM contact_sync_jobs WHERE idempotency_key = $1`, [key]); return r.rows[0] ? this.mapJob(r.rows[0]) : null; }
  /** Atomic: exactly one worker wins a pending job. */
  async claimSyncJob(id: string) { const r = await this.db.query("UPDATE contact_sync_jobs SET status = 'running', updated_at = now() WHERE id = $1 AND status = 'pending'", [id]); return r.rowCount === 1; }
  async dueSyncJobs(now: number, limit: number) { const r = await this.db.query(`SELECT ${PgStore.JOB_COLS} FROM contact_sync_jobs WHERE status = 'pending' AND next_attempt_at <= $1 ORDER BY next_attempt_at LIMIT $2`, [new Date(now), limit]); return r.rows.map(x => this.mapJob(x)); }
  async saveSyncJob(j: SyncJob) {
    await this.db.query("UPDATE contact_sync_jobs SET status = $2, attempts = $3, next_attempt_at = $4, last_error = $5, updated_at = now() WHERE id = $1", [j.id, j.status, j.attempts, new Date(j.nextAttemptAt), j.lastError ?? null]);
  }
  async listSyncJobsFor(userId: string) { const r = await this.db.query(`SELECT ${PgStore.JOB_COLS} FROM contact_sync_jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500`, [userId]); return r.rows.map(x => this.mapJob(x)); }
  /** Jobs left 'running' by a crashed worker go back to pending. */
  async requeueStaleSyncJobs(olderThanMs: number) { const r = await this.db.query("UPDATE contact_sync_jobs SET status = 'pending', updated_at = now() WHERE status = 'running' AND updated_at < $1", [new Date(Date.now() - olderThanMs)]); return r.rowCount; }
  async addSyncLog(userId: string, outcome: string, at: number) { await this.db.query("INSERT INTO contact_sync_logs (user_id, outcome, created_at) VALUES ($1, $2, $3)", [userId, outcome, new Date(at)]); }
  async lastSyncAt(userId: string) { const r = await this.db.query(`SELECT ${ms("max(created_at)")} AS t FROM contact_sync_logs WHERE user_id = $1 AND outcome = 'synced'`, [userId]); return r.rows[0]?.t === null || r.rows[0]?.t === undefined ? null : n(r.rows[0].t); }
}

export type { Queryable };
