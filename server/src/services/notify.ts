import type { Store } from "../store/pg.ts";
import type { Dispatcher } from "./queue.ts";
import type { KeyRing } from "../security/crypto.ts";
import { can, type Permission } from "../auth/rbac.ts";

/** What background-capable domain code needs: the store, the queue, the clock. */
export interface Services { store: Store; dispatch: Dispatcher; now: () => number; keyRing: KeyRing; log: (level: string, msg: string, extra?: object) => void }

/**
 * Notification kinds. `essential` ones (security, money, support answers) are always shown and cannot be switched off;
 * the others respect the user's "progress notifications" preference. `email` ones are also e-mailed when allowed.
 */
export const KINDS = {
  sync_revoked: { essential: true, email: false },
  sync_reconnect_requested: { essential: true, email: false },
  referral_milestone: { essential: false, email: false },
  reward_eligible: { essential: true, email: true },
  reward_review: { essential: true, email: false },
  add_payout_method: { essential: true, email: true },
  payout_update: { essential: true, email: true },
  fulfilment_update: { essential: true, email: true },
  challenge_completed: { essential: false, email: false },
  challenge_review: { essential: true, email: false },
  achievement: { essential: false, email: false },
  level_up: { essential: false, email: false },
  ticket_reply: { essential: true, email: true },
  security: { essential: true, email: true },
  account_deletion: { essential: true, email: true },
  staff_task: { essential: true, email: false },
} as const;
export type NotificationKind = keyof typeof KINDS;

export async function notify(sv: Services, userId: string, kind: NotificationKind, payload: Record<string, unknown> = {}): Promise<void> {
  const k = KINDS[kind];
  const settings = await sv.store.getSettings(userId);
  if (k.essential || settings.notifyInappProgress) await sv.store.addNotification({ userId, kind, payload, essential: k.essential });
  const emailAllowed = kind === "reward_eligible" || kind === "payout_update" || kind === "add_payout_method" || kind === "fulfilment_update" ? settings.notifyEmailRewards : true;
  if (k.email && emailAllowed) {
    try { await sv.dispatch.email({ userId, template: kind, vars: payload }); }
    catch (e) { sv.log("warn", "email enqueue failed", { kind, error: (e as Error).message }); } // in-app notice already stored
  }
}

/** Tells every staff member holding `perm` that something waits for them (in-app only). */
export async function notifyStaff(sv: Services, perm: Permission, payload: Record<string, unknown>): Promise<void> {
  for (const u of await sv.store.usersWithRole()) if (u.status === "active" && can(u.roles, perm)) await sv.store.addNotification({ userId: u.id, kind: "staff_task", payload, essential: true });
}

/**
 * Runs `fn` in one database transaction with a store bound to it. Queue pushes and e-mails requested inside
 * are held back and sent only after COMMIT, so a rolled-back operation never e-mails anyone.
 */
export async function inTx<T>(sv: Services, fn: (svx: Services) => Promise<T>): Promise<T> {
  if (sv.store.db.inTransaction) return fn(sv);
  const later: (() => Promise<void>)[] = [];
  const dispatch = {
    syncJob: (id: string, attempt: number, delayMs?: number) => { later.push(() => sv.dispatch.syncJob(id, attempt, delayMs)); return Promise.resolve(); },
    email: (j: Parameters<Services["dispatch"]["email"]>[0]) => { later.push(() => sv.dispatch.email(j)); return Promise.resolve(); },
    close: () => sv.dispatch.close(),
  };
  const out = await sv.store.tx(s => fn({ ...sv, store: s, dispatch }));
  for (const f of later) await f().catch(e => sv.log("warn", "deferred dispatch failed", { error: (e as Error).message }));
  return out;
}
