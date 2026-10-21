import { h, icon, t, tOr, api, act, num, money, date, dateTime, ago, toast, confirmDialog, field, empty, switchEl, LANGS } from "/js/core.js";
import { pageHead, card, statusBadge, kpi } from "/js/app/ui.js";

const tableOf = (heads, rows) => h("div", { class: "table-wrap" }, h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
  h("thead", {}, h("tr", {}, heads.map(x => h("th", { class: x === "" ? "actions" : null }, x)))), h("tbody", {}, rows))));
const cents = v => Math.round(Number(v) * 100);
const dollars = c => String((c ?? 0) / 100);
const numInput = (value, { min = 0, step = 1, max } = {}) => h("input", { class: "input", type: "number", inputmode: "decimal", min: String(min), step: String(step), max: max != null ? String(max) : null, value: String(value) });

/* ---------------- referral review (fraud) ---------------- */
export async function fraud() {
  const view = h("div", {});
  const st = { status: "under_review" };
  async function load() {
    const r = await api(`/api/admin/referrals?status=${st.status}`);
    const tabs = h("div", { class: "tabs", role: "tablist" }, ["under_review", "pending", "qualified", "disqualified"].map(s =>
      h("button", { class: "tab", role: "tab", type: "button", "aria-selected": String(st.status === s), onclick: () => { st.status = s; load(); } }, t(`referralSt.${s}`), h("span", { class: "count" }, num(r.totals[s] ?? 0)))));
    const decide = async (x, decision) => {
      const ok = await confirmDialog({ title: t(decision === "qualified" ? "adm.f.approve" : "adm.f.reject"), text: t("adm.f.confirm", { a: x.referrerName, b: x.referredName }), reason: true, danger: decision !== "qualified" });
      if (ok && await act(() => api(`/api/admin/referrals/${x.id}/resolve`, { method: "POST", body: { decision, reason: ok.reason } }), { ok: t("common.saved") })) load();
    };
    view.replaceChildren(pageHead(t("adm.nav.fraud"), t("adm.f.sub")), tabs,
      r.items.length ? tableOf([t("adm.f.referrer"), t("adm.f.referred"), t("adm.f.reason"), t("adm.f.created"), t("wal.status"), ""], r.items.map(x => h("tr", {},
        h("td", {}, h("a", { href: `#/user/${x.referrerId}` }, h("b", {}, x.referrerName))),
        h("td", { "data-label": t("adm.f.referred") }, h("a", { href: `#/user/${x.referredId}` }, x.referredName), h("div", { class: "cell-sub" }, x.referredEmail)),
        h("td", { "data-label": t("adm.f.reason") }, x.reason ? tOr(`refReason.${x.reason}`, x.reason) : "—"),
        h("td", { "data-label": t("adm.f.created") }, h("span", { title: dateTime(x.createdAt) }, ago(x.createdAt))),
        h("td", { "data-label": t("wal.status") }, statusBadge("referral", x.status)),
        h("td", { class: "actions" }, x.status === "under_review" ? h("div", { class: "row" },
          h("button", { class: "btn btn-sm btn-ok", type: "button", onclick: () => decide(x, "qualified") }, icon("check", "i-sm"), t("adm.f.approve")),
          h("button", { class: "btn btn-sm btn-danger", type: "button", onclick: () => decide(x, "disqualified") }, icon("ban", "i-sm"), t("adm.f.reject"))) : null))))
        : empty("shield", t("adm.f.empty"), t("adm.f.emptyP")));
  }
  await load();
  return view;
}

/* ---------------- deletion queue ---------------- */
export async function deletions() {
  const view = h("div", {});
  async function load() {
    const r = await api("/api/admin/deletions");
    const run = async (x, what) => {
      const ok = await confirmDialog({ title: t(`adm.d.${what}`), text: t(`adm.d.${what}P`, { name: x.name }), reason: true, danger: what === "process" });
      if (ok && await act(() => api(`/api/admin/deletions/${x.id}/${what}`, { method: "POST", body: { reason: ok.reason } }), { ok: t("common.saved") })) load();
    };
    view.replaceChildren(pageHead(t("adm.nav.deletions"), t("adm.d.sub")),
      h("div", { class: "callout mb-3" }, icon("info"), h("div", { class: "small" }, t("adm.d.note"))),
      r.items.length ? tableOf([t("adm.p.user"), t("adm.d.requested"), t("adm.d.due"), "", ""], r.items.map(x => h("tr", {},
        h("td", {}, h("a", { href: `#/user/${x.id}` }, h("b", {}, x.name)), h("div", { class: "cell-sub" }, x.email)),
        h("td", { "data-label": t("adm.d.requested") }, date(x.requestedAt)),
        h("td", { "data-label": t("adm.d.due") }, date(x.dueAt)),
        h("td", {}, x.openPayout ? h("span", { class: "badge warn" }, icon("wallet", "i-sm"), t("adm.d.openPayout")) : null),
        h("td", { class: "actions" }, h("div", { class: "row" },
          h("button", { class: "btn btn-sm", type: "button", onclick: () => run(x, "cancel") }, t("adm.d.cancel")),
          h("button", { class: "btn btn-sm btn-danger", type: "button", disabled: x.openPayout, title: x.openPayout ? t("adm.d.openPayoutP") : null, onclick: () => run(x, "process") }, icon("trash", "i-sm"), t("adm.d.process")))))))
        : empty("trash", t("adm.d.empty"), t("adm.d.emptyP")));
  }
  await load();
  return view;
}

/* ---------------- settings ---------------- */
export async function settings() {
  const view = h("div", {});
  async function save(kind, value) {
    const ok = await confirmDialog({ title: t("adm.st.saveTitle"), text: t(`adm.st.${kind}`), reason: true, confirm: t("common.save") });
    if (ok && await act(() => api(`/api/admin/settings/${kind}`, { method: "PUT", body: { value, reason: ok.reason } }), { ok: t("common.saved") })) load();
  }
  const saveBtn = fn => h("div", { class: "row mt-2" }, h("button", { class: "btn btn-primary btn-sm", type: "button", onclick: fn }, icon("check", "i-sm"), t("common.save")));

  async function load() {
    const s = await api("/api/admin/settings");
    const p = s.reward_policy, b = s.reward_budget, rp = s.referral_policy;

    const minW = numInput(dollars(p.minWithdrawCents), { min: 1, step: 0.01 }), perRef = numInput(dollars(p.centsPerReferral), { min: 0, step: 0.01, max: 10 }), maxRef = numInput(p.maxRewardedReferrals, { min: 0 });
    const policy = card(t("adm.st.reward_policy"), h("div", {}, h("div", { class: "grid-3" },
      field(t("adm.st.minWithdraw"), minW, { hint: "USD" }), field(t("adm.st.perReferral"), perRef, { hint: t("adm.st.perReferralHint") }), field(t("adm.st.maxRewarded"), maxRef)),
      saveBtn(() => save("reward_policy", { minWithdrawCents: cents(minW.value), centsPerReferral: cents(perRef.value), maxRewardedReferrals: Number(maxRef.value) }))));

    const perUser = numInput(dollars(b.perUserCapCents), { step: 0.01 }), global = numInput(dollars(b.globalCapCents), { step: 0.01 });
    const budget = card(t("adm.st.reward_budget"), h("div", {},
      h("div", { class: "kpis mb-2" }, kpi(t("adm.st.earned"), money(s.globalEarnedCents), { iconName: "coins" }),
        kpi(t("adm.st.left"), b.globalCapCents ? money(Math.max(0, b.globalCapCents - s.globalEarnedCents)) : "—", { iconName: "wallet" })),
      h("div", { class: "grid-2" }, field(t("adm.st.perUserCap"), perUser, { hint: t("adm.st.zeroNoLimit") }), field(t("adm.st.globalCap"), global, { hint: t("adm.st.zeroNoLimit") })),
      saveBtn(() => save("reward_budget", { perUserCapCents: cents(perUser.value), globalCapCents: cents(global.value) }))), { sub: t("adm.st.budgetSub") });

    // milestones: editable rows
    const rows = s.referral_milestones.map(m => ({ ...m }));
    const msBody = h("div", {});
    const drawMs = () => msBody.replaceChildren(tableOf([t("adm.st.threshold"), "XP", t("adm.st.badge"), t("adm.st.cash"), ""], rows.map((m, i) => {
      const set = (k, conv) => e => { const v = e.target.value.trim(); if (v === "") delete m[k]; else m[k] = conv(v); };
      return h("tr", {},
        h("td", {}, h("input", { class: "input input-sm", type: "number", min: "1", value: String(m.threshold ?? ""), "aria-label": t("adm.st.threshold"), onchange: set("threshold", Number) })),
        h("td", { "data-label": "XP" }, h("input", { class: "input input-sm", type: "number", min: "0", value: String(m.xp ?? ""), "aria-label": "XP", onchange: set("xp", Number) })),
        h("td", { "data-label": t("adm.st.badge") }, h("input", { class: "input input-sm", pattern: "[a-z0-9_]+", maxlength: 40, value: m.badge ?? "", "aria-label": t("adm.st.badge"), onchange: set("badge", String) })),
        h("td", { "data-label": t("adm.st.cash") }, h("input", { class: "input input-sm", type: "number", min: "0", step: "0.01", value: m.cashCents ? dollars(m.cashCents) : "", "aria-label": t("adm.st.cash"), onchange: set("cashCents", cents) })),
        h("td", { class: "actions" }, h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.delete"), onclick: () => { rows.splice(i, 1); drawMs(); } }, icon("trash"))));
    })), h("div", { class: "row mt-2" },
      h("button", { class: "btn btn-sm", type: "button", onclick: () => { rows.push({ threshold: (rows.at(-1)?.threshold ?? 0) + 10 }); drawMs(); } }, icon("plus", "i-sm"), t("adm.st.addMilestone")),
      h("button", { class: "btn btn-primary btn-sm", type: "button", onclick: () => save("referral_milestones", rows.filter(m => m.threshold > 0).map(m => Object.fromEntries(Object.entries(m).filter(([, v]) => v !== "" && v != null && v !== 0)))) }, icon("check", "i-sm"), t("common.save"))));
    drawMs();
    const milestones = card(t("adm.st.referral_milestones"), h("div", {}, h("p", { class: "small muted mb-2" }, t("adm.st.milestonesP")), msBody));

    const age = numInput(rp.minAccountAgeHours), perNet = numInput(rp.maxPerNetworkPerDay, { min: 1 });
    const refPolicy = card(t("adm.st.referral_policy"), h("div", {}, h("div", { class: "grid-2" }, field(t("adm.st.minAge"), age, { hint: t("adm.st.hours") }), field(t("adm.st.perNetwork"), perNet)),
      saveBtn(() => save("referral_policy", { minAccountAgeHours: Number(age.value), maxPerNetworkPerDay: Number(perNet.value) }))));

    const vip = s.vip_levels.map(l => ({ name: l.name, minXp: l.minXp, benefits: { ...l.benefits } }));
    const vipBody = h("div", {});
    const drawVip = () => vipBody.replaceChildren(h("div", { class: "stack" }, vip.map((l, i) => h("div", { class: "card-inset" },
      h("div", { class: "grid-2" },
        field(t("adm.st.levelName"), h("input", { class: "input", maxlength: 30, value: l.name, onchange: e => { l.name = e.target.value.trim(); } })),
        field(t("adm.st.minXp"), h("input", { class: "input", type: "number", min: "0", value: String(l.minXp), disabled: i === 0, onchange: e => { l.minXp = Number(e.target.value); } }))),
      h("details", { class: "mt-1" }, h("summary", { class: "small" }, t("adm.st.benefits")), h("div", { class: "stack mt-1" }, Object.keys(LANGS).map(lg =>
        h("div", { class: "input-group" }, h("span", { class: "badge" }, lg.toUpperCase()), h("input", { class: "input", maxlength: 300, lang: lg, dir: lg === "ar" ? "rtl" : "ltr", value: l.benefits[lg] ?? "", onchange: e => { const v = e.target.value.trim(); if (v) l.benefits[lg] = v; else delete l.benefits[lg]; } }))))),
      i > 0 ? h("button", { class: "btn btn-ghost btn-sm mt-1", type: "button", onclick: () => { vip.splice(i, 1); drawVip(); } }, icon("trash", "i-sm"), t("common.delete")) : null))),
    h("div", { class: "row mt-2" },
      vip.length < 10 ? h("button", { class: "btn btn-sm", type: "button", onclick: () => { vip.push({ name: "", minXp: (vip.at(-1)?.minXp ?? 0) + 1000, benefits: {} }); drawVip(); } }, icon("plus", "i-sm"), t("adm.st.addLevel")) : null,
      h("button", { class: "btn btn-primary btn-sm", type: "button", onclick: () => save("vip_levels", vip) }, icon("check", "i-sm"), t("common.save"))));
    drawVip();
    const vipCard = card(t("adm.st.vip_levels"), vipBody);

    const intro = card(t("adm.st.intro_first_visit_only"), switchEl(t("adm.st.introLabel"), s.intro_first_visit_only, e => save("intro_first_visit_only", e.target.checked), { hint: t("adm.st.introHint") }));

    view.replaceChildren(pageHead(t("adm.nav.settings"), t("adm.st.sub")),
      h("div", { class: "callout mb-3" }, icon("shield"), h("div", { class: "small" }, t("adm.st.auditNote"))),
      h("div", { class: "stack" }, policy, budget, milestones, refPolicy, vipCard, intro));
  }
  await load();
  return view;
}

/* ---------------- audit log + security events ---------------- */
const short = v => { if (v == null) return "—"; const s = typeof v === "string" ? v : JSON.stringify(v); return s.length > 80 ? `${s.slice(0, 80)}…` : s; };
export async function audit({ route }) {
  const view = h("div", {});
  const st = { tab: route.query.get("tab") === "security" ? "security" : "audit", action: "", type: route.query.get("type") ?? "", rid: route.query.get("id") ?? "", kind: "", offset: 0 };
  const PAGE = 100;
  async function load() {
    const tabs = h("div", { class: "tabs", role: "tablist" }, ["audit", "security"].map(k =>
      h("button", { class: "tab", role: "tab", type: "button", "aria-selected": String(st.tab === k), onclick: () => { st.tab = k; st.offset = 0; load(); } }, t(`adm.au.${k}`))));
    let filters, body, count;
    if (st.tab === "audit") {
      const q = new URLSearchParams({ limit: String(PAGE), offset: String(st.offset) });
      if (st.action) q.set("action", st.action); if (st.type) q.set("resourceType", st.type); if (st.rid) q.set("resourceId", st.rid);
      const r = await api(`/api/admin/audit?${q}`);
      count = r.items.length;
      const act$ = h("input", { class: "input input-sm", placeholder: t("adm.au.action"), value: st.action, "aria-label": t("adm.au.action") });
      const type$ = h("select", { class: "select select-sm", "aria-label": t("adm.au.resource") }, ["", "user", "payout", "reward_claim", "referral", "challenge", "announcement", "setting", "report", "ticket"].map(x => h("option", { value: x, selected: x === st.type }, x || t("common.all"))));
      filters = h("form", { class: "row mb-2", onsubmit: e => { e.preventDefault(); st.action = act$.value.trim(); st.type = type$.value; st.offset = 0; load(); } }, act$, type$,
        st.rid ? h("span", { class: "badge" }, st.rid.slice(0, 8), h("button", { class: "link-btn", type: "button", "aria-label": t("common.clear"), onclick: () => { st.rid = ""; load(); } }, icon("x", "i-sm"))) : null,
        h("button", { class: "btn btn-sm", type: "submit" }, icon("filter", "i-sm"), t("common.filter")));
      body = r.items.length ? tableOf([t("adm.au.when"), t("adm.au.actor"), t("adm.au.action"), t("adm.au.resource"), t("adm.au.change"), t("common.reason")], r.items.map(x => h("tr", {},
        h("td", {}, h("span", { title: dateTime(x.at) }, dateTime(x.at))),
        h("td", { "data-label": t("adm.au.actor") }, x.actorId ? h("a", { href: `#/user/${x.actorId}` }, x.actorName ?? x.actorId.slice(0, 8)) : t("adm.au.system")),
        h("td", { "data-label": t("adm.au.action") }, h("code", { class: "small" }, x.action)),
        h("td", { "data-label": t("adm.au.resource") }, x.resourceType, " ", x.resourceType === "user" && !x.resourceId.includes(",") ? h("a", { href: `#/user/${x.resourceId}`, class: "small" }, x.resourceId.slice(0, 8)) : h("span", { class: "small faint" }, short(x.resourceId))),
        h("td", { "data-label": t("adm.au.change") }, h("span", { class: "small mono" }, `${short(x.from)} → ${short(x.to)}`)),
        h("td", { "data-label": t("common.reason") }, x.reason ? h("span", { class: "small" }, x.reason) : "—"))))
        : empty("scroll", t("adm.au.empty"), "");
    } else {
      const q = new URLSearchParams({ limit: String(PAGE), offset: String(st.offset) });
      if (st.kind) q.set("kind", st.kind);
      const r = await api(`/api/admin/security-events?${q}`);
      count = r.items.length;
      const kind$ = h("select", { class: "select select-sm", "aria-label": t("adm.au.kind"), onchange: e => { st.kind = e.target.value; st.offset = 0; load(); } },
        ["", "login", "login_failed", "google_verification_failed", "oauth_state_mismatch", "login_blocked_suspended", "admin_denied", "account_created", "session_revoked", "sessions_revoked", "roles_changed", "suspended", "suspension_expired", "google_contacts_connected", "google_contacts_disconnected", "payout_method_added", "payout_method_removed", "data_exported", "deletion_requested", "deletion_cancelled", "account_deleted"].map(x => h("option", { value: x, selected: x === st.kind }, x ? tOr(`secEvent.${x}`, x) : t("common.all"))));
      filters = h("div", { class: "row mb-2" }, kind$);
      body = r.items.length ? tableOf([t("adm.au.when"), t("adm.au.kind"), t("adm.p.user"), t("adm.au.network"), t("adm.au.detail")], r.items.map(x => h("tr", {},
        h("td", {}, dateTime(x.at)),
        h("td", { "data-label": t("adm.au.kind") }, h("span", { class: `badge ${/failed|denied|mismatch|blocked|suspended/.test(x.kind) ? "warn" : ""}` }, tOr(`secEvent.${x.kind}`, x.kind))),
        h("td", { "data-label": t("adm.p.user") }, x.userId ? h("a", { href: `#/user/${x.userId}` }, x.userId.slice(0, 8)) : "—"),
        h("td", { "data-label": t("adm.au.network") }, h("span", { class: "small mono" }, x.ipPrefix ?? "—")),
        h("td", { "data-label": t("adm.au.detail") }, h("span", { class: "small mono" }, short(x.detail))))))
        : empty("shield", t("adm.au.empty"), "");
    }
    const pager = h("div", { class: "row mt-2" },
      h("button", { class: "btn btn-sm", type: "button", disabled: st.offset === 0, onclick: () => { st.offset = Math.max(0, st.offset - PAGE); load(); } }, icon("chevron-left", "i-sm flip"), t("common.prev")),
      h("span", { class: "small muted" }, `${num(st.offset + (count ? 1 : 0))}–${num(st.offset + count)}`),
      h("button", { class: "btn btn-sm", type: "button", disabled: count < PAGE, onclick: () => { st.offset += PAGE; load(); } }, t("common.next"), icon("chevron-right", "i-sm flip")));
    view.replaceChildren(pageHead(t("adm.nav.audit"), t("adm.au.sub")), tabs, filters, body, pager);
  }
  await load();
  return view;
}

/* ---------------- CSV reports ---------------- */
export async function reports() {
  const kinds = [["users", "users"], ["payouts", "wallet"], ["referrals", "link"], ["claims", "gift"]];
  return h("div", {}, pageHead(t("adm.nav.reports"), t("adm.rp.sub")),
    h("div", { class: "callout mb-3" }, icon("lock"), h("div", { class: "small" }, t("adm.rp.note"))),
    h("div", { class: "grid-2" }, kinds.map(([k, ic]) => card(null, h("div", { class: "row" },
      h("span", { class: "icon-tile" }, icon(ic)), h("div", { class: "grow" }, h("b", {}, t(`adm.rp.${k}`)), h("div", { class: "small muted" }, t(`adm.rp.${k}P`))),
      h("a", { class: "btn btn-sm", href: `/api/admin/reports/${k}`, download: "", onclick: () => toast(t("adm.rp.started")) }, icon("download", "i-sm"), "CSV"))))));
}
