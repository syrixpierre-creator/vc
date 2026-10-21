export type PayoutStatus = "pending" | "in_progress" | "action_required" | "paid" | "failed" | "rejected";

const NEXT: Record<PayoutStatus, readonly PayoutStatus[]> = {
  pending: ["in_progress", "action_required", "rejected"],
  in_progress: ["paid", "failed", "action_required", "rejected"],
  action_required: ["pending", "rejected"],
  failed: ["pending"], // retry only after a human checked the first transfer did not go through
  paid: [],            // terminal: corrections are new ledger adjustments, never edits
  rejected: [],
};

export function canTransition(from: PayoutStatus, to: PayoutStatus): boolean {
  return NEXT[from].includes(to);
}

export interface TransitionInput {
  from: PayoutStatus;
  to: PayoutStatus;
  reason?: string;
  txReference?: string;
  confirmedPaid?: boolean;
}

export function assertTransition(i: TransitionInput): void {
  if (!canTransition(i.from, i.to)) throw new Error(`invalid payout transition ${i.from} -> ${i.to}`);
  if (i.to === "paid") {
    if (!i.confirmedPaid) throw new Error("marking as paid requires explicit confirmation");
    if (!i.txReference || i.txReference.trim().length < 3) throw new Error("marking as paid requires a transaction reference");
  }
  if ((i.to === "failed" || i.to === "rejected" || i.to === "action_required") && !(i.reason && i.reason.trim())) {
    throw new Error(`${i.to} requires a reason`);
  }
}
