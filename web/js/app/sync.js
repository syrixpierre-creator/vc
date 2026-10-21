import { h, icon, t, api, act, num, ago, dateTime, toast, confirmDialog, switchEl } from "/js/core.js";
import { pageHead, kpi, card, statusBadge } from "/js/app/ui.js";

/* Google Contacts: separate consent, automatic sync, pause/resume, Sync now, retries, error history, disconnect. */
export default async function sync({ app, route }) {
  const e = route.query.get("e");
  if (e) { history.replaceState(null, "", "#/sync"); if (e === "ok") toast(t("sync.connectedOk")); else toast(t(`sync.e.${e}`), "bad"); }
  const view = h("div", {});
  let timer;
  async function draw() {
    clearTimeout(timer);
    const s = await api("/api/google-contacts/status");
    const connected = s.status === "connected";
    const connect = h("button", { class: "btn btn-primary", type: "button", onclick: ev => act(async () => { const r = await api("/api/google-contacts/connect", { method: "POST", body: {} }); location.href = r.url; }, { btn: ev.currentTarget }) },
      icon("cloud"), s.status === "not_connected" ? t("sync.connect") : t("sync.reconnect"));
    const head = pageHead(t("nav.sync"), t("sync.sub"), connected ? [
      h("button", { class: "btn btn-primary", type: "button", id: "syncNow", disabled: s.paused, onclick: ev => act(async () => { const r = await api("/api/google-contacts/sync-now", { method: "POST", body: {} }); toast(t("sync.queued", { n: r.queued })); await draw(); }, { btn: ev.currentTarget }) }, icon("sync"), t("sync.now")),
      s.jobs.failed ? h("button", { class: "btn", type: "button", onclick: ev => act(async () => { const r = await api("/api/google-contacts/retry-failed", { method: "POST", body: {} }); toast(t("sync.retried", { n: r.retried })); await draw(); }, { btn: ev.currentTarget }) }, icon("history"), t("sync.retry")) : null,
    ].filter(Boolean) : [connect]);
    const statusCard = card(t("sync.connection"), h("div", { class: "stack" },
      h("div", { class: "row between wrap" }, h("div", { class: "row" }, h("span", { class: "icon-tile blue" }, icon("cloud")), h("div", {}, h("b", {}, t("sync.google")), h("div", { class: "xs faint" }, connected ? (s.lastSyncAt ? t("sync.last", { when: ago(s.lastSyncAt) }) : t("sync.never")) : t("sync.notYet")))), statusBadge("conn", s.status)),
      s.status === "revoked" || s.status === "refresh_failed" || s.status === "reconnect_requested" ? h("div", { class: "callout warn" }, icon("alert"), h("div", {}, h("div", { class: "small" }, t(`sync.why.${s.status}`)), h("div", { class: "mt-1" }, connect))) : null,
      !connected && s.status === "not_connected" ? h("div", { class: "stack small muted" }, ["sync.p1", "sync.p2", "sync.p3", "sync.p4"].map(k => h("div", { class: "row" }, icon("check-circle", "i-sm"), h("span", {}, t(k))))) : null,
      h("p", { class: "xs faint" }, t("sync.scope"), " ", h("code", { class: "ltr" }, s.scopes.join(" ")))));
    const settings = connected ? card(t("sync.settings"), h("div", { class: "stack-lg" },
      switchEl(t("sync.auto"), s.autoSync, v => save({ autoSync: v }), { id: "autoSync", hint: t("sync.autoHint") }),
      switchEl(t("sync.pause"), s.paused, v => save({ paused: v }), { id: "paused", hint: t("sync.pauseHint") }),
      h("hr", { class: "divider" }),
      h("div", { class: "row between wrap" }, h("div", {}, h("b", { class: "small" }, t("sync.disconnect")), h("p", { class: "xs muted" }, t("sync.disconnectHint"))),
        h("button", { class: "btn btn-danger btn-sm", type: "button", id: "disconnect", onclick: disconnect }, icon("unlink"), t("sync.disconnect"))))) : null;
    const counts = h("div", { class: "kpis" },
      kpi(t("sync.c.total"), num(s.counts.total), { iconName: "contacts" }), kpi(t("sync.c.synced"), num(s.counts.synced), { iconName: "check-circle" }),
      kpi(t("sync.c.pending"), num(s.counts.pending), { iconName: "clock" }), kpi(t("sync.c.failed"), num(s.counts.failed), { iconName: "x-circle" }),
      kpi(t("sync.c.conflict"), num(s.counts.conflict), { iconName: "alert", sub: s.counts.conflict ? t("sync.conflictHint") : undefined }));
    const log = card(t("sync.history"), s.recent.length ? h("div", { class: "list" }, s.recent.map(l => h("div", { class: "list-item" },
      h("span", { class: `icon-tile ${l.outcome === "synced" ? "ok" : "bad"}` }, icon(l.outcome === "synced" ? "check" : "alert")),
      h("div", { class: "grow" }, h("div", { class: "small" }, t(`sync.o.${l.outcome}`)), h("div", { class: "meta" }, dateTime(l.at))))))
      : h("p", { class: "small muted" }, t("sync.noHistory")));
    const review = connected ? h("div", { class: "callout mt-2" }, icon("shield"), h("div", { class: "grow small" }, t("sync.reviewP")),
      h("button", { class: "btn btn-sm", type: "button", onclick: ev => act(() => api("/api/google-contacts/review-access", { method: "POST", body: {} }), { btn: ev.currentTarget, ok: t("sync.reviewed") }) }, t("sync.reviewBtn"))) : null;
    view.replaceChildren(head, h("div", { class: "grid-2" }, statusCard, settings ?? card(t("sync.how"), h("ol", { class: "stack small muted" }, ["sync.h1", "sync.h2", "sync.h3"].map(k => h("li", {}, t(k)))))),
      connected ? h("div", { class: "mt-2" }, counts) : null, h("div", { class: "mt-2" }, log), review);
    if (connected && !s.paused && s.counts.pending > 0) timer = setTimeout(() => { if (view.isConnected) draw(); }, 2000); // watch the queue drain
  }
  async function save(body) { if (await act(() => api("/api/google-contacts/settings", { method: "PATCH", body }), { ok: t("common.saved") })) await draw(); }
  async function disconnect() {
    if (!(await confirmDialog({ title: t("sync.disconnectTitle"), text: t("sync.disconnectText"), confirm: t("sync.disconnect"), danger: true }))) return;
    if (await act(() => api("/api/google-contacts/disconnect", { method: "POST", body: {} }), { ok: t("sync.disconnected") })) await draw();
  }
  await draw();
  void app;
  return view;
}
