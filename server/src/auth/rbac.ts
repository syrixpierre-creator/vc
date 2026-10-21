export type Role = "super_admin" | "user_manager" | "finance_manager" | "challenge_manager" | "support_agent" | "auditor";

export type Permission =
  | "users.read" | "users.suspend" | "users.restrict" | "sessions.revoke"
  | "payouts.read" | "payouts.review" | "payouts.mark_paid" | "ledger.adjust" | "rewards.fulfil"
  | "challenges.manage" | "announcements.manage" | "tickets.read" | "tickets.respond"
  | "fraud.review" | "audit.read" | "roles.manage" | "reports.export" | "settings.manage" | "sync.manage" | "deletions.manage";

export const ROLES: readonly Role[] = ["super_admin", "user_manager", "finance_manager", "challenge_manager", "support_agent", "auditor"];

/**
 * The single place where roles map to permissions (least privilege).
 * No role has a "contacts content" permission: admins see counts and sync status, never address books.
 * Finance cannot suspend users; support cannot touch money; the auditor only reads.
 */
const MATRIX: Record<Role, readonly Permission[]> = {
  super_admin: ["users.read", "users.suspend", "users.restrict", "sessions.revoke", "payouts.read", "payouts.review", "payouts.mark_paid", "ledger.adjust", "rewards.fulfil",
    "challenges.manage", "announcements.manage", "tickets.read", "tickets.respond", "fraud.review", "audit.read", "roles.manage", "reports.export", "settings.manage", "sync.manage", "deletions.manage"],
  user_manager: ["users.read", "users.suspend", "users.restrict", "sessions.revoke", "fraud.review", "sync.manage", "deletions.manage", "tickets.read"],
  finance_manager: ["users.read", "payouts.read", "payouts.review", "payouts.mark_paid", "ledger.adjust", "rewards.fulfil", "reports.export"],
  challenge_manager: ["challenges.manage", "announcements.manage", "rewards.fulfil"],
  support_agent: ["users.read", "tickets.read", "tickets.respond", "sync.manage"],
  auditor: ["users.read", "payouts.read", "audit.read", "tickets.read"],
};
export const PERMISSIONS: readonly Permission[] = MATRIX.super_admin;
export function isStaff(roles: readonly Role[]): boolean { return roles.length > 0; }

export function can(roles: readonly Role[], permission: Permission): boolean {
  return roles.some(r => MATRIX[r]?.includes(permission));
}
export function permissionsFor(roles: readonly Role[]): Permission[] {
  return [...new Set(roles.flatMap(r => MATRIX[r] ?? []))];
}

export interface AdminBootstrapInput { email: string; emailVerified: boolean; sub: string }
export interface AdminDecision { isSuperAdmin: boolean; pinSub?: string }

/**
 * ADMIN_EMAIL grants super-admin only to a *verified* Google identity.
 * On first success the Google subject is pinned: afterwards the email alone is not enough,
 * so a recycled or re-assigned address cannot take over the admin account.
 */
export function decideAdmin(i: AdminBootstrapInput, adminEmail: string, pinnedSub: string | null): AdminDecision {
  if (!i.emailVerified) return { isSuperAdmin: false };
  if (i.email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return { isSuperAdmin: false };
  if (pinnedSub === null) return { isSuperAdmin: true, pinSub: i.sub };
  return { isSuperAdmin: pinnedSub === i.sub };
}
