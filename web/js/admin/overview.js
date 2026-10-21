import { h, icon, t, api, num, money, ago, shortDate, date } from "/js/core.js";
import { pageHead, kpi, card } from "/js/app/ui.js";

/** Bar chart of sign-ups per day: one series (no legend), 4px rounded tops on a shared baseline, 2px gaps, hover value, table view. */
function signupChart(rows) {
  const W = 720, H = 180, P = { l: 30, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...rows.map(r => r.n));
  const step = (W - P.l - P.r) / rows.length, bw = Math.max(2, step - 2);
  const y = v => P.t + (H - P.t - P.b) * (1 - v / max);
  const svg = h("svg", { class: "chart", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": t("adm.ov.chartLabel") });
  const tip = h("div", { class: "chart-tip", hidden: true });
  for (const tick of [0, Math.ceil(max / 2), max]) {
    svg.append(h("line", { class: "axis", x1: String(P.l), x2: String(W - P.r), y1: String(y(tick)), y2: String(y(tick)), "stroke-dasharray": tick ? "2 4" : null }));
    const tx = h("text", { x: String(P.l - 6), y: String(y(tick) + 3), "text-anchor": "end" }); tx.textContent = String(tick); svg.append(tx);
  }
  rows.forEach((r, i) => {
    const x = P.l + i * step + 1, top = y(r.n), hgt = Math.max(0, H - P.b - top);
    const rad = Math.min(4, hgt);
    const d = hgt > 0 ? `M${x} ${H - P.b}V${top + rad}q0 -${rad} ${rad} -${rad}h${bw - 2 * rad}q${rad} 0 ${rad} ${rad}V${H - P.b}Z` : "";
    if (d) svg.append(h("path", { class: "bar", d }));
    const hit = h("rect", { x: String(P.l + i * step), y: String(P.t), width: String(step), height: String(H - P.t - P.b), fill: "transparent" });
    hit.addEventListener("mouseenter", () => { tip.hidden = false; tip.textContent = `${date(Date.parse(r.day))}: ${t("adm.ov.signupsN", { n: r.n })}`; });
    hit.addEventListener("mouseleave", () => { tip.hidden = true; });
    svg.append(hit);
    if ((rows.length - 1 - i) % 7 === 0) { const tx = h("text", { x: String(x + bw / 2), y: String(H - 6), "text-anchor": "middle" }); tx.textContent = shortDate(Date.parse(r.day)); svg.append(tx); }
  });
  const table = h("details", { class: "small mt-1" }, h("summary", { class: "muted" }, t("adm.ov.table")), h("table", { class: "table" }, h("tbody", {}, rows.slice().reverse().map(r => h("tr", {}, h("td", {}, date(Date.parse(r.day))), h("td", { class: "num" }, num(r.n)))))));
  return h("div", { class: "chart-wrap" }, tip, svg, table);
}

export default async function overview() {
  const o = await api("/api/admin/overview");
  const u = o.users, m = o.money, hl = o.health;
  const led = ok => h("span", { class: `led ${ok === true ? "ok" : ok === false ? "bad" : "warn"}` });
  const healthItems = [
    ["database", "PostgreSQL", hl.postgres?.ok, hl.postgres?.latencyMs !== undefined ? `${hl.postgres.latencyMs} ms` : ""],
    ["server", "Redis", hl.redis?.note ? undefined : hl.redis?.ok, hl.redis?.latencyMs !== undefined ? `${hl.redis.latencyMs} ms` : hl.redis?.note ?? ""],
    ...hl.workers.map(w => ["bolt", t("adm.ov.worker"), w.ok, t("adm.ov.beat", { when: ago(w.lastBeatAt) })]),
    ...(hl.workers.length ? [] : [["bolt", t("adm.ov.worker"), false, t("adm.ov.noWorker")]]),
    ["archive", t("adm.ov.disk"), hl.disk ? hl.disk.usedPercent < 85 : undefined, hl.disk ? t("adm.ov.diskUsed", { n: hl.disk.usedPercent }) : "—"],
    ["database", t("adm.ov.backup"), hl.backups[0] ? hl.backups[0].status === "ok" && Date.now() - hl.backups[0].startedAt < 2 * 86400000 : undefined, hl.backups[0] ? `${t(`adm.ov.bk.${hl.backups[0].status}`)} · ${ago(hl.backups[0].startedAt)}` : t("adm.ov.noBackup")],
  ];
  return h("div", {}, pageHead(t("adm.nav.overview"), t("adm.ov.sub")),
    h("div", { class: "kpis" }, kpi(t("adm.ov.users"), num(u.users), { iconName: "users", sub: t("adm.ov.new", { d: num(u.new1), w: num(u.new7) }) }),
      kpi(t("adm.ov.active"), num(u.active30), { iconName: "flame", sub: t("adm.ov.active1", { n: num(u.active1) }) }),
      kpi(t("adm.ov.suspended"), num(u.suspended), { iconName: "ban", sub: t("adm.ov.review", { n: num(u.in_review) }) }),
      kpi(t("adm.ov.deletions"), num(u.pending_deletion), { iconName: "trash" }),
      kpi(t("adm.ov.google"), num(u.google_connected), { iconName: "cloud", sub: t("adm.ov.googleBroken", { n: num(u.google_broken) }) }),
      kpi(t("adm.ov.contacts"), num(u.contacts), { iconName: "contacts" })),
    h("div", { class: "dash-grid" },
      h("div", { class: "stack-lg" },
        card(t("adm.ov.signups"), signupChart(o.signups), { sub: t("adm.ov.signupsSub") }),
        card(t("adm.ov.money"), h("div", { class: "kpis" }, kpi(t("adm.ov.obligations"), money(m.pendingObligationsCents), { accent: true, sub: t("adm.ov.requests", { n: m.pendingCount }) }),
          kpi(t("adm.ov.paid"), money(m.paidCents), { sub: t("adm.ov.requests", { n: m.paidCount }) }), kpi(t("adm.ov.failed"), num(m.failedCount), { sub: t("adm.ov.rejected", { n: m.rejectedCount }) }),
          kpi(t("adm.ov.liability"), money(m.available + m.reserved), { sub: t("adm.ov.earnedAll", { amount: money(m.earned) }) })), { right: h("a", { class: "btn btn-sm", href: "#/payouts" }, t("adm.nav.payouts")) })),
      h("div", { class: "stack-lg" },
        card(t("adm.ov.health"), h("div", { class: "health" }, healthItems.map(([ic, label, ok, sub]) => h("div", { class: "h-item" }, led(ok), h("div", {}, h("b", { class: "small" }, label), h("div", { class: "xs faint" }, sub)))))),
        card(t("adm.ov.queues"), h("div", { class: "stack" },
          ...[[t("adm.ov.syncRate"), o.sync.successRate7d === null ? "—" : `${o.sync.successRate7d}%`], [t("adm.ov.syncPending"), num(o.sync.pending)], [t("adm.ov.syncFailed"), num(o.sync.failed)],
            [t("adm.ov.qualified"), num(o.referrals.qualified ?? 0)], [t("adm.ov.suspicious"), num(o.suspiciousReferrals)], [t("adm.ov.backlog"), num(o.fulfilmentBacklog)],
            [t("adm.ov.tickets"), num((o.support.open ?? 0) + (o.support.pending ?? 0))], [t("adm.ov.activeCh"), num(u.active_challenges)], [t("adm.ov.participation"), num(u.participations30)],
            [t("adm.ov.failedLogins"), num(o.security.failedLogins24h)], [t("adm.ov.denied"), num(o.security.deniedAdminRequests24h)]].map(([k, v]) => h("div", { class: "stat-row" }, h("span", { class: "muted" }, k), h("b", { class: "num" }, v))))))));
}
