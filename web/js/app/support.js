import { h, icon, t, api, act, dateTime, ago, toast, modal, field, empty } from "/js/core.js";
import { pageHead, card, statusBadge, backLink } from "/js/app/ui.js";

const CATS = ["bug", "payment", "account", "partnership", "feature", "other"];

/* Support tickets: open, follow the conversation, reply, close. Users only ever see their own tickets. */
export default async function support({ app, route }) {
  if (route.params[0]) return thread(route.params[0], app);
  const r = await api("/api/support/tickets");
  const newBtn = h("button", { class: "btn btn-primary", type: "button", onclick: () => newTicket(app) }, icon("plus"), t("sp.new"));
  return h("div", {}, pageHead(t("nav.support"), t("sp.sub", { email: app.me.supportEmail }), [newBtn]),
    r.items.length ? h("div", { class: "table-wrap" }, h("table", { class: "table table-cards" },
      h("thead", {}, h("tr", {}, h("th", {}, t("sp.subject")), h("th", {}, t("sp.category")), h("th", {}, t("sp.updated")), h("th", {}, t("sp.status")))),
      h("tbody", {}, r.items.map(x => h("tr", {}, h("td", {}, h("a", { href: `#/support/${x.id}` }, h("b", { dir: "auto" }, x.subject))), h("td", { "data-label": t("sp.category") }, t(`sp.cat.${x.category}`)),
        h("td", { "data-label": t("sp.updated") }, ago(x.updatedAt)), h("td", { "data-label": t("sp.status") }, statusBadge("ticket", x.status)))))))
      : h("div", { class: "table-wrap" }, empty("lifebuoy", t("sp.none"), t("sp.noneP"), newBtn.cloneNode(true))),
    h("div", { class: "grid-3 mt-3" }, [["help", "sp.faq", "/#faq"], ["scroll", "legal.rewards", "/legal/reward-rules"], ["shield", "legal.privacy", "/legal/privacy"]].map(([ic, k, href]) =>
      h("a", { class: "card interactive row", href, target: "_blank", rel: "noopener" }, h("span", { class: "icon-tile blue" }, icon(ic)), h("b", { class: "small" }, t(k))))));
}
function newTicket(app) {
  const cat = h("select", { class: "select" }, CATS.map(c => h("option", { value: c }, t(`sp.cat.${c}`))));
  const subject = h("input", { class: "input", maxlength: 140, required: true });
  const body = h("textarea", { class: "textarea", rows: 6, maxlength: 5000, required: true });
  const err = h("p", { class: "error-text", role: "alert" });
  const send = h("button", { class: "btn btn-primary", type: "button" }, icon("send"), t("sp.send"));
  const m = modal({ title: t("sp.new"), sub: t("sp.newSub"), body: h("div", {}, field(t("sp.category"), cat), field(t("sp.subject"), subject), field(t("sp.message"), body, { hint: t("sp.messageHint") }), err),
    actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), send] });
  send.addEventListener("click", async () => {
    const r = await act(() => api("/api/support/tickets", { method: "POST", body: { category: cat.value, subject: subject.value.trim(), body: body.value.trim() } }), { btn: send, errBox: err });
    if (r) { m.close(); toast(t("sp.sent")); app.go(`support/${r.id}`); }
  });
  subject.focus();
}
async function thread(id, app) {
  const x = await api(`/api/support/tickets/${id}`);
  const reply = h("textarea", { class: "textarea", rows: 3, maxlength: 5000, "aria-label": t("sp.reply") });
  const err = h("p", { class: "error-text", role: "alert" });
  const send = h("button", { class: "btn btn-primary", type: "button" }, icon("send"), t("sp.send"));
  send.addEventListener("click", async () => { if (!reply.value.trim()) return; if (await act(() => api(`/api/support/tickets/${id}/reply`, { method: "POST", body: { body: reply.value.trim() } }), { btn: send, errBox: err })) app.render(); });
  const close = x.status !== "closed" ? h("button", { class: "btn", type: "button", onclick: e => act(async () => { await api(`/api/support/tickets/${id}/close`, { method: "POST", body: {} }); app.render(); }, { btn: e.currentTarget, ok: t("sp.closed") }) }, icon("check"), t("sp.close")) : null;
  return h("div", {}, backLink("#/support", t("nav.support")),
    pageHead(x.subject, `${t(`sp.cat.${x.category}`)} · ${dateTime(x.createdAt)}`, [statusBadge("ticket", x.status), close].filter(Boolean)),
    card(null, h("div", { class: "thread" }, h("div", { class: "msg mine", dir: "auto" }, x.body, h("div", { class: "meta" }, dateTime(x.createdAt))),
      x.messages.map(m => h("div", { class: `msg${m.fromStaff ? "" : " mine"}`, dir: "auto" }, m.fromStaff ? h("b", { class: "xs", style: { display: "block", marginBottom: "4px" } }, t("sp.team")) : null, m.body, h("div", { class: "meta" }, dateTime(m.createdAt)))))),
    card(t("sp.reply"), h("div", { class: "stack" }, reply, err, h("div", { class: "row end" }, send)), { cls: "mt-2" }));
}
