import { h, icon, t, api, num, money, ago, avatar, progressBar, act, toast } from "/js/core.js";
import { kpi, card, statusBadge } from "/js/app/ui.js";
import { notificationText, notificationIcon } from "/js/app/notifications.js";

export default async function overview({ app }) {
  const d = await api("/api/dashboard");
  const me = app.me;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "ov.morning" : hour < 18 ? "ov.afternoon" : "ov.evening";
  const ms = d.referrals.milestone;

  const syncCard = card(t("ov.syncTitle"), h("div", { class: "stack" },
    h("div", { class: "row between" }, statusBadge("conn", d.sync.status), d.sync.paused ? h("span", { class: "badge warn" }, icon("pause", "i-sm"), t("sync.paused")) : null),
    d.sync.status === "connected"
      ? h("div", { class: "stack" },
        h("div", { class: "row between small" }, h("span", { class: "muted" }, t("ov.synced")), h("b", { class: "num" }, `${num(d.contacts.synced)} / ${num(d.contacts.total)}`)),
        progressBar(d.contacts.synced, Math.max(1, d.contacts.total), "ok"),
        h("div", { class: "row between small muted" }, h("span", {}, t("ov.pendingJobs", { n: d.sync.pendingJobs })), h("span", {}, d.sync.failedJobs ? t("ov.failedJobs", { n: d.sync.failedJobs }) : "")),
        h("p", { class: "small faint" }, d.sync.lastSyncAt ? t("sync.last", { when: ago(d.sync.lastSyncAt) }) : t("sync.never")))
      : h("p", { class: "small muted" }, t("ov.syncOff")),
    h("a", { class: "btn btn-sm", href: "#/sync" }, icon("sync"), d.sync.status === "connected" ? t("ov.manageSync") : t("sync.connect"))), { cls: "" });

  const msCard = ms ? card(t("ov.milestoneTitle"), h("div", { class: "stack" },
    h("div", { class: "row between" }, h("span", { class: "big-num" }, money(ms.cents)), h("span", { class: "badge gold" }, icon("gift", "i-sm"), t("ov.at", { n: ms.threshold }))),
    progressBar(ms.progress, ms.threshold, "gold"),
    h("div", { class: "row between small" }, h("span", { class: "muted" }, t("ov.qualified")), h("b", { class: "num" }, `${num(ms.progress)} / ${num(ms.threshold)}`)),
    d.referrals.next && d.referrals.next < ms.threshold ? h("p", { class: "small faint" }, t("ov.nextMilestone", { n: d.referrals.next })) : null,
    h("a", { class: "btn btn-sm", href: "#/referrals" }, icon("users"), t("ov.invite"))), { cls: "milestone-card" }) : null;

  const missions = card(t("ov.missions"), h("div", {}, d.missions.map(m => h("div", { class: "mission" },
    h("span", { class: `icon-tile ${m.done ? "ok" : ""}` }, icon(m.done ? "check" : "target")),
    h("div", {}, h("div", { class: "small", style: { fontWeight: "600" } }, t(`mission.${m.code}`, { n: m.target })), h("div", { class: "xs faint" }, `${num(m.progress)} / ${num(m.target)} · +${num(m.xp)} XP`)),
    m.claimed ? h("span", { class: "badge ok" }, t("ov.claimed"))
      : h("button", { class: "btn btn-sm", type: "button", disabled: !m.done, onclick: e => act(async () => { await api(`/api/missions/${m.code}/claim`, { method: "POST", body: {} }); e.target.closest(".mission").querySelector("button").replaceWith(h("span", { class: "badge ok" }, t("ov.claimed"))); }, { btn: e.currentTarget, ok: t("ov.xpAdded", { n: m.xp }) }) }, t("ov.claim"))))),
  { right: h("a", { class: "btn btn-ghost btn-sm", href: "#/progress" }, t("common.seeAll")) });

  const notes = card(t("ov.recent"), d.notifications.length ? h("div", { class: "list" }, d.notifications.map(n => h("div", { class: "list-item" },
    h("span", { class: "icon-tile" }, icon(notificationIcon(n.kind))), h("div", { class: "grow" }, h("div", { class: "small" }, notificationText(n)), h("div", { class: "meta" }, ago(n.createdAt))))))
    : h("p", { class: "small muted" }, t("ov.noNotes")), { right: h("a", { class: "btn btn-ghost btn-sm", href: "#/notifications" }, t("common.seeAll")) });

  const anns = d.announcements.length ? card(t("ov.news"), h("div", { class: "list" }, d.announcements.map(a => h("div", { class: "list-item" },
    h("span", { class: "icon-tile blue" }, icon("megaphone")), h("div", { class: "grow" }, h("div", { class: "title" }, a.title), h("div", { class: "meta", style: { whiteSpace: "normal" } }, a.body)))))) : null;

  const quick = h("div", { class: "quick" },
    h("a", { href: "#/contacts?add=1" }, h("span", { class: "icon-tile blue" }, icon("user-plus")), t("ov.qAdd")),
    h("a", { href: "#/contacts?import=1" }, h("span", { class: "icon-tile blue" }, icon("upload")), t("ov.qImport")),
    h("a", { href: "/api/contacts/export?version=3.0", download: "" }, h("span", { class: "icon-tile blue" }, icon("download")), t("ov.qExport")),
    h("button", { type: "button", onclick: e => act(async () => { const r = await api("/api/google-contacts/sync-now", { method: "POST", body: {} }); toast(t("sync.queued", { n: r.queued })); }, { btn: e.currentTarget }) },
      h("span", { class: "icon-tile violet" }, icon("sync")), t("ov.qSync")),
    h("a", { href: "#/backups" }, h("span", { class: "icon-tile violet" }, icon("archive")), t("ov.qBackups")),
    h("a", { href: "#/referrals" }, h("span", { class: "icon-tile violet" }, icon("share")), t("ov.qInvite")),
    h("a", { href: "#/challenges" }, h("span", { class: "icon-tile ok" }, icon("target")), t("ov.qChallenges")),
    h("a", { href: "#/wallet" }, h("span", { class: "icon-tile ok" }, icon("wallet")), t("ov.qWallet")));

  return h("div", {},
    h("div", { class: "page-head" }, h("div", { class: "hello" }, avatar(me), h("div", {}, h("h1", {}, t(greet, { name: me.name.split(" ")[0] })), h("p", { class: "sub" }, t("ov.sub"))))),
    h("div", { class: "kpis" },
      kpi(t("ov.kContacts"), num(d.contacts.total), { iconName: "contacts", sub: d.contacts.conflict ? t("ov.conflicts", { n: d.contacts.conflict }) : t("ov.syncedN", { n: d.contacts.synced }) }),
      kpi(t("ov.kReferrals"), num(d.referrals.qualified), { iconName: "users", sub: t("ov.pendingRefs", { n: d.referrals.pending + d.referrals.under_review }) }),
      kpi(t("ov.kAvailable"), money(d.wallet.available), { iconName: "wallet", sub: d.wallet.pendingPayoutCents ? t("ov.inProgress", { amount: money(d.wallet.pendingPayoutCents) }) : t("ov.paidTotal", { amount: money(d.wallet.completedPayoutCents) }) }),
      kpi(t("ov.kLevel"), h("span", {}, num(d.progress.level), h("span", { class: "small muted" }, ` · ${t(`levelTitle.${d.progress.title}`)}`)), { iconName: "crown", accent: true,
        sub: `${num(d.progress.xp)} XP · VIP ${d.progress.vip}` }),
      kpi(t("ov.kChallenges"), num(d.challenges.active), { iconName: "target", sub: t("ov.chSub", { joined: d.challenges.joinedActive, done: d.challenges.completed }) }),
      kpi(t("ov.kStreak"), t("ov.days", { n: d.progress.streakDays }), { iconName: "flame", sub: t("ov.keepGoing") })),
    h("h2", { class: "section-title" }, t("ov.quick")), quick,
    h("div", { class: "dash-grid" }, h("div", { class: "stack-lg" }, missions, notes, anns), h("div", { class: "stack-lg" }, msCard, syncCard)));
}
