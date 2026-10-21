import type { Role } from "../auth/rbac.ts";
import type { PayoutStatus } from "../domain/payout.ts";
import type { LedgerEntry } from "../domain/ledger.ts";
import type { ChallengeDef, Metric } from "../domain/challenges.ts";
import type { SyncJob } from "../sync/engine.ts";

export type UserStatus = "active" | "suspended" | "pending_deletion" | "deleted";
export type ReviewStatus = "none" | "flagged" | "under_review" | "cleared" | "confirmed_fraud";
export interface User {
  id: string; googleSub: string; email: string; name: string; language: string; dialCode: string; phone?: string; pseudonym?: string; leaderboardOptIn?: boolean;
  status: UserStatus; roles: Role[]; createdAt: number;
  countryCode?: string; timeZone?: string; onboardedAt?: number; lastSeenAt?: number; avatarUrl?: string;
  suspendedUntil?: number; suspensionReason?: string; deletionRequestedAt?: number; premiumUntil?: number;
  reviewStatus?: ReviewStatus; reviewReason?: string;
}
export interface UserSettings {
  autoSync: boolean; paused: boolean; notifyEmailMarketing: boolean; notifyReminders: boolean; notifyInappProgress: boolean; notifyEmailRewards: boolean;
  profilePublic: boolean; leaderboardOptIn: boolean; theme: "dark" | "light" | "system";
}
export interface Contact {
  id: string; userId: string; fullName: string; phones: string[]; emails: string[]; organization?: string; title?: string; notes?: string;
  syncState: string; googleResourceName?: string; googleEtag?: string; labelIds: string[]; createdAt: number; updatedAt: number;
}
export type ContactInput = Pick<Contact, "fullName" | "phones" | "emails"> & Partial<Pick<Contact, "organization" | "title" | "notes">>;
export interface Label { id: string; name: string; color: string; count: number }
export interface ContactListQuery { q?: string; labelId?: string; syncState?: string; sort?: "name" | "-name" | "created" | "-created" | "updated" | "-updated"; limit: number; offset: number }
export interface HistoryRow { contactId: string; action: string; fields: string[]; source: string; at: number }
export interface BackupRow { id: string; userId: string; kind: "manual" | "automatic" | "before_restore"; label?: string; contactCount: number; vcardVersion: string; sizeBytes: number; payloadEnc?: string; createdAt: number; expiresAt?: number; restoredAt?: number }

export interface SessionRec { idHash: string; userId: string; createdAt: number; rotatedAt: number; expiresAt: number; lastSeenAt: number; revokedAt: number | null; userAgent?: string; ipPrefix?: string }
export interface Payout {
  id: string; userId: string; amountCents: number; status: PayoutStatus; maskedHint: string; txReference?: string; adminNotes?: string;
  methodKind?: string; snapshotEnc?: string; idempotencyKey?: string; createdAt?: number; updatedAt?: number;
  source?: "withdrawal" | "milestone" | "challenge"; rewardClaimId?: string; paidAt?: number; recipientName?: string;
}
export interface PayoutHistoryRow { from: string | null; to: string; reason?: string; txReference?: string; actorId?: string; at: number }
export type ReferralStatus = "pending" | "qualified" | "disqualified" | "under_review";
export interface Referral { id: string; referrerId: string; referredId: string; status: ReferralStatus; reason?: string; networkHash: string; createdAt: number; qualifiedAt?: number }
export interface PayoutMethod { id: string; userId: string; kind: "paypal" | "binance_pay" | "pix"; recipientName?: string; detailsEnc: string; maskedHint: string; createdAt?: number }
export interface LedgerRow extends LedgerEntry { userId: string; reason?: string; actorId?: string; createdAt?: number; reference?: string }
export interface AuditRow { actorId: string; action: string; resourceType: string; resourceId: string; from: unknown; to: unknown; reason?: string; at: number; correlationId?: string }
export interface PendingOAuth { nonce: string; codeVerifier: string; next: string; expiresAt: number; ref?: string; purpose?: "login" | "contacts"; userId?: string }

export interface ChallengeRec extends ChallengeDef {
  slug: string; rewardXp?: number; title: Record<string, string>; description: Record<string, string>; terms: string; published: boolean; claimDeadline?: number;
  reviewRequired?: boolean; eligibility?: { minAccountAgeDays?: number; minLevel?: number };
}
export type ParticipationStatus = "active" | "completed" | "reward_pending" | "reward_in_progress" | "reward_delivered" | "expired" | "rejected";
export interface Participation { challengeId: string; userId: string; joinedAt: number; completedAt?: number; claimedAt?: number; awardedCents?: number; status?: ParticipationStatus; reviewNote?: string }
export interface EventRow { userId: string; type: Metric; at: number; key: string }
export interface XpRow { userId: string; amount: number; reason: string; key: string; at: number }

export type ClaimStatus = "pending" | "in_progress" | "completed" | "failed" | "action_required" | "rejected";
export interface RewardClaimRow { id: string; userId: string; source: string; kind: string; status: ClaimStatus; createdAt: number; amountCents?: number; detail?: Record<string, unknown>; note?: string; updatedAt?: number; idempotencyKey?: string }
export interface FulfillmentRow { id: string; claimId: string; kind: string; status: ClaimStatus; deliveryConfirmation?: string; notes?: string; adminId?: string; createdAt: number; updatedAt: number }

export type ConnStatus = "not_connected" | "connected" | "revoked" | "refresh_failed" | "reconnect_requested";
export interface GoogleConn { status: ConnStatus; refreshTokenEnc?: string; accessTokenEnc?: string; accessExpiresAt?: number }
export interface SyncSettings { autoSync: boolean; paused: boolean }
export interface SyncCounts { total: number; synced: number; pending: number; failed: number; conflict: number; localOnly: number }
export interface SyncLogRow { outcome: string; contactId?: string; at: number }

export interface NotificationRow { id: string; userId: string; kind: string; payload: Record<string, unknown>; essential: boolean; readAt?: number; createdAt: number }
export interface AnnouncementRow { id: string; kind: string; title: Record<string, string>; body: Record<string, string>; status: "draft" | "published" | "archived"; pinned: boolean; showOnSite: boolean; publishedAt?: number; createdAt: number; createdBy?: string }
export type TicketCategory = "bug" | "payment" | "account" | "partnership" | "feature" | "other";
export interface TicketRow { id: string; userId: string; category: TicketCategory; subject: string; body: string; status: "open" | "pending" | "closed"; priority: "low" | "normal" | "high" | "urgent"; assignedTo?: string; createdAt: number; updatedAt: number; closedAt?: number }
export interface TicketMessage { id: string; ticketId: string; authorId?: string; isStaff: boolean; internal: boolean; body: string; createdAt: number }
export type RestrictionScope = "account" | "referrals" | "rewards" | "challenges" | "read_only";
export interface Restriction { id: string; userId: string; scope: RestrictionScope; reason: string; adminId: string; startsAt: number; expiresAt?: number; liftedAt?: number }
export interface SecurityEvent { id?: number; userId?: string; kind: string; detail: Record<string, unknown>; ipPrefix?: string; at: number }
export interface VipLevel { id: number; name: string; minXp: number; benefits: Record<string, string> }
export interface UserListQuery { q?: string; status?: string; review?: string; role?: string; sort?: "created" | "-created" | "name" | "-name" | "last_seen" | "-last_seen"; limit: number; offset: number }
export interface UserListRow { id: string; name: string; email: string; status: UserStatus; reviewStatus: ReviewStatus; countryCode?: string; language: string; createdAt: number; lastSeenAt?: number; contactCount: number; qualifiedReferrals: number; roles: Role[]; xp: number; pendingCents: number; paidCents: number; contactsStatus: ConnStatus }

export class DuplicateError extends Error {}
export class ConflictError extends Error {}

export type { SyncJob };
