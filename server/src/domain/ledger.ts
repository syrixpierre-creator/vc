import type { Cents } from "./money.ts";

export type LedgerType = "earn" | "reserve" | "release" | "pay" | "adjustment";
export interface LedgerEntry { id: string; type: LedgerType; amountCents: Cents; idempotencyKey: string }
export interface Balances { earned: Cents; available: Cents; reserved: Cents; paid: Cents }

/** Append-only ledger. Balances are always derived, never stored or sent by the client. */
export function computeBalances(entries: readonly LedgerEntry[]): Balances {
  const b: Balances = { earned: 0, available: 0, reserved: 0, paid: 0 };
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.idempotencyKey)) continue; // a replayed entry is ignored
    seen.add(e.idempotencyKey);
    if (!Number.isSafeInteger(e.amountCents)) throw new RangeError("ledger amount must be an integer");
    const a = e.amountCents;
    switch (e.type) {
      case "earn": b.earned += a; b.available += a; break;
      case "reserve": b.available -= a; b.reserved += a; break;
      case "release": b.available += a; b.reserved -= a; break;
      case "pay": b.reserved -= a; b.paid += a; break;
      case "adjustment": b.available += a; break;
    }
  }
  if (b.available < 0 || b.reserved < 0) throw new Error("ledger invariant broken: negative balance");
  return b;
}

/** Same rule the SQL function request_payout() enforces under a row lock. */
export function canReserve(b: Balances, amountCents: Cents): boolean {
  return Number.isSafeInteger(amountCents) && amountCents > 0 && amountCents <= b.available;
}
