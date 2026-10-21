import type { Row } from "./db.ts";
import type { User, UserSettings, SessionRec, PendingOAuth, SecurityEvent, Restriction, RestrictionScope, UserListQuery, UserListRow, ConnStatus, ReviewStatus } from "./types.ts";
import type { Role } from "../auth/rbac.ts";
import { PgBase, ms, num, optMs, escapeLike, d } from "./pg-base.ts";

const USER_SQL = `
  SELECT u.id, u.display_name, u.email::text AS email, u.language, COALESCE(u.dial_code, '') AS dial_code, u.phone_e164, u.pseudonym, u.status,
         u.country_code, u.time_zone, u.avatar_url, u.review_status, u.review_reason, u.suspension_reason,
         ${ms("u.created_at")} AS created_ms, ${ms("u.onboarded_at")} AS onboarded_ms, ${ms("u.last_seen_at")} AS seen_ms,
         ${ms("u.suspended_until")} AS susp_ms, ${ms("u.deletion_requested_at")} AS del_ms, ${ms("u.premium_until")} AS prem_ms,
         oa.provider_subject AS google_sub, COALESCE(us.leaderboard_opt_in, false) AS opt_in,
         COALESCE((SELECT array_agg(ar.role ORDER BY ar.role) FROM admin_roles ar WHERE ar.user_id = u.id), '{}') AS roles
  FROM users u
  JOIN oauth_accounts oa ON oa.user_id = u.id AND oa.provider = 'google'
  LEFT JOIN user_settings us ON us.user_id = u.id`;

function mapUser(r: Row): User {
  const u: User = { id: r.id, googleSub: r.google_sub, email: r.email, name: r.display_name, language: r.language, dialCode: r.dial_code,
    status: r.status, roles: (r.roles ?? []) as Role[], createdAt: num(r.created_ms), leaderboardOptIn: !!r.opt_in, reviewStatus: r.review_status };
  if (r.phone_e164) u.phone = r.phone_e164;
  if (r.pseudonym) u.pseudonym = r.pseudonym;
  if (r.country_code) u.countryCode = r.country_code;
  if (r.time_zone) u.timeZone = r.time_zone;
  if (r.avatar_url) u.avatarUrl = r.avatar_url;
  if (r.review_reason) u.reviewReason = r.review_reason;
  if (r.suspension_reason) u.suspensionReason = r.suspension_reason;
  const o = optMs(r.onboarded_ms); if (o !== undefined) u.onboardedAt = o;
  const s = optMs(r.seen_ms); if (s !== undefined) u.lastSeenAt = s;
  const su = optMs(r.susp_ms); if (su !== undefined) u.suspendedUntil = su;
  const de = optMs(r.del_ms); if (de !== undefined) u.deletionRequestedAt = de;
  const pr = optMs(r.prem_ms); if (pr !== undefined) u.premiumUntil = pr;
  return u;
}

const SETTINGS_COLS: Record<keyof UserSettings, string> = {
  autoSync: "auto_sync", paused: "sync_paused", notifyEmailMarketing: "notify_email_marketing", notifyReminders: "notify_reminders",
  notifyInappProgress: "notify_inapp_progress", notifyEmailRewards: "notify_email_rewards", profilePublic: "profile_public", leaderboardOptIn: "leaderboard_opt_in", theme: "theme",
};
export const DEFAULT_SETTINGS: UserSettings = { autoSync: true, paused: false, notifyEmailMarketing: false, notifyReminders: false, notifyInappProgress: true, notifyEmailRewards: true, profilePublic: false, leaderboardOptIn: false, theme: "dark" };

export class PgUsers extends PgBase {
  async findUserBySub(sub: string) { const r = await this.one(`${USER_SQL} WHERE oa.provider_subject = $1`, [sub]); return r ? mapUser(r) : null; }
  async getUser(id: string) { const r = await this.one(`${USER_SQL} WHERE u.id = $1`, [id]); return r ? mapUser(r) : null; }
  async findUserByPhone(phone: string) { const r = await this.one(`${USER_SQL} WHERE u.phone_e164 = $1`, [phone]); return r ? mapUser(r) : null; }
  async findUserByPseudonym(name: string) { const r = await this.one(`${USER_SQL} WHERE lower(u.pseudonym) = lower($1)`, [name]); return r ? mapUser(r) : null; }
  async usersWithRole(): Promise<User[]> { return (await this.all(`${USER_SQL} WHERE EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = u.id) ORDER BY u.created_at`)).map(mapUser); }

  async createUser(u: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = await this.tx(async s => {
      const t = d(this.now());
      const ins = await s.one("INSERT INTO users (display_name, email, language, dial_code, status, avatar_url, created_at, updated_at, last_seen_at) VALUES ($1, $2, $3, NULLIF($4, ''), 'active', $5, $6, $6, $6) RETURNING id",
        [u.name, u.email, u.language, u.dialCode, u.avatarUrl ?? null, t]);
      const uid = ins!["id"] as string;
      await s.db.query("INSERT INTO oauth_accounts (user_id, provider, provider_subject, created_at) VALUES ($1, 'google', $2, $3)", [uid, u.googleSub, t]);
      await s.db.query("INSERT INTO user_settings (user_id) VALUES ($1)", [uid]);
      if (u.roles.length) await s.setRoles(uid, u.roles, null);
      return uid;
    });
    return (await this.getUser(id))!;
  }
  /** Profile fields only. Roles and status have their own audited methods. */
  async saveUser(u: User): Promise<void> {
    await this.uniqueOr(() => this.tx(async s => {
      await s.db.query(`UPDATE users SET display_name = $2, email = $3, language = $4, dial_code = NULLIF($5, ''), phone_e164 = $6, pseudonym = $7,
          country_code = $8, time_zone = $9, onboarded_at = $10, avatar_url = $11, updated_at = $12 WHERE id = $1`,
        [u.id, u.name, u.email, u.language, u.dialCode, u.phone ?? null, u.pseudonym ?? null, u.countryCode ?? null, u.timeZone ?? null, d(u.onboardedAt), u.avatarUrl ?? null, d(this.now())]);
      await s.db.query("INSERT INTO user_settings (user_id, leaderboard_opt_in) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET leaderboard_opt_in = EXCLUDED.leaderboard_opt_in, updated_at = now()", [u.id, !!u.leaderboardOptIn]);
    }), "phone or pseudonym already used");
  }
  async setRoles(userId: string, roles: readonly Role[], grantedBy: string | null) {
    await this.tx(async s => {
      await s.db.query("DELETE FROM admin_roles WHERE user_id = $1 AND NOT (role = ANY($2::text[]))", [userId, roles]);
      await s.db.query("INSERT INTO admin_roles (user_id, role, granted_by, created_at) SELECT $1, r, $3, $4 FROM unnest($2::text[]) AS r ON CONFLICT DO NOTHING", [userId, roles, grantedBy, d(this.now())]);
    });
  }
  async setUserStatus(userId: string, status: User["status"], o: { until?: number | null; reason?: string | null } = {}) {
    await this.db.query("UPDATE users SET status = $2, suspended_until = $3, suspension_reason = $4, updated_at = $5 WHERE id = $1",
      [userId, status, status === "suspended" ? d(o.until ?? null) : null, status === "suspended" ? (o.reason ?? null) : null, d(this.now())]);
  }
  async setReview(userId: string, status: ReviewStatus, reason: string | null) { await this.db.query("UPDATE users SET review_status = $2, review_reason = $3, updated_at = $4 WHERE id = $1", [userId, status, reason, d(this.now())]); }
  async setDeletionRequested(userId: string, at: number | null) {
    await this.db.query("UPDATE users SET deletion_requested_at = $2, status = CASE WHEN $2::timestamptz IS NULL THEN 'active' ELSE 'pending_deletion' END, updated_at = $3 WHERE id = $1", [userId, d(at), d(this.now())]);
  }
  async setPremiumUntil(userId: string, until: number) { await this.db.query("UPDATE users SET premium_until = GREATEST(COALESCE(premium_until, $2), $2) WHERE id = $1", [userId, d(until)]); }
  async touchUser(userId: string) { await this.db.query("UPDATE users SET last_seen_at = $2 WHERE id = $1 AND (last_seen_at IS NULL OR last_seen_at < $2::timestamptz - interval '5 minutes')", [userId, d(this.now())]); }
  async dueDeletions(before: number): Promise<string[]> { return (await this.all("SELECT id FROM users WHERE status = 'pending_deletion' AND deletion_requested_at <= $1 LIMIT 100", [d(before)])).map(r => r["id"] as string); }
  async listDeletionRequests() { return (await this.all(`${USER_SQL} WHERE u.status = 'pending_deletion' ORDER BY u.deletion_requested_at`)).map(mapUser); }

  /**
   * Account deletion: contacts, backups, labels, tokens, sessions, payout methods and personal fields are removed.
   * Financial history (ledger, payout requests with encrypted snapshots removed) and audit rows are kept, as required for accounting,
   * but no longer point to a name, e-mail or Google account.
   */
  async anonymizeUser(userId: string) {
    await this.tx(async s => {
      const t = d(this.now());
      for (const q of [
        "DELETE FROM contacts WHERE user_id = $1", "DELETE FROM contact_labels WHERE user_id = $1", "DELETE FROM contact_backups WHERE user_id = $1",
        "DELETE FROM contact_sync_logs WHERE user_id = $1", "DELETE FROM contact_change_history WHERE user_id = $1", "DELETE FROM contact_duplicate_dismissals WHERE user_id = $1",
        "DELETE FROM sessions WHERE user_id = $1", "DELETE FROM notifications WHERE user_id = $1", "DELETE FROM payout_methods WHERE user_id = $1",
        "DELETE FROM oauth_pending WHERE user_id = $1", "DELETE FROM admin_roles WHERE user_id = $1",
      ]) await s.db.query(q, [userId]);
      await s.db.query("UPDATE payout_requests SET recipient_snapshot_enc = 'erased', recipient_name = NULL WHERE user_id = $1 AND status IN ('paid','failed','rejected')", [userId]);
      await s.db.query("UPDATE oauth_accounts SET provider_subject = 'deleted:' || user_id::text, refresh_token_enc = NULL, access_token_enc = NULL, contacts_status = 'not_connected', updated_at = $2 WHERE user_id = $1", [userId, t]);
      await s.db.query(`UPDATE users SET display_name = 'Deleted user', email = 'deleted+' || id::text || '@invalid', phone_e164 = NULL, pseudonym = NULL, avatar_url = NULL,
          country_code = NULL, time_zone = NULL, status = 'deleted', updated_at = $2 WHERE id = $1`, [userId, t]);
      await s.db.query("UPDATE support_messages SET body = '[removed]' WHERE author_id = $1", [userId]);
      await s.db.query("UPDATE support_tickets SET subject = '[removed]', body = '[removed]', status = 'closed' WHERE user_id = $1", [userId]);
    });
  }

  /* ---- settings ---- */
  async getSettings(userId: string): Promise<UserSettings> {
    const r = await this.one("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
    if (!r) return { ...DEFAULT_SETTINGS };
    const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
    for (const [k, col] of Object.entries(SETTINGS_COLS)) if (r[col] !== undefined && r[col] !== null) out[k] = r[col];
    return out as unknown as UserSettings;
  }
  async saveSettings(userId: string, patch: Partial<UserSettings>) {
    const cols: string[] = []; const vals: unknown[] = [userId];
    for (const [k, col] of Object.entries(SETTINGS_COLS)) if (k in patch) { vals.push((patch as Record<string, unknown>)[k]); cols.push(col); } // column names come from the constant map
    if (!cols.length) return;
    const sets = cols.map((c, i) => `${c} = $${i + 2}`).join(", ");
    await this.db.query(`INSERT INTO user_settings (user_id, ${cols.join(", ")}) VALUES ($1, ${cols.map((_, i) => `$${i + 2}`).join(", ")}) ON CONFLICT (user_id) DO UPDATE SET ${sets}, updated_at = now()`, vals);
  }
  async getSyncSettings(userId: string) { const s = await this.getSettings(userId); return { autoSync: s.autoSync, paused: s.paused }; }
  async saveSyncSettings(userId: string, s: { autoSync: boolean; paused: boolean }) { await this.saveSettings(userId, s); }

  async getSetting(key: string) { const r = await this.one("SELECT value #>> '{}' AS v FROM system_settings WHERE key = $1", [key]); return r ? (r["v"] as string) : null; }
  async setSetting(key: string, value: string) {
    await this.db.query("INSERT INTO system_settings (key, value, updated_at) VALUES ($1, to_jsonb($2::text), $3) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at", [key, value, d(this.now())]);
  }
  async getJsonSetting<T>(key: string, fallback: T): Promise<T> { const r = await this.one("SELECT value FROM system_settings WHERE key = $1", [key]); return r ? (r["value"] as T) : fallback; }
  async setJsonSetting(key: string, value: unknown) {
    await this.db.query("INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2::jsonb, $3) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at", [key, JSON.stringify(value), d(this.now())]);
  }

  /* ---- OAuth login attempts (single use) ---- */
  async putPending(state: string, p: PendingOAuth) {
    await this.db.query("INSERT INTO oauth_pending (state, nonce, code_verifier, next_path, ref_code, expires_at, purpose, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [state, p.nonce, p.codeVerifier, p.next, p.ref ?? null, d(p.expiresAt), p.purpose ?? "login", p.userId ?? null]);
  }
  async takePending(state: string): Promise<PendingOAuth | null> {
    const row = await this.one(`DELETE FROM oauth_pending WHERE state = $1 RETURNING nonce, code_verifier, next_path, ref_code, purpose, user_id, ${ms("expires_at")} AS exp_ms`, [state]);
    if (!row || num(row["exp_ms"]) <= this.now()) return null;
    const p: PendingOAuth = { nonce: row["nonce"], codeVerifier: row["code_verifier"], next: row["next_path"], expiresAt: num(row["exp_ms"]), purpose: row["purpose"] === "contacts" ? "contacts" : "login" };
    if (row["ref_code"]) p.ref = row["ref_code"];
    if (row["user_id"]) p.userId = row["user_id"];
    return p;
  }
  async purgeExpiredPending() { return (await this.db.query("DELETE FROM oauth_pending WHERE expires_at < $1", [d(this.now())])).rowCount; }

  /* ---- sessions: only the SHA-256 of the cookie is stored ---- */
  async createSession(s: SessionRec) {
    await this.db.query("INSERT INTO sessions (id_hash, user_id, created_at, rotated_at, expires_at, last_seen_at, revoked_at, user_agent, ip_prefix, last_ip_prefix) VALUES (decode($1, 'hex'), $2, $3, $4, $5, $6, $7, $8, $9, $9)",
      [s.idHash, s.userId, d(s.createdAt), d(s.rotatedAt), d(s.expiresAt), d(s.lastSeenAt), d(s.revokedAt), s.userAgent ?? null, s.ipPrefix ?? null]);
  }
  private mapSession(x: Row): SessionRec {
    const s: SessionRec = { idHash: x["h"], userId: x["user_id"], createdAt: num(x["c"]), rotatedAt: num(x["ro"]), expiresAt: num(x["ex"]), lastSeenAt: num(x["ls"]), revokedAt: x["rv"] === null ? null : num(x["rv"]) };
    if (x["user_agent"]) s.userAgent = x["user_agent"];
    if (x["last_ip_prefix"]) s.ipPrefix = x["last_ip_prefix"];
    return s;
  }
  private static SESSION_COLS = `encode(id_hash, 'hex') AS h, user_id, ${ms("created_at")} AS c, ${ms("rotated_at")} AS ro, ${ms("expires_at")} AS ex, ${ms("last_seen_at")} AS ls, ${ms("revoked_at")} AS rv, user_agent, last_ip_prefix`;
  async getSession(idHash: string) { const r = await this.one(`SELECT ${PgUsers.SESSION_COLS} FROM sessions WHERE id_hash = decode($1, 'hex')`, [idHash]); return r ? this.mapSession(r) : null; }
  async saveSession(s: SessionRec) {
    await this.db.query("UPDATE sessions SET rotated_at = $2, expires_at = $3, last_seen_at = $4, revoked_at = $5, last_ip_prefix = COALESCE($6, last_ip_prefix) WHERE id_hash = decode($1, 'hex')",
      [s.idHash, d(s.rotatedAt), d(s.expiresAt), d(s.lastSeenAt), d(s.revokedAt), s.ipPrefix ?? null]);
  }
  async listSessions(userId: string): Promise<SessionRec[]> {
    return (await this.all(`SELECT ${PgUsers.SESSION_COLS} FROM sessions WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > $2 ORDER BY last_seen_at DESC LIMIT 50`, [userId, d(this.now())])).map(r => this.mapSession(r));
  }
  /** Revokes every live session of the user, except `keepHash` when given. Returns how many were revoked. */
  async revokeSessions(userId: string, keepHash?: string) {
    return (await this.db.query("UPDATE sessions SET revoked_at = $2 WHERE user_id = $1 AND revoked_at IS NULL AND ($3::text IS NULL OR id_hash <> decode($3, 'hex'))", [userId, d(this.now()), keepHash ?? null])).rowCount;
  }
  async revokeSessionByPrefix(userId: string, hashPrefix: string) {
    return (await this.db.query("UPDATE sessions SET revoked_at = $3 WHERE user_id = $1 AND revoked_at IS NULL AND left(encode(id_hash, 'hex'), 16) = $2", [userId, hashPrefix, d(this.now())])).rowCount;
  }
  async purgeOldSessions() { return (await this.db.query("DELETE FROM sessions WHERE expires_at < $1::timestamptz - interval '30 days' OR revoked_at < $1::timestamptz - interval '30 days'", [d(this.now())])).rowCount; }

  /* ---- security events ---- */
  async addSecurityEvent(e: SecurityEvent) {
    await this.db.query("INSERT INTO security_events (user_id, kind, detail, ip_prefix, created_at) VALUES ($1, $2, $3::jsonb, $4, $5)", [e.userId ?? null, e.kind, JSON.stringify(e.detail), e.ipPrefix ?? null, d(e.at)]);
  }
  async listSecurityEvents(o: { userId?: string; kind?: string; limit: number; offset?: number }): Promise<SecurityEvent[]> {
    const r = await this.all(`SELECT id, user_id, kind, detail, ip_prefix, ${ms("created_at")} AS at FROM security_events WHERE ($1::uuid IS NULL OR user_id = $1) AND ($2::text IS NULL OR kind = $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [o.userId ?? null, o.kind ?? null, o.limit, o.offset ?? 0]);
    return r.map(x => ({ id: num(x["id"]), ...(x["user_id"] ? { userId: x["user_id"] } : {}), kind: x["kind"], detail: x["detail"], ...(x["ip_prefix"] ? { ipPrefix: x["ip_prefix"] } : {}), at: num(x["at"]) }));
  }
  async countSecurityEventsSince(kind: string, since: number) { return num((await this.one("SELECT count(*) AS c FROM security_events WHERE kind = $1 AND created_at >= $2", [kind, d(since)]))?.["c"] ?? 0); }

  /* ---- restrictions ---- */
  private mapRestriction(x: Row): Restriction {
    const r: Restriction = { id: x["id"], userId: x["user_id"], scope: x["scope"], reason: x["reason"], adminId: x["admin_id"], startsAt: num(x["s"]) };
    const e = optMs(x["e"]); if (e !== undefined) r.expiresAt = e;
    const l = optMs(x["l"]); if (l !== undefined) r.liftedAt = l;
    return r;
  }
  async addRestriction(r: Omit<Restriction, "id" | "startsAt">): Promise<string> {
    const x = await this.one("INSERT INTO account_restrictions (user_id, scope, reason, admin_id, starts_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [r.userId, r.scope, r.reason, r.adminId, d(this.now()), d(r.expiresAt)]);
    return x!["id"] as string;
  }
  async liftRestriction(id: string, adminId: string, reason: string) {
    return (await this.db.query("UPDATE account_restrictions SET lifted_at = $2, lifted_by = $3, lift_reason = $4 WHERE id = $1 AND lifted_at IS NULL", [id, d(this.now()), adminId, reason])).rowCount > 0;
  }
  async getRestriction(id: string) { const x = await this.one(`SELECT *, ${ms("starts_at")} AS s, ${ms("expires_at")} AS e, ${ms("lifted_at")} AS l FROM account_restrictions WHERE id = $1`, [id]); return x ? this.mapRestriction(x) : null; }
  async listRestrictions(userId: string): Promise<Restriction[]> {
    return (await this.all(`SELECT *, ${ms("starts_at")} AS s, ${ms("expires_at")} AS e, ${ms("lifted_at")} AS l FROM account_restrictions WHERE user_id = $1 ORDER BY starts_at DESC`, [userId])).map(x => this.mapRestriction(x));
  }
  async activeRestrictions(userId: string): Promise<Set<RestrictionScope>> {
    const r = await this.all("SELECT DISTINCT scope FROM account_restrictions WHERE user_id = $1 AND lifted_at IS NULL AND (expires_at IS NULL OR expires_at > $2)", [userId, d(this.now())]);
    return new Set(r.map(x => x["scope"] as RestrictionScope));
  }

  /* ---- admin user directory (no contact contents: only counts) ---- */
  async listUsers(o: UserListQuery): Promise<{ rows: UserListRow[]; total: number }> {
    const like = o.q ? `%${escapeLike(o.q)}%` : null;
    const where = `u.status <> 'deleted' AND ($1::text IS NULL OR u.display_name ILIKE $1 ESCAPE '\\' OR u.email::text ILIKE $1 ESCAPE '\\' OR u.pseudonym ILIKE $1 ESCAPE '\\' OR u.id::text = $5)
      AND ($2::text IS NULL OR u.status = $2) AND ($3::text IS NULL OR u.review_status = $3)
      AND ($4::text IS NULL OR EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.user_id = u.id AND ($4 = 'any' OR ar.role = $4)))`;
    const order = { created: "u.created_at", "-created": "u.created_at DESC", name: "lower(u.display_name)", "-name": "lower(u.display_name) DESC", last_seen: "u.last_seen_at NULLS FIRST", "-last_seen": "u.last_seen_at DESC NULLS LAST" }[o.sort ?? "-created"];
    const params = [like, o.status ?? null, o.review ?? null, o.role ?? null, o.q ?? ""];
    const rows = await this.all(`
      SELECT u.id, u.display_name, u.email::text AS email, u.status, u.review_status, u.country_code, u.language, ${ms("u.created_at")} AS created_ms, ${ms("u.last_seen_at")} AS seen_ms,
        oa.contacts_status,
        (SELECT count(*) FROM contacts c WHERE c.user_id = u.id AND c.deleted_at IS NULL) AS contact_count,
        (SELECT count(*) FROM referrals r WHERE r.referrer_id = u.id AND r.status = 'qualified') AS qualified,
        (SELECT COALESCE(sum(amount), 0) FROM user_xp_ledger x WHERE x.user_id = u.id) AS xp,
        (SELECT COALESCE(sum(amount_cents), 0) FROM payout_requests p WHERE p.user_id = u.id AND p.status IN ('pending','in_progress','action_required')) AS pending_cents,
        (SELECT COALESCE(sum(amount_cents), 0) FROM payout_requests p WHERE p.user_id = u.id AND p.status = 'paid') AS paid_cents,
        COALESCE((SELECT array_agg(ar.role) FROM admin_roles ar WHERE ar.user_id = u.id), '{}') AS roles
      FROM users u JOIN oauth_accounts oa ON oa.user_id = u.id AND oa.provider = 'google'
      WHERE ${where} ORDER BY ${order} LIMIT $6 OFFSET $7`, [...params, o.limit, o.offset]);
    const total = num((await this.one(`SELECT count(*) AS c FROM users u WHERE ${where}`, params))?.["c"] ?? 0);
    return { total, rows: rows.map(x => ({ id: x["id"], name: x["display_name"], email: x["email"], status: x["status"], reviewStatus: x["review_status"], language: x["language"],
      ...(x["country_code"] ? { countryCode: x["country_code"] } : {}), createdAt: num(x["created_ms"]), ...(x["seen_ms"] !== null ? { lastSeenAt: num(x["seen_ms"]) } : {}),
      contactCount: num(x["contact_count"]), qualifiedReferrals: num(x["qualified"]), xp: num(x["xp"]), pendingCents: num(x["pending_cents"]), paidCents: num(x["paid_cents"]),
      roles: x["roles"] as Role[], contactsStatus: x["contacts_status"] as ConnStatus })) };
  }
}
