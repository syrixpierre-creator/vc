import { h, icon, t, api, act, num, money, date, dateTime, ago, toast, modal, confirmDialog, field, LANGS, switchEl } from "/js/core.js";
import { pageHead, card, statusBadge, diffBadge, backLink } from "/js/app/ui.js";

const METRICS = ["qualified_referrals", "active_days", "verified_operations", "challenges_completed", "contacts_labeled", "duplicates_reviewed", "vcf_imports", "vcf_exports", "backups_created", "security_tasks", "sync_successes", "admin_verified"];
const REWARDS = ["xp", "badge", "vip", "premium", "cash", "whatsapp_promotion", "telegram_stars", "telegram_premium"];
const toLocal = ms => { const d = new Date(ms); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const fromLocal = v => new Date(v).getTime();

/** Inputs for one translated text in all five languages (English required). */
function i18nFields(label, value = {}, { multiline = false, max = 200 } = {}) {
  const inputs = {};
  const box = h("div", { class: "field" }, h("span", { class: "label" }, label), h("div", { class: "stack" }, Object.entries(LANGS).map(([l, name]) => {
    const el = multiline ? h("textarea", { class: "textarea", rows: 2, maxlength: max, lang: l, dir: l === "ar" ? "rtl" : "ltr" }, value[l] ?? "") : h("input", { class: "input", maxlength: max, lang: l, dir: l === "ar" ? "rtl" : "ltr", value: value[l] ?? "" });
    inputs[l] = el;
    return h("div", { class: "input-group" }, h("span", { class: "badge", style: { minWidth: "40px", justifyContent: "center" } }, l.toUpperCase()), el, void name);
  })));
  return { box, value: () => Object.fromEntries(Object.entries(inputs).map(([l, el]) => [l, el.value.trim()]).filter(([, v]) => v)) };
}

export async function challenges({ admin }) {
  const view = h("div", {});
  const selected = new Set();
  async function load() {
    const [r, rev] = await Promise.all([api("/api/admin/challenges"), api("/api/admin/challenges/reviews")]);
    const drafts = r.items.filter(c => !c.published);
    const month = new Date().toISOString().slice(0, 7);
    view.replaceChildren(pageHead(t("adm.nav.challenges"), t("adm.c.sub"), [
      h("button", { class: "btn btn-primary", type: "button", onclick: () => form(null) }, icon("plus"), t("adm.c.new")),
      h("button", { class: "btn", type: "button", onclick: e => act(async () => { const x = await api("/api/admin/challenges/templates", { method: "POST", body: { month } }); toast(t("adm.c.templated", { n: x.created })); load(); }, { btn: e.currentTarget }) }, icon("layers"), t("adm.c.templates", { month })),
    ]),
      rev.items.length ? card(t("adm.c.reviews"), h("div", { class: "list" }, rev.items.map(x => h("div", { class: "list-item" }, h("div", { class: "grow" }, h("b", { class: "small" }, x.userName), h("div", { class: "meta" }, `${x.challenge.title} · ${ago(x.claimedAt)}`)),
        h("a", { class: "btn btn-ghost btn-sm", href: `#/user/${x.userId}` }, t("adm.c.profile")),
        h("button", { class: "btn btn-sm btn-ok", type: "button", onclick: () => decide(x, "approve") }, t("adm.c.approve")), h("button", { class: "btn btn-sm btn-danger", type: "button", onclick: () => decide(x, "reject") }, t("adm.c.reject"))))), { cls: "mb-3" }) : null,
      drafts.length ? h("div", { class: "callout mb-2" }, icon("info"), h("div", { class: "grow small" }, t("adm.c.publishHint")),
        h("button", { class: "btn btn-sm btn-primary", type: "button", onclick: publishMonth }, t("adm.c.publishSel", { n: selected.size }))) : null,
      h("div", { class: "table-wrap" }, h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
        h("thead", {}, h("tr", {}, h("th", { class: "check-col" }), h("th", {}, t("adm.c.challenge")), h("th", {}, t("adm.c.goal")), h("th", {}, t("adm.c.reward")), h("th", {}, t("adm.c.window")), h("th", {}, t("adm.c.stats")), h("th", { class: "actions" }))),
        h("tbody", {}, r.items.map(c => h("tr", {},
          h("td", { class: "check-col" }, c.published ? h("span", { class: "badge ok", title: t("adm.c.published") }, icon("check", "i-sm")) : h("input", { type: "checkbox", "aria-label": c.title.en, checked: selected.has(c.id), onchange: e => { e.target.checked ? selected.add(c.id) : selected.delete(c.id); load(); } })),
          h("td", {}, h("b", {}, c.title.en), h("div", { class: "row mt-1" }, diffBadge(c.difficulty), c.published ? h("span", { class: "badge ok" }, t("adm.c.published")) : h("span", { class: "badge" }, t("adm.c.draft")), c.reviewRequired ? h("span", { class: "badge blue" }, t("ch.reviewed")) : null)),
          h("td", { "data-label": t("adm.c.goal") }, `${num(c.threshold)} · ${t(`metric.${c.metric}`)}`),
          h("td", { "data-label": t("adm.c.reward") }, c.rewardType === "cash" ? `${money(c.rewardCents)} · ${t("adm.c.budget", { amount: money(c.budgetCents) })}` : `${t(`reward.${c.rewardType}`)}${c.rewardXp ? ` · ${num(c.rewardXp)} XP` : ""}`, c.maxWinners ? h("div", { class: "cell-sub" }, t("adm.c.maxWinners", { n: c.maxWinners })) : null),
          h("td", { "data-label": t("adm.c.window") }, `${date(c.startsAt)} → ${date(c.endsAt)}`),
          h("td", { "data-label": t("adm.c.stats") }, t("adm.c.statsLine", { joined: c.stats.joined, completed: c.stats.completed, claimed: c.stats.claimed }), c.stats.spentCents ? h("div", { class: "cell-sub" }, money(c.stats.spentCents)) : null),
          h("td", { class: "actions" }, h("div", { class: "row end wrap" }, h("button", { class: "btn btn-sm", type: "button", onclick: () => form(c) }, t("common.edit")),
            !c.published ? h("button", { class: "btn btn-sm", type: "button", onclick: e => act(async () => { const res = await api(`/api/admin/challenges/${c.id}/publish`, { method: "POST", body: {} }).catch(err => { if (err.data?.problems) toast(err.data.problems.join("; "), "bad"); throw err; }); void res; load(); }, { btn: e.currentTarget, ok: t("adm.c.publishedOk") }) }, t("adm.c.publish")) : null,
            !c.published && !c.stats.joined ? h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.delete"), onclick: async () => { if (await confirmDialog({ title: t("adm.c.deleteDraft"), text: c.title.en, danger: true, confirm: t("common.delete") })) { await act(() => api(`/api/admin/challenges/${c.id}`, { method: "DELETE" })); load(); } } }, icon("trash")) : null)))))))));
  }
  async function publishMonth() {
    if (!selected.size) return toast(t("adm.c.selectFirst"), "bad");
    try { await api("/api/admin/challenges/publish-month", { method: "POST", body: { ids: [...selected] } }); toast(t("adm.c.publishedOk")); selected.clear(); load(); }
    catch (e) { toast(e.data?.problems ? e.data.problems.join(" · ") : t("err.generic"), "bad"); }
  }
  async function decide(x, decision) {
    const ok = await confirmDialog({ title: t(`adm.c.${decision}`), text: `${x.userName} · ${x.challenge.title}`, reason: true, danger: decision === "reject", confirm: t(`adm.c.${decision}`) });
    if (ok && await act(() => api(`/api/admin/challenges/${x.challengeId}/participants/${x.userId}/review`, { method: "POST", body: { decision, reason: ok.reason } }), { ok: t("common.saved") })) load();
  }
  function form(c) {
    const title = i18nFields(t("adm.c.title"), c?.title, { max: 120 });
    const desc = i18nFields(t("adm.c.description"), c?.description, { multiline: true, max: 600 });
    const slug = h("input", { class: "input ltr", value: c?.slug ?? "", pattern: "[a-z0-9-]+", maxlength: 60 });
    const diff = h("select", { class: "select" }, ["advanced", "expert", "elite", "legendary"].map(d => h("option", { value: d, selected: c?.difficulty === d }, t(`diff.${d}`))));
    const metric = h("select", { class: "select" }, METRICS.map(m => h("option", { value: m, selected: c?.metric === m }, t(`metric.${m}`))));
    const threshold = h("input", { class: "input", type: "number", min: "1", value: String(c?.threshold ?? 25) });
    const start = h("input", { class: "input", type: "datetime-local", value: toLocal(c?.startsAt ?? Date.now()) });
    const end = h("input", { class: "input", type: "datetime-local", value: toLocal(c?.endsAt ?? Date.now() + 30 * 86400000) });
    const reward = h("select", { class: "select" }, REWARDS.map(r => h("option", { value: r, selected: c?.rewardType === r }, t(`reward.${r}`))));
    const xp = h("input", { class: "input", type: "number", min: "0", value: String(c?.rewardXp ?? 200) });
    const cash = h("input", { class: "input", type: "number", min: "0", step: "0.01", value: c?.rewardCents ? String(c.rewardCents / 100) : "" });
    const budget = h("input", { class: "input", type: "number", min: "0", step: "0.01", value: c?.budgetCents ? String(c.budgetCents / 100) : "" });
    const winners = h("input", { class: "input", type: "number", min: "0", value: c?.maxWinners ? String(c.maxWinners) : "" });
    const terms = h("textarea", { class: "textarea", rows: 4, maxlength: 4000 }, c?.terms ?? "");
    let review = !!c?.reviewRequired;
    const minAge = h("input", { class: "input", type: "number", min: "0", value: c?.eligibility?.minAccountAgeDays ? String(c.eligibility.minAccountAgeDays) : "" });
    const minLevel = h("input", { class: "input", type: "number", min: "0", value: c?.eligibility?.minLevel ? String(c.eligibility.minLevel) : "" });
    const cashBox = h("div", { class: "grid-2" }, field(t("adm.c.cash"), cash), field(t("adm.c.budgetLabel"), budget, { hint: t("adm.c.budgetHint") }));
    const syncCash = () => { cashBox.hidden = reward.value !== "cash"; };
    reward.addEventListener("change", syncCash); syncCash();
    const err = h("p", { class: "error-text", role: "alert" });
    const save = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
    const m = modal({ title: c ? t("adm.c.edit") : t("adm.c.new"), sub: c ? t("adm.c.frozenHint") : t("adm.c.newSub"), wide: true, body: h("div", {},
      title.box, desc.box, h("div", { class: "grid-3" }, field(t("adm.c.slug"), slug), field(t("ch.difficulty"), diff), field(t("adm.c.metric"), metric)),
      h("div", { class: "grid-3" }, field(t("adm.c.threshold"), threshold, { hint: t("adm.c.thresholdHint") }), field(t("adm.c.start"), start), field(t("adm.c.end"), end)),
      h("div", { class: "grid-3" }, field(t("adm.c.reward"), reward), field(t("adm.c.xp"), xp), field(t("adm.c.maxWinnersLabel"), winners)), cashBox,
      h("div", { class: "grid-2" }, field(t("adm.c.minAge"), minAge), field(t("adm.c.minLevel"), minLevel)),
      field(t("ch.terms"), terms), switchEl(t("adm.c.review"), review, v => { review = v; }, { hint: t("adm.c.reviewHint") }), err),
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), save] });
    save.addEventListener("click", async () => {
      const body = { title: title.value(), description: desc.value(), difficulty: diff.value, metric: metric.value, threshold: Number(threshold.value), startsAt: fromLocal(start.value), endsAt: fromLocal(end.value),
        rewardType: reward.value, terms: terms.value.trim(), reviewRequired: review };
      if (slug.value.trim()) body.slug = slug.value.trim();
      if (Number(xp.value) > 0) body.rewardXp = Number(xp.value);
      if (reward.value === "cash") { body.rewardCents = Math.round(Number(cash.value) * 100); body.budgetCents = Math.round(Number(budget.value) * 100); }
      if (Number(winners.value) > 0) body.maxWinners = Number(winners.value);
      const el = {}; if (Number(minAge.value) > 0) el.minAccountAgeDays = Number(minAge.value); if (Number(minLevel.value) > 0) el.minLevel = Number(minLevel.value);
      if (Object.keys(el).length) body.eligibility = el;
      if (await act(() => c ? api(`/api/admin/challenges/${c.id}`, { method: "PUT", body }) : api("/api/admin/challenges", { method: "POST", body }), { btn: save, errBox: err })) { m.close(); toast(t("common.saved")); load(); }
    });
  }
  await load();
  void admin;
  return view;
}

export async function announcements() {
  const view = h("div", {});
  async function load() {
    const r = await api("/api/admin/announcements");
    view.replaceChildren(pageHead(t("adm.nav.announcements"), t("adm.a2.sub"), [h("button", { class: "btn btn-primary", type: "button", onclick: () => form(null) }, icon("plus"), t("adm.a2.new"))]),
      r.items.length ? h("div", { class: "stack" }, r.items.map(a => h("div", { class: "card row wrap" }, h("span", { class: "icon-tile violet" }, icon("megaphone")),
        h("div", { class: "grow" }, h("div", { class: "row wrap" }, h("b", {}, a.title.en), h("span", { class: `badge ${a.status === "published" ? "ok" : ""}` }, t(`annSt.${a.status}`)), a.pinned ? h("span", { class: "badge blue" }, t("nt.pinned")) : null, a.showOnSite ? h("span", { class: "badge violet" }, t("adm.a2.onSite")) : null),
          h("p", { class: "small muted mt-1" }, a.body.en), h("div", { class: "xs faint" }, `${t(`annKind.${a.kind}`)} · ${a.publishedAt ? dateTime(a.publishedAt) : t("adm.c.draft")} · ${Object.keys(a.title).join(", ").toUpperCase()}`)),
        h("button", { class: "btn btn-sm", type: "button", onclick: () => form(a) }, t("common.edit")))))
        : h("div", { class: "table-wrap" }, h("div", { class: "empty" }, h("h3", {}, t("adm.a2.none")))));
  }
  function form(a) {
    const title = i18nFields(t("adm.c.title"), a?.title, { max: 140 });
    const body = i18nFields(t("adm.a2.body"), a?.body, { multiline: true, max: 4000 });
    const kind = h("select", { class: "select" }, ["product", "feature", "challenge", "reward", "maintenance", "security"].map(k => h("option", { value: k, selected: a?.kind === k }, t(`annKind.${k}`))));
    const status = h("select", { class: "select" }, ["draft", "published", "archived"].map(s => h("option", { value: s, selected: (a?.status ?? "draft") === s }, t(`annSt.${s}`))));
    let pinned = !!a?.pinned, site = !!a?.showOnSite;
    const err = h("p", { class: "error-text", role: "alert" });
    const save = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
    const m = modal({ title: a ? t("adm.a2.edit") : t("adm.a2.new"), wide: true, body: h("div", {}, title.box, body.box, h("div", { class: "grid-2" }, field(t("adm.a2.kind"), kind), field(t("wal.status"), status)),
      h("div", { class: "stack" }, switchEl(t("adm.a2.pin"), pinned, v => { pinned = v; }), switchEl(t("adm.a2.site"), site, v => { site = v; }, { hint: t("adm.a2.siteHint") })), err),
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), save] });
    save.addEventListener("click", async () => {
      const payload = { kind: kind.value, title: title.value(), body: body.value(), status: status.value, pinned, showOnSite: site };
      if (await act(() => a ? api(`/api/admin/announcements/${a.id}`, { method: "PUT", body: payload }) : api("/api/admin/announcements", { method: "POST", body: payload }), { btn: save, errBox: err })) { m.close(); toast(t("common.saved")); load(); }
    });
  }
  await load();
  return view;
}

export async function supportDesk({ admin, route }) {
  const id = route.query.get("id");
  if (id) return ticket(id, admin);
  const st = { status: "open", category: "", mine: false };
  const view = h("div", {});
  async function load() {
    const p = new URLSearchParams(); if (st.status) p.set("status", st.status); if (st.category) p.set("category", st.category); if (st.mine) p.set("mine", "1");
    const r = await api(`/api/admin/tickets?${p}`);
    const tabs = h("div", { class: "tabs" }, [["open", "ticketSt.open"], ["pending", "ticketSt.pending"], ["closed", "ticketSt.closed"], ["", "common.all"]].map(([s, k]) =>
      h("button", { class: "tab", type: "button", "aria-selected": String(st.status === s), onclick: () => { st.status = s; load(); } }, t(k), s ? h("span", { class: "count" }, String(r.counts[s] ?? 0)) : null)));
    view.replaceChildren(pageHead(t("adm.nav.support"), t("adm.s.sub")), tabs,
      h("div", { class: "toolbar" }, h("select", { class: "select", style: { width: "auto" }, onchange: e => { st.category = e.target.value; load(); } }, [["", t("adm.s.allCats")], ...["bug", "payment", "account", "partnership", "feature", "other"].map(c => [c, t(`sp.cat.${c}`)])].map(([v, l]) => h("option", { value: v, selected: st.category === v }, l))),
        h("label", { class: "check" }, h("input", { type: "checkbox", checked: st.mine, onchange: e => { st.mine = e.target.checked; load(); } }), t("adm.s.mine"))),
      r.items.length ? h("div", { class: "table-wrap" }, h("table", { class: "table table-cards" }, h("thead", {}, h("tr", {}, h("th", {}, t("sp.subject")), h("th", {}, t("adm.p.user")), h("th", {}, t("adm.s.priority")), h("th", {}, t("sp.updated")), h("th", {}, t("sp.status")))),
        h("tbody", {}, r.items.map(x => h("tr", {}, h("td", {}, h("a", { href: `#/support?id=${x.id}` }, h("b", { dir: "auto" }, x.subject)), h("div", { class: "cell-sub" }, t(`sp.cat.${x.category}`))),
          h("td", { "data-label": t("adm.p.user") }, x.userName, h("div", { class: "cell-sub" }, x.userEmail)), h("td", { "data-label": t("adm.s.priority") }, h("span", { class: `badge ${x.priority === "urgent" ? "bad" : x.priority === "high" ? "warn" : ""}` }, t(`prio.${x.priority}`))),
          h("td", { "data-label": t("sp.updated") }, ago(x.updatedAt)), h("td", { "data-label": t("sp.status") }, statusBadge("ticket", x.status))))))) : h("div", { class: "table-wrap" }, h("div", { class: "empty" }, h("div", { class: "icon-tile ok" }, icon("check-circle")), h("h3", {}, t("adm.s.none")))));
  }
  await load();
  return view;
}
async function ticket(id, admin) {
  const x = await api(`/api/admin/tickets/${id}`);
  const reply = h("textarea", { class: "textarea", rows: 4, maxlength: 5000 });
  let internal = false;
  const err = h("p", { class: "error-text", role: "alert" });
  const send = h("button", { class: "btn btn-primary", type: "button" }, icon("send"), t("sp.send"));
  send.addEventListener("click", async () => { if (!reply.value.trim()) return; if (await act(() => api(`/api/admin/tickets/${id}/reply`, { method: "POST", body: { body: reply.value.trim(), internal } }), { btn: send, errBox: err })) admin.render(); });
  const patch = async body => { if (await act(() => api(`/api/admin/tickets/${id}`, { method: "PATCH", body }), { ok: t("common.saved") })) admin.render(); };
  const sel = (opts, cur, key) => h("select", { class: "select select-sm", style: { width: "auto" }, onchange: e => patch({ [key]: e.target.value === "" && key === "assignedTo" ? null : e.target.value }) }, opts.map(([v, l]) => h("option", { value: v, selected: cur === v }, l)));
  const canRespond = admin.can("tickets.respond");
  return h("div", {}, backLink("#/support", t("adm.nav.support")),
    pageHead(x.subject, `${t(`sp.cat.${x.category}`)} · ${x.user ? `${x.user.name} (${x.user.email})` : ""} · ${dateTime(x.createdAt)}`, canRespond ? [
      sel([["open", t("ticketSt.open")], ["pending", t("ticketSt.pending")], ["closed", t("ticketSt.closed")]], x.status, "status"),
      sel(["low", "normal", "high", "urgent"].map(p => [p, t(`prio.${p}`)]), x.priority, "priority"),
      sel([["", t("adm.s.unassigned")], ...x.staff.map(s => [s.id, s.name])], x.assignedTo ?? "", "assignedTo")] : [statusBadge("ticket", x.status)]),
    card(null, h("div", { class: "thread" }, h("div", { class: "msg", dir: "auto" }, x.body, h("div", { class: "meta" }, dateTime(x.createdAt))),
      x.messages.map(m => h("div", { class: `msg${m.isStaff ? " mine" : ""}${m.internal ? " internal" : ""}`, dir: "auto" }, m.internal ? h("b", { class: "xs", style: { display: "block" } }, t("adm.s.internal")) : null, m.body, h("div", { class: "meta" }, dateTime(m.createdAt)))))),
    canRespond ? card(t("sp.reply"), h("div", { class: "stack" }, reply, switchEl(t("adm.s.internalNote"), false, v => { internal = v; send.lastChild.textContent = v ? t("adm.s.addNote") : t("sp.send"); }, { hint: t("adm.s.internalHint") }), err, h("div", { class: "row end" }, send)), { cls: "mt-2" }) : null,
    x.user ? h("a", { class: "btn btn-sm mt-2", href: `#/user/${x.user.id}` }, icon("user"), t("adm.c.profile")) : null);
}
