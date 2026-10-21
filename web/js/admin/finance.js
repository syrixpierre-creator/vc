import { h, icon, t, api, act, money, date, dateTime, ago, toast, modal, confirmDialog, field, copyText } from "/js/core.js";
import { pageHead, statusBadge, methodName, methodMark } from "/js/app/ui.js";

const NEXT = { pending: ["in_progress", "action_required", "rejected"], in_progress: ["paid", "failed", "action_required", "rejected"], action_required: ["pending", "rejected"], failed: ["pending"], paid: [], rejected: [] };

/* Manual payouts: review, send outside the app, then record the real outcome. Paid needs explicit confirmation + a transaction reference. */
export async function payouts({ admin, route }) {
  const st = { status: route.query.get("status") ?? "pending" };
  const view = h("div", {});
  async function load() {
    const r = await api(`/api/admin/payouts?${st.status === "all" ? "" : `status=${st.status}`}`);
    const count = s => r.counts[s]?.count ?? 0;
    const tabs = h("div", { class: "tabs", role: "tablist" }, ["pending", "in_progress", "action_required", "paid", "failed", "rejected", "all"].map(s =>
      h("button", { class: "tab", role: "tab", type: "button", "aria-selected": String(st.status === s), onclick: () => { st.status = s; load(); } }, s === "all" ? t("common.all") : t(`payoutSt.${s}`), s !== "all" ? h("span", { class: "count" }, String(count(s))) : null)));
    view.replaceChildren(pageHead(t("adm.nav.payouts"), t("adm.p.sub"), admin.can("reports.export") ? [h("a", { class: "btn", href: "/api/admin/reports/payouts", download: "" }, icon("download"), "CSV")] : []), tabs,
      r.items.length ? h("div", { class: "table-wrap" }, h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
        h("thead", {}, h("tr", {}, h("th", {}, t("adm.p.user")), h("th", {}, t("wal.amount")), h("th", {}, t("wal.method")), h("th", {}, t("adm.p.requested")), h("th", {}, t("wal.status")), h("th", { class: "actions" }))),
        h("tbody", {}, r.items.map(p => h("tr", {},
          h("td", {}, h("a", { href: `#/user/${p.userId}` }, h("b", {}, p.userName)), h("div", { class: "cell-sub" }, t(`payoutSource.${p.source}`))),
          h("td", { "data-label": t("wal.amount") }, h("b", { class: "num" }, money(p.amountCents)), " ", h("span", { class: "xs faint" }, p.currency)),
          h("td", { "data-label": t("wal.method") }, h("div", { class: "row" }, methodMark(p.method), h("span", { class: "ltr small" }, p.maskedHint))),
          h("td", { "data-label": t("adm.p.requested") }, date(p.createdAt), h("div", { class: "cell-sub" }, ago(p.createdAt))),
          h("td", { "data-label": t("wal.status") }, statusBadge("payout", p.status), p.txReference ? h("div", { class: "cell-sub ltr" }, p.txReference) : null, p.adminNotes ? h("div", { class: "cell-sub" }, p.adminNotes) : null),
          h("td", { class: "actions" }, h("button", { class: "btn btn-sm", type: "button", onclick: () => detail(p.id) }, t("adm.p.open")))))))))
        : h("div", { class: "table-wrap" }, h("div", { class: "empty" }, h("div", { class: "icon-tile ok" }, icon("check-circle")), h("h3", {}, t("adm.p.none")))));
  }
  async function detail(id) {
    const p = await api(`/api/admin/payouts/${id}`);
    const recipientBox = h("div", {});
    const canReveal = admin.can("payouts.mark_paid") && ["pending", "in_progress", "action_required"].includes(p.status);
    if (canReveal) recipientBox.append(h("button", { class: "btn btn-sm", type: "button", onclick: async () => {
      const ok = await confirmDialog({ title: t("adm.p.reveal"), text: t("adm.p.revealP"), reason: true, confirm: t("adm.p.reveal") });
      if (!ok) return;
      const r = await act(() => api(`/api/admin/payouts/${id}/reveal`, { method: "POST", body: { reason: ok.reason } }));
      if (r) recipientBox.replaceChildren(h("div", { class: "recipient ltr" }, r.recipient), r.recipientName ? h("p", { class: "small mt-1" }, r.recipientName) : null,
        h("button", { class: "btn btn-sm mt-1", type: "button", onclick: async () => { if (await copyText(r.recipient)) toast(t("ref.copied")); } }, icon("copy"), t("common.copy")));
    } }, icon("eye"), t("adm.p.reveal")));
    const buttons = NEXT[p.status].filter(s => s !== "paid" || admin.can("payouts.mark_paid")).map(s => h("button", { class: `btn ${s === "paid" ? "btn-primary" : s === "failed" || s === "rejected" ? "btn-danger" : ""}`, type: "button", onclick: () => move(p, s) }, t(`adm.p.to.${s}`)));
    const m = modal({ title: `${money(p.amountCents)} · ${p.userName ?? ""}`, sub: `${methodName(p.method)} · ${p.maskedHint}`, wide: true, body: h("div", { class: "stack-lg" },
      h("dl", { class: "kv" }, h("dt", {}, t("wal.status")), h("dd", {}, statusBadge("payout", p.status)), h("dt", {}, t("adm.p.source")), h("dd", {}, t(`payoutSource.${p.source}`)),
        h("dt", {}, t("adm.p.requested")), h("dd", {}, dateTime(p.createdAt)), p.paidAt ? [h("dt", {}, t("wal.paidOn")), h("dd", {}, dateTime(p.paidAt))] : null,
        p.txReference ? [h("dt", {}, t("wal.reference")), h("dd", { class: "ltr" }, p.txReference)] : null, h("dt", {}, t("adm.p.recipient")), h("dd", {}, recipientBox.childNodes.length ? recipientBox : h("span", { class: "muted small" }, t("adm.p.frozen")))),
      h("div", { class: "callout" }, icon("info"), h("span", { class: "small" }, t("adm.p.manual"))),
      h("h3", { class: "small" }, t("wal.timeline")),
      h("div", { class: "timeline-list" }, p.history.map(x => h("div", { class: "tl-item" }, h("span", { class: "tl-dot" }, icon(x.to === "paid" ? "check" : "clock")),
        h("div", {}, h("b", { class: "small" }, t(`payoutSt.${x.to}`)), x.reason ? h("div", { class: "xs muted" }, x.reason) : null, x.txReference ? h("div", { class: "xs ltr" }, x.txReference) : null, h("div", { class: "xs faint" }, dateTime(x.at))))))),
      actions: admin.can("payouts.review") ? buttons : [] });
    async function move(pp, to) {
      let body = { to };
      if (to === "paid") {
        const ref = h("input", { class: "input ltr", maxlength: 200, placeholder: "PP-8A41..." });
        const confirmBox = h("input", { type: "checkbox" });
        const ok = await confirmDialog({ title: t("adm.p.markPaid", { amount: money(pp.amountCents) }), text: t("adm.p.markPaidP"), confirm: t("adm.p.to.paid"),
          extra: h("div", {}, field(t("wal.reference"), ref, { hint: t("adm.p.refHint") }), h("label", { class: "check" }, confirmBox, h("span", {}, t("adm.p.confirmSent", { amount: money(pp.amountCents), hint: pp.maskedHint })))) });
        if (!ok) return;
        if (!confirmBox.checked || ref.value.trim().length < 3) { toast(t("adm.p.needConfirm"), "bad"); return; }
        body = { to, confirmPaid: true, txReference: ref.value.trim() };
      } else if (to !== "in_progress") {
        const ok = await confirmDialog({ title: t(`adm.p.to.${to}`), text: t(`adm.p.why.${to}`), reason: true, danger: to === "failed" || to === "rejected", confirm: t("common.confirm") });
        if (!ok) return;
        body.reason = ok.reason;
      }
      if (await act(() => api(`/api/admin/payouts/${pp.id}/status`, { method: "POST", body }), { ok: t("common.saved") })) { m.close(); load(); }
    }
  }
  await load();
  if (route.query.get("id")) detail(route.query.get("id"));
  return view;
}

/* Reward claims: cash claims waiting for budget review, and Telegram/WhatsApp rewards delivered by a person (evidence required). */
export async function rewards({ admin }) {
  const st = { status: "", kind: "" };
  const view = h("div", {});
  async function load() {
    const p = new URLSearchParams(); if (st.status) p.set("status", st.status); if (st.kind) p.set("kind", st.kind);
    const r = await api(`/api/admin/claims?${p}`);
    const sel = (key, opts) => h("select", { class: "select", style: { width: "auto" }, onchange: e => { st[key] = e.target.value; load(); } }, opts.map(([v, l]) => h("option", { value: v, selected: st[key] === v }, l)));
    view.replaceChildren(pageHead(t("adm.nav.rewards"), t("adm.r.sub")),
      h("div", { class: "toolbar" }, sel("status", [["", t("adm.r.allStatus")], ...["pending", "in_progress", "action_required", "completed", "failed", "rejected"].map(s => [s, t(`claimSt.${s}`)])]),
        sel("kind", [["", t("adm.r.allKinds")], ...["cash", "whatsapp_promotion", "telegram_stars", "telegram_premium"].map(k => [k, t(`reward.${k}`)])])),
      r.items.length ? h("div", { class: "table-wrap" }, h("table", { class: "table table-cards" },
        h("thead", {}, h("tr", {}, h("th", {}, t("adm.p.user")), h("th", {}, t("adm.r.reward")), h("th", {}, t("adm.r.source")), h("th", {}, t("wal.status")), h("th", { class: "actions" }))),
        h("tbody", {}, r.items.map(c => h("tr", {},
          h("td", {}, h("a", { href: `#/user/${c.userId}` }, h("b", {}, c.userName)), h("div", { class: "cell-sub" }, date(c.createdAt))),
          h("td", { "data-label": t("adm.r.reward") }, c.kind === "cash" ? h("b", { class: "num" }, money(c.amountCents)) : t(`reward.${c.kind}`)),
          h("td", { "data-label": t("adm.r.source") }, h("span", { class: "xs ltr" }, c.source), c.note ? h("div", { class: "cell-sub" }, c.note) : null),
          h("td", { "data-label": t("wal.status") }, statusBadge("claim", c.status), c.fulfilment?.deliveryConfirmation ? h("div", { class: "cell-sub" }, c.fulfilment.deliveryConfirmation) : null),
          h("td", { class: "actions" }, h("div", { class: "row end wrap" }, actionsFor(c)))))))) : h("div", { class: "table-wrap" }, h("div", { class: "empty" }, h("h3", {}, t("adm.r.none")))));
  }
  function actionsFor(c) {
    const out = [];
    if (c.kind === "cash" && c.status === "action_required" && admin.can("ledger.adjust")) out.push(h("button", { class: "btn btn-sm btn-primary", type: "button", onclick: async () => {
      const ok = await confirmDialog({ title: t("adm.r.fund", { amount: money(c.amountCents) }), text: t("adm.r.fundP"), reason: true, confirm: t("adm.r.fundBtn") });
      if (ok && await act(() => api(`/api/admin/claims/${c.id}/fund`, { method: "POST", body: { reason: ok.reason } }), { ok: t("common.saved") })) load();
    } }, t("adm.r.fundBtn")));
    if (c.kind !== "cash" && !["completed", "rejected"].includes(c.status)) out.push(h("button", { class: "btn btn-sm", type: "button", onclick: () => fulfil(c) }, icon("send"), t("adm.r.update")));
    if (["pending", "action_required", "failed"].includes(c.status)) out.push(h("button", { class: "btn btn-sm btn-danger", type: "button", onclick: async () => {
      const ok = await confirmDialog({ title: t("adm.r.reject"), text: t("adm.r.rejectP"), reason: true, danger: true, confirm: t("adm.r.reject") });
      if (ok && await act(() => api(`/api/admin/claims/${c.id}/reject`, { method: "POST", body: { reason: ok.reason } }), { ok: t("common.saved") })) load();
    } }, t("adm.r.reject")));
    return out;
  }
  function fulfil(c) {
    const status = h("select", { class: "select" }, ["in_progress", "completed", "failed", "action_required"].map(s => h("option", { value: s }, t(`claimSt.${s}`))));
    const conf = h("input", { class: "input", maxlength: 300, placeholder: t("adm.r.evidencePh") });
    const notes = h("textarea", { class: "textarea", maxlength: 1000 });
    const err = h("p", { class: "error-text", role: "alert" });
    const save = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
    const m = modal({ title: t("adm.r.update"), sub: `${t(`reward.${c.kind}`)} · ${c.userName}`, body: h("div", {}, field(t("wal.status"), status), field(t("adm.r.evidence"), conf, { hint: t("adm.r.evidenceHint") }), field(t("adm.r.notes"), notes), err,
      h("div", { class: "callout warn" }, icon("alert"), h("span", { class: "small" }, t("adm.r.policy")))), actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), save] });
    save.addEventListener("click", async () => {
      const body = { status: status.value, ...(conf.value.trim() ? { deliveryConfirmation: conf.value.trim() } : {}), ...(notes.value.trim() ? { notes: notes.value.trim() } : {}) };
      if (await act(() => api(`/api/admin/claims/${c.id}/fulfilment`, { method: "POST", body }), { btn: save, errBox: err })) { m.close(); toast(t("common.saved")); load(); }
    });
  }
  await load();
  return view;
}
