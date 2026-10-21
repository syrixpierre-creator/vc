import type { Row } from "./db.ts";
import type { ChallengeRec, Participation, ParticipationStatus, EventRow, XpRow, NotificationRow, AnnouncementRow, TicketRow, TicketMessage, VipLevel } from "./types.ts";
import type { Metric } from "../domain/challenges.ts";
import { PgMoney } from "./pg-money.ts";
import { ms, num, optMs, d } from "./pg-base.ts";

const CHALLENGE_COLS = `id, slug, title, description, difficulty, ${ms("starts_at")} AS starts_ms, ${ms("ends_at")} AS ends_ms, rule, reward_type, reward_cents, reward_xp,
  max_winners, budget_cents, ${ms("claim_deadline")} AS deadline_ms, terms #>> '{}' AS terms_text, published, review_required, eligibility`;
function mapChallenge(r: Row): ChallengeRec {
  const c: ChallengeRec = { id: r.id, slug: r.slug, title: r.title, description: r.description, difficulty: r.difficulty, startsAt: num(r.starts_ms), endsAt: num(r.ends_ms),
    metric: r.rule.metric as Metric, threshold: num(r.rule.threshold), rewardType: r.reward_type, terms: r.terms_text ?? "", published: !!r.published, reviewRequired: !!r.review_required, eligibility: r.eligibility ?? {} };
  if (r.reward_cents !== null) c.rewardCents = num(r.reward_cents);
  if (r.reward_xp !== null) c.rewardXp = num(r.reward_xp);
  if (r.max_winners !== null) c.maxWinners = num(r.max_winners);
  if (r.budget_cents !== null) c.budgetCents = num(r.budget_cents);
  if (r.deadline_ms !== null) c.claimDeadline = num(r.deadline_ms);
  return c;
}
const PART_COLS = `challenge_id, user_id, status, review_note, ${ms("joined_at")} AS joined_ms, ${ms("completed_at")} AS completed_ms, ${ms("claimed_at")} AS claimed_ms, awarded_cents`;
function mapPart(r: Row): Participation {
  const p: Participation = { challengeId: r.challenge_id, userId: r.user_id, joinedAt: num(r.joined_ms), awardedCents: num(r.awarded_cents), status: r.status };
  if (r.completed_ms !== null) p.completedAt = num(r.completed_ms);
  if (r.claimed_ms !== null) p.claimedAt = num(r.claimed_ms);
  if (r.review_note) p.reviewNote = r.review_note;
  return p;
}
const TICKET_COLS = `id, user_id, category, subject, body, status, priority, assigned_to, ${ms("created_at")} AS c, ${ms("updated_at")} AS u, ${ms("closed_at")} AS cl`;
function mapTicket(x: Row): TicketRow {
  const t: TicketRow = { id: x["id"], userId: x["user_id"], category: x["category"], subject: x["subject"], body: x["body"], status: x["status"], priority: x["priority"], createdAt: num(x["c"]), updatedAt: num(x["u"]) };
  if (x["assigned_to"]) t.assignedTo = x["assigned_to"];
  const cl = optMs(x["cl"]); if (cl !== undefined) t.closedAt = cl;
  return t;
}
const ANN_COLS = `id, kind, title, body, status, pinned, show_on_site, created_by, ${ms("published_at")} AS p, ${ms("created_at")} AS c`;
function mapAnn(x: Row): AnnouncementRow {
  const a: AnnouncementRow = { id: x["id"], kind: x["kind"], title: x["title"], body: x["body"], status: x["status"], pinned: !!x["pinned"], showOnSite: !!x["show_on_site"], createdAt: num(x["c"]) };
  const p = optMs(x["p"]); if (p !== undefined) a.publishedAt = p;
  if (x["created_by"]) a.createdBy = x["created_by"];
  return a;
}

export class PgEngage extends PgMoney {
  /* ---- challenges ---- */
  async saveChallenge(c: ChallengeRec, createdBy?: string) {
    await this.db.query(`INSERT INTO challenge_definitions (id, slug, title, description, difficulty, starts_at, ends_at, rule, reward_type, reward_cents, reward_xp, max_winners, budget_cents, claim_deadline, terms, published, review_required, eligibility, created_by, created_at)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15::jsonb, $16, $17, $18::jsonb, $19, $20)
      ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, starts_at = EXCLUDED.starts_at,
        ends_at = EXCLUDED.ends_at, rule = EXCLUDED.rule, reward_type = EXCLUDED.reward_type, reward_cents = EXCLUDED.reward_cents, reward_xp = EXCLUDED.reward_xp,
        max_winners = EXCLUDED.max_winners, budget_cents = EXCLUDED.budget_cents, claim_deadline = EXCLUDED.claim_deadline, terms = EXCLUDED.terms, published = EXCLUDED.published,
        review_required = EXCLUDED.review_required, eligibility = EXCLUDED.eligibility`,
      [c.id, c.slug, JSON.stringify(c.title), JSON.stringify(c.description), c.difficulty, d(c.startsAt), d(c.endsAt), JSON.stringify({ metric: c.metric, threshold: c.threshold }),
        c.rewardType, c.rewardCents ?? null, c.rewardXp ?? null, c.maxWinners ?? null, c.budgetCents ?? null, d(c.claimDeadline), JSON.stringify(c.terms), c.published, !!c.reviewRequired, JSON.stringify(c.eligibility ?? {}), createdBy ?? null, d(this.now())]);
  }
  async getChallenge(id: string) { const r = await this.one(`SELECT ${CHALLENGE_COLS} FROM challenge_definitions WHERE id = $1`, [id]); return r ? mapChallenge(r) : null; }
  async listChallenges(onlyPublished: boolean) { return (await this.all(`SELECT ${CHALLENGE_COLS} FROM challenge_definitions WHERE ($1::boolean = false OR published) ORDER BY starts_at DESC, slug`, [onlyPublished])).map(mapChallenge); }
  async deleteDraftChallenge(id: string) { return (await this.db.query("DELETE FROM challenge_definitions WHERE id = $1 AND published = false AND NOT EXISTS (SELECT 1 FROM challenge_participation WHERE challenge_id = $1)", [id])).rowCount > 0; }
  async challengeStats() {
    return (await this.all(`SELECT challenge_id, count(*) AS joined, count(completed_at) AS completed, count(claimed_at) AS claimed, COALESCE(sum(awarded_cents), 0) AS spent FROM challenge_participation GROUP BY challenge_id`))
      .map(x => ({ challengeId: x["challenge_id"] as string, joined: num(x["joined"]), completed: num(x["completed"]), claimed: num(x["claimed"]), spentCents: num(x["spent"]) }));
  }
  async joinChallenge(p: Participation) { await this.uniqueOr(() => this.db.query("INSERT INTO challenge_participation (challenge_id, user_id, joined_at, status, updated_at) VALUES ($1, $2, $3, 'active', $3)", [p.challengeId, p.userId, d(p.joinedAt)]), "already joined"); }
  async getParticipation(challengeId: string, userId: string) { const r = await this.one(`SELECT ${PART_COLS} FROM challenge_participation WHERE challenge_id = $1 AND user_id = $2`, [challengeId, userId]); return r ? mapPart(r) : null; }
  async participationsOf(userId: string) { return (await this.all(`SELECT ${PART_COLS} FROM challenge_participation WHERE user_id = $1`, [userId])).map(mapPart); }
  async participationsFor(challengeId: string) { return (await this.all(`SELECT ${PART_COLS} FROM challenge_participation WHERE challenge_id = $1`, [challengeId])).map(mapPart); }
  async participationsWithStatus(status: ParticipationStatus, limit = 200) {
    return (await this.all(`SELECT p.challenge_id, p.user_id, p.status, p.review_note, ${ms("p.joined_at")} AS joined_ms, ${ms("p.completed_at")} AS completed_ms, ${ms("p.claimed_at")} AS claimed_ms, p.awarded_cents, u.display_name, u.email::text AS email
      FROM challenge_participation p JOIN users u ON u.id = p.user_id WHERE p.status = $1 ORDER BY p.updated_at LIMIT $2`, [status, limit])).map(x => ({ ...mapPart(x), userName: x["display_name"] as string, userEmail: x["email"] as string }));
  }
  async saveParticipation(p: Participation) {
    await this.db.query("UPDATE challenge_participation SET completed_at = $3, claimed_at = $4, awarded_cents = $5, status = COALESCE($6, status), review_note = COALESCE($7, review_note), updated_at = $8 WHERE challenge_id = $1 AND user_id = $2",
      [p.challengeId, p.userId, d(p.completedAt), d(p.claimedAt), p.awardedCents ?? 0, p.status ?? null, p.reviewNote ?? null, d(this.now())]);
  }

  /* ---- verified events (replay-safe on (user, key)) ---- */
  async addEvent(e: EventRow) { return (await this.db.query("INSERT INTO user_events (user_id, type, at, event_key) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, event_key) DO NOTHING", [e.userId, e.type, d(e.at), e.key])).rowCount === 1; }
  async listEvents(userId: string, since?: number): Promise<EventRow[]> {
    return (await this.all(`SELECT user_id, type, ${ms("at")} AS at_ms, event_key FROM user_events WHERE user_id = $1 AND ($2::timestamptz IS NULL OR at >= $2)`, [userId, d(since)]))
      .map(x => ({ userId: x["user_id"], type: x["type"] as Metric, at: num(x["at_ms"]), key: x["event_key"] }));
  }

  /* ---- XP (not money, never withdrawable) ---- */
  async addXp(x: XpRow) { return (await this.db.query("INSERT INTO user_xp_ledger (user_id, amount, reason, idempotency_key, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (idempotency_key) DO NOTHING", [x.userId, x.amount, x.reason, x.key, d(x.at)])).rowCount === 1; }
  async xpRows(userId: string): Promise<XpRow[]> { return (await this.all(`SELECT user_id, amount, reason, idempotency_key, ${ms("created_at")} AS at_ms FROM user_xp_ledger WHERE user_id = $1 ORDER BY created_at`, [userId])).map(x => ({ userId: x["user_id"], amount: num(x["amount"]), reason: x["reason"], key: x["idempotency_key"], at: num(x["at_ms"]) })); }
  async xpTotal(userId: string) { return num((await this.one("SELECT COALESCE(sum(amount), 0) AS s FROM user_xp_ledger WHERE user_id = $1", [userId]))?.["s"] ?? 0); }
  /** Leaderboard rows: only users who opted in with a pseudonym, only active accounts. */
  async xpLeaderboard(since: number, limit: number) {
    return (await this.all(`SELECT u.pseudonym, sum(x.amount) AS xp, (SELECT COALESCE(sum(amount), 0) FROM user_xp_ledger t WHERE t.user_id = u.id) AS total
      FROM user_xp_ledger x JOIN users u ON u.id = x.user_id JOIN user_settings s ON s.user_id = u.id
      WHERE x.created_at >= $1 AND u.status = 'active' AND s.leaderboard_opt_in AND u.pseudonym IS NOT NULL
      GROUP BY u.id, u.pseudonym ORDER BY xp DESC, u.pseudonym LIMIT $2`, [d(since), limit])).map(x => ({ pseudonym: x["pseudonym"] as string, xp: num(x["xp"]), totalXp: num(x["total"]) }));
  }
  async referralLeaderboard(since: number, limit: number) {
    return (await this.all(`SELECT u.pseudonym, count(*) AS n FROM referrals r JOIN users u ON u.id = r.referrer_id JOIN user_settings s ON s.user_id = u.id
      WHERE r.status = 'qualified' AND r.qualified_at >= $1 AND u.status = 'active' AND s.leaderboard_opt_in AND u.pseudonym IS NOT NULL
      GROUP BY u.id, u.pseudonym ORDER BY n DESC, u.pseudonym LIMIT $2`, [d(since), limit])).map(x => ({ pseudonym: x["pseudonym"] as string, referrals: num(x["n"]) }));
  }

  /* ---- achievements and VIP ---- */
  async grantAchievement(userId: string, code: string) { return (await this.db.query("INSERT INTO user_achievements (user_id, code, earned_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [userId, code, d(this.now())])).rowCount === 1; }
  async achievementsOf(userId: string) { return (await this.all(`SELECT code, ${ms("earned_at")} AS at FROM user_achievements WHERE user_id = $1 ORDER BY earned_at`, [userId])).map(x => ({ code: x["code"] as string, at: num(x["at"]) })); }
  async vipLevels(): Promise<VipLevel[]> { return (await this.all("SELECT id, name, min_xp, benefits FROM vip_levels ORDER BY min_xp")).map(x => ({ id: num(x["id"]), name: x["name"], minXp: num(x["min_xp"]), benefits: x["benefits"] ?? {} })); }
  async saveVipLevels(levels: readonly Omit<VipLevel, "id">[]) {
    await this.tx(async s => {
      await s.db.query("DELETE FROM vip_levels");
      for (const l of levels) await s.db.query("INSERT INTO vip_levels (name, min_xp, benefits, updated_at) VALUES ($1, $2, $3::jsonb, $4)", [l.name, l.minXp, JSON.stringify(l.benefits), d(this.now())]);
    });
  }

  /* ---- notifications ---- */
  async addNotification(n: Omit<NotificationRow, "id" | "createdAt" | "readAt">) {
    const r = await this.one("INSERT INTO notifications (user_id, kind, payload, essential, created_at) VALUES ($1, $2, $3::jsonb, $4, $5) RETURNING id", [n.userId, n.kind, JSON.stringify(n.payload), n.essential, d(this.now())]);
    return r!["id"] as string;
  }
  async listNotifications(userId: string, limit: number, unreadOnly = false): Promise<NotificationRow[]> {
    return (await this.all(`SELECT id, user_id, kind, payload, essential, ${ms("read_at")} AS r, ${ms("created_at")} AS c FROM notifications WHERE user_id = $1 AND ($3::boolean = false OR read_at IS NULL) ORDER BY created_at DESC LIMIT $2`, [userId, limit, unreadOnly]))
      .map(x => ({ id: x["id"], userId: x["user_id"], kind: x["kind"], payload: x["payload"], essential: !!x["essential"], createdAt: num(x["c"]), ...(x["r"] !== null ? { readAt: num(x["r"]) } : {}) }));
  }
  async unreadCount(userId: string) { return num((await this.one("SELECT count(*) AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL", [userId]))?.["c"] ?? 0); }
  async markNotificationsRead(userId: string, ids: readonly string[] | "all") {
    if (ids === "all") return (await this.db.query("UPDATE notifications SET read_at = $2 WHERE user_id = $1 AND read_at IS NULL", [userId, d(this.now())])).rowCount;
    return (await this.db.query("UPDATE notifications SET read_at = $3 WHERE user_id = $1 AND id = ANY($2::uuid[]) AND read_at IS NULL", [userId, ids, d(this.now())])).rowCount;
  }
  async purgeOldNotifications() { return (await this.db.query("DELETE FROM notifications WHERE created_at < $1::timestamptz - interval '180 days'", [d(this.now())])).rowCount; }

  /* ---- announcements ---- */
  async saveAnnouncement(a: Omit<AnnouncementRow, "createdAt"> & { createdAt?: number }) {
    await this.db.query(`INSERT INTO announcements (id, kind, title, body, status, pinned, show_on_site, published_at, created_by, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9, $10, $10)
      ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, title = EXCLUDED.title, body = EXCLUDED.body, status = EXCLUDED.status, pinned = EXCLUDED.pinned, show_on_site = EXCLUDED.show_on_site,
        published_at = COALESCE(announcements.published_at, EXCLUDED.published_at), updated_at = EXCLUDED.updated_at`,
      [a.id, a.kind, JSON.stringify(a.title), JSON.stringify(a.body), a.status, a.pinned, a.showOnSite, d(a.publishedAt), a.createdBy ?? null, d(a.createdAt ?? this.now())]);
  }
  async getAnnouncement(id: string) { const x = await this.one(`SELECT ${ANN_COLS} FROM announcements WHERE id = $1`, [id]); return x ? mapAnn(x) : null; }
  async listAnnouncements(o: { publishedOnly: boolean; siteOnly?: boolean; limit: number }) {
    return (await this.all(`SELECT ${ANN_COLS} FROM announcements WHERE ($1::boolean = false OR status = 'published') AND ($2::boolean = false OR show_on_site) ORDER BY pinned DESC, COALESCE(published_at, created_at) DESC LIMIT $3`,
      [o.publishedOnly, !!o.siteOnly, o.limit])).map(mapAnn);
  }

  /* ---- support ---- */
  async createTicket(t: Omit<TicketRow, "createdAt" | "updatedAt" | "status" | "priority"> & { priority?: TicketRow["priority"] }) {
    await this.db.query("INSERT INTO support_tickets (id, user_id, category, subject, body, status, priority, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'open', $6, $7, $7)",
      [t.id, t.userId, t.category, t.subject, t.body, t.priority ?? "normal", d(this.now())]);
  }
  async getTicket(id: string) { const x = await this.one(`SELECT ${TICKET_COLS} FROM support_tickets WHERE id = $1`, [id]); return x ? mapTicket(x) : null; }
  async listTicketsFor(userId: string) { return (await this.all(`SELECT ${TICKET_COLS} FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 100`, [userId])).map(mapTicket); }
  async countOpenTicketsFor(userId: string) { return num((await this.one("SELECT count(*) AS c FROM support_tickets WHERE user_id = $1 AND status <> 'closed'", [userId]))?.["c"] ?? 0); }
  async listTickets(o: { status?: string; assignedTo?: string; category?: string; limit: number; offset: number }) {
    return (await this.all(`SELECT t.id, t.user_id, t.category, t.subject, t.body, t.status, t.priority, t.assigned_to, ${ms("t.created_at")} AS c, ${ms("t.updated_at")} AS u, ${ms("t.closed_at")} AS cl, u.display_name, u.email::text AS email
      FROM support_tickets t JOIN users u ON u.id = t.user_id WHERE ($1::text IS NULL OR t.status = $1) AND ($2::uuid IS NULL OR t.assigned_to = $2) AND ($3::text IS NULL OR t.category = $3)
      ORDER BY CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.updated_at DESC LIMIT $4 OFFSET $5`,
      [o.status ?? null, o.assignedTo ?? null, o.category ?? null, o.limit, o.offset])).map(x => ({ ...mapTicket(x), userName: x["display_name"] as string, userEmail: x["email"] as string }));
  }
  async updateTicket(id: string, p: { status?: TicketRow["status"]; priority?: TicketRow["priority"]; assignedTo?: string | null }) {
    await this.db.query(`UPDATE support_tickets SET status = COALESCE($2, status), priority = COALESCE($3, priority), assigned_to = CASE WHEN $4::boolean THEN $5::uuid ELSE assigned_to END,
        closed_at = CASE WHEN $2 = 'closed' THEN $6 WHEN $2 IS NOT NULL THEN NULL ELSE closed_at END, updated_at = $6 WHERE id = $1`,
      [id, p.status ?? null, p.priority ?? null, "assignedTo" in p, p.assignedTo ?? null, d(this.now())]);
  }
  async addTicketMessage(m: Omit<TicketMessage, "id" | "createdAt">) {
    const r = await this.one("INSERT INTO support_messages (ticket_id, author_id, is_staff, internal, body, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [m.ticketId, m.authorId ?? null, m.isStaff, m.internal, m.body, d(this.now())]);
    await this.db.query("UPDATE support_tickets SET updated_at = $2 WHERE id = $1", [m.ticketId, d(this.now())]);
    return r!["id"] as string;
  }
  async ticketMessages(ticketId: string, includeInternal: boolean): Promise<TicketMessage[]> {
    return (await this.all(`SELECT id, ticket_id, author_id, is_staff, internal, body, ${ms("created_at")} AS c FROM support_messages WHERE ticket_id = $1 AND ($2::boolean OR NOT internal) ORDER BY created_at, id`, [ticketId, includeInternal]))
      .map(x => ({ id: x["id"], ticketId: x["ticket_id"], ...(x["author_id"] ? { authorId: x["author_id"] } : {}), isStaff: !!x["is_staff"], internal: !!x["internal"], body: x["body"], createdAt: num(x["c"]) }));
  }
  async ticketCounts() { const r = await this.all("SELECT status, count(*) AS c FROM support_tickets GROUP BY status"); return Object.fromEntries(r.map(x => [x["status"], num(x["c"])])) as Record<string, number>; }

  /* ---- operations ---- */
  async heartbeat(name: string, info: Record<string, unknown>) {
    await this.db.query("INSERT INTO service_heartbeats (name, beat_at, info) VALUES ($1, $2, $3::jsonb) ON CONFLICT (name) DO UPDATE SET beat_at = EXCLUDED.beat_at, info = EXCLUDED.info", [name, d(this.now()), JSON.stringify(info)]);
  }
  async heartbeats() { return (await this.all(`SELECT name, ${ms("beat_at")} AS at, info FROM service_heartbeats ORDER BY name`)).map(x => ({ name: x["name"] as string, at: num(x["at"]), info: x["info"] as Record<string, unknown> })); }
  async lastOpsBackups(limit = 10) {
    return (await this.all(`SELECT id, status, file_name, size_bytes, offsite, error, ${ms("started_at")} AS s, ${ms("finished_at")} AS f FROM ops_backups ORDER BY started_at DESC LIMIT $1`, [limit]))
      .map(x => ({ id: num(x["id"]), status: x["status"] as string, fileName: x["file_name"] as string | null, sizeBytes: x["size_bytes"] === null ? null : num(x["size_bytes"]), offsite: !!x["offsite"], error: x["error"] as string | null, startedAt: num(x["s"]), finishedAt: optMs(x["f"]) ?? null }));
  }
  /** Users with contacts whose newest backup is older than `olderThan` (or who never had one). */
  async usersNeedingBackup(olderThan: number, limit: number): Promise<string[]> {
    return (await this.all(`SELECT u.id FROM users u WHERE u.status = 'active' AND EXISTS (SELECT 1 FROM contacts c WHERE c.user_id = u.id AND c.deleted_at IS NULL)
      AND NOT EXISTS (SELECT 1 FROM contact_backups b WHERE b.user_id = u.id AND b.created_at > $1) LIMIT $2`, [d(olderThan), limit])).map(x => x["id"] as string);
  }
  /** Participations still "active" in challenges that ended: they become "expired". */
  async expireParticipations() {
    return (await this.db.query(`UPDATE challenge_participation p SET status = 'expired', updated_at = $1 FROM challenge_definitions d
      WHERE d.id = p.challenge_id AND p.status = 'active' AND p.completed_at IS NULL AND d.ends_at <= $1`, [d(this.now())])).rowCount;
  }
  async platformCounts() {
    const r = await this.one(`SELECT
      (SELECT count(*) FROM users WHERE status <> 'deleted') AS users,
      (SELECT count(*) FROM users WHERE created_at > $1::timestamptz - interval '7 days') AS new7,
      (SELECT count(*) FROM users WHERE created_at > $1::timestamptz - interval '1 day') AS new1,
      (SELECT count(*) FROM users WHERE last_seen_at > $1::timestamptz - interval '30 days' AND status = 'active') AS active30,
      (SELECT count(*) FROM users WHERE last_seen_at > $1::timestamptz - interval '1 day' AND status = 'active') AS active1,
      (SELECT count(*) FROM users WHERE status = 'suspended') AS suspended,
      (SELECT count(*) FROM users WHERE status = 'pending_deletion') AS pending_deletion,
      (SELECT count(*) FROM users WHERE review_status IN ('flagged','under_review')) AS in_review,
      (SELECT count(*) FROM oauth_accounts WHERE contacts_status = 'connected') AS google_connected,
      (SELECT count(*) FROM oauth_accounts WHERE contacts_status IN ('revoked','refresh_failed','reconnect_requested')) AS google_broken,
      (SELECT count(*) FROM contacts WHERE deleted_at IS NULL) AS contacts,
      (SELECT count(*) FROM challenge_definitions WHERE published AND starts_at <= $1 AND ends_at > $1) AS active_challenges,
      (SELECT count(*) FROM challenge_participation WHERE joined_at > $1::timestamptz - interval '30 days') AS participations30`, [d(this.now())]);
    return Object.fromEntries(Object.entries(r ?? {}).map(([k, v]) => [k, num(v)])) as Record<string, number>;
  }
  async signupsPerDay(days: number) {
    return (await this.all(`SELECT to_char(g.day, 'YYYY-MM-DD') AS day, (SELECT count(*) FROM users u WHERE u.created_at >= g.day AND u.created_at < g.day + interval '1 day') AS n
      FROM generate_series(date_trunc('day', $1::timestamptz) - ($2::int - 1) * interval '1 day', date_trunc('day', $1::timestamptz), interval '1 day') AS g(day) ORDER BY g.day`, [d(this.now()), days]))
      .map(x => ({ day: x["day"] as string, n: num(x["n"]) }));
  }
}
