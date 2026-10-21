import { h, icon, t, api, act, num, date, dateTime, ago, toast, modal, confirmDialog, menu, debounce, field, initials, empty } from "/js/core.js";
import { pageHead, statusBadge, labelChip } from "/js/app/ui.js";

const PAGE = 25;
const COLORS = ["blue", "violet", "teal", "amber", "rose", "slate"];

export default async function contacts({ app, route }) {
  const state = { q: "", label: "", sync: "", sort: "name", offset: 0, selected: new Set(), allMatching: false, total: 0, items: [] };
  let labels = (await api("/api/labels")).items;
  const tableBox = h("div", {});
  const pager = h("div", { class: "pager" });
  const bulkBox = h("div", {});
  const countSub = h("span", {});

  /* ---------- toolbar ---------- */
  const search = h("input", { class: "input", type: "search", placeholder: t("ct.search"), "aria-label": t("ct.search"), autocomplete: "off" });
  search.addEventListener("input", debounce(() => { state.q = search.value.trim(); state.offset = 0; clearSel(); load(); }, 250));
  const labelSel = h("select", { class: "select", "aria-label": t("ct.filterLabel"), style: { width: "auto" }, onchange: e => { state.label = e.target.value; state.offset = 0; clearSel(); load(); } });
  const fillLabels = () => labelSel.replaceChildren(h("option", { value: "" }, t("ct.allLabels")), labels.map(l => h("option", { value: l.id, selected: l.id === state.label }, `${l.name} (${num(l.count)})`)));
  fillLabels();
  const syncSel = h("select", { class: "select", "aria-label": t("ct.filterSync"), style: { width: "auto" }, onchange: e => { state.sync = e.target.value; state.offset = 0; clearSel(); load(); } },
    h("option", { value: "" }, t("ct.allStates")), ["synced", "pending", "failed", "conflict", "local_only"].map(s => h("option", { value: s }, t(`syncSt.${s}`))));
  const sortSel = h("select", { class: "select", "aria-label": t("ct.sort"), style: { width: "auto" }, onchange: e => { state.sort = e.target.value; state.offset = 0; load(); } },
    [["name", "ct.sortName"], ["-name", "ct.sortNameDesc"], ["-created", "ct.sortNewest"], ["created", "ct.sortOldest"], ["-updated", "ct.sortUpdated"]].map(([v, k]) => h("option", { value: v }, t(k))));
  const filterQuery = () => { const p = new URLSearchParams(); if (state.q) p.set("q", state.q); if (state.label) p.set("label", state.label); if (state.sync) p.set("sync", state.sync); return p; };

  /* ---------- data ---------- */
  async function load() {
    const p = filterQuery(); p.set("limit", String(PAGE)); p.set("offset", String(state.offset)); p.set("sort", state.sort);
    const r = await api(`/api/contacts?${p}`);
    state.items = r.items; state.total = r.total;
    countSub.textContent = t("ct.count", { n: r.total });
    drawTable(); drawPager(); drawBulk();
  }
  const labelById = id => labels.find(l => l.id === id);
  function clearSel() { state.selected.clear(); state.allMatching = false; }

  function drawTable() {
    if (!state.items.length) {
      const filtered = state.q || state.label || state.sync;
      tableBox.replaceChildren(h("div", { class: "table-wrap" }, filtered ? empty("search", t("ct.noMatch"), t("ct.noMatchP"))
        : empty("contacts", t("ct.empty"), t("ct.emptyP"), h("div", { class: "row wrap" }, h("button", { class: "btn btn-primary", type: "button", onclick: () => contactForm(null) }, icon("plus"), t("ct.add")),
          h("button", { class: "btn", type: "button", onclick: importWizard }, icon("upload"), t("ct.import"))))));
      return;
    }
    const allOnPage = state.items.every(c => state.selected.has(c.id));
    const head = h("input", { type: "checkbox", "aria-label": t("ct.selectPage"), checked: allOnPage, onchange: e => { for (const c of state.items) e.target.checked ? state.selected.add(c.id) : state.selected.delete(c.id); state.allMatching = false; drawTable(); drawBulk(); } });
    tableBox.replaceChildren(h("div", { class: "table-wrap" }, h("div", { class: "table-scroll" }, h("table", { class: "table table-cards" },
      h("thead", {}, h("tr", {}, h("th", { class: "check-col" }, head), h("th", {}, t("ct.name")), h("th", {}, t("ct.phones")), h("th", {}, t("ct.emails")), h("th", {}, t("ct.labels")), h("th", {}, t("ct.sync")), h("th", { class: "actions" }, h("span", { class: "sr-only" }, t("common.actions"))))),
      h("tbody", {}, state.items.map(c => {
        const sel = h("input", { type: "checkbox", "aria-label": t("ct.selectOne", { name: c.fullName }), checked: state.selected.has(c.id), onchange: e => { e.target.checked ? state.selected.add(c.id) : state.selected.delete(c.id); state.allMatching = false; tr.classList.toggle("selected", e.target.checked); drawBulk(); head.checked = state.items.every(x => state.selected.has(x.id)); } });
        const more = menu(h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.actions") }, icon("more")), [
          { text: t("common.edit"), icon: "edit", onClick: () => contactForm(c) },
          { text: t("ct.editLabels"), icon: "tag", onClick: () => labelPicker(c) },
          { text: t("ct.history"), icon: "history", onClick: () => historyDialog(c) },
          { text: t("ct.exportOne"), icon: "download", href: `/api/contacts/export?version=4.0&ids=${c.id}` },
          "-", { text: t("common.delete"), icon: "trash", danger: true, onClick: () => deleteOne(c) }]);
        const tr = h("tr", { class: state.selected.has(c.id) ? "selected" : "", "data-id": c.id },
          h("td", { class: "check-col" }, sel),
          h("td", {}, h("div", { class: "contact-name" }, h("span", { class: "avatar sm", "aria-hidden": "true" }, initials(c.fullName)),
            h("div", { class: "grow" }, h("button", { class: "link-btn", type: "button", onclick: () => contactForm(c) }, h("b", { dir: "auto" }, c.fullName)),
              c.organization || c.title ? h("span", { class: "cell-sub truncate", dir: "auto" }, [c.title, c.organization].filter(Boolean).join(" · ")) : null))),
          h("td", { "data-label": t("ct.phones") }, c.phones.length ? h("span", { class: "ltr num" }, c.phones[0], c.phones.length > 1 ? h("span", { class: "faint" }, ` +${c.phones.length - 1}`) : null) : h("span", { class: "faint" }, "—")),
          h("td", { "data-label": t("ct.emails") }, c.emails.length ? h("span", { class: "truncate" }, c.emails[0], c.emails.length > 1 ? h("span", { class: "faint" }, ` +${c.emails.length - 1}`) : null) : h("span", { class: "faint" }, "—")),
          h("td", { "data-label": t("ct.labels") }, h("div", { class: "chips" }, c.labelIds.map(labelById).filter(Boolean).map(labelChip))),
          h("td", { "data-label": t("ct.sync") }, statusBadge("sync", c.syncState)),
          h("td", { class: "actions" }, more));
        return tr;
      }))))));
  }
  function drawPager() {
    const from = state.total ? state.offset + 1 : 0, to = Math.min(state.offset + PAGE, state.total);
    pager.replaceChildren(h("span", {}, t("ct.range", { from: num(from), to: num(to), total: num(state.total) })),
      h("div", { class: "row" }, h("button", { class: "btn btn-sm", type: "button", disabled: state.offset === 0, onclick: () => { state.offset = Math.max(0, state.offset - PAGE); load(); } }, icon("chevron-left", "flip"), t("common.previous")),
        h("button", { class: "btn btn-sm", type: "button", disabled: state.offset + PAGE >= state.total, onclick: () => { state.offset += PAGE; load(); } }, t("common.next"), icon("chevron-right", "flip"))));
  }
  const selCount = () => (state.allMatching ? state.total : state.selected.size);
  const selPayload = () => (state.allMatching ? { filter: { ...(state.q ? { q: state.q } : {}), ...(state.label ? { labelId: state.label } : {}), ...(state.sync ? { syncState: state.sync } : {}) } } : { ids: [...state.selected] });
  function drawBulk() {
    const n = selCount();
    if (!n) return bulkBox.replaceChildren();
    const pageFull = state.items.every(c => state.selected.has(c.id)) && state.total > state.items.length && !state.allMatching;
    const labelMenu = add => menu(h("button", { class: "btn btn-sm", type: "button" }, icon("tag"), add ? t("ct.addLabel") : t("ct.removeLabel")),
      () => labels.length ? labels.map(l => ({ text: l.name, onClick: () => bulk(add ? "label" : "unlabel", { labelId: l.id }) })) : [{ label: t("ct.noLabels") }], { align: "start" });
    const exportHref = state.allMatching ? `/api/contacts/export?version=4.0&${filterQuery()}` : `/api/contacts/export?version=4.0&ids=${[...state.selected].join(",")}`;
    bulkBox.replaceChildren(h("div", { class: "bulkbar", role: "region", "aria-label": t("ct.bulk") },
      h("span", { class: "grow" }, t("ct.selected", { n })),
      pageFull ? h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: () => { state.allMatching = true; drawBulk(); } }, t("ct.selectAllMatching", { n: state.total })) : null,
      labelMenu(true), labelMenu(false),
      h("a", { class: "btn btn-sm", href: exportHref, download: "" }, icon("download"), t("ct.exportSel")),
      h("button", { class: "btn btn-danger btn-sm", type: "button", onclick: () => bulkDelete() }, icon("trash"), t("common.delete")),
      h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("ct.clearSel"), onclick: () => { clearSel(); drawTable(); drawBulk(); } }, icon("x"))));
  }
  async function bulk(action, extra = {}) {
    const r = await act(() => api("/api/contacts/bulk", { method: "POST", body: { action, ...selPayload(), ...extra } }));
    if (!r) return;
    toast(t(`ct.bulkDone.${action}`, { n: r.affected }));
    labels = (await api("/api/labels")).items; fillLabels();
    await load();
  }
  async function bulkDelete() {
    const n = selCount();
    const ok = await confirmDialog({ title: t("ct.bulkDeleteTitle", { n }), text: t("ct.bulkDeleteText"), confirm: t("ct.bulkDeleteBtn", { n }), danger: true });
    if (!ok) return;
    await bulk("delete", { confirm: true });
    clearSel(); drawBulk();
  }
  async function deleteOne(c) {
    const ok = await confirmDialog({ title: t("ct.deleteTitle"), text: t("ct.deleteText", { name: c.fullName }), confirm: t("common.delete"), danger: true });
    if (!ok) return;
    if (await act(() => api(`/api/contacts/${c.id}?confirm=true`, { method: "DELETE" }), { ok: t("ct.deleted") }) !== undefined) { state.selected.delete(c.id); await load(); }
  }

  /* ---------- contact form (several numbers and e-mails) ---------- */
  function contactForm(c) {
    const err = h("p", { class: "error-text", role: "alert" });
    const name = h("input", { class: "input", required: true, maxlength: 200, value: c?.fullName ?? "", autocomplete: "off", dir: "auto" });
    const phoneRows = h("div", { class: "phone-rows" });
    const addPhone = (v = "") => {
      const input = h("input", { class: "input ltr", type: "tel", inputmode: "tel", value: v, placeholder: app.me.dialCode ? `${app.me.dialCode} …` : "+33 6 12 34 56 78", autocomplete: "off", "aria-label": t("ct.phone") });
      const row = h("div", { class: "input-group" }, input, h("button", { class: "btn btn-ghost btn-icon", type: "button", "aria-label": t("ct.removePhone"), onclick: () => { row.remove(); if (!phoneRows.children.length) addPhone(); } }, icon("minus")));
      phoneRows.append(row);
      return input;
    };
    (c?.phones.length ? c.phones : [""]).forEach(p => addPhone(p));
    const emails = h("input", { class: "input", type: "text", inputmode: "email", value: (c?.emails ?? []).join(", "), autocomplete: "off", placeholder: "name@example.com" });
    const org = h("input", { class: "input", maxlength: 200, value: c?.organization ?? "", dir: "auto" });
    const title = h("input", { class: "input", maxlength: 200, value: c?.title ?? "", dir: "auto" });
    const notes = h("textarea", { class: "textarea", maxlength: 5000, dir: "auto" }, c?.notes ?? "");
    const chosen = new Set(c?.labelIds ?? (state.label ? [state.label] : []));
    const labelBoxes = labels.length ? h("div", { class: "chips" }, labels.map(l => h("label", { class: "check", style: { marginInlineEnd: "10px" } },
      h("input", { type: "checkbox", checked: chosen.has(l.id), onchange: e => e.target.checked ? chosen.add(l.id) : chosen.delete(l.id) }), labelChip(l)))) : h("p", { class: "small faint" }, t("ct.noLabelsYet"));
    const save = h("button", { class: "btn btn-primary", type: "submit", form: "contactForm" }, t("common.save"));
    const form = h("form", { id: "contactForm", novalidate: true },
      field(t("ct.name"), name),
      h("div", { class: "field" }, h("span", { class: "label" }, t("ct.phones")), phoneRows,
        h("button", { class: "btn btn-ghost btn-sm", type: "button", style: { justifySelf: "start" }, onclick: () => addPhone().focus() }, icon("plus"), t("ct.addPhone")),
        h("span", { class: "hint" }, t("ct.phoneHint"))),
      field(t("ct.emails"), emails, { hint: t("ct.emailsHint") }),
      h("div", { class: "grid-2" }, field(t("ct.organization"), org), field(t("ct.title"), title)),
      field(t("ct.notes"), notes),
      c ? null : h("div", { class: "field" }, h("span", { class: "label" }, t("ct.labels")), labelBoxes),
      err);
    const m = modal({ title: c ? t("ct.edit") : t("ct.add"), sub: c ? t("ct.editSub", { date: date(c.updatedAt) }) : t("ct.addSub"), body: form,
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), save] });
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!name.value.trim()) { err.textContent = t("err.invalid_fullName"); name.focus(); return; }
      const body = { fullName: name.value.trim(), phones: [...phoneRows.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean),
        emails: emails.value.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean), organization: org.value.trim(), title: title.value.trim(), notes: notes.value };
      if (!c && chosen.size) body.labelIds = [...chosen];
      const r = await act(() => c ? api(`/api/contacts/${c.id}`, { method: "PATCH", body }) : api("/api/contacts", { method: "POST", body }), { btn: save, errBox: err });
      if (!r) return;
      m.close(); toast(c ? t("ct.saved") : t("ct.created"));
      labels = (await api("/api/labels")).items; fillLabels();
      await load();
    });
    name.focus();
  }

  function labelPicker(c) {
    const chosen = new Set(c.labelIds);
    const err = h("p", { class: "error-text", role: "alert" });
    const save = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
    const m = modal({ title: t("ct.editLabels"), sub: c.fullName, body: h("div", { class: "stack" },
      labels.length ? labels.map(l => h("label", { class: "check" }, h("input", { type: "checkbox", checked: chosen.has(l.id), onchange: e => e.target.checked ? chosen.add(l.id) : chosen.delete(l.id) }), labelChip(l)))
        : h("p", { class: "muted small" }, t("ct.noLabelsYet")), err),
      actions: [h("button", { class: "btn", type: "button", onclick: () => { m.close(); manageLabels(); } }, icon("settings"), t("ct.manageLabels")), save] });
    save.addEventListener("click", async () => { if (await act(() => api(`/api/contacts/${c.id}/labels`, { method: "PUT", body: { labelIds: [...chosen] } }), { btn: save, errBox: err })) { m.close(); labels = (await api("/api/labels")).items; fillLabels(); await load(); } });
  }

  function manageLabels() {
    const list = h("div", { class: "list" });
    const err = h("p", { class: "error-text", role: "alert" });
    const draw = () => list.replaceChildren(...(labels.length ? labels.map(l => {
      const nameIn = h("input", { class: "input", value: l.name, maxlength: 60, "aria-label": t("ct.labelName") });
      const color = h("select", { class: "select", style: { width: "auto" }, "aria-label": t("ct.labelColor") }, COLORS.map(c => h("option", { value: c, selected: c === l.color }, t(`color.${c}`))));
      return h("div", { class: "list-item" }, h("span", { class: `label-chip c-${l.color}` }, num(l.count)), nameIn, color,
        h("button", { class: "btn btn-sm", type: "button", onclick: e => act(async () => { await api(`/api/labels/${l.id}`, { method: "PATCH", body: { name: nameIn.value.trim(), color: color.value } }); await refresh(); }, { btn: e.currentTarget, errBox: err, ok: t("ct.labelSaved") }) }, t("common.save")),
        h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.delete"), onclick: async () => {
          if (!(await confirmDialog({ title: t("ct.deleteLabelTitle", { name: l.name }), text: t("ct.deleteLabelText"), confirm: t("common.delete"), danger: true }))) return;
          await act(async () => { await api(`/api/labels/${l.id}`, { method: "DELETE" }); if (state.label === l.id) state.label = ""; await refresh(); });
        } }, icon("trash")));
    }) : [h("p", { class: "muted small" }, t("ct.noLabelsYet"))]));
    async function refresh() { labels = (await api("/api/labels")).items; fillLabels(); draw(); await load(); }
    const newName = h("input", { class: "input", maxlength: 60, placeholder: t("ct.newLabel"), "aria-label": t("ct.newLabel") });
    const newColor = h("select", { class: "select", style: { width: "auto" }, "aria-label": t("ct.labelColor") }, COLORS.map(c => h("option", { value: c }, t(`color.${c}`))));
    const add = h("button", { class: "btn btn-primary", type: "button" }, icon("plus"), t("common.add"));
    add.addEventListener("click", () => act(async () => { if (!newName.value.trim()) return; await api("/api/labels", { method: "POST", body: { name: newName.value.trim(), color: newColor.value } }); newName.value = ""; await refresh(); }, { btn: add, errBox: err }));
    draw();
    modal({ title: t("ct.manageLabels"), sub: t("ct.manageLabelsSub"), wide: true, body: h("div", { class: "stack" }, h("div", { class: "input-group" }, newName, newColor, add), err, list) });
  }

  async function historyDialog(c) {
    const r = await act(() => api(`/api/contacts/${c.id}/history`));
    if (!r) return;
    const ICON = { created: "plus", updated: "edit", deleted: "trash", labeled: "tag", unlabeled: "tag", merged: "merge" };
    modal({ title: t("ct.history"), sub: c.fullName, body: r.items.length ? h("div", { class: "timeline-list" }, r.items.map(x => h("div", { class: "tl-item" },
      h("span", { class: "tl-dot" }, icon(ICON[x.action] ?? "history")),
      h("div", {}, h("div", { class: "small", style: { fontWeight: "600" } }, t(`hist.${x.action}`), x.source !== "app" ? h("span", { class: "faint" }, ` · ${t(`hist.src.${x.source}`)}`) : null),
        x.fields.length ? h("div", { class: "xs muted" }, x.fields.map(f => t(`field.${f}`)).join(", ")) : null, h("div", { class: "xs faint" }, `${dateTime(x.at)} · ${ago(x.at)}`)))))
      : h("p", { class: "muted" }, t("ct.noHistory")) });
  }

  /* ---------- import wizard ---------- */
  function importWizard() {
    let text = "", fileName = "";
    const body = h("div", { class: "stack" });
    const err = h("p", { class: "error-text", role: "alert" });
    const foot = h("div", { class: "row end wrap" });
    const m = modal({ title: t("imp.title"), sub: t("imp.sub"), wide: true, body: h("div", {}, body, err) });
    m.dlg.querySelector(".modal-box").append(h("div", { class: "modal-foot" }, foot));
    const fileIn = h("input", { type: "file", accept: ".vcf,text/vcard,text/x-vcard", hidden: true, onchange: () => fileIn.files[0] && pick(fileIn.files[0]) });
    const zone = h("div", { class: "dropzone", tabindex: "0", role: "button", "aria-label": t("imp.choose"), onclick: () => fileIn.click(), onkeydown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileIn.click(); } } },
      h("span", { class: "icon-tile blue" }, icon("upload")), h("b", {}, t("imp.drop")), h("span", { class: "small" }, t("imp.formats")), fileIn);
    for (const ev of ["dragenter", "dragover"]) zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add("over"); });
    for (const ev of ["dragleave", "drop"]) zone.addEventListener(ev, () => zone.classList.remove("over"));
    zone.addEventListener("drop", e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) pick(f); });
    body.replaceChildren(zone, h("div", { class: "callout" }, icon("info"), h("span", { class: "small" }, t("imp.safe"))));
    foot.replaceChildren(h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")));

    async function pick(f) {
      err.textContent = "";
      if (f.size > 5 * 1024 * 1024) { err.textContent = t("err.payload_too_large"); return; }
      fileName = f.name; text = await f.text();
      await preview("skip");
    }
    async function preview(strategy) {
      const p = await act(() => api(`/api/contacts/import?mode=preview&strategy=${strategy}`, { method: "POST", body: text }), { errBox: err });
      if (!p) return;
      const strat = h("div", { class: "dup-options", role: "radiogroup", "aria-label": t("imp.strategy") }, ["skip", "merge"].map(s => h("label", { class: "dup-option" },
        h("input", { type: "radio", name: "strategy", value: s, checked: s === strategy }), h("div", {}, h("b", { class: "small" }, t(`imp.s.${s}`)), h("div", { class: "xs muted" }, t(`imp.s.${s}P`))))));
      const stat = (label, v, tone) => h("div", { class: "stat-row" }, h("span", {}, label), h("b", { class: `num ${tone ?? ""}` }, num(v)));
      body.replaceChildren(
        h("div", { class: "row" }, h("span", { class: "icon-tile violet" }, icon("file")), h("div", { class: "grow" }, h("b", { class: "truncate" }, fileName), h("div", { class: "xs faint" }, t("imp.cards", { n: p.total })))),
        h("div", { class: "card" }, stat(t("imp.toImport"), p.toImport), stat(t("imp.dupExisting"), p.duplicatesExisting), stat(t("imp.dupFile"), p.duplicatesInFile), stat(t("imp.invalid"), p.invalidCount),
          p.ignoredExtraPhones ? stat(t("imp.extraPhones"), p.ignoredExtraPhones) : null),
        p.sample.length ? h("details", {}, h("summary", { class: "small" }, t("imp.sample")), h("ul", { class: "small muted" }, p.sample.map(s => h("li", { dir: "auto" }, `${s.name} · ${t("imp.sampleLine", { phones: s.phones, emails: s.emails })}`)))) : null,
        p.invalid.length ? h("details", {}, h("summary", { class: "small" }, t("imp.invalidList")), h("ul", { class: "small muted" }, p.invalid.slice(0, 50).map(x => h("li", {}, t("imp.cardN", { n: x.index + 1 }), ": ", t(`imp.reason.${x.reason.replace(/\s+/g, "_")}`))))) : null,
        p.duplicatesExisting ? h("div", { class: "field" }, h("span", { class: "label" }, t("imp.strategy")), strat) : null);
      strat.addEventListener("change", e => preview(e.target.value));
      const total = p.toImport + (strategy === "merge" ? p.duplicatesExisting : 0);
      const go = h("button", { class: "btn btn-primary", type: "button", disabled: total === 0 }, icon("check"), t("imp.confirm", { n: total }));
      go.addEventListener("click", async () => {
        const r = await act(() => api(`/api/contacts/import?mode=commit&strategy=${strategy}`, { method: "POST", body: text }), { btn: go, errBox: err });
        if (!r) return;
        body.replaceChildren(h("div", { class: "empty" }, h("div", { class: "icon-tile ok" }, icon("check-circle")), h("h3", {}, t("imp.done")),
          h("p", {}, t("imp.doneP", { imported: num(r.imported), merged: num(r.merged), skipped: num(r.duplicates - r.merged) }))));
        foot.replaceChildren(h("button", { class: "btn btn-primary", type: "button", onclick: () => m.close() }, t("common.close")));
        state.offset = 0; await load();
      });
      foot.replaceChildren(h("button", { class: "btn", type: "button", onclick: () => { body.replaceChildren(zone); foot.replaceChildren(h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel"))); } }, t("imp.other")), go);
    }
  }

  /* ---------- export ---------- */
  function exportDialog() {
    const ver = h("select", { class: "select" }, ["3.0", "4.0", "2.1"].map(v => h("option", { value: v }, `vCard ${v}`)));
    const scope = h("div", { class: "dup-options" }, [["all", t("exp.all", { n: state.total })], ...(state.q || state.label || state.sync ? [["filter", t("exp.filtered")]] : []), ...(state.selected.size ? [["selected", t("exp.selected", { n: state.selected.size })]] : [])]
      .map(([v, label], i) => h("label", { class: "dup-option" }, h("input", { type: "radio", name: "scope", value: v, checked: i === 0 }), h("span", { class: "small" }, label))));
    const link = h("a", { class: "btn btn-primary", download: "" }, icon("download"), t("exp.download"));
    const update = () => {
      const s = scope.querySelector("input:checked").value;
      const p = s === "filter" ? filterQuery() : new URLSearchParams();
      p.set("version", ver.value);
      if (s === "selected") p.set("ids", [...state.selected].join(","));
      link.href = `/api/contacts/export?${p}`;
    };
    ver.addEventListener("change", update); scope.addEventListener("change", update); update();
    const m = modal({ title: t("exp.title"), sub: t("exp.sub"), body: h("div", {}, field(t("exp.version"), ver, { hint: t("exp.versionHint") }), h("div", { class: "field" }, h("span", { class: "label" }, t("exp.scope")), scope)),
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), link] });
    link.addEventListener("click", () => setTimeout(() => m.close(), 300));
  }

  const view = h("div", {},
    pageHead(t("nav.contacts"), countSub, [
      h("button", { class: "btn btn-primary", type: "button", onclick: () => contactForm(null) }, icon("plus"), t("ct.add")),
      h("button", { class: "btn", type: "button", onclick: importWizard }, icon("upload"), t("ct.import")),
      h("button", { class: "btn", type: "button", onclick: exportDialog }, icon("download"), t("ct.export")),
      menu(h("button", { class: "btn btn-icon", type: "button", "aria-label": t("common.more") }, icon("more")), [
        { text: t("ct.duplicates"), icon: "merge", onClick: () => app.go("duplicates") },
        { text: t("ct.manageLabels"), icon: "tag", onClick: manageLabels },
        { text: t("nav.backups"), icon: "archive", onClick: () => app.go("backups") }])]),
    h("div", { class: "toolbar" }, h("div", { class: "input-icon search" }, icon("search"), search), labelSel, syncSel, sortSel),
    bulkBox, tableBox, pager);
  await load();
  if (route.query.get("add") === "1") { history.replaceState(null, "", "#/contacts"); contactForm(null); }
  if (route.query.get("import") === "1") { history.replaceState(null, "", "#/contacts"); importWizard(); }
  if (route.query.get("label")) { state.label = route.query.get("label"); fillLabels(); await load(); }
  return view;
}
