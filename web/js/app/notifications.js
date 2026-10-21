import { h, icon, t, tOr, api, act, money, ago, dateTime, empty } from "/js/core.js";
import { pageHead, card } from "/js/app/ui.js";

const ICONS = { sync_revoked: "unlink", sync_reconnect_requested: "unlink", referral_milestone: "users", reward_eligible: "gift", reward_review: "clock", add_payout_method: "wallet",
  payout_update: "wallet", fulfilment_update: "gift", challenge_completed: "trophy", challenge_review: "shield", achievement: "medal", level_up: "crown", ticket_reply: "message",
  security: "shield", account_deletion: "alert", staff_task: "flag", service_message: "megaphone" };
export const notificationIcon = kind => ICONS[kind] ?? "bell";
/** Human text for a notification, built from its kind and payload (only server-generated values, never free HTML). */
export function notificationText(n) {
  const p = n.payload ?? {};
  const vars = { ...p, amount: p.amountCents !== undefined ? money(p.amountCents) : "", status: p.status ? tOr(`payoutSt.${p.status}`, p.status) : "", level: p.level ?? "", title: typeof p.title === "object" ? (p.title.en ?? "") : (p.title ?? ""),
    code: p.code ? tOr(`ach.${p.code}`, t("pg.challengeBadge")) : "", threshold: p.threshold ?? "", kind: p.kind ? t(`reward.${p.kind}`) : "", subject: p.subject ?? "", message: p.message ?? "", event: p.event ? tOr(`secEvent.${p.event}`, p.event) : "",
    task: p.task ? tOr(`staffTask.${p.task}`, p.task) : "" };
  return tOr(`notif.${n.kind}${n.kind === "payout_update" && p.status ? `.${p.status}` : ""}`, tOr(`notif.${n.kind}`, n.kind), vars);
}
const LINK = { payout_update: "#/wallet", reward_eligible: "#/wallet", add_payout_method: "#/wallet", reward_review: "#/wallet", fulfilment_update: "#/wallet", referral_milestone: "#/referrals",
  sync_revoked: "#/sync", sync_reconnect_requested: "#/sync", challenge_completed: "#/challenges", challenge_review: "#/challenges", achievement: "#/progress", level_up: "#/progress",
  ticket_reply: "#/support", security: "#/settings", account_deletion: "#/settings", staff_task: "/admin/" };

export default async function notifications({ app }) {
  const view = h("div", {});
  async function draw() {
    const [n, a] = await Promise.all([api("/api/notifications?limit=100"), api("/api/announcements")]);
    app.setUnread(n.unread);
    const markAll = h("button", { class: "btn", type: "button", disabled: n.unread === 0, onclick: e => act(async () => { await api("/api/notifications/read", { method: "POST", body: { all: true } }); await draw(); }, { btn: e.currentTarget }) }, icon("check"), t("nt.markAll"));
    const list = n.items.length ? h("div", { class: "list" }, n.items.map(x => h("div", { class: "list-item" },
      h("span", { class: `icon-tile ${x.read ? "" : "blue"}` }, icon(notificationIcon(x.kind))),
      h("div", { class: "grow" }, h("div", { class: "small", style: { fontWeight: x.read ? "400" : "650" } }, notificationText(x)), h("div", { class: "meta" }, `${ago(x.createdAt)} · ${dateTime(x.createdAt)}`)),
      LINK[x.kind] ? h("a", { class: "btn btn-ghost btn-sm", href: LINK[x.kind], onclick: () => { if (!x.read) api("/api/notifications/read", { method: "POST", body: { ids: [x.id] } }).catch(() => undefined); } }, t("common.open")) : null)))
      : empty("bell", t("nt.none"), t("nt.noneP"));
    view.replaceChildren(pageHead(t("nav.notifications"), t("nt.sub"), [markAll, h("a", { class: "btn", href: "#/settings" }, icon("sliders"), t("nt.prefs"))]),
      h("div", { class: "dash-grid" }, card(t("nt.inbox"), list), card(t("nt.news"), a.items.length ? h("div", { class: "list" }, a.items.map(x => h("div", { class: "list-item", style: { alignItems: "flex-start" } },
        h("span", { class: "icon-tile violet" }, icon("megaphone")), h("div", { class: "grow" }, h("div", { class: "row" }, h("b", { class: "small" }, x.title), x.pinned ? h("span", { class: "badge blue" }, t("nt.pinned")) : null),
          h("p", { class: "small muted", style: { whiteSpace: "pre-wrap" } }, x.body), h("div", { class: "meta" }, `${t(`annKind.${x.kind}`)} · ${ago(x.publishedAt)}`)))))
        : h("p", { class: "small muted" }, t("nt.noNews")))));
  }
  await draw();
  return view;
}
