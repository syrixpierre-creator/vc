import { h, icon, t, api, act, num, money, date, dateTime, ago, toast, modal, confirmDialog, field, debounce, menu, countryName, avatar } from "/js/core.js";
import { pageHead, card, statusBadge, kpi, backLink } from "/js/app/ui.js";

const ROLES = ["super_admin", "user_manager", "finance_manager", "challenge_manager", "support_agent", "auditor"];
const userStatus = s => h("span", { class: `badge ${s === "active" ? "ok" : s === "suspended" ? "bad" : "warn"}` }, h("span", { class: "dot" }), t(`userSt.${s}`));
const reviewBadge = r => (r && r !== "none" ? h("span", { class: `badge ${r === "cleared" ? "ok" : r === "confirmed_fraud" ? "bad" : "warn"}` }, t(`review.${r}`)) : null);

/* User directory: search, filters, sort, pages, bulk actions with preview. */
export default async function users({ admin }) {
  const st = { q: "", status: "", review: "", role: "", sort: "-created", offset: 0, sel: new Set() };
  const box = h("div", {}), pager = h("div", { class: "pager" }), bulk = h("div", {});
  const LIM = 25;
  async function load() {
    const p = new URLSearchParams({ limit: String(LIM), offset: String(st.offset), sort: st.sort });
    for (const k of ["q", "status", "review", "role"]) if (st[k]) p.set(k, st[k]);
    const r = await api(`/api/admin/users?${p}`);
    box.replaceChildren(h("div", { class: "table-wrap" }, h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
      h("thead", {}, h("tr", {}, h("th", { class: "check-col" }), h("th", {}, t("adm.u.user")), h("th", {}, t("adm.u.status")), h("th", {}, t("adm.u.registered")), h("th", {}, t("adm.u.lastSeen")),
        h("th", {}, t("adm.u.contacts")), h("th", {}, t("adm.u.referrals")), h("th", {}, "XP"), h("th", {}, t("adm.u.money")))),
      h("tbody", {}, r.items.map(u => h("tr", { class: st.sel.has(u.id) ? "selected" : "" },
        h("td", { class: "check-col" }, h("input", { type: "checkbox", "aria-label": u.name, checked: st.sel.has(u.id), onchange: e => { e.target.checked ? st.sel.add(u.id) : st.sel.delete(u.id); drawBulk(); } })),
        h("td", {}, h("a", { href: `#/user/${u.id}`, class: "contact-name" }, h("span", { class: "avatar sm" }, (u.name[0] ?? "?").toUpperCase()), h("span", { class: "grow" }, h("b", { class: "truncate" }, u.name), h("span", { class: "cell-sub truncate" }, u.email))),
          u.roles.length ? h("div", { class: "chips mt-1" }, u.roles.map(ro => h("span", { class: "badge violet" }, t(`role.${ro}`)))) : null),
        h("td", { "data-label": t("adm.u.status") }, h("div", { class: "chips" }, userStatus(u.status), reviewBadge(u.reviewStatus))),
        h("td", { "data-label": t("adm.u.registered") }, date(u.createdAt), h("div", { class: "cell-sub" }, [u.countryCode ? countryName(u.countryCode) : null, u.language.toUpperCase()].filter(Boolean).join(" · "))),
        h("td", { "data-label": t("adm.u.lastSeen") }, u.lastSeenAt ? ago(u.lastSeenAt) : "—"),
        h("td", { "data-label": t("adm.u.contacts"), class: "num" }, num(u.contactCount), h("div", { class: "cell-sub" }, t(`connSt.${u.contactsStatus}`))),
        h("td", { "data-label": t("adm.u.referrals"), class: "num" }, num(u.qualifiedReferrals)),
        h("td", { "data-label": "XP", class: "num" }, num(u.xp)),
        h("td", { "data-label": t("adm.u.money"), class: "num" }, u.pendingCents ? h("span", { class: "badge warn" }, money(u.pendingCents)) : null, u.paidCents ? h("div", { class: "cell-sub" }, t("adm.u.paid", { amount: money(u.paidCents) })) : null))))))));
    const from = r.total ? st.offset + 1 : 0;
    pager.replaceChildren(h("span", {}, t("ct.range", { from: num(from), to: num(Math.min(st.offset + LIM, r.total)), total: num(r.total) })),
      h("div", { class: "row" }, h("button", { class: "btn btn-sm", type: "button", disabled: !st.offset, onclick: () => { st.offset -= LIM; load(); } }, t("common.previous")), h("button", { class: "btn btn-sm", type: "button", disabled: st.offset + LIM >= r.total, onclick: () => { st.offset += LIM; load(); } }, t("common.next"))));
  }
  function drawBulk() {
    if (!st.sel.size) return bulk.replaceChildren();
    const act1 = action => async () => {
      const prev = await api("/api/admin/bulk", { method: "POST", body: { action, userIds: [...st.sel] } }).catch(e => { toast(e.message, "bad"); return null; });
      if (!prev) return;
      const msg = action === "notify" ? h("textarea", { class: "textarea", maxlength: 500, placeholder: t("adm.u.message") }) : null;
      const ok = await confirmDialog({ title: t(`adm.bulk.${action}`), text: t("adm.bulk.preview", { n: prev.count }), reason: true, danger: action !== "notify", confirm: t("common.confirm"),
        extra: h("div", {}, msg ? field(t("adm.u.message"), msg) : null, h("p", { class: "xs muted" }, prev.sample.map(s => s.name).join(", "))) });
      if (!ok) return;
      const r = await act(() => api("/api/admin/bulk", { method: "POST", body: { action, userIds: [...st.sel], preview: false, reason: ok.reason, ...(msg ? { message: msg.value } : {}) } }));
      if (r) { toast(t("adm.bulk.done", { n: r.affected })); st.sel.clear(); drawBulk(); load(); }
    };
    const items = [["suspend", "users.suspend"], ["restrict_referrals", "users.restrict"], ["flag", "fraud.review"], ["notify", "announcements.manage"]].filter(([, p]) => admin.can(p));
    bulk.replaceChildren(h("div", { class: "bulkbar" }, h("span", { class: "grow" }, t("ct.selected", { n: st.sel.size })),
      items.map(([a]) => h("button", { class: `btn btn-sm${a === "suspend" ? " btn-danger" : ""}`, type: "button", onclick: act1(a) }, t(`adm.bulk.${a}`))),
      h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("ct.clearSel"), onclick: () => { st.sel.clear(); drawBulk(); load(); } }, icon("x"))));
  }
  const search = h("input", { class: "input", type: "search", placeholder: t("adm.u.search"), "aria-label": t("adm.u.search") });
  search.addEventListener("input", debounce(() => { st.q = search.value.trim(); st.offset = 0; load(); }));
  const sel = (key, opts, label) => h("select", { class: "select", style: { width: "auto" }, "aria-label": label, onchange: e => { st[key] = e.target.value; st.offset = 0; load(); } }, opts.map(([v, l]) => h("option", { value: v, selected: st[key] === v }, l)));
  await load();
  return h("div", {}, pageHead(t("adm.nav.users"), t("adm.u.sub"), admin.can("reports.export") ? [h("a", { class: "btn", href: "/api/admin/reports/users", download: "" }, icon("download"), t("adm.u.export"))] : []),
    h("div", { class: "toolbar" }, h("div", { class: "input-icon search" }, icon("search"), search),
      sel("status", [["", t("adm.u.allStatus")], ...["active", "suspended", "pending_deletion"].map(s => [s, t(`userSt.${s}`)])], t("adm.u.status")),
      sel("review", [["", t("adm.u.allReview")], ...["flagged", "under_review", "cleared", "confirmed_fraud"].map(s => [s, t(`review.${s}`)])], t("adm.u.review")),
      sel("role", [["", t("adm.u.allRoles")], ["any", t("adm.u.staff")], ...ROLES.map(r => [r, t(`role.${r}`)])], t("adm.u.role")),
      sel("sort", [["-created", t("adm.u.newest")], ["created", t("adm.u.oldest")], ["name", t("ct.sortName")], ["-last_seen", t("adm.u.recent")]], t("ct.sort"))),
    bulk, box, pager);
}

/* One user: sections for account, contacts (counts only), referrals, progression, wallet, security, support — and the actions. */
export async function userDetail({ admin, route }) {
  const id = route.params[0];
  const d = await api(`/api/admin/users/${id}`);
  const a = d.account;
  const reload = () => admin.render();
  const withReason = async (title, text, fn, danger = false) => { const ok = await confirmDialog({ title, text, reason: true, danger, confirm: t("common.confirm") }); if (ok) { if (await act(() => fn(ok.reason), { ok: t("common.saved") })) reload(); } };
  const actions = [];
  if (admin.can("users.suspend")) actions.push(a.status === "suspended"
    ? { text: t("adm.a.unsuspend"), icon: "check", onClick: () => withReason(t("adm.a.unsuspend"), a.name, r => api(`/api/admin/users/${id}/unsuspend`, { method: "POST", body: { reason: r } })) }
    : { text: t("adm.a.suspend"), icon: "ban", danger: true, onClick: suspend });
  if (admin.can("users.restrict")) actions.push({ text: t("adm.a.restrict"), icon: "lock", onClick: restrict });
  if (admin.can("fraud.review")) actions.push({ text: t("adm.a.review"), icon: "flag", onClick: review });
  if (admin.can("sessions.revoke")) actions.push({ text: t("adm.a.revoke"), icon: "logout", onClick: () => withReason(t("adm.a.revoke"), t("adm.a.revokeP"), r => api(`/api/admin/users/${id}/revoke-sessions`, { method: "POST", body: { reason: r } }), true) });
  if (admin.can("sync.manage")) actions.push({ text: t("adm.a.retrySync"), icon: "sync", onClick: () => withReason(t("adm.a.retrySync"), "", r => api(`/api/admin/users/${id}/retry-sync`, { method: "POST", body: { reason: r } })) },
    { text: t("adm.a.reconnect"), icon: "unlink", onClick: () => withReason(t("adm.a.reconnect"), t("adm.a.reconnectP"), r => api(`/api/admin/users/${id}/request-reconnect`, { method: "POST", body: { reason: r } })) });
  if (admin.can("roles.manage")) actions.push({ text: t("adm.a.roles"), icon: "key", onClick: roles });
  if (admin.can("ledger.adjust")) actions.push({ text: t("adm.a.adjust"), icon: "coins", onClick: adjust });
  if (admin.can("challenges.manage")) actions.push({ text: t("adm.a.verified"), icon: "check-circle", onClick: verified });

  async function suspend() {
    const until = h("select", { class: "select" }, [["", t("adm.a.indefinite")], ["1", t("adm.a.days", { n: 1 })], ["7", t("adm.a.days", { n: 7 })], ["30", t("adm.a.days", { n: 30 })]].map(([v, l]) => h("option", { value: v }, l)));
    const ok = await confirmDialog({ title: t("adm.a.suspend"), text: t("adm.a.suspendP"), reason: true, danger: true, confirm: t("adm.a.suspend"), extra: field(t("adm.a.duration"), until) });
    if (ok && await act(() => api(`/api/admin/users/${id}/suspend`, { method: "POST", body: { reason: ok.reason, ...(until.value ? { until: Date.now() + Number(until.value) * 86400000 } : {}) } }), { ok: t("common.saved") })) reload();
  }
  async function restrict() {
    const scope = h("select", { class: "select" }, ["referrals", "rewards", "challenges", "read_only", "account"].map(s => h("option", { value: s }, t(`restriction.${s}`))));
    const days = h("select", { class: "select" }, [["", t("adm.a.indefinite")], ["7", t("adm.a.days", { n: 7 })], ["30", t("adm.a.days", { n: 30 })], ["90", t("adm.a.days", { n: 90 })]].map(([v, l]) => h("option", { value: v }, l)));
    const ok = await confirmDialog({ title: t("adm.a.restrict"), text: a.name, reason: true, confirm: t("adm.a.restrict"), extra: h("div", { class: "grid-2" }, field(t("adm.a.scope"), scope), field(t("adm.a.duration"), days)) });
    if (ok && await act(() => api(`/api/admin/users/${id}/restrictions`, { method: "POST", body: { scope: scope.value, reason: ok.reason, ...(days.value ? { expiresAt: Date.now() + Number(days.value) * 86400000 } : {}) } }), { ok: t("common.saved") })) reload();
  }
  async function review() {
    const s = h("select", { class: "select" }, ["flagged", "under_review", "cleared", "confirmed_fraud", "none"].map(x => h("option", { value: x, selected: x === a.reviewStatus }, t(`review.${x}`))));
    const ok = await confirmDialog({ title: t("adm.a.review"), text: t("adm.a.reviewP"), reason: true, confirm: t("common.save"), extra: field(t("adm.u.review"), s) });
    if (ok && await act(() => api(`/api/admin/users/${id}/review`, { method: "POST", body: { status: s.value, reason: ok.reason } }), { ok: t("common.saved") })) reload();
  }
  async function roles() {
    const chosen = new Set(a.roles);
    const boxes = h("div", { class: "stack" }, ROLES.filter(r => r !== "super_admin").map(r => h("label", { class: "check" }, h("input", { type: "checkbox", checked: chosen.has(r), onchange: e => e.target.checked ? chosen.add(r) : chosen.delete(r) }),
      h("span", {}, h("b", {}, t(`role.${r}`)), h("span", { class: "hint", style: { display: "block" } }, t(`roleDesc.${r}`))))));
    const ok = await confirmDialog({ title: t("adm.a.roles"), text: t("adm.a.rolesP"), reason: true, confirm: t("common.save"), extra: boxes });
    if (ok && await act(() => api(`/api/admin/users/${id}/roles`, { method: "PUT", body: { roles: [...chosen], reason: ok.reason } }), { ok: t("common.saved") })) reload();
  }
  async function adjust() {
    const amount = h("input", { class: "input", type: "number", step: "0.01", placeholder: "-1.00" });
    const ok = await confirmDialog({ title: t("adm.a.adjust"), text: t("adm.a.adjustP"), reason: true, danger: true, confirm: t("adm.a.adjustBtn"), extra: field(t("adm.a.amountUsd"), amount, { hint: t("adm.a.amountHint") }) });
    if (!ok) return;
    const cents = Math.round(Number(amount.value) * 100);
    if (!cents) { toast(t("err.invalid_amountCents"), "bad"); return; }
    if (await act(() => api(`/api/admin/users/${id}/ledger-adjustment`, { method: "POST", body: { amountCents: cents, reason: ok.reason, confirm: true } }), { ok: t("common.saved") })) reload();
  }
  async function verified() {
    const ref = h("input", { class: "input", maxlength: 80, placeholder: "ticket-1234" });
    const ok = await confirmDialog({ title: t("adm.a.verified"), text: t("adm.a.verifiedP"), reason: true, confirm: t("common.save"), extra: field(t("adm.a.ref"), ref) });
    if (ok && await act(() => api(`/api/admin/users/${id}/verified-activity`, { method: "POST", body: { reason: ok.reason, ref: ref.value.trim() } }), { ok: t("common.saved") })) reload();
  }

  const tabs = ["account", "contacts", "referrals", "progression", "wallet", "security", "support"].filter(k => k !== "wallet" || d.wallet);
  const tabBar = h("div", { class: "tabs", role: "tablist" });
  const panels = {};
  const show = k => { for (const b of tabBar.children) b.setAttribute("aria-selected", String(b.dataset.k === k)); for (const [pk, el] of Object.entries(panels)) el.hidden = pk !== k; };
  tabs.forEach(k => tabBar.append(h("button", { class: "tab", role: "tab", type: "button", "data-k": k, onclick: () => show(k) }, t(`adm.ut.${k}`))));
  const kv = pairs => h("dl", { class: "kv" }, pairs.filter(Boolean).map(([k, v]) => [h("dt", {}, k), h("dd", {}, v ?? "—")]));
  panels.account = card(null, kv([[t("adm.u.email"), a.email], ["ID", h("span", { class: "ltr xs" }, a.id)], [t("adm.u.status"), h("div", { class: "chips" }, userStatus(a.status), reviewBadge(a.reviewStatus))],
    a.suspensionReason ? [t("adm.a.reasonGiven"), `${a.suspensionReason}${a.suspendedUntil ? ` · ${t("adm.a.until", { date: dateTime(a.suspendedUntil) })}` : ""}`] : null,
    a.reviewReason ? [t("adm.u.review"), a.reviewReason] : null, [t("adm.u.roles"), a.roles.length ? a.roles.map(r => t(`role.${r}`)).join(", ") : "—"],
    [t("adm.u.registered"), dateTime(a.createdAt)], [t("adm.u.lastSeen"), a.lastSeenAt ? ago(a.lastSeenAt) : "—"], [t("set.country"), a.countryCode ? countryName(a.countryCode) : "—"],
    [t("common.language"), a.language.toUpperCase()], [t("set.timeZone"), a.timeZone], [t("set.phone"), a.phoneMasked], [t("set.pseudonym"), a.pseudonym],
    [t("adm.u.onboarded"), a.onboardedAt ? date(a.onboardedAt) : t("common.no")], a.deletionRequestedAt ? [t("adm.u.deletion"), dateTime(a.deletionRequestedAt)] : null]));
  const c = d.contacts;
  panels.contacts = h("div", { class: "stack-lg" }, h("div", { class: "callout" }, icon("lock"), h("span", { class: "small" }, t("adm.u.noContents"))),
    h("div", { class: "kpis" }, kpi(t("adm.u.contacts"), num(c.counts.total)), kpi(t("sync.c.synced"), num(c.counts.synced)), kpi(t("sync.c.pending"), num(c.counts.pending)), kpi(t("sync.c.failed"), num(c.counts.failed)), kpi(t("adm.u.google"), statusBadge("conn", c.google))),
    card(t("sync.history"), c.recentSync.length ? h("div", { class: "list" }, c.recentSync.map(l => h("div", { class: "list-item" }, h("span", { class: "grow small" }, t(`sync.o.${l.outcome}`)), h("span", { class: "meta" }, dateTime(l.at))))) : h("p", { class: "small muted" }, "—")));
  const rf = d.referrals;
  panels.referrals = h("div", { class: "stack-lg" }, h("div", { class: "kpis" }, ...["qualified", "pending", "under_review", "disqualified"].map(k => kpi(t(`referralSt.${k}`), num(rf.counts[k])))),
    rf.referredBy ? h("p", { class: "small muted" }, t("adm.u.referredBy", { name: rf.referredBy })) : null,
    card(t("ref.people"), rf.items.length ? h("div", { class: "list" }, rf.items.map(x => h("div", { class: "list-item" }, h("span", { class: "grow small" }, x.referred), x.reason ? h("span", { class: "xs faint" }, x.reason) : null, statusBadge("referral", x.status), h("span", { class: "meta" }, date(x.createdAt))))) : h("p", { class: "small muted" }, "—")));
  const p = d.progression;
  panels.progression = h("div", { class: "stack-lg" }, h("div", { class: "kpis" }, kpi("XP", num(p.xp)), kpi(t("pg.level"), `${num(p.level)} · ${t(`levelTitle.${p.title}`)}`), kpi("VIP", p.vip), kpi(t("pg.streak"), num(p.streakDays))),
    card(t("pg.achievements"), h("div", { class: "chips" }, p.achievements.map(x => h("span", { class: "badge violet" }, x.code)))),
    card(t("nav.challenges"), p.challenges.length ? h("div", { class: "list" }, p.challenges.map(x => h("div", { class: "list-item" }, h("span", { class: "grow xs ltr" }, x.challengeId), statusBadge("challenge", x.status ?? "active"), h("span", { class: "meta" }, date(x.joinedAt))))) : h("p", { class: "small muted" }, "—")));
  if (d.wallet) {
    const w = d.wallet;
    panels.wallet = h("div", { class: "stack-lg" }, h("div", { class: "kpis" }, kpi(t("wal.available"), money(w.balances.available)), kpi(t("wal.reserved"), money(w.balances.reserved)), kpi(t("wal.paid"), money(w.balances.paid)), kpi(t("wal.earned"), money(w.balances.earned))),
      card(t("wal.history"), w.payouts.length ? h("div", { class: "list" }, w.payouts.map(x => h("a", { class: "list-item", href: `#/payouts?id=${x.id}` }, h("b", { class: "num" }, money(x.amountCents)), h("span", { class: "grow small" }, `${t(`method.${x.method}`)} · ${x.maskedHint}`), statusBadge("payout", x.status), h("span", { class: "meta" }, date(x.createdAt))))) : h("p", { class: "small muted" }, "—")),
      card(t("wal.rewards"), w.claims.length ? h("div", { class: "list" }, w.claims.map(x => h("div", { class: "list-item" }, h("span", { class: "grow small" }, `${x.source} · ${x.kind}`), x.amountCents ? h("b", { class: "num" }, money(x.amountCents)) : null, statusBadge("claim", x.status)))) : h("p", { class: "small muted" }, "—")),
      card(t("wal.ledger"), h("div", { class: "list" }, w.ledger.map(x => h("div", { class: "list-item" }, h("span", { class: "grow small" }, `${t(`ledger.${x.type}`)}${x.reason ? ` · ${x.reason}` : ""}`), h("b", { class: "num" }, money(x.amountCents)), h("span", { class: "meta" }, dateTime(x.at)))))));
  }
  const sec = d.security;
  panels.security = h("div", { class: "stack-lg" },
    card(t("adm.u.restrictions"), sec.restrictions.length ? h("div", { class: "list" }, sec.restrictions.map(r => h("div", { class: "list-item" },
      h("span", { class: `badge ${r.liftedAt || (r.expiresAt && r.expiresAt < Date.now()) ? "" : "warn"}` }, t(`restriction.${r.scope}`)), h("div", { class: "grow" }, h("div", { class: "small" }, r.reason), h("div", { class: "meta" }, `${dateTime(r.startsAt)}${r.expiresAt ? ` → ${dateTime(r.expiresAt)}` : ""}${r.liftedAt ? ` · ${t("adm.u.lifted", { when: ago(r.liftedAt) })}` : ""}`)),
      !r.liftedAt && admin.can("users.restrict") ? h("button", { class: "btn btn-sm", type: "button", onclick: () => withReason(t("adm.a.lift"), t(`restriction.${r.scope}`), reason => api(`/api/admin/restrictions/${r.id}/lift`, { method: "POST", body: { reason } })) }, t("adm.a.lift")) : null)))
      : h("p", { class: "small muted" }, t("adm.u.noRestrictions"))),
    card(t("set.sessions"), sec.sessions.length ? h("div", { class: "list" }, sec.sessions.map(s => h("div", { class: "list-item" }, h("span", { class: "grow small" }, s.userAgent ?? "—"), h("span", { class: "meta" }, `${s.network ?? ""} · ${ago(s.lastSeenAt)}`)))) : h("p", { class: "small muted" }, "—")),
    card(t("set.events"), h("div", { class: "list" }, sec.events.map(e => h("div", { class: "list-item" }, h("span", { class: "grow small" }, t(`secEvent.${e.kind}`)), h("span", { class: "meta" }, `${e.network ?? ""} ${dateTime(e.at)}`))))));
  panels.support = card(t("nav.support"), d.support.length ? h("div", { class: "list" }, d.support.map(x => h("a", { class: "list-item", href: `#/support?id=${x.id}` }, h("span", { class: "grow small" }, x.subject), statusBadge("ticket", x.status), h("span", { class: "meta" }, date(x.createdAt))))) : h("p", { class: "small muted" }, "—"));

  const view = h("div", {}, backLink("#/users", t("adm.nav.users")),
    h("div", { class: "page-head" }, h("div", { class: "hello" }, avatar(a), h("div", {}, h("h1", {}, a.name), h("p", { class: "sub" }, a.email))),
      actions.length ? menu(h("button", { class: "btn btn-primary", type: "button" }, icon("sliders"), t("adm.u.actions"), icon("chevron-down", "i-sm")), actions) : null),
    tabBar, ...Object.values(panels));
  show("account");
  return view;
}
