import { h, icon, t, api, num, date, ago, ring, progressBar } from "/js/core.js";
import { pageHead, card } from "/js/app/ui.js";

const ACH_ICON = { contacts: "contacts", sync: "sync", referrals: "users", progress: "flame", challenges: "trophy", security: "shield" };

/* XP (not money), levels, VIP ranks with benefits, streak calendar, missions, achievements and the opt-in leaderboard. */
export default async function progress({ app }) {
  const [p, ach, vip, ms, xp] = await Promise.all([api("/api/me/progress"), api("/api/achievements"), api("/api/vip-levels"), api("/api/missions"), api("/api/me/xp")]);
  const inLevel = p.xp - p.currentLevelXp, need = p.nextLevelXp - p.currentLevelXp;
  const today = new Date().toISOString().slice(0, 10);
  const head = card(null, h("div", { class: "row wrap", style: { gap: "24px" } },
    ring(inLevel, need, num(p.level), 96),
    h("div", { class: "grow stack" }, h("div", {}, h("div", { class: "small muted" }, t("pg.level")), h("h2", {}, t(`levelTitle.${p.title}`))),
      progressBar(inLevel, need), h("div", { class: "row between xs muted" }, h("span", { class: "num" }, `${num(p.xp)} XP`), h("span", {}, t("pg.toNext", { n: Math.max(0, p.nextLevelXp - p.xp), level: p.level + 1 })))),
    h("div", { class: "stack", style: { minWidth: "180px" } }, h("div", { class: "row" }, h("span", { class: "icon-tile violet" }, icon("crown")), h("div", {}, h("div", { class: "xs muted" }, t("pg.vip")), h("b", {}, p.vip))),
      p.nextVip ? h("div", { class: "xs faint" }, t("pg.nextVip", { name: p.nextVip.name, n: Math.max(0, p.nextVip.minXp - p.xp) })) : h("div", { class: "xs faint" }, t("pg.topVip")))));

  const streak = card(t("pg.streak"), h("div", { class: "stack" },
    h("div", { class: "row between" }, h("div", { class: "row" }, h("span", { class: "icon-tile warn" }, icon("flame")), h("div", {}, h("b", { class: "big-num" }, num(p.streakDays)), h("div", { class: "xs muted" }, t("pg.days")))),
      h("div", { class: "xs muted", style: { textAlign: "end" } }, t("pg.best", { n: p.longestStreak }), h("br"), t("pg.activeDays", { n: p.activeDays }))),
    h("div", { class: "calendar", role: "img", "aria-label": t("pg.calendarLabel", { n: p.calendar.filter(d => d.active).length }) }, p.calendar.map(d => h("span", { class: [d.active ? "on" : "", d.day === today ? "today" : ""].join(" "), title: d.day })))),
    { sub: t("pg.streakSub") });

  const missions = card(t("pg.missions"), h("div", {}, ["daily", "weekly", "monthly"].map(period => h("div", { class: "mb-2" }, h("div", { class: "xs faint", style: { textTransform: "uppercase", letterSpacing: ".08em" } }, t(`pg.period.${period}`)),
    ms.items.filter(m => m.period === period).map(m => h("div", { class: "mission" }, h("span", { class: `icon-tile ${m.done ? "ok" : ""}` }, icon(m.done ? "check" : "target")),
      h("div", {}, h("div", { class: "small", style: { fontWeight: "600" } }, t(`mission.${m.code}`, { n: m.target })), progressBar(m.progress, m.target, "thin"), h("div", { class: "xs faint" }, `${num(m.progress)}/${num(m.target)} · +${num(m.xp)} XP · ${t("pg.resets", { when: ago(m.endsAt) })}`)),
      m.claimed ? h("span", { class: "badge ok" }, t("ov.claimed")) : h("button", { class: "btn btn-sm", type: "button", disabled: !m.done, onclick: async e => { e.currentTarget.disabled = true; await api(`/api/missions/${m.code}/claim`, { method: "POST", body: {} }).catch(() => undefined); app.render(); } }, t("ov.claim"))))))), { sub: t("pg.missionsSub") });

  const achievements = card(t("pg.achievements"), h("div", { class: "ach-grid" }, ach.items.map(a => h("div", { class: `ach${a.earnedAt ? " on" : ""}` },
    h("span", { class: "medal" }, icon(a.code.startsWith("challenge:") ? "trophy" : ACH_ICON[a.group] ?? "medal")),
    h("b", {}, a.code.startsWith("challenge:") ? t("pg.challengeBadge") : t(`ach.${a.code}`)),
    h("span", {}, a.earnedAt ? date(a.earnedAt) : a.xp ? `+${num(a.xp)} XP` : t("pg.locked"))))),
  { sub: t("pg.achSub", { n: ach.items.filter(a => a.earnedAt).length, total: ach.items.length }) });

  const vipCard = card(t("pg.vipLevels"), h("div", { class: "vip-ladder" }, vip.items.map(v => h("div", { class: `vip${v.name === p.vip ? " current" : ""}` },
    h("b", {}, v.name), h("span", { class: "xs muted num" }, `${num(v.minXp)} XP`), h("span", { class: "xs" }, v.benefits[app.me.language] ?? v.benefits.en ?? "")))), { sub: t("pg.vipSub") });

  const board = h("div", {});
  const lb = { period: "weekly", metric: "xp" };
  async function drawBoard() {
    const r = await api(`/api/leaderboard?period=${lb.period}&metric=${lb.metric}`);
    board.replaceChildren(r.items.length ? h("div", { class: "list" }, r.items.map(x => h("div", { class: "list-item" },
      h("span", { class: `rank r${x.rank}` }, num(x.rank)), h("span", { class: "avatar sm", "aria-hidden": "true" }, x.pseudonym.slice(0, 2).toUpperCase()),
      h("div", { class: "grow" }, h("div", { class: "title" }, x.pseudonym, r.me === x.pseudonym ? h("span", { class: "badge blue", style: { marginInlineStart: "8px" } }, t("pg.you")) : null), x.level ? h("div", { class: "meta" }, `${t("pg.level")} ${num(x.level)}`) : null),
      h("b", { class: "num" }, lb.metric === "xp" ? `${num(x.value)} XP` : t("pg.refs", { n: x.value })))))
      : h("p", { class: "small muted" }, t("pg.noBoard")));
  }
  const segs = (key, opts) => h("div", { class: "seg" }, opts.map(o => h("button", { type: "button", "aria-pressed": String(lb[key] === o), onclick: e => { lb[key] = o; [...e.target.parentNode.children].forEach(b => b.setAttribute("aria-pressed", String(b === e.target))); drawBoard(); } }, t(`pg.lb.${o}`))));
  await drawBoard();
  const leaderboard = card(t("pg.leaderboard"), h("div", { class: "stack" }, h("div", { class: "row wrap" }, segs("period", ["weekly", "monthly", "all"]), segs("metric", ["xp", "referrals"])), board,
    app.me.leaderboardOptIn ? null : h("div", { class: "callout" }, icon("eye-off"), h("span", { class: "small" }, t("pg.optInHint"), " ", h("a", { href: "#/settings" }, t("nav.settings"))))), { sub: t("pg.lbSub") });

  const history = card(t("pg.xpHistory"), xp.items.length ? h("div", { class: "list" }, xp.items.slice(0, 15).map(x => h("div", { class: "list-item" }, h("div", { class: "grow" }, h("div", { class: "small" }, t(`xpReason.${x.reason.split(":")[0]}`)), h("div", { class: "meta" }, ago(x.at))), h("b", { class: "num" }, `+${num(x.amount)}`))))
    : h("p", { class: "small muted" }, t("pg.noXp")), { sub: t("pg.xpNote") });

  const share = h("div", { class: "row wrap" }, ["level", "vip", "month"].map(k => h("a", { class: "btn btn-sm", href: `/api/share/card.svg?kind=${k}`, download: `syrix-${k}.svg` }, icon("share"), t(`pg.share.${k}`))));
  return h("div", {}, pageHead(t("nav.progress"), t("pg.sub"), [share]), head,
    h("div", { class: "dash-grid" }, h("div", { class: "stack-lg" }, missions, achievements, leaderboard), h("div", { class: "stack-lg" }, streak, vipCard, history)));
}
