import type { Row } from "./db.ts";
import type { LedgerRow, Payout, PayoutHistoryRow, PayoutMethod, Referral, ReferralStatus, RewardClaimRow, ClaimStatus, FulfillmentRow, AuditRow } from "./types.ts";
import type { PayoutStatus } from "../domain/payout.ts";
import { PgSync } from "./pg-sync.ts";
import { ms, num, optMs, d } from "./pg-base.ts";

const PAYOUT_COLS = `p.id, p.user_id, p.amount_cents, p.status, p.masked_hint, p.tx_reference, p.admin_notes, p.method_kind, p.recipient_snapshot_enc, p.idempotency_key, p.source, p.reward_claim_id, p.recipient_name,
  ${ms("p.created_at")} AS created_ms, ${ms("p.updated_at")} AS updated_ms, ${ms("p.paid_at")} AS paid_ms`;
function mapPayout(r: Row): Payout {
  const p: Payout = { id: r.id, userId: r.user_id, amountCents: num(r.amount_cents), status: r.status as PayoutStatus, maskedHint: r.masked_hint, methodKind: r.method_kind,
    snapshotEnc: r.recipient_snapshot_enc, idempotencyKey: r.idempotency_key, createdAt: num(r.created_ms), updatedAt: num(r.updated_ms), source: r.source };
  if (r.tx_reference) p.txReference = r.tx_reference;
  if (r.admin_notes) p.adminNotes = r.admin_notes;
  if (r.reward_claim_id) p.rewardClaimId = r.reward_claim_id;
  if (r.recipient_name) p.recipientName = r.recipient_name;
  const pa = optMs(r.paid_ms); if (pa !== undefined) p.paidAt = pa;
  return p;
}
const REFERRAL_COLS = `id, referrer_id, referred_id, status, disqualified_reason, encode(network_hash, 'hex') AS network_hex, ${ms("created_at")} AS created_ms, ${ms("qualified_at")} AS qualified_ms`;
function mapReferral(r: Row): Referral {
  const x: Referral = { id: r.id, referrerId: r.referrer_id, referredId: r.referred_id, status: r.status as ReferralStatus, networkHash: r.network_hex ?? "", createdAt: num(r.created_ms) };
  if (r.disqualified_reason) x.reason = r.disqualified_reason;
  if (r.qualified_ms !== null && r.qualified_ms !== undefined) x.qualifiedAt = num(r.qualified_ms);
  return x;
}
const CLAIM_COLS = `id, user_id, source, kind, status, amount_cents, detail, note, idempotency_key, ${ms("created_at")} AS c, ${ms("updated_at")} AS u`;
function mapClaim(x: Row): RewardClaimRow {
  const c: RewardClaimRow = { id: x["id"], userId: x["user_id"], source: x["source"], kind: x["kind"] ?? "", status: x["status"], createdAt: num(x["c"]), updatedAt: num(x["u"]), detail: x["detail"] ?? {}, idempotencyKey: x["idempotency_key"] };
  if (x["amount_cents"] !== null) c.amountCents = num(x["amount_cents"]);
  if (x["note"]) c.note = x["note"];
  return c;
}

export class PgMoney extends PgSync {
  /* ---- append-only ledger ---- */
  async ledgerFor(userId: string): Promise<LedgerRow[]> {
    return (await this.all(`SELECT id, user_id, type, amount_cents, idempotency_key, reason, reference, actor_id, ${ms("created_at")} AS at FROM reward_ledger WHERE user_id = $1 ORDER BY id`, [userId]))
      .map(x => ({ id: String(x["id"]), userId: x["user_id"], type: x["type"], amountCents: num(x["amount_cents"]), idempotencyKey: x["idempotency_key"], createdAt: num(x["at"]),
        ...(x["reason"] ? { reason: x["reason"] } : {}), ...(x["reference"] ? { reference: x["reference"] } : {}), ...(x["actor_id"] ? { actorId: x["actor_id"] } : {}) }));
  }
  /** Idempotent on idempotencyKey: a replay is ignored by the database. Returns true when a row was written. */
  async addLedger(row: LedgerRow): Promise<boolean> {
    const m = /^(?:reserve|release|pay):([0-9a-f-]{36})(?::[\w-]+)?$/.exec(row.idempotencyKey);
    return (await this.db.query("INSERT INTO reward_ledger (user_id, type, amount_cents, payout_id, reference, reason, actor_id, idempotency_key, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (idempotency_key) DO NOTHING",
      [row.userId, row.type, row.amountCents, m ? m[1] : null, row.reference ?? row.idempotencyKey, row.reason ?? null, row.actorId ?? null, row.idempotencyKey, d(this.now())])).rowCount === 1;
  }
  async globalEarnedCents() { return num((await this.one("SELECT COALESCE(SUM(amount_cents), 0) AS s FROM reward_ledger WHERE type = 'earn'"))?.["s"] ?? 0); }
  async financeTotals() {
    const r = await this.one(`SELECT COALESCE(SUM(amount_cents) FILTER (WHERE type = 'earn'), 0) AS earned, COALESCE(SUM(amount_cents) FILTER (WHERE type = 'pay'), 0) AS paid,
      COALESCE(SUM(CASE type WHEN 'reserve' THEN amount_cents WHEN 'release' THEN -amount_cents WHEN 'pay' THEN -amount_cents ELSE 0 END), 0) AS reserved,
      COALESCE(SUM(CASE type WHEN 'earn' THEN amount_cents WHEN 'release' THEN amount_cents WHEN 'reserve' THEN -amount_cents WHEN 'adjustment' THEN amount_cents ELSE 0 END), 0) AS available FROM reward_ledger`);
    return { earned: num(r?.["earned"]), paid: num(r?.["paid"]), reserved: num(r?.["reserved"]), available: num(r?.["available"]) };
  }

  /* ---- payout methods ---- */
  async addPayoutMethod(m: PayoutMethod) {
    await this.db.query("INSERT INTO payout_methods (id, user_id, kind, recipient_name, details_enc, masked_hint, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)", [m.id, m.userId, m.kind, m.recipientName ?? null, m.detailsEnc, m.maskedHint, d(this.now())]);
  }
  private mapMethod(r: Row): PayoutMethod { const m: PayoutMethod = { id: r["id"], userId: r["user_id"], kind: r["kind"], detailsEnc: r["details_enc"], maskedHint: r["masked_hint"], createdAt: num(r["c"]) }; if (r["recipient_name"]) m.recipientName = r["recipient_name"]; return m; }
  async getPayoutMethod(userId: string, id: string) { const r = await this.one(`SELECT *, ${ms("created_at")} AS c FROM payout_methods WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL`, [userId, id]); return r ? this.mapMethod(r) : null; }
  async listPayoutMethods(userId: string) { return (await this.all(`SELECT *, ${ms("created_at")} AS c FROM payout_methods WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at`, [userId])).map(x => this.mapMethod(x)); }
  /** Soft delete: an existing request keeps its own frozen snapshot, so removing a method never redirects money. */
  async deletePayoutMethod(userId: string, id: string) { return (await this.db.query("UPDATE payout_methods SET deleted_at = $3, details_enc = 'erased' WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL", [userId, id, d(this.now())])).rowCount > 0; }

  /* ---- payout requests ---- */
  async getPayout(id: string) { const r = await this.one(`SELECT ${PAYOUT_COLS} FROM payout_requests p WHERE p.id = $1`, [id]); return r ? mapPayout(r) : null; }
  async listPayoutsFor(userId: string) { return (await this.all(`SELECT ${PAYOUT_COLS} FROM payout_requests p WHERE p.user_id = $1 ORDER BY p.created_at DESC LIMIT 100`, [userId])).map(mapPayout); }
  async openPayoutFor(userId: string) { const r = await this.one(`SELECT ${PAYOUT_COLS} FROM payout_requests p WHERE p.user_id = $1 AND p.status IN ('pending','in_progress','action_required') LIMIT 1`, [userId]); return r ? mapPayout(r) : null; }
  async getPayoutByIdem(userId: string, key: string) { const r = await this.one(`SELECT ${PAYOUT_COLS} FROM payout_requests p WHERE p.user_id = $1 AND p.idempotency_key = $2`, [userId, key]); return r ? mapPayout(r) : null; }
  async payoutForClaim(claimId: string) { const r = await this.one(`SELECT ${PAYOUT_COLS} FROM payout_requests p WHERE p.reward_claim_id = $1 ORDER BY p.created_at DESC LIMIT 1`, [claimId]); return r ? mapPayout(r) : null; }
  async listPayouts(o: { status?: PayoutStatus; userId?: string; limit?: number; offset?: number } = {}) {
    return (await this.all(`SELECT ${PAYOUT_COLS}, u.display_name, u.email::text AS email FROM payout_requests p JOIN users u ON u.id = p.user_id
      WHERE ($1::text IS NULL OR p.status = $1) AND ($2::uuid IS NULL OR p.user_id = $2) ORDER BY p.created_at DESC LIMIT $3 OFFSET $4`,
      [o.status ?? null, o.userId ?? null, o.limit ?? 200, o.offset ?? 0])).map(x => ({ ...mapPayout(x), userName: x["display_name"] as string, userEmail: x["email"] as string }));
  }
  async payoutCounts() {
    const r = await this.all("SELECT status, count(*) AS c, COALESCE(sum(amount_cents), 0) AS s FROM payout_requests GROUP BY status");
    return Object.fromEntries(r.map(x => [x["status"], { count: num(x["c"]), cents: num(x["s"]) }])) as Record<string, { count: number; cents: number }>;
  }
  /** Insert or update; a second open request for the same user hits the partial unique index and becomes DuplicateError. */
  async savePayout(p: Payout, actorId?: string) {
    await this.uniqueOr(() => this.tx(async s => {
      const prev = await s.one("SELECT status FROM payout_requests WHERE id = $1 FOR UPDATE", [p.id]);
      const t = d(this.now());
      if (!prev) {
        await s.db.query(`INSERT INTO payout_requests (id, user_id, amount_cents, status, method_kind, recipient_snapshot_enc, masked_hint, idempotency_key, source, reward_claim_id, recipient_name, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
          [p.id, p.userId, p.amountCents, p.status, p.methodKind ?? null, p.snapshotEnc ?? null, p.maskedHint, p.idempotencyKey ?? null, p.source ?? "withdrawal", p.rewardClaimId ?? null, p.recipientName ?? null, t]);
        await s.db.query("INSERT INTO payout_status_history (payout_id, from_status, to_status, actor_id, created_at) VALUES ($1, NULL, $2, $3, $4)", [p.id, p.status, actorId ?? p.userId, t]);
      } else {
        await s.db.query("UPDATE payout_requests SET status = $2, tx_reference = $3, admin_notes = $4, updated_at = $5, paid_at = CASE WHEN $2 = 'paid' THEN $5 ELSE paid_at END, reviewed_by = COALESCE($6, reviewed_by) WHERE id = $1",
          [p.id, p.status, p.txReference ?? null, p.adminNotes ?? null, t, actorId ?? null]);
        if (prev["status"] !== p.status) await s.db.query("INSERT INTO payout_status_history (payout_id, from_status, to_status, reason, tx_reference, actor_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [p.id, prev["status"], p.status, p.adminNotes ?? null, p.status === "paid" ? (p.txReference ?? null) : null, actorId ?? null, t]);
      }
    }), "payout already open or duplicate request");
  }
  async payoutHistory(id: string): Promise<PayoutHistoryRow[]> {
    return (await this.all(`SELECT from_status, to_status, reason, tx_reference, actor_id, ${ms("created_at")} AS at FROM payout_status_history WHERE payout_id = $1 ORDER BY created_at, id`, [id]))
      .map(x => ({ from: x["from_status"], to: x["to_status"], at: num(x["at"]), ...(x["reason"] ? { reason: x["reason"] } : {}), ...(x["tx_reference"] ? { txReference: x["tx_reference"] } : {}), ...(x["actor_id"] ? { actorId: x["actor_id"] } : {}) }));
  }

  /* ---- reward claims (cash milestones, challenge prizes) and manual fulfilment ---- */
  /** Idempotent on the key: returns the existing claim instead of creating a second one. */
  async addRewardClaim(c: RewardClaimRow): Promise<{ claim: RewardClaimRow; created: boolean }> {
    const key = c.idempotencyKey ?? `${c.source}:${c.userId}:${c.kind}`;
    const r = await this.one(`INSERT INTO reward_claims (id, user_id, source, kind, status, idempotency_key, amount_cents, detail, note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $10)
      ON CONFLICT (idempotency_key) DO NOTHING RETURNING id`, [c.id, c.userId, c.source, c.kind, c.status, key, c.amountCents ?? null, JSON.stringify(c.detail ?? {}), c.note ?? null, d(c.createdAt)]);
    const claim = (await this.claimByKey(key))!;
    return { claim, created: !!r };
  }
  async claimByKey(key: string) { const x = await this.one(`SELECT ${CLAIM_COLS} FROM reward_claims WHERE idempotency_key = $1`, [key]); return x ? mapClaim(x) : null; }
  async getRewardClaim(id: string) { const x = await this.one(`SELECT ${CLAIM_COLS} FROM reward_claims WHERE id = $1`, [id]); return x ? mapClaim(x) : null; }
  async listRewardClaimsFor(userId: string) { return (await this.all(`SELECT ${CLAIM_COLS} FROM reward_claims WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`, [userId])).map(mapClaim); }
  async listRewardClaims(o: { status?: ClaimStatus; kind?: string; limit?: number } = {}) {
    return (await this.all(`SELECT rc.id, rc.user_id, rc.source, rc.kind, rc.status, rc.amount_cents, rc.detail, rc.note, rc.idempotency_key, ${ms("rc.created_at")} AS c, ${ms("rc.updated_at")} AS u,
        u.display_name, u.email::text AS email FROM reward_claims rc JOIN users u ON u.id = rc.user_id
      WHERE ($1::text IS NULL OR rc.status = $1) AND ($2::text IS NULL OR rc.kind = $2) ORDER BY rc.created_at DESC LIMIT $3`, [o.status ?? null, o.kind ?? null, o.limit ?? 200]))
      .map(x => ({ ...mapClaim(x), userName: x["display_name"] as string, userEmail: x["email"] as string }));
  }
  async updateRewardClaim(id: string, p: { status?: ClaimStatus; note?: string | null; detail?: Record<string, unknown> }) {
    await this.db.query("UPDATE reward_claims SET status = COALESCE($2, status), note = COALESCE($3, note), detail = COALESCE($4::jsonb, detail), updated_at = $5 WHERE id = $1",
      [id, p.status ?? null, p.note ?? null, p.detail ? JSON.stringify(p.detail) : null, d(this.now())]);
  }
  async claimCounts() {
    const r = await this.all("SELECT status, count(*) AS c FROM reward_claims WHERE kind NOT IN ('cash') GROUP BY status");
    return Object.fromEntries(r.map(x => [x["status"], num(x["c"])])) as Record<string, number>;
  }
  private mapFul(x: Row): FulfillmentRow {
    const f: FulfillmentRow = { id: x["id"], claimId: x["claim_id"], kind: x["kind"], status: x["status"], createdAt: num(x["c"]), updatedAt: num(x["u"]) };
    if (x["delivery_confirmation"]) f.deliveryConfirmation = x["delivery_confirmation"];
    if (x["notes"]) f.notes = x["notes"];
    if (x["admin_id"]) f.adminId = x["admin_id"];
    return f;
  }
  async ensureFulfillment(claimId: string, kind: string): Promise<FulfillmentRow> {
    await this.db.query("INSERT INTO reward_fulfillment (claim_id, kind, status, created_at, updated_at) VALUES ($1, $2, 'pending', $3, $3) ON CONFLICT (claim_id) DO NOTHING", [claimId, kind, d(this.now())]);
    return (await this.fulfillmentForClaim(claimId))!;
  }
  async fulfillmentForClaim(claimId: string) { const x = await this.one(`SELECT *, ${ms("created_at")} AS c, ${ms("updated_at")} AS u FROM reward_fulfillment WHERE claim_id = $1`, [claimId]); return x ? this.mapFul(x) : null; }
  async updateFulfillment(claimId: string, p: { status: ClaimStatus; deliveryConfirmation?: string | null; notes?: string | null; adminId: string }) {
    await this.db.query("UPDATE reward_fulfillment SET status = $2, delivery_confirmation = COALESCE($3, delivery_confirmation), notes = COALESCE($4, notes), admin_id = $5, updated_at = $6 WHERE claim_id = $1",
      [claimId, p.status, p.deliveryConfirmation ?? null, p.notes ?? null, p.adminId, d(this.now())]);
  }

  /* ---- referrals ---- */
  async getReferralCode(userId: string) { const r = await this.one("SELECT code FROM referral_codes WHERE user_id = $1", [userId]); return r ? (r["code"] as string) : null; }
  async setReferralCode(userId: string, code: string) { await this.db.query("INSERT INTO referral_codes (user_id, code, created_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO NOTHING", [userId, code, d(this.now())]); }
  async findUserIdByReferralCode(code: string) { const r = await this.one("SELECT user_id FROM referral_codes WHERE code = $1", [code]); return r ? (r["user_id"] as string) : null; }
  async createReferral(r: Referral) {
    await this.uniqueOr(() => this.tx(async s => {
      await s.db.query("INSERT INTO referrals (id, referrer_id, referred_id, status, network_hash, created_at) VALUES ($1, $2, $3, $4, decode($5, 'hex'), $6)", [r.id, r.referrerId, r.referredId, r.status, r.networkHash, d(r.createdAt)]);
      await s.db.query("INSERT INTO referral_events (referral_id, referrer_id, event, created_at) VALUES ($1, $2, 'registered', $3)", [r.id, r.referrerId, d(r.createdAt)]);
    }), "already referred");
  }
  async getReferral(id: string) { const r = await this.one(`SELECT ${REFERRAL_COLS} FROM referrals WHERE id = $1`, [id]); return r ? mapReferral(r) : null; }
  async listReferralsByReferrer(userId: string) { return (await this.all(`SELECT ${REFERRAL_COLS} FROM referrals WHERE referrer_id = $1 ORDER BY created_at DESC`, [userId])).map(mapReferral); }
  async referralCounts(userId: string) {
    const r = await this.all("SELECT status, count(*) AS c FROM referrals WHERE referrer_id = $1 GROUP BY status", [userId]);
    const c = { pending: 0, qualified: 0, under_review: 0, disqualified: 0 };
    for (const x of r) c[x["status"] as ReferralStatus] = num(x["c"]);
    return c;
  }
  async listReferralsByStatus(status: ReferralStatus, limit = 1000) { return (await this.all(`SELECT ${REFERRAL_COLS} FROM referrals WHERE status = $1 ORDER BY created_at LIMIT $2`, [status, limit])).map(mapReferral); }
  async saveReferral(r: Referral) {
    await this.db.query("UPDATE referrals SET status = $2, disqualified_reason = $3, qualified_at = $4 WHERE id = $1", [r.id, r.status, r.reason ?? null, d(r.qualifiedAt)]);
    if (r.status !== "pending") await this.db.query("INSERT INTO referral_events (referral_id, referrer_id, event, created_at) VALUES ($1, $2, $3, $4)",
      [r.id, r.referrerId, r.status === "under_review" ? "flagged" : r.status, d(this.now())]);
  }
  async countByNetworkBetween(hash: string, from: number, to: number) { return num((await this.one("SELECT count(*) AS c FROM referrals WHERE network_hash = decode($1, 'hex') AND created_at BETWEEN $2 AND $3", [hash, d(from), d(to)]))?.["c"] ?? 0); }
  async addReferralClick(referrerId: string, code: string, ipHash: string) {
    await this.db.query("INSERT INTO referral_events (referrer_id, code, event, ip_hash, created_at) VALUES ($1, $2, 'click', decode($3, 'hex'), $4)", [referrerId, code, ipHash, d(this.now())]);
  }
  async clickCount(referrerId: string) { return num((await this.one("SELECT count(*) AS c FROM referral_events WHERE referrer_id = $1 AND event = 'click'", [referrerId]))?.["c"] ?? 0); }
  async recentClickFrom(referrerId: string, ipHash: string, since: number) {
    return !!(await this.one("SELECT 1 FROM referral_events WHERE referrer_id = $1 AND event = 'click' AND ip_hash = decode($2, 'hex') AND created_at > $3 LIMIT 1", [referrerId, ipHash, d(since)]));
  }
  /** True the first time this threshold is recorded for the user. */
  async reachMilestone(userId: string, threshold: number) { return (await this.db.query("INSERT INTO referral_milestones (user_id, threshold, reached_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [userId, threshold, d(this.now())])).rowCount === 1; }
  async milestonesOf(userId: string) { return (await this.all(`SELECT threshold, ${ms("reached_at")} AS at FROM referral_milestones WHERE user_id = $1 ORDER BY threshold`, [userId])).map(x => ({ threshold: num(x["threshold"]), at: num(x["at"]) })); }
  async listReferralsForAdmin(o: { status?: ReferralStatus; userId?: string; limit: number }) {
    return (await this.all(`SELECT r.id, r.referrer_id, r.referred_id, r.status, r.disqualified_reason, encode(r.network_hash, 'hex') AS network_hex, ${ms("r.created_at")} AS created_ms, ${ms("r.qualified_at")} AS qualified_ms,
        a.display_name AS referrer_name, b.display_name AS referred_name, b.email::text AS referred_email
      FROM referrals r JOIN users a ON a.id = r.referrer_id JOIN users b ON b.id = r.referred_id
      WHERE ($1::text IS NULL OR r.status = $1) AND ($2::uuid IS NULL OR r.referrer_id = $2 OR r.referred_id = $2) ORDER BY r.created_at DESC LIMIT $3`, [o.status ?? null, o.userId ?? null, o.limit]))
      .map(x => ({ ...mapReferral(x), referrerName: x["referrer_name"] as string, referredName: x["referred_name"] as string, referredEmail: x["referred_email"] as string }));
  }
  async referralTotals() {
    const r = await this.all("SELECT status, count(*) AS c FROM referrals GROUP BY status");
    return Object.fromEntries(r.map(x => [x["status"], num(x["c"])])) as Record<string, number>;
  }

  /* ---- audit (insert-only; a trigger refuses UPDATE and DELETE) ---- */
  async addAudit(a: AuditRow) {
    await this.db.query("INSERT INTO admin_audit_logs (actor_id, action, resource_type, resource_id, from_value, to_value, reason, correlation_id, created_at) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9)",
      [a.actorId, a.action, a.resourceType, a.resourceId, JSON.stringify(a.from ?? null), JSON.stringify(a.to ?? null), a.reason ?? null, a.correlationId ?? null, d(a.at)]);
  }
  async listAudit(o: { actorId?: string; resourceType?: string; resourceId?: string; action?: string; limit: number; offset: number }) {
    return (await this.all(`SELECT l.actor_id, l.action, l.resource_type, l.resource_id, l.from_value, l.to_value, l.reason, l.correlation_id, ${ms("l.created_at")} AS at, u.display_name AS actor_name
      FROM admin_audit_logs l LEFT JOIN users u ON u.id = l.actor_id
      WHERE ($1::uuid IS NULL OR l.actor_id = $1) AND ($2::text IS NULL OR l.resource_type = $2) AND ($3::text IS NULL OR l.resource_id = $3) AND ($4::text IS NULL OR l.action LIKE $4 || '%')
      ORDER BY l.created_at DESC, l.id DESC LIMIT $5 OFFSET $6`, [o.actorId ?? null, o.resourceType ?? null, o.resourceId ?? null, o.action ?? null, o.limit, o.offset]))
      .map(x => ({ actorId: x["actor_id"] as string, actorName: x["actor_name"] as string | null, action: x["action"] as string, resourceType: x["resource_type"] as string, resourceId: x["resource_id"] as string,
        from: x["from_value"], to: x["to_value"], reason: x["reason"] as string | null, correlationId: x["correlation_id"] as string | null, at: num(x["at"]) }));
  }
}
