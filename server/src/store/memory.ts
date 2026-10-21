import { randomUUID } from "node:crypto";
import type { Store, User, Contact, SessionRec, Payout, LedgerRow, AuditRow, PendingOAuth, Referral, ReferralStatus, PayoutMethod, ChallengeRec, Participation, EventRow, XpRow, RewardClaimRow, GoogleConn, SyncSettings, SyncCounts } from "./types.ts";
import type { SyncJob } from "../sync/engine.ts";
import type { PayoutStatus } from "../domain/payout.ts";
import { DuplicateError } from "./types.ts";

/** In-memory Store used by the tests. Not for production. */
export class MemoryStore implements Store {
  users = new Map<string, User>();
  contacts = new Map<string, Contact>();
  sessions = new Map<string, SessionRec>();
  settings = new Map<string, string>();
  pending = new Map<string, PendingOAuth>();
  ledger: LedgerRow[] = [];
  payouts = new Map<string, Payout>();
  audit: AuditRow[] = [];
  refCodes = new Map<string, string>();
  referrals = new Map<string, Referral>();
  methods = new Map<string, PayoutMethod>();
  challenges = new Map<string, ChallengeRec>();
  parts: Participation[] = [];
  events: EventRow[] = [];
  xp: XpRow[] = [];
  rewardClaims: RewardClaimRow[] = [];
  conns = new Map<string, GoogleConn>();
  syncSettings = new Map<string, SyncSettings>();
  syncJobs = new Map<string, SyncJob>();
  runningSince = new Map<string, number>();
  syncLogs: { userId: string; outcome: string; at: number }[] = [];
  private clock: () => number;
  constructor(clock: () => number = Date.now) { this.clock = clock; }

  async findUserBySub(sub: string) { return [...this.users.values()].find(u => u.googleSub === sub) ?? null; }
  async getUser(id: string) { return this.users.get(id) ?? null; }
  async createUser(u: Omit<User, "id" | "createdAt">) { const n: User = { ...u, id: randomUUID(), createdAt: this.clock() }; this.users.set(n.id, n); return n; }
  async saveUser(u: User) { this.users.set(u.id, u); }
  async findUserByPhone(phone: string) { return [...this.users.values()].find(u => u.phone === phone) ?? null; }
  async getSetting(k: string) { return this.settings.get(k) ?? null; }
  async setSetting(k: string, v: string) { this.settings.set(k, v); }

  async putPending(state: string, p: PendingOAuth) { this.pending.set(state, p); }
  async takePending(state: string) {
    const p = this.pending.get(state) ?? null;
    this.pending.delete(state);
    return p && p.expiresAt > this.clock() ? p : null;
  }

  async createSession(s: SessionRec) { this.sessions.set(s.idHash, s); }
  async getSession(h: string) { return this.sessions.get(h) ?? null; }
  async saveSession(s: SessionRec) { this.sessions.set(s.idHash, s); }

  async allContacts(userId: string) { return [...this.contacts.values()].filter(c => c.userId === userId); }
  async listContacts(userId: string, o: { q?: string; limit: number; offset: number }) {
    const q = o.q?.toLowerCase();
    const all = (await this.allContacts(userId)).filter(c => !q || c.fullName.toLowerCase().includes(q) || (c.phone ?? "").includes(q))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    return { rows: all.slice(o.offset, o.offset + o.limit), total: all.length };
  }
  async getContact(userId: string, id: string) { const c = this.contacts.get(id); return c && c.userId === userId ? c : null; }
  async createContact(userId: string, c: Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt" | "syncState">) {
    if (c.phone && (await this.allContacts(userId)).some(x => x.phone === c.phone)) throw new DuplicateError("duplicate phone");
    const t = this.clock();
    const n: Contact = { ...c, id: randomUUID(), userId, createdAt: t, updatedAt: t, syncState: "local_only" };
    this.contacts.set(n.id, n);
    return n;
  }
  async updateContact(userId: string, id: string, patch: Partial<Omit<Contact, "id" | "userId">>) {
    const c = await this.getContact(userId, id);
    if (!c) return null;
    if (patch.phone && patch.phone !== c.phone && (await this.allContacts(userId)).some(x => x.phone === patch.phone && x.id !== id)) throw new DuplicateError("duplicate phone");
    const n = { ...c, ...patch, updatedAt: this.clock() };
    this.contacts.set(id, n);
    return n;
  }
  async deleteContact(userId: string, id: string) { const c = await this.getContact(userId, id); if (!c) return false; this.contacts.delete(id); return true; }

  async ledgerFor(userId: string) { return this.ledger.filter(r => r.userId === userId); }
  async addLedger(row: LedgerRow) { if (!this.ledger.some(r => r.idempotencyKey === row.idempotencyKey)) this.ledger.push(row); }
  async getPayout(id: string) { return this.payouts.get(id) ?? null; }
  async savePayout(p: Payout) { this.payouts.set(p.id, p); }
  async addAudit(a: AuditRow) { this.audit.push(a); }

  async getReferralCode(userId: string) { return this.refCodes.get(userId) ?? null; }
  async setReferralCode(userId: string, code: string) { this.refCodes.set(userId, code); }
  async findUserIdByReferralCode(code: string) { for (const [u, c] of this.refCodes) if (c === code) return u; return null; }
  async createReferral(r: Referral) {
    if ([...this.referrals.values()].some(x => x.referredId === r.referredId)) throw new DuplicateError("already referred");
    this.referrals.set(r.id, r);
  }
  async getReferral(id: string) { return this.referrals.get(id) ?? null; }
  async listReferralsByReferrer(userId: string) { return [...this.referrals.values()].filter(r => r.referrerId === userId); }
  async listReferralsByStatus(status: ReferralStatus) { return [...this.referrals.values()].filter(r => r.status === status); }
  async saveReferral(r: Referral) { this.referrals.set(r.id, r); }
  async countByNetworkBetween(h: string, from: number, to: number) { return [...this.referrals.values()].filter(r => r.networkHash === h && r.createdAt >= from && r.createdAt <= to).length; }
  async globalEarnedCents() { return this.ledger.filter(r => r.type === "earn").reduce((a, r) => a + r.amountCents, 0); }

  async addPayoutMethod(m: PayoutMethod) { this.methods.set(m.id, m); }
  async getPayoutMethod(userId: string, id: string) { const m = this.methods.get(id); return m && m.userId === userId ? m : null; }
  async listPayoutMethods(userId: string) { return [...this.methods.values()].filter(m => m.userId === userId); }
  async openPayoutFor(userId: string) { return [...this.payouts.values()].find(p => p.userId === userId && ["pending", "in_progress", "action_required"].includes(p.status)) ?? null; }
  async getPayoutByIdem(userId: string, key: string) { return [...this.payouts.values()].find(p => p.userId === userId && p.idempotencyKey === key) ?? null; }
  async listPayoutsFor(userId: string) { return [...this.payouts.values()].filter(p => p.userId === userId).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)); }
  async listPayouts(status?: PayoutStatus) { return [...this.payouts.values()].filter(p => !status || p.status === status); }

  async saveChallenge(c: ChallengeRec) { this.challenges.set(c.id, c); }
  async getChallenge(id: string) { return this.challenges.get(id) ?? null; }
  async listChallenges(onlyPublished: boolean) { return [...this.challenges.values()].filter(c => !onlyPublished || c.published).sort((a, b) => a.startsAt - b.startsAt); }
  async joinChallenge(p: Participation) {
    if (this.parts.some(x => x.challengeId === p.challengeId && x.userId === p.userId)) throw new DuplicateError("already joined");
    this.parts.push(p);
  }
  async getParticipation(challengeId: string, userId: string) { return this.parts.find(x => x.challengeId === challengeId && x.userId === userId) ?? null; }
  async participationsOf(userId: string) { return this.parts.filter(x => x.userId === userId); }
  async participationsFor(challengeId: string) { return this.parts.filter(x => x.challengeId === challengeId); }
  async saveParticipation(p: Participation) { const i = this.parts.findIndex(x => x.challengeId === p.challengeId && x.userId === p.userId); if (i >= 0) this.parts[i] = p; }
  async addEvent(e: EventRow) { if (this.events.some(x => x.userId === e.userId && x.key === e.key)) return false; this.events.push(e); return true; }
  async listEvents(userId: string) { return this.events.filter(e => e.userId === userId); }
  async addXp(x: XpRow) { if (this.xp.some(r => r.key === x.key)) return false; this.xp.push(x); return true; }
  async xpRows(userId: string) { return this.xp.filter(r => r.userId === userId); }
  async xpRowsSince(since: number) { return this.xp.filter(r => r.at >= since); }
  async findUserByPseudonym(name: string) { return [...this.users.values()].find(u => u.pseudonym?.toLowerCase() === name.toLowerCase()) ?? null; }
  async addRewardClaim(c: RewardClaimRow) { this.rewardClaims.push(c); }

  async getConnection(userId: string): Promise<GoogleConn> { return this.conns.get(userId) ?? { status: "not_connected" }; }
  async saveConnection(userId: string, c: GoogleConn) { this.conns.set(userId, c); }
  async getSyncSettings(userId: string): Promise<SyncSettings> { return this.syncSettings.get(userId) ?? { autoSync: true, paused: false }; }
  async saveSyncSettings(userId: string, s: SyncSettings) { this.syncSettings.set(userId, s); }
  async setContactSync(userId: string, contactId: string, p: { state?: string; resourceName?: string; etag?: string }) {
    const c = await this.getContact(userId, contactId);
    if (!c) return;
    const n: Contact = { ...c };
    if (p.state) n.syncState = p.state;
    if (p.resourceName) n.googleResourceName = p.resourceName;
    if (p.etag) n.googleEtag = p.etag;
    this.contacts.set(contactId, n); // does not bump updatedAt: a sync result is not a user edit
  }
  async syncCounts(userId: string): Promise<SyncCounts> {
    const all = await this.allContacts(userId);
    const n = (s: string) => all.filter(c => c.syncState === s).length;
    return { total: all.length, synced: n("synced"), pending: n("pending"), failed: n("failed"), conflict: n("conflict") };
  }
  async insertSyncJob(j: SyncJob) { if (![...this.syncJobs.values()].some(x => x.idempotencyKey === j.idempotencyKey)) this.syncJobs.set(j.id, j); }
  async findSyncJobByKey(key: string) { return [...this.syncJobs.values()].find(j => j.idempotencyKey === key) ?? null; }
  async claimSyncJob(id: string) { const j = this.syncJobs.get(id); if (!j || j.status !== "pending") return false; j.status = "running"; this.runningSince.set(id, this.clock()); return true; }
  async requeueStaleSyncJobs(olderThanMs: number) { let n = 0; for (const j of this.syncJobs.values()) { const t = this.runningSince.get(j.id); if (j.status === "running" && t !== undefined && this.clock() - t > olderThanMs) { j.status = "pending"; n++; } } return n; }
  async dueSyncJobs(now: number, limit: number) { return [...this.syncJobs.values()].filter(j => j.status === "pending" && j.nextAttemptAt <= now).sort((a, b) => a.nextAttemptAt - b.nextAttemptAt).slice(0, limit); }
  async saveSyncJob(j: SyncJob) { this.syncJobs.set(j.id, j); }
  async listSyncJobsFor(userId: string) { return [...this.syncJobs.values()].filter(j => j.userId === userId); }
  async addSyncLog(userId: string, outcome: string, at: number) { this.syncLogs.push({ userId, outcome, at }); }
  async lastSyncAt(userId: string) { const l = this.syncLogs.filter(x => x.userId === userId && x.outcome === "synced"); return l.length ? Math.max(...l.map(x => x.at)) : null; }
}
