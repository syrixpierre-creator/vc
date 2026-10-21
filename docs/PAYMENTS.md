# Rewards and payouts: how money moves (runbook for the finance role)

Nothing is ever paid automatically. The system tracks what is owed; a person sends the money and records proof.

## Where money comes from
- **Referral milestone**: when a user's 500th referral qualifies, a one-time **$10.00** reward is created (`referral_milestones` in Admin → Settings). Badges and XP at 10/25/50/100/250 have no cash value.
- **Challenge cash rewards**: only on challenges created with a cash amount *and* a budget.
- **Per-referral cash** is off by default (`reward_policy.centsPerReferral = 0`).
- Budgets (Admin → Settings → Budget): a per-user cap and a global cap. A reward that would exceed a cap is not credited; it waits in Admin → Reward delivery as "Action required" until someone funds or rejects it.

## The ledger
Every movement is an append-only row in `reward_ledger` (the database refuses UPDATE and DELETE): `earn`, `reserve` (payout requested), `release` (payout failed/rejected: money back to the user), `pay` (sent), `adjustment` (correction with a reason). Balances are always computed from the ledger. Each row has an idempotency key, so a retried job or a double click cannot credit twice.

## Paying a payout (Admin → Payouts)
1. Open the request. The recipient is masked; click **Show full details** (needs `payouts.mark_paid`, asks for a reason, recorded in the audit log). The details shown are the ones frozen when the user asked, even if they changed their method since.
2. **Start processing** (status *In progress*) so nobody else sends it twice.
3. Send the money from the company PayPal / Binance Pay / Pix account. Never ask the user for passwords, codes or remote access.
4. **Mark as paid**: enter the transaction reference from the provider and tick "I sent …". Without a reference it cannot be marked paid.
5. If the transfer fails or the details are wrong: **Mark as failed** or **Ask the user for an action** with a reason the user will read. The amount is released back to their balance; they can fix their details and request again.

Statuses: `pending → in_progress → paid` (final), or `failed` / `rejected` (money released), or `action_required` (waiting for the user). The history of each change, who made it and why, is kept in `payout_status_history` and the audit log.

## Corrections
Admin → Users → user → Actions → **Ledger adjustment** (needs `ledger.adjust`, reason required). Use it for documented mistakes only. It cannot make a balance negative.

## Non-cash rewards (Telegram Stars/Premium, WhatsApp promotion)
Admin → Reward delivery. Deliver by hand, then set *Delivered* with evidence (message link, gift ID). The user sees the status and your note.

## Checks before paying (fraud)
- Admin → Referral review: referrals held back by the network-burst rule. Qualify or disqualify with a reason.
- Look at the user's referrals tab: many referred accounts created the same day from the same network, unverified e-mails or immediate inactivity are warning signs. Restrict referrals or rewards if needed (reversible, audited).

## Reports
Admin → Reports: CSV of users, payouts (masked recipients, references), referrals, rewards. Exports never contain contact data and are audited.
