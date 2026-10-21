import { randomUUID, randomBytes } from "node:crypto";
import type { AppCtx } from "../app.ts";
import { HttpError, pick, readJson, v, EMAIL } from "../kit.ts";
import { maskEmail } from "../../domain/phone.ts";
import { encrypt } from "../../security/crypto.ts";
import { computeBalances } from "../../domain/ledger.ts";
import { canRequestWithdrawal } from "../../domain/money.ts";
import { loadPolicy, loadMilestones, createPayoutRequest, autoPayout } from "../../domain/rewards.ts";
import { loadReferralPolicy } from "../../domain/referral-engine.ts";

const KINDS = ["paypal", "binance_pay", "pix"] as const;

/** Accepted payout identifiers. Never a password, private key, recovery phrase, card number, CVV or PIN. */
function validateDetails(kind: (typeof KINDS)[number], details: string): string {
  const d = details.trim();
  if (d.length < 3 || d.length > 140) throw new HttpError(400, "invalid_details");
  if (kind === "paypal" && !EMAIL.test(d)) throw new HttpError(400, "invalid_paypal_email");
  if (kind === "binance_pay" && !(/^\d{6,12}$/.test(d) || EMAIL.test(d))) throw new HttpError(400, "invalid_binance_id"); // Binance Pay ID or the account e-mail
  if (kind === "pix" && !(EMAIL.test(d) || /^\+?\d{10,14}$/.test(d.replace(/[\s().-]/g, "")) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d) || /^\d{11}$|^\d{14}$/.test(d.replace(/\D/g, "")))) {
    throw new HttpError(400, "invalid_pix_key"); // e-mail, phone, random key, CPF (11 digits) or CNPJ (14 digits)
  }
  if (d.split(/\s+/).length >= 12) throw new HttpError(400, "looks_like_secret"); // a 12-24 word recovery phrase is never a payout address
  return d;
}
function hintFor(kind: (typeof KINDS)[number], d: string): string {
  if (EMAIL.test(d)) return maskEmail(d);
  const digits = d.replace(/\W/g, "");
  return kind === "pix" && digits.length > 20 ? `••••${digits.slice(-4)}` : `••••${digits.slice(-3)}`;
}

export function registerMoney(app: AppCtx) {
  const { router: r, store, config, now, send, sv } = app;
  const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from(randomBytes(10), b => A[b % A.length]).join(""); };

  /* ---------- referrals ---------- */
  r.get("/api/referrals/me", { summary: "Referral code, link, counts, clicks, milestones and the cash reward status", tag: "referrals", access: "user" }, async c => {
    const u = c.user!;
    let code = await store.getReferralCode(u.id);
    if (!code) { await store.setReferralCode(u.id, newCode()); code = (await store.getReferralCode(u.id))!; }
    const [counts, clicks, reached, milestones, claims, policy, restrictions] = await Promise.all([store.referralCounts(u.id), store.clickCount(u.id), store.milestonesOf(u.id), loadMilestones(sv),
      store.listRewardClaimsFor(u.id), loadReferralPolicy(sv), store.activeRestrictions(u.id)]);
    const reachedSet = new Map(reached.map(m => [m.threshold, m.at]));
    const cash = milestones.find(m => m.cashCents);
    const cashClaim = cash ? claims.find(x => x.source === `milestone:${cash.threshold}`) : undefined;
    const payout = cashClaim ? await store.payoutForClaim(cashClaim.id) : null;
    send(c, 200, {
      code, link: `${config.appUrl}/register?ref=${code}`, counts, clicks, restricted: restrictions.has("referrals"),
      milestones: milestones.map(m => ({ threshold: m.threshold, xp: m.xp ?? 0, badge: m.badge ?? null, cashCents: m.cashCents ?? null, reachedAt: reachedSet.get(m.threshold) ?? null })),
      cashReward: cash ? { threshold: cash.threshold, cents: cash.cashCents, currency: "USD", progress: Math.min(counts.qualified, cash.threshold),
        claim: cashClaim ? { id: cashClaim.id, status: cashClaim.status, createdAt: cashClaim.createdAt, note: cashClaim.note ?? null } : null,
        payout: payout ? { id: payout.id, status: payout.status, maskedHint: payout.maskedHint, method: payout.methodKind, createdAt: payout.createdAt, paidAt: payout.paidAt ?? null } : null } : null,
      rules: { waitingPeriodHours: policy.minAccountAgeMs / 3600_000, maxSignupsPerNetworkPerDay: policy.maxPerNetworkPerDay },
    });
  });
  r.get("/api/referrals/list", { summary: "People you referred (first name initial only, status, dates)", tag: "referrals", access: "user" }, async c => {
    const list = (await store.listReferralsByReferrer(c.user!.id)).slice(0, 500);
    const names = await Promise.all(list.map(x => store.getUser(x.referredId)));
    send(c, 200, { items: list.map((x, i) => ({ id: x.id, member: names[i] && names[i]!.status !== "deleted" ? `${(names[i]!.name.trim()[0] ?? "?").toUpperCase()}.` : "—", status: x.status,
      reason: x.status === "disqualified" || x.status === "under_review" ? (x.reason ?? null) : null, createdAt: x.createdAt, qualifiedAt: x.qualifiedAt ?? null })) });
  });

  /* ---------- wallet: read-only, balances are derived from the ledger, never accepted from the client ---------- */
  r.get("/api/wallet", { summary: "Balances (earned, available, reserved, paid), policy and reward claims", tag: "wallet", access: "user" }, async c => {
    const u = c.user!;
    const [ledger, policy, claims, open, restrictions] = await Promise.all([store.ledgerFor(u.id), loadPolicy(sv), store.listRewardClaimsFor(u.id), store.openPayoutFor(u.id), store.activeRestrictions(u.id)]);
    const b = computeBalances(ledger);
    const failed = (await store.listPayoutsFor(u.id)).filter(p => p.status === "failed" || p.status === "rejected").reduce((a, p) => a + p.amountCents, 0);
    send(c, 200, { ...b, failedOrRejectedCents: failed, currency: "USD", minWithdrawCents: policy.minWithdrawCents, canWithdraw: canRequestWithdrawal(b.available, policy) && !open && !restrictions.has("rewards"),
      openPayoutId: open?.id ?? null, restricted: restrictions.has("rewards"),
      claims: claims.map(x => ({ id: x.id, source: x.source, kind: x.kind, status: x.status, amountCents: x.amountCents ?? null, createdAt: x.createdAt, note: x.status === "rejected" || x.status === "action_required" ? (x.note ?? null) : null })) });
  });
  r.get("/api/wallet/transactions", { summary: "Ledger entries (append-only history)", tag: "wallet", access: "user" }, async c => {
    const rows = await store.ledgerFor(c.user!.id);
    send(c, 200, { items: rows.slice().reverse().slice(0, 300).map(x => ({ id: x.id, type: x.type, amountCents: x.amountCents, reason: x.reason ?? null, at: x.createdAt ?? null })) });
  });

  r.get("/api/payout-methods", { summary: "Saved payout methods (masked)", tag: "wallet", access: "user" }, async c => {
    send(c, 200, { items: (await store.listPayoutMethods(c.user!.id)).map(x => ({ id: x.id, kind: x.kind, recipientName: x.recipientName ?? null, maskedHint: x.maskedHint, createdAt: x.createdAt ?? null })) });
  });
  r.post("/api/payout-methods", { summary: "Add a payout method (PayPal e-mail, Binance Pay ID, Pix key). Stored encrypted.", tag: "wallet", access: "write", limit: "account",
    body: "{kind: paypal|binance_pay|pix, details, recipientName?}" }, async c => {
    const u = c.user!;
    const b = pick(await readJson(c.req), ["kind", "recipientName", "details"]);
    const kind = v.oneOf(b, "kind", KINDS, true)!;
    const details = validateDetails(kind, v.str(b, "details", { min: 3, max: 140, required: true })!);
    const recipientName = v.str(b, "recipientName", { max: 120 });
    if ((await store.listPayoutMethods(u.id)).length >= 5) throw new HttpError(409, "method_limit_reached");
    const id = randomUUID();
    const hint = hintFor(kind, details);
    await store.addPayoutMethod({ id, userId: u.id, kind, ...(recipientName ? { recipientName } : {}), detailsEnc: encrypt(details, app.deps.keyRing, `payout_method:${id}`), maskedHint: hint });
    await store.addSecurityEvent({ userId: u.id, kind: "payout_method_added", detail: { kind }, at: now() });
    await autoPayout(sv, u.id); // a milestone reward waiting for payout details starts now
    send(c, 201, { id, kind, maskedHint: hint }); // the plain details are never returned
  });
  r.delete("/api/payout-methods/:id", { summary: "Remove a payout method (requests already made keep their own frozen copy)", tag: "wallet", access: "write" }, async c => {
    if (!(await store.deletePayoutMethod(c.user!.id, c.params["id"]!))) throw new HttpError(404, "not_found");
    await store.addSecurityEvent({ userId: c.user!.id, kind: "payout_method_removed", detail: {}, at: now() });
    send(c, 200, { ok: true });
  });

  r.get("/api/payouts", { summary: "My payout requests", tag: "wallet", access: "user" }, async c => {
    const list = await store.listPayoutsFor(c.user!.id);
    send(c, 200, { items: list.map(p => ({ id: p.id, amountCents: p.amountCents, currency: "USD", status: p.status, method: p.methodKind ?? null, maskedHint: p.maskedHint, source: p.source ?? "withdrawal",
      createdAt: p.createdAt ?? null, paidAt: p.paidAt ?? null, txReference: p.status === "paid" ? (p.txReference ?? null) : null, note: p.status === "failed" || p.status === "rejected" || p.status === "action_required" ? (p.adminNotes ?? null) : null })) });
  });
  r.get("/api/payouts/:id", { summary: "One payout request with its status history", tag: "wallet", access: "user" }, async c => {
    const p = await store.getPayout(c.params["id"]!);
    if (!p || p.userId !== c.user!.id) throw new HttpError(404, "not_found");
    send(c, 200, { id: p.id, amountCents: p.amountCents, status: p.status, method: p.methodKind, maskedHint: p.maskedHint, source: p.source, createdAt: p.createdAt, paidAt: p.paidAt ?? null,
      txReference: p.status === "paid" ? (p.txReference ?? null) : null, history: (await store.payoutHistory(p.id)).map(h => ({ from: h.from, to: h.to, at: h.at, reason: h.to === "paid" ? null : (h.reason ?? null) })) });
  });
  r.post("/api/payouts/request", { summary: "Request a withdrawal of the available balance (Idempotency-Key header required)", tag: "wallet", access: "write", limit: "rewardClaim",
    body: "{methodId, amountCents?}" }, async c => {
    const u = c.user!;
    const idem = c.req.headers["idempotency-key"];
    if (typeof idem !== "string" || !/^[\w-]{8,64}$/.test(idem)) throw new HttpError(400, "idempotency_key_required");
    const b = pick(await readJson(c.req), ["methodId", "amountCents"]);
    if (typeof b["methodId"] !== "string") throw new HttpError(400, "method_required");
    const replay = await store.getPayoutByIdem(u.id, idem);
    if (replay) return send(c, 200, { id: replay.id, status: replay.status, amountCents: replay.amountCents, maskedHint: replay.maskedHint });
    const pm = await store.getPayoutMethod(u.id, b["methodId"]);
    if (!pm) throw new HttpError(404, "method_not_found");
    if (await store.openPayoutFor(u.id)) throw new HttpError(409, "payout_already_open");
    const policy = await loadPolicy(sv);
    const amount = b["amountCents"] === undefined ? computeBalances(await store.ledgerFor(u.id)).available : b["amountCents"];
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) throw new HttpError(400, "invalid_amount");
    const p = await createPayoutRequest(sv, u.id, pm, amount, { source: "withdrawal", idempotencyKey: idem, minCents: policy.minWithdrawCents });
    send(c, 201, { id: p.id, status: p.status, amountCents: p.amountCents, maskedHint: p.maskedHint });
  });

  r.get("/api/rewards", { summary: "Reward claims and the delivery status of non-cash rewards", tag: "wallet", access: "user" }, async c => {
    const claims = await store.listRewardClaimsFor(c.user!.id);
    const items = await Promise.all(claims.map(async x => {
      const f = x.kind !== "cash" ? await store.fulfillmentForClaim(x.id) : null;
      return { id: x.id, source: x.source, kind: x.kind, status: x.status, amountCents: x.amountCents ?? null, detail: x.detail ?? {}, createdAt: x.createdAt, updatedAt: x.updatedAt ?? null,
        fulfilment: f ? { status: f.status, updatedAt: f.updatedAt } : null, note: x.status === "rejected" || x.status === "action_required" ? (x.note ?? null) : null };
    }));
    send(c, 200, { items });
  });
}
