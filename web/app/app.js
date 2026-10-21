import { I18N, LANGS } from "./i18n.js";

/* No innerHTML anywhere: every piece of user data goes through textContent, so stored text cannot become markup. */
const state = { me: null, csrf: "", lang: "en", openAdd: false };
const $ = id => document.getElementById(id);

/* ---------- i18n ---------- */
const t = (key, vars = {}) => {
  const s = (I18N[state.lang] && I18N[state.lang][key]) ?? I18N.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
};
const locale = () => (state.lang === "ar" ? "ar" : state.lang);
const money = cents => new Intl.NumberFormat(locale(), { style: "currency", currency: "USD" }).format(cents / 100);
const num = n => new Intl.NumberFormat(locale()).format(n);
const dateFmt = ms => new Intl.DateTimeFormat(locale(), { dateStyle: "medium" }).format(new Date(ms));
function applyLang(l) {
  state.lang = LANGS[l] ? l : "en";
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  localStorage.setItem("lang", state.lang);
}

/* ---------- tiny DOM helper ---------- */
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else if (k === "value") el.value = v;
    else if (k === "checked") el.checked = !!v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const kid of kids.flat()) if (kid !== undefined && kid !== null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}

/* ---------- api ---------- */
class ApiError extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
async function api(path, { method = "GET", body, headers = {}, raw = false } = {}) {
  const init = { method, headers: { ...headers }, credentials: "same-origin" };
  if (method !== "GET") init.headers["x-csrf-token"] = state.csrf;
  if (body !== undefined) {
    init.headers["content-type"] = typeof body === "string" ? "text/plain" : "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const r = await fetch(path, init);
  if (r.status === 401) { location.href = "/api/auth/google/start?next=%2Fapp%2F"; throw new ApiError(401, "unauthenticated"); }
  if (raw && r.ok) return r;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, String(data.error ?? "generic"));
  return data;
}
const errText = e => { const k = `err_${e && e.code ? e.code : "generic"}`; return (I18N[state.lang] && I18N[state.lang][k]) ?? I18N.en[k] ?? t("err_generic"); };

/* ---------- toast + dialog ---------- */
function toast(msg, isErr = false) {
  const box = $("toast");
  const n = h("div", { class: isErr ? "err" : "" }, msg);
  box.replaceChildren(n);
  setTimeout(() => { if (n.parentNode === box) box.replaceChildren(); }, 3500);
}
function openDialog(...nodes) { const d = $("dlg"); d.replaceChildren(...nodes); if (!d.open) d.showModal(); return d; }
const closeDialog = () => { const d = $("dlg"); if (d.open) d.close(); };
const guard = async (fn, errBox) => { try { await fn(); } catch (e) { if (e instanceof ApiError && e.status === 401) return; const m = errText(e); if (errBox) errBox.textContent = m; else toast(m, true); } };

const syncClass = s => (s === "synced" ? "ok" : s === "failed" || s === "conflict" ? "bad" : s === "pending" || s === "paused" ? "warn" : "");
const syncPill = s => h("span", { class: `pill-s ${syncClass(s)}`, "data-sync": s }, t(`ss_${s}`));
const statusClass = s => (s === "paid" ? "ok" : s === "failed" || s === "rejected" ? "bad" : "warn");

/* ---------- views ---------- */
const views = { overview, contacts, sync, wallet, referrals, challenges, settings };

async function overview() {
  const [wal, list, ref, prog, sy] = await Promise.all([api("/api/wallet"), api("/api/contacts?limit=1"), api("/api/referrals/me"), api("/api/me/progress"), api("/api/google-contacts/status")]);
  const min = wal.minWithdrawCents;
  const pct = Math.min(100, Math.round((wal.earned / min) * 100));
  const kpi = (label, value, sub) => h("div", { class: "kpi" }, h("small", {}, label), h("div", { class: "v" }, value), sub ? h("div", { class: "s" }, sub) : null);
  return h("div", {},
    h("div", { class: "top" }, h("h1", {}, t("hello", { name: state.me.name }))),
    h("div", { class: "kpis" },
      kpi(t("contactsTotal"), num(list.total)),
      kpi(t("earned"), money(wal.earned)),
      kpi(t("qualified"), num(ref.counts.qualified)),
      kpi(t("level"), num(prog.level), `${prog.title} · VIP ${prog.vip}`)),
    h("div", { class: "grid2" },
      h("div", { class: "card" }, h("h3", {}, t("walletTitle")),
        h("div", { class: "mtext" }, h("span", {}, wal.canWithdraw ? t("canWithdrawNow") : t("toWithdraw", { amount: money(Math.max(0, min - wal.available)) })), h("span", {}, `${money(wal.available)} / ${money(min)}`)),
        h("div", { class: "prog gold" }, h("i", { style: `width:${pct}%` }))),
      h("div", { class: "card" }, h("h3", {}, t("syncPageTitle"), h("a", { href: "#/sync", style: "font-size:12px;color:var(--blue)" }, t("sync"))),
        h("div", { class: "mtext" }, h("span", { class: `pill-s ${sy.status === "connected" ? "ok" : sy.status === "not_connected" ? "" : "bad"}` }, t(`cs_${sy.status}`)),
          h("span", {}, sy.status === "connected" ? `${num(sy.counts.synced)} / ${num(sy.counts.total)}` : "")),
        h("p", { class: "muted", style: "font-size:13px;margin-top:6px" }, sy.status === "not_connected" ? t("syncExplain") : sy.lastSyncAt ? t("lastSync", { date: dateFmt(sy.lastSyncAt) }) : t("neverSynced")))),
    h("h2", { class: "sec" }, t("quick")),
    h("div", { class: "qa" },
      h("button", { onclick: () => { state.openAdd = true; go("contacts"); } }, `＋ ${t("addContact")}`),
      h("button", { onclick: () => go("contacts") }, `☰ ${t("contacts")}`),
      h("button", { onclick: () => go("referrals") }, `◎ ${t("refTitle")}`),
      h("button", { onclick: () => go("challenges") }, `★ ${t("challenges")}`)));
}

async function contacts() {
  const view = { q: "", offset: 0, limit: 25 };
  const body = h("div", {});
  const tableBox = h("div", {});
  const pager = h("div", { class: "pager" });
  const search = h("input", { type: "search", placeholder: t("search"), "aria-label": t("search"), class: "grow" });
  const verSel = h("select", { "aria-label": t("vcardVersion"), style: "width:auto" }, ["3.0", "4.0", "2.1"].map(v => h("option", { value: v }, `vCard ${v}`)));
  const fileIn = h("input", { type: "file", accept: ".vcf,text/vcard,text/x-vcard", hidden: true });

  async function load() {
    const r = await api(`/api/contacts?limit=${view.limit}&offset=${view.offset}${view.q ? `&q=${encodeURIComponent(view.q)}` : ""}`);
    if (!r.items.length) {
      tableBox.replaceChildren(h("div", { class: "tbl-wrap" }, h("div", { class: "empty" }, t("noContacts"))));
    } else {
      tableBox.replaceChildren(h("div", { class: "tbl-wrap" }, h("table", {},
        h("thead", {}, h("tr", {}, h("th", {}, t("name")), h("th", {}, t("phone")), h("th", { class: "hide-m" }, t("emails")), h("th", { class: "hide-m" }, t("organization")), h("th", { class: "act-d" }))),
        h("tbody", {}, r.items.map(c => {
          const actions = cls => h("div", { class: `row-actions ${cls}` },
            h("button", { class: "btn btn-sm", onclick: () => contactDialog(c) }, t("edit")),
            h("button", { class: "btn btn-sm btn-danger", onclick: () => deleteDialog(c) }, t("delete")));
          // on phones the actions sit under the name (always reachable); on wider screens they have their own column
          return h("tr", { "data-id": c.id },
            h("td", {}, h("div", { dir: "auto" }, c.fullName), h("div", { style: "margin-top:4px" }, syncPill(c.syncState)), actions("act-m")), h("td", { dir: "ltr", style: "text-align:start" }, c.phone ?? "—"),
            h("td", { class: "hide-m" }, c.emails.join(", ") || "—"), h("td", { class: "hide-m" }, c.organization ?? "—"),
            h("td", { class: "act-d" }, actions("")));
        }))))); 
    }
    const from = r.total ? view.offset + 1 : 0, to = Math.min(view.offset + view.limit, r.total);
    pager.replaceChildren(
      h("span", {}, `${num(from)}–${num(to)} / ${t("totalN", { n: num(r.total) })}`),
      h("button", { class: "btn btn-sm", disabled: view.offset === 0, onclick: () => { view.offset = Math.max(0, view.offset - view.limit); guard(load); } }, t("back")),
      h("button", { class: "btn btn-sm", disabled: view.offset + view.limit >= r.total, onclick: () => { view.offset += view.limit; guard(load); } }, t("next")));
  }

  function contactDialog(c) {
    const err = h("div", { class: "form-err", role: "alert" });
    const f = {
      name: h("input", { type: "text", value: c?.fullName ?? "", maxlength: 200, required: true, name: "fullName" }),
      phone: h("input", { type: "tel", value: c?.phone ?? "", dir: "ltr", name: "phone", placeholder: "+33 6 12 34 56 78" }),
      emails: h("input", { type: "text", value: (c?.emails ?? []).join(", "), name: "emails" }),
      org: h("input", { type: "text", value: c?.organization ?? "", name: "organization" }),
      notes: h("textarea", { name: "notes" }, c?.notes ?? ""),
    };
    const form = h("form", { method: "dialog" },
      h("h3", {}, c ? t("editContact") : t("addContact")),
      h("label", { class: "f" }, t("name"), f.name), h("label", { class: "f" }, t("phone"), f.phone), h("label", { class: "f" }, t("emails"), f.emails),
      h("label", { class: "f" }, t("organization"), f.org), h("label", { class: "f" }, t("notes"), f.notes), err,
      h("div", { class: "dlg-actions" }, h("button", { class: "btn", type: "button", onclick: closeDialog }, t("cancel")), h("button", { class: "btn btn-primary", type: "submit" }, t("save"))));
    form.addEventListener("submit", ev => {
      ev.preventDefault();
      guard(async () => {
        const payload = { fullName: f.name.value };
        const ph = f.phone.value.trim();
        if (ph) payload.phone = ph; // left empty on edit = unchanged
        payload.emails = f.emails.value.split(",").map(s => s.trim()).filter(Boolean);
        payload.organization = f.org.value; payload.notes = f.notes.value;
        if (c) await api(`/api/contacts/${c.id}`, { method: "PATCH", body: payload });
        else await api("/api/contacts", { method: "POST", body: payload });
        closeDialog(); toast(t("savedOk")); await load();
      }, err);
    });
    openDialog(form);
    f.name.focus();
  }

  function deleteDialog(c) {
    openDialog(h("div", {}, h("h3", {}, t("deleteTitle")), h("p", {}, t("deleteText", { name: c.fullName })),
      h("div", { class: "dlg-actions" }, h("button", { class: "btn", onclick: closeDialog }, t("cancel")),
        h("button", { class: "btn btn-danger", onclick: () => guard(async () => { await api(`/api/contacts/${c.id}?confirm=true`, { method: "DELETE" }); closeDialog(); toast(t("deletedOk")); await load(); }) }, t("delete")))));
  }

  async function importFile(file) {
    const text = await file.text();
    const p = await api("/api/contacts/import?mode=preview", { method: "POST", body: text });
    const stat = (label, v) => h("div", { class: "stat" }, h("span", {}, label), h("b", {}, num(v)));
    openDialog(h("div", {}, h("h3", {}, t("previewTitle")),
      stat(t("toImport"), p.toImport), stat(t("duplicates"), p.duplicates), stat(t("invalidRecords"), p.invalid.length),
      p.ignoredExtraPhones ? stat(t("extraPhones"), p.ignoredExtraPhones) : null,
      h("div", { class: "dlg-actions" }, h("button", { class: "btn", onclick: closeDialog }, t("cancel")),
        h("button", { class: "btn btn-primary", disabled: p.toImport === 0, onclick: () => guard(async () => {
          const done = await api("/api/contacts/import?mode=commit", { method: "POST", body: text });
          closeDialog(); toast(t("importedOk", { n: num(done.imported) })); view.offset = 0; await load();
        }) }, t("confirmImport", { n: num(p.toImport) })))));
  }

  async function exportFile() {
    const r = await api(`/api/contacts/export?version=${verSel.value}`, { raw: true });
    const url = URL.createObjectURL(await r.blob());
    const a = h("a", { href: url, download: "contacts.vcf" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  let timer;
  search.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { view.q = search.value.trim(); view.offset = 0; guard(load); }, 250); });
  fileIn.addEventListener("change", () => { const f = fileIn.files[0]; fileIn.value = ""; if (f) guard(() => importFile(f)); });

  body.append(
    h("div", { class: "top" }, h("h1", {}, t("contacts"))),
    h("div", { class: "toolbar" }, search,
      h("button", { class: "btn btn-primary", onclick: () => contactDialog(null) }, `＋ ${t("addContact")}`),
      h("button", { class: "btn", onclick: () => fileIn.click() }, t("importVcf")), fileIn,
      verSel, h("button", { class: "btn", onclick: () => guard(exportFile) }, t("exportVcf"))),
    tableBox, pager);
  await load();
  if (state.openAdd) { state.openAdd = false; contactDialog(null); }
  return body;
}

let pollTimer = null;
async function sync() {
  const hq = new URLSearchParams(location.hash.split("?")[1] ?? "");
  const e = hq.get("e");
  if (e) { // result of the Google consent screen
    history.replaceState(null, "", "#/sync");
    if (e === "ok") toast(t("connectedOk")); else toast(t(`e_${e}`), true);
  }
  const st = await api("/api/google-contacts/status");
  const c = st.counts;
  const connected = st.status === "connected";
  const connectBtn = h("button", { class: "btn btn-primary", id: "connect", onclick: () => guard(async () => { const r = await api("/api/google-contacts/connect", { method: "POST", body: {} }); location.href = r.url; }) }, st.status === "not_connected" ? t("connect") : t("reconnect"));
  const count = (label, v, cls) => h("div", { class: "kpi" }, h("small", {}, label), h("div", { class: `v ${cls ?? ""}` }, num(v)));
  const auto = h("input", { type: "checkbox", id: "autoSync", checked: st.autoSync });
  const pause = h("input", { type: "checkbox", id: "paused", checked: st.paused });
  const save = body => guard(async () => { await api("/api/google-contacts/settings", { method: "PATCH", body }); await render(); });
  auto.addEventListener("change", () => save({ autoSync: auto.checked }));
  pause.addEventListener("change", () => save({ paused: pause.checked }));
  if (c.pending > 0 && connected && !st.paused) pollTimer = setTimeout(render, 1500); // watch the queue drain

  const root = h("div", {}, h("div", { class: "top" }, h("h1", {}, t("syncPageTitle"))),
    h("div", { class: "card", style: "max-width:720px" },
      h("div", { class: "mtext" }, h("span", { class: `pill-s ${connected ? "ok" : st.status === "not_connected" ? "" : "bad"}`, id: "connStatus" }, t(`cs_${st.status}`)),
        h("span", {}, connected ? (st.lastSyncAt ? t("lastSync", { date: dateFmt(st.lastSyncAt) }) : t("neverSynced")) : "")),
      h("p", { class: "muted", style: "font-size:14px;margin:12px 0" }, t("syncExplain")),
      h("div", { class: "toolbar", style: "margin:0" },
        connected ? null : connectBtn,
        connected ? h("button", { class: "btn btn-primary", id: "syncNow", disabled: st.paused, onclick: () => guard(async () => { const r = await api("/api/google-contacts/sync-now", { method: "POST", body: {} }); toast(t("queuedOk", { n: num(r.queued) })); await render(); }) }, t("syncNow")) : null,
        connected ? h("button", { class: "btn btn-danger", id: "disconnect", onclick: () => disconnectDialog() }, t("disconnect")) : null)),
    connected ? h("div", { style: "max-width:720px" },
      h("div", { class: "kpis", style: "margin-top:16px" }, count(t("cnt_synced"), c.synced, ""), count(t("cnt_pending"), c.pending, ""), count(t("cnt_failed"), c.failed, ""), count(t("cnt_conflict"), c.conflict, "")),
      h("label", { class: "chk" }, auto, t("autoSync")), h("label", { class: "chk" }, pause, t("pauseSync")),
      c.conflict ? h("p", { class: "muted", style: "font-size:13px" }, t("conflictNote")) : null,
      c.failed ? h("p", { class: "muted", style: "font-size:13px" }, t("failedNote")) : null) : null);
  return root;
}
function disconnectDialog() {
  openDialog(h("div", {}, h("h3", {}, t("disconnectTitle")), h("p", {}, t("disconnectText")),
    h("div", { class: "dlg-actions" }, h("button", { class: "btn", onclick: closeDialog }, t("cancel")),
      h("button", { class: "btn btn-danger", id: "confirmDisconnect", onclick: () => guard(async () => { await api("/api/google-contacts/disconnect", { method: "POST", body: {} }); closeDialog(); toast(t("disconnectedOk")); await render(); }) }, t("disconnect")))));
}

async function wallet() {
  const [w, m, p] = await Promise.all([api("/api/wallet"), api("/api/payout-methods"), api("/api/payouts")]);
  const kpi = (label, v) => h("div", { class: "kpi" }, h("small", {}, label), h("div", { class: "v" }, money(v)));
  const methodSel = h("select", { "aria-label": t("methods") }, m.items.map(x => h("option", { value: x.id }, `${x.kind} · ${x.maskedHint}`)));
  const canRequest = w.canWithdraw && m.items.length > 0;
  const kindSel = h("select", { name: "kind" }, ["paypal", "binance_pay", "pix"].map(k => h("option", { value: k }, k === "paypal" ? "PayPal" : k === "pix" ? "Pix" : "Binance Pay")));
  const det = h("input", { type: "text", name: "details", autocomplete: "off", maxlength: 200, required: true });
  const rec = h("input", { type: "text", name: "recipientName", maxlength: 120 });
  const err = h("div", { class: "form-err", role: "alert" });
  const addForm = h("form", {},
    h("label", { class: "f" }, t("kind"), kindSel), h("label", { class: "f" }, t("details"), det), h("label", { class: "f" }, t("recipientName"), rec), err,
    h("button", { class: "btn", type: "submit" }, t("add")));
  addForm.addEventListener("submit", ev => { ev.preventDefault(); guard(async () => {
    const body = { kind: kindSel.value, details: det.value }; if (rec.value.trim()) body.recipientName = rec.value.trim();
    await api("/api/payout-methods", { method: "POST", body }); toast(t("savedOk")); go("wallet");
  }, err); });

  return h("div", {},
    h("div", { class: "top" }, h("h1", {}, t("walletTitle"))),
    h("div", { class: "kpis" }, kpi(t("earned"), w.earned), kpi(t("available"), w.available), kpi(t("reserved"), w.reserved), kpi(t("paid"), w.paid)),
    h("p", { class: "muted", style: "font-size:14px" }, t("minNote", { amount: money(w.minWithdrawCents) })),
    h("div", { class: "toolbar", style: "margin-top:14px" }, m.items.length > 1 ? methodSel : null,
      h("button", { class: "btn btn-primary", id: "withdraw", disabled: !canRequest, onclick: () => guard(async () => {
        await api("/api/payouts/request", { method: "POST", headers: { "idempotency-key": crypto.randomUUID() }, body: { methodId: methodSel.value || m.items[0].id } });
        toast(t("requestedOk")); go("wallet");
      }) }, t("requestWithdrawal"))),
    h("h2", { class: "sec" }, t("methods")),
    m.items.length ? h("div", { class: "tbl-wrap" }, h("table", {}, h("tbody", {}, m.items.map(x => h("tr", {}, h("td", {}, x.kind), h("td", { dir: "ltr", style: "text-align:start" }, x.maskedHint), h("td", {}, x.recipientName ?? "")))))) : h("p", { class: "muted" }, t("noMethods")),
    h("div", { class: "card", style: "margin-top:14px;max-width:520px" }, h("h3", {}, t("addMethod")), addForm, h("p", { class: "muted", style: "font-size:12px;margin-top:10px" }, t("never"))),
    h("h2", { class: "sec" }, t("history")),
    p.items.length ? h("div", { class: "tbl-wrap" }, h("table", {}, h("tbody", {}, p.items.map(x => h("tr", {},
      h("td", {}, money(x.amountCents)), h("td", {}, x.method ?? ""), h("td", { dir: "ltr", style: "text-align:start" }, x.maskedHint), h("td", {}, x.createdAt ? dateFmt(x.createdAt) : ""),
      h("td", {}, h("span", { class: `pill-s ${statusClass(x.status)}` }, t(`st_${x.status}`)))))))) : h("p", { class: "muted" }, t("noHistory")));
}

async function referrals() {
  const r = await api("/api/referrals/me");
  const input = h("input", { type: "text", readonly: true, value: r.link, dir: "ltr", "aria-label": t("yourLink") });
  const copyBtn = h("button", { class: "btn", onclick: async () => { try { await navigator.clipboard.writeText(r.link); } catch { input.select(); document.execCommand("copy"); } toast(t("copied")); } }, t("copy"));
  const stat = (label, v) => h("div", { class: "stat" }, h("span", {}, label), h("b", {}, num(v)));
  return h("div", {},
    h("div", { class: "top" }, h("h1", {}, t("refTitle"))),
    h("div", { class: "card", style: "max-width:640px" }, h("h3", {}, t("yourLink")), h("div", { class: "copy-row" }, input, copyBtn)),
    h("div", { class: "card", style: "max-width:640px;margin-top:14px" },
      stat(t("qualified"), r.counts.qualified), stat(t("pending"), r.counts.pending), stat(t("inReview"), r.counts.under_review), stat(t("disqualified"), r.counts.disqualified),
      h("div", { class: "stat" }, h("span", {}, t("earned")), h("b", {}, money(r.earnedCents)))),
    h("p", { class: "muted", style: "font-size:14px;max-width:640px;margin-top:14px" }, t("refRules")));
}

async function challenges() {
  const { items } = await api("/api/challenges");
  const boardBox = h("div", {});
  async function board(period) {
    const b = await api(`/api/leaderboard?period=${period}`);
    boardBox.replaceChildren(b.items.length
      ? h("div", { class: "tbl-wrap" }, h("table", {}, h("tbody", {}, b.items.map(x => h("tr", {}, h("td", {}, num(x.rank)), h("td", {}, x.pseudonym), h("td", {}, `${num(x.xp)} XP`), h("td", {}, `${t("level")} ${num(x.level)}`))))))
      : h("p", { class: "muted" }, t("noBoard")));
  }
  const tabs = h("div", { class: "tabs" }, [["weekly", "weekly"], ["monthly", "monthly"], ["all", "allTime"]].map(([p, k], i) =>
    h("button", { class: i === 0 ? "on" : "", onclick: ev => { tabs.querySelectorAll("button").forEach(b => b.classList.remove("on")); ev.target.classList.add("on"); guard(() => board(p)); } }, t(k))));
  const diffClass = { advanced: "b-adv", expert: "b-exp", elite: "b-eli", legendary: "b-leg" };
  const rewardText = c => (c.rewardType === "cash" ? money(c.rewardCents ?? 0) : c.rewardType.replace(/_/g, " "));

  const root = h("div", {}, h("div", { class: "top" }, h("h1", {}, t("chTitle"))),
    items.length ? items.map(c => h("div", { class: "ch-card" },
      h("div", { class: "ch-head" }, h("b", {}, c.title), h("span", { class: `badge ${diffClass[c.difficulty] ?? ""}` }, t(`d_${c.difficulty}`))),
      h("p", { style: "font-size:14px" }, c.description),
      h("div", { class: "mtext", style: "margin-top:12px" }, h("span", {}, `${t("progress")}: ${num(c.progress)} / ${num(c.threshold)}`), h("span", { class: `pill-s ${c.status === "completed" || c.status === "reward_delivered" ? "ok" : c.status === "expired" ? "bad" : ""}` }, t(`s_${c.status}`))),
      h("div", { class: "prog" }, h("i", { style: `width:${Math.min(100, Math.round((c.progress / c.threshold) * 100))}%` })),
      h("div", { class: "ch-meta" }, `${t("reward")}: ${rewardText(c)} · ${t("ends", { date: dateFmt(c.endsAt) })}`),
      h("details", { class: "terms" }, h("summary", {}, "Terms"), h("p", {}, c.terms)),
      h("div", { class: "toolbar", style: "margin:12px 0 0" },
        !c.joined && (c.status === "active" || c.status === "completed") ? h("button", { class: "btn btn-sm btn-primary", onclick: () => guard(async () => { await api(`/api/challenges/${c.id}/join`, { method: "POST", body: {} }); toast(t("joinedOk")); go("challenges"); }) }, t("join")) : null,
        c.joined && c.status === "completed" ? h("button", { class: "btn btn-sm btn-primary", onclick: () => guard(async () => { await api(`/api/challenges/${c.id}/claim`, { method: "POST", body: {} }); toast(t("claimedOk")); go("challenges"); }) }, t("claim")) : null)))
      : h("p", { class: "muted" }, t("noChallenges")),
    h("h2", { class: "sec" }, t("leaderboard")), tabs, boardBox);
  await board("weekly");
  return root;
}

async function settings() {
  const me = await api("/api/me");
  const err = h("div", { class: "form-err", role: "alert" });
  const lang = h("select", { "aria-label": t("language") }, Object.entries(LANGS).map(([k, v]) => h("option", { value: k, selected: k === state.lang }, v)));
  lang.addEventListener("change", () => guard(async () => { await api("/api/me", { method: "PATCH", body: { language: lang.value } }); applyLang(lang.value); await render(); }));
  const dial = h("input", { type: "text", value: me.dialCode, dir: "ltr", maxlength: 5, placeholder: "+33" });
  const phone = h("input", { type: "tel", dir: "ltr", placeholder: me.phoneMasked ?? "+33 6 12 34 56 78", autocomplete: "off" });
  const pseudo = h("input", { type: "text", maxlength: 24, autocomplete: "off" });
  const opt = h("input", { type: "checkbox" });
  const saveDial = h("button", { class: "btn btn-sm", onclick: () => guard(async () => { await api("/api/me", { method: "PATCH", body: { dialCode: dial.value.trim() } }); toast(t("savedOk")); }, err) }, t("save"));
  const savePhone = h("button", { class: "btn btn-sm", onclick: () => guard(async () => { await api("/api/me/phone", { method: "PUT", body: { phone: phone.value } }); phone.value = ""; toast(t("savedOk")); await render(); }, err) }, t("save"));
  const savePseudo = h("button", { class: "btn btn-sm", onclick: () => guard(async () => {
    if (pseudo.value.trim()) await api("/api/me", { method: "PATCH", body: { pseudonym: pseudo.value.trim() } });
    await api("/api/me", { method: "PATCH", body: { leaderboardOptIn: opt.checked } }); toast(t("savedOk"));
  }, err) }, t("save"));
  return h("div", { style: "max-width:560px" }, h("div", { class: "top" }, h("h1", {}, t("settings"))),
    h("label", { class: "f" }, t("language"), lang),
    h("label", { class: "f" }, t("dialCode"), h("div", { class: "copy-row" }, dial, saveDial)),
    h("label", { class: "f" }, t("accountPhone"), h("div", { class: "copy-row" }, phone, savePhone), h("small", {}, me.phoneMasked ? `${me.phoneMasked} · ${t("phoneHelp")}` : t("phoneHelp"))),
    h("label", { class: "f" }, t("pseudonym"), pseudo),
    h("label", { class: "chk" }, opt, t("optIn")), savePseudo, err,
    h("hr", { style: "border:0;border-top:1px solid var(--line);margin:24px 0" }),
    h("button", { class: "btn", onclick: () => guard(async () => { await api("/api/auth/logout", { method: "POST", body: {} }); location.href = "/"; }) }, t("logout")));
}

/* ---------- shell + router ---------- */
const NAV = [["overview", "▦"], ["contacts", "☰"], ["sync", "⇅"], ["wallet", "$"], ["referrals", "◎"], ["challenges", "★"], ["settings", "⚙"]];
const route = () => { const r = location.hash.replace(/^#\/?/, "").split("?")[0]; return views[r] ? r : "overview"; };
const go = name => { if (location.hash === `#/${name}`) render(); else location.hash = `#/${name}`; };

function renderNav() {
  const cur = route();
  $("side").replaceChildren(
    h("a", { class: "brand", href: "/" }, h("img", { src: "../assets/emblem-dark.svg", alt: "" }), h("span", {}, "SYRIX VCF", h("small", {}, "BY SYRIX VISION COMPANY"))),
    ...NAV.map(([k, icon]) => h("a", { href: `#/${k}`, class: k === cur ? "on" : "", "aria-label": t(k), "aria-current": k === cur ? "page" : null }, h("span", { "aria-hidden": "true" }, icon), h("span", { class: "lbl" }, t(k)))));
}

let renderToken = 0;
async function render() {
  const token = ++renderToken;
  clearTimeout(pollTimer);
  renderNav();
  document.title = `${t(route())} · SYRIX VCF`;
  const main = $("main");
  main.replaceChildren(h("div", { class: "skeleton" }));
  try {
    const node = await views[route()]();
    if (token === renderToken) { main.replaceChildren(node); main.focus({ preventScroll: true }); }
  } catch (e) {
    if (token === renderToken && !(e instanceof ApiError && e.status === 401)) main.replaceChildren(h("p", { class: "form-err", role: "alert" }, errText(e)));
  }
}

async function boot() {
  const me = await api("/api/me");
  state.me = me; state.csrf = me.csrfToken;
  const stored = localStorage.getItem("lang");
  const browser = (navigator.language || "en").slice(0, 2);
  applyLang(stored ?? (me.language !== "en" ? me.language : LANGS[browser] ? browser : "en"));
  window.addEventListener("hashchange", render);
  await render();
}
boot().catch(() => { /* a 401 already redirected to sign-in */ });
