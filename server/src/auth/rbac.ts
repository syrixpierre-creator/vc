export type Role = "super_admin" | "user_manager" | "finance_manager" | "challenge_manager" | "support_agent" | "auditor";

export type Permission =
  | "users.read" | "users.suspend" | "users.restrict" | "sessions.revoke"
  | "payouts.read" | "payouts.review" | "payouts.mark_paid" | "ledger.adjust"
  | "challenges.manage" | "announcements.manage" | "tickets.read" | "tickets.respond"
  | "fraud.review" | "audit.read" | "roles.manage" | "reports.export";

/** Note: no role has a "contacts content" permission. Admins see counts and sync status, never address books. */
const MATRIX: Record<Role, readonly Permission[]> = {
  super_admin: ["users.read", "users.suspend", "users.restrict", "sessions.revoke", "payouts.read", "payouts.review", "payouts.mark_paid",
    "ledger.adjust", "challenges.manage", "announcements.manage", "tickets.read", "tickets.respond", "fraud.review", "audit.read", "roles.manage", "reports.export"],
  user_manager: ["users.read", "users.suspend", "users.restrict", "sessions.revoke", "fraud.review"],
  finance_manager: ["users.read", "payouts.read", "payouts.review", "payouts.mark_paid", "ledger.adjust", "reports.export"],
  challenge_manager: ["challenges.manage", "announcements.manage"],
  support_agent: ["users.read", "tickets.read", "tickets.respond"],
  auditor: ["users.read", "payouts.read", "audit.read"],
};

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
