import { h, icon, t, tOr, api, act, num, money, date, dateTime, toast, modal, confirmDialog, field, empty } from "/js/core.js";
import { pageHead, kpi, card, statusBadge, methodMark, methodName } from "/js/app/ui.js";

/* Wallet: balances derived from the ledger, reward claims, payout methods (encrypted, masked), withdrawals and their history. */
export default async function wallet({ app }) {
  const view = h("div", {});
  async function draw() {
    const [w, m, p, tx, rw] = await Promise.all([api("/api/wallet"), api("/api/payout-methods"), api("/api/payouts"), api("/api/wallet/transactions"), api("/api/rewards")]);
    const canRequest = w.canWithdraw && m.items.length > 0;
    const request = h("button", { class: "btn btn-primary", type: "button", id: "withdraw", disabled: !canRequest, onclick: () => withdraw(w, m.items) }, icon("arrow-up-right"), t("wal.withdraw"));
    const why = w.restricted ? t("wal.whyRestricted") : w.openPayoutId ? t("wal.whyOpen") : w.available < w.minWithdrawCents ? t("wal.whyMin", { amount: money(w.minWithdrawCents) }) : !m.items.length ? t("wal.whyMethod") : null;

    const methods = card(t("wal.methods"), h("div", { class: "stack" },
      m.items.length ? m.items.map(x => h("div", { class: "method" }, methodMark(x.kind), h("div", { class: "grow" }, h("b", { class: "small" }, methodName(x.kind)), h("div", { class: "xs muted ltr" }, x.maskedHint, x.recipientName ? ` · ${x.recipientName}` : "")),
        h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.delete"), onclick: () => removeMethod(x) }, icon("trash")))) : h("p", { class: "small muted" }, t("wal.noMethods")),
      h("button", { class: "btn btn-sm", type: "button", style: { justifySelf: "start" }, onclick: addMethod }, icon("plus"), t("wal.addMethod")),
      h("p", { class: "xs faint" }, icon("lock", "i-sm inline"), " ", t("wal.never"))));

    const claims = w.claims.length ? card(t("wal.rewards"), h("div", { class: "list" }, rw.items.map(x => h("div", { class: "list-item" },
      h("span", { class: `icon-tile ${x.kind === "cash" ? "warn" : "violet"}` }, icon(x.kind === "cash" ? "coins" : x.kind.startsWith("telegram") ? "send" : x.kind === "whatsapp_promotion" ? "chat-bubble" : "gift")),
      h("div", { class: "grow" }, h("div", { class: "title" }, x.kind === "cash" ? money(x.amountCents) : t(`reward.${x.kind}`)), h("div", { class: "meta" }, `${t(`source.${x.source.split(":")[0]}`, { n: x.source.split(":")[1] ?? "" })} · ${date(x.createdAt)}`),
        x.note ? h("div", { class: "xs muted" }, tOr(`claimNote.${x.note}`, x.note)) : null),
      statusBadge("claim", x.fulfilment?.status ?? x.status))))) : null;

    const payouts = card(t("wal.history"), p.items.length ? h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
      h("thead", {}, h("tr", {}, h("th", {}, t("wal.amount")), h("th", {}, t("wal.method")), h("th", {}, t("wal.date")), h("th", {}, t("wal.status")), h("th", { class: "actions" }))),
      h("tbody", {}, p.items.map(x => h("tr", {},
        h("td", {}, h("b", { class: "num" }, money(x.amountCents)), h("div", { class: "cell-sub" }, t(`payoutSource.${x.source}`))),
        h("td", { "data-label": t("wal.method") }, h("span", { class: "ltr" }, `${methodName(x.method)} · ${x.maskedHint}`)),
        h("td", { "data-label": t("wal.date") }, date(x.createdAt)),
        h("td", { "data-label": t("wal.status") }, statusBadge("payout", x.status), x.note ? h("div", { class: "xs muted" }, x.note) : null),
        h("td", { class: "actions" }, h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: () => details(x.id) }, t("wal.details"))))))))
      : empty("wallet", t("wal.noPayouts"), t("wal.noPayoutsP")));

    const txs = card(t("wal.ledger"), tx.items.length ? h("div", { class: "list" }, tx.items.slice(0, 30).map(x => h("div", { class: "list-item" },
      h("span", { class: "icon-tile" }, icon({ earn: "plus", reserve: "lock", release: "history", pay: "check", adjustment: "sliders" }[x.type] ?? "coins")),
      h("div", { class: "grow" }, h("div", { class: "small" }, t(`ledger.${x.type}`)), h("div", { class: "meta" }, `${x.reason ? `${tOr(`ledgerReason.${x.reason.split(":")[0]}`, x.reason)} · ` : ""}${dateTime(x.at)}`)),
      h("b", { class: `num ${x.type === "earn" || (x.type === "adjustment" && x.amountCents > 0) ? "" : "muted"}` }, `${x.type === "earn" || x.type === "release" || (x.type === "adjustment" && x.amountCents > 0) ? "+" : x.type === "adjustment" ? "" : "−"}${money(Math.abs(x.amountCents))}`))))
      : h("p", { class: "small muted" }, t("wal.noTx")), { sub: t("wal.ledgerSub") });

    view.replaceChildren(
      pageHead(t("nav.wallet"), t("wal.sub"), [request]),
      why ? h("div", { class: "callout mb-2" }, icon("info"), h("span", { class: "small" }, why)) : null,
      h("div", { class: "money-hero" }, kpi(t("wal.available"), money(w.available), { iconName: "wallet", accent: true }), kpi(t("wal.reserved"), money(w.reserved), { iconName: "clock", sub: t("wal.reservedSub") }),
        kpi(t("wal.paid"), money(w.paid), { iconName: "check-circle" }), kpi(t("wal.earned"), money(w.earned), { iconName: "coins", sub: w.failedOrRejectedCents ? t("wal.failedSub", { amount: money(w.failedOrRejectedCents) }) : undefined })),
      h("div", { class: "dash-grid" }, h("div", { class: "stack-lg" }, payouts, txs), h("div", { class: "stack-lg" }, claims, methods,
        card(t("wal.howTitle"), h("ol", { class: "stack small muted" }, ["wal.how1", "wal.how2", "wal.how3", "wal.how4"].map(k => h("li", {}, t(k))))))));
  }

  function addMethod() {
    const HINT = { paypal: "wal.hintPaypal", binance_pay: "wal.hintBinance", pix: "wal.hintPix" };
    const kind = h("select", { class: "select" }, ["paypal", "binance_pay", "pix"].map(k => h("option", { value: k }, methodName(k))));
    const details = h("input", { class: "input ltr", maxlength: 140, autocomplete: "off", required: true });
    const hint = h("span", { class: "hint" });
    const name = h("input", { class: "input", maxlength: 120, autocomplete: "name" });
    const err = h("p", { class: "error-text", role: "alert" });
    const sync = () => { hint.textContent = t(HINT[kind.value]); details.placeholder = t(`${HINT[kind.value]}Ph`); details.inputMode = kind.value === "paypal" ? "email" : "text"; };
    kind.addEventListener("change", sync); sync();
    const save = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
    const m = modal({ title: t("wal.addMethod"), sub: t("wal.addMethodSub"), body: h("div", {}, field(t("wal.kind"), kind), h("div", { class: "field" }, h("label", { for: "pmDetails" }, t("wal.details")), Object.assign(details, { id: "pmDetails" }), hint),
      field(t("wal.recipient"), name, { hint: t("wal.recipientHint") }), h("div", { class: "callout warn" }, icon("lock"), h("span", { class: "small" }, t("wal.never"))), err),
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), save] });
    save.addEventListener("click", async () => {
      const body = { kind: kind.value, details: details.value.trim() };
      if (name.value.trim()) body.recipientName = name.value.trim();
      if (await act(() => api("/api/payout-methods", { method: "POST", body }), { btn: save, errBox: err })) { m.close(); toast(t("wal.methodSaved")); await draw(); }
    });
    details.focus();
  }
  async function removeMethod(x) {
    if (!(await confirmDialog({ title: t("wal.removeTitle"), text: t("wal.removeText"), confirm: t("common.delete"), danger: true }))) return;
    if (await act(() => api(`/api/payout-methods/${x.id}`, { method: "DELETE" }), { ok: t("wal.methodRemoved") })) await draw();
  }
  async function withdraw(w, methods) {
    const sel = h("select", { class: "select" }, methods.map(x => h("option", { value: x.id }, `${methodName(x.kind)} · ${x.maskedHint}`)));
    const ok = await confirmDialog({ title: t("wal.withdrawTitle", { amount: money(w.available) }), text: t("wal.withdrawText"), confirm: t("wal.withdrawBtn"), extra: field(t("wal.sendTo"), sel) });
    if (!ok) return;
    const r = await act(() => api("/api/payouts/request", { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: { methodId: sel.value } }));
    if (r) { toast(t("wal.requested")); await draw(); }
  }
  async function details(id) {
    const p = await act(() => api(`/api/payouts/${id}`));
    if (!p) return;
    modal({ title: t("wal.detailTitle", { amount: money(p.amountCents) }), sub: `${methodName(p.method)} · ${p.maskedHint}`, body: h("div", { class: "stack" },
      h("dl", { class: "kv" }, h("dt", {}, t("wal.status")), h("dd", {}, statusBadge("payout", p.status)), h("dt", {}, t("wal.requestedOn")), h("dd", {}, dateTime(p.createdAt)),
        p.paidAt ? [h("dt", {}, t("wal.paidOn")), h("dd", {}, dateTime(p.paidAt))] : null, p.txReference ? [h("dt", {}, t("wal.reference")), h("dd", { class: "ltr" }, p.txReference)] : null),
      h("h3", { class: "small mt-1" }, t("wal.timeline")),
      h("div", { class: "timeline-list" }, p.history.map(x => h("div", { class: "tl-item" }, h("span", { class: "tl-dot" }, icon(x.to === "paid" ? "check" : x.to === "failed" || x.to === "rejected" ? "x" : "clock")),
        h("div", {}, h("div", { class: "small", style: { fontWeight: "600" } }, t(`payoutSt.${x.to}`)), x.reason ? h("div", { class: "xs muted" }, x.reason) : null, h("div", { class: "xs faint" }, dateTime(x.at))))))) });
  }
  await draw();
  void app;
  return view;
}
