import type { Role } from "../auth/rbac.ts";
import type { PayoutStatus } from "../domain/payout.ts";
import type { LedgerEntry } from "../domain/ledger.ts";
import type { ChallengeDef, Metric } from "../domain/challenges.ts";
import type { SyncJob } from "../sync/engine.ts";

export interface User { id: string; googleSub: string; email: string; name: string; language: string; dialCode: string; phone?: string; pseudonym?: string; leaderboardOptIn?: boolean; status: "active" | "suspended"; roles: Role[]; createdAt: number }
export interface Contact { id: string; userId: string; fullName: string; phone?: string; emails: string[]; organization?: string; title?: string; notes?: string; syncState: string; googleResourceName?: string; googleEtag?: string; createdAt: number; updatedAt: number }
export interface SessionRec { idHash: string; userId: string; createdAt: number; rotatedAt: number; expiresAt: number; lastSeenAt: number; revokedAt: number | null }
export interface Payout { id: string; userId: string; amountCents: number; status: PayoutStatus; maskedHint: string; txReference?: string; adminNotes?: string;
  methodKind?: string; snapshotEnc?: string; idempotencyKey?: string; createdAt?: number }
export type ReferralStatus = "pending" | "qualified" | "disqualified" | "under_review";
export interface Referral { id: string; referrerId: string; referredId: string; status: ReferralStatus; reason?: string; networkHash: string; createdAt: number; qualifiedAt?: number }
export interface PayoutMethod { id: string; userId: string; kind: "paypal" | "binance_pay" | "pix"; recipientName?: string; detailsEnc: string; maskedHint: string }
export interface LedgerRow extends LedgerEntry { userId: string }
export interface AuditRow { actorId: string; action: string; resourceType: string; resourceId: string; from: unknown; to: unknown; reason?: string; at: number }
export interface PendingOAuth { nonce: string; codeVerifier: string; next: string; expiresAt: number; ref?: string; purpose?: "login" | "contacts"; userId?: string }

export interface ChallengeRec extends ChallengeDef { slug: string; rewardXp?: number; title: Record<string, string>; description: Record<string, string>; terms: string; published: boolean; claimDeadline?: number }
export interface Participation { challengeId: string; userId: string; joinedAt: number; completedAt?: number; claimedAt?: number; awardedCents?: number }
export interface EventRow { userId: string; type: Metric; at: number; key: string }
export interface XpRow { userId: string; amount: number; reason: string; key: string; at: number }
export interface RewardClaimRow { id: string; userId: string; source: string; kind: string; status: "pending"; createdAt: number }

export type ConnStatus = "not_connected" | "connected" | "revoked" | "refresh_failed" | "reconnect_requested";
export interface GoogleConn { status: ConnStatus; refreshTokenEnc?: string; accessTokenEnc?: string; accessExpiresAt?: number }
export interface SyncSettings { autoSync: boolean; paused: boolean }
export interface SyncCounts { total: number; synced: number; pending: number; failed: number; conflict: number }

export class DuplicateError extends Error {}

/**
 * Every contact method takes the owner's userId: a row can only be reached through its owner (anti-IDOR by construction).
 * The PostgreSQL adapter implements the same interface and must keep that rule in its WHERE clauses.
 */
export interface Store {
  findUserBySub(sub: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  createUser(u: Omit<User, "id" | "createdAt">): Promise<User>;
  saveUser(u: User): Promise<void>;
  findUserByPhone(phone: string): Promise<User | null>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;

  putPending(state: string, p: PendingOAuth): Promise<void>;
  takePending(state: string): Promise<PendingOAuth | null>; // one-time use

  createSession(s: SessionRec): Promise<void>;
  getSession(idHash: string): Promise<SessionRec | null>;
  saveSession(s: SessionRec): Promise<void>;

  listContacts(userId: string, o: { q?: string; limit: number; offset: number }): Promise<{ rows: Contact[]; total: number }>;
  allContacts(userId: string): Promise<Contact[]>;
  getContact(userId: string, id: string): Promise<Contact | null>;
  createContact(userId: string, c: Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt" | "syncState">): Promise<Contact>; // throws DuplicateError
  updateContact(userId: string, id: string, patch: Partial<Omit<Contact, "id" | "userId">>): Promise<Contact | null>;
  deleteContact(userId: string, id: string): Promise<boolean>;

  ledgerFor(userId: string): Promise<LedgerRow[]>;
  addLedger(row: LedgerRow): Promise<void>; // idempotent on idempotencyKey
  getPayout(id: string): Promise<Payout | null>;
  savePayout(p: Payout): Promise<void>;
  addAudit(a: AuditRow): Promise<void>;

  getReferralCode(userId: string): Promise<string | null>;
  setReferralCode(userId: string, code: string): Promise<void>;
  findUserIdByReferralCode(code: string): Promise<string | null>;
  createReferral(r: Referral): Promise<void>; // throws DuplicateError if the person was already referred
  getReferral(id: string): Promise<Referral | null>;
  listReferralsByReferrer(userId: string): Promise<Referral[]>;
  listReferralsByStatus(status: ReferralStatus): Promise<Referral[]>;
  saveReferral(r: Referral): Promise<void>;
  /** referrals from the same network created between `from` and `to` (inclusive) */
  countByNetworkBetween(networkHash: string, from: number, to: number): Promise<number>;
  globalEarnedCents(): Promise<number>;

  addPayoutMethod(m: PayoutMethod): Promise<void>;
  getPayoutMethod(userId: string, id: string): Promise<PayoutMethod | null>;
  listPayoutMethods(userId: string): Promise<PayoutMethod[]>;
  openPayoutFor(userId: string): Promise<Payout | null>;
  getPayoutByIdem(userId: string, key: string): Promise<Payout | null>;
  listPayouts(status?: PayoutStatus): Promise<Payout[]>;
  listPayoutsFor(userId: string): Promise<Payout[]>;

  saveChallenge(c: ChallengeRec): Promise<void>;
  getChallenge(id: string): Promise<ChallengeRec | null>;
  listChallenges(onlyPublished: boolean): Promise<ChallengeRec[]>;
  joinChallenge(p: Participation): Promise<void>; // throws DuplicateError
  getParticipation(challengeId: string, userId: string): Promise<Participation | null>;
  participationsOf(userId: string): Promise<Participation[]>;
  participationsFor(challengeId: string): Promise<Participation[]>;
  saveParticipation(p: Participation): Promise<void>;
  addEvent(e: EventRow): Promise<boolean>; // false when the key was already recorded (replay)
  listEvents(userId: string): Promise<EventRow[]>;
  addXp(x: XpRow): Promise<boolean>;
  xpRows(userId: string): Promise<XpRow[]>;
  xpRowsSince(since: number): Promise<XpRow[]>;
  findUserByPseudonym(name: string): Promise<User | null>;
  addRewardClaim(c: RewardClaimRow): Promise<void>;

  getConnection(userId: string): Promise<GoogleConn>;
  saveConnection(userId: string, c: GoogleConn): Promise<void>;
  getSyncSettings(userId: string): Promise<SyncSettings>;
  saveSyncSettings(userId: string, s: SyncSettings): Promise<void>;
  setContactSync(userId: string, contactId: string, p: { state?: string; resourceName?: string; etag?: string }): Promise<void>;
  syncCounts(userId: string): Promise<SyncCounts>;
  insertSyncJob(j: SyncJob): Promise<void>; // ignores a repeated idempotency key
  findSyncJobByKey(key: string): Promise<SyncJob | null>;
  claimSyncJob(id: string): Promise<boolean>; // atomic pending -> running
  dueSyncJobs(now: number, limit: number): Promise<SyncJob[]>;
  saveSyncJob(j: SyncJob): Promise<void>;
  listSyncJobsFor(userId: string): Promise<SyncJob[]>;
  requeueStaleSyncJobs(olderThanMs: number): Promise<number>;
  addSyncLog(userId: string, outcome: string, at: number): Promise<void>;
  lastSyncAt(userId: string): Promise<number | null>;
}
