import { h, icon, t, api, act, num, dateTime, ago, toast, modal, confirmDialog, field, empty } from "/js/core.js";
import { pageHead } from "/js/app/ui.js";

const size = b => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);

/* Encrypted backups: create, download, preview what a restore would add, restore (never overwrites or deletes), delete. */
export default async function backups() {
  const list = h("div", {});
  async function load() {
    const r = await api("/api/backups");
    if (!r.items.length) { list.replaceChildren(h("div", { class: "table-wrap" }, empty("archive", t("bk.none"), t("bk.noneP"), createBtn()))); return; }
    list.replaceChildren(h("div", { class: "table-wrap" }, h("table", { class: "table table-cards" },
      h("thead", {}, h("tr", {}, h("th", {}, t("bk.backup")), h("th", {}, t("bk.contacts")), h("th", {}, t("bk.size")), h("th", {}, t("bk.kind")), h("th", { class: "actions" }, h("span", { class: "sr-only" }, t("common.actions"))))),
      h("tbody", {}, r.items.map(b => h("tr", {},
        h("td", {}, h("div", { class: "row" }, h("span", { class: "icon-tile violet" }, icon("archive")), h("div", {}, h("div", { class: "cell-main" }, b.label ?? dateTime(b.createdAt)),
          h("div", { class: "cell-sub" }, `${ago(b.createdAt)}${b.restoredAt ? ` · ${t("bk.restoredAt", { when: ago(b.restoredAt) })}` : ""}${b.expiresAt ? ` · ${t("bk.expires", { when: dateTime(b.expiresAt) })}` : ""}`)))),
        h("td", { "data-label": t("bk.contacts"), class: "num" }, num(b.contactCount)),
        h("td", { "data-label": t("bk.size"), class: "num" }, size(b.sizeBytes)),
        h("td", { "data-label": t("bk.kind") }, h("span", { class: `badge ${b.kind === "manual" ? "blue" : ""}` }, t(`bk.k.${b.kind}`))),
        h("td", { class: "actions" }, h("div", { class: "row end wrap" },
          h("a", { class: "btn btn-sm", href: `/api/backups/${b.id}/download`, download: "" }, icon("download"), t("bk.download")),
          h("button", { class: "btn btn-sm", type: "button", onclick: () => restore(b) }, icon("history"), t("bk.restore")),
          h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.delete"), onclick: () => remove(b) }, icon("trash")))))))))));
  }
  function createBtn() { return h("button", { class: "btn btn-primary", type: "button", onclick: create }, icon("plus"), t("bk.create")); }
  function create() {
    const label = h("input", { class: "input", maxlength: 80, placeholder: t("bk.labelPh") });
    const err = h("p", { class: "error-text", role: "alert" });
    const go = h("button", { class: "btn btn-primary", type: "button" }, icon("archive"), t("bk.create"));
    const m = modal({ title: t("bk.create"), sub: t("bk.createSub"), body: h("div", {}, field(t("bk.label"), label), err), actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), go] });
    go.addEventListener("click", async () => { const r = await act(() => api("/api/backups", { method: "POST", body: label.value.trim() ? { label: label.value.trim() } : {} }), { btn: go, errBox: err }); if (r) { m.close(); toast(t("bk.created", { n: r.contactCount })); await load(); } });
  }
  async function restore(b) {
    const p = await act(() => api(`/api/backups/${b.id}/preview`));
    if (!p) return;
    const extra = h("div", { class: "card" },
      h("div", { class: "stat-row" }, h("span", {}, t("bk.inBackup")), h("b", { class: "num" }, num(p.inBackup))),
      h("div", { class: "stat-row" }, h("span", {}, t("bk.toRestore")), h("b", { class: "num" }, num(p.toRestore))),
      h("div", { class: "stat-row" }, h("span", {}, t("bk.present")), h("b", { class: "num" }, num(p.alreadyPresent))),
      p.sample.length ? h("p", { class: "xs muted mt-1", dir: "auto" }, p.sample.join(", ")) : null);
    if (p.toRestore === 0) { modal({ title: t("bk.restoreTitle"), body: h("div", { class: "stack" }, extra, h("div", { class: "callout ok" }, icon("check-circle"), h("span", {}, t("bk.nothing")))) }); return; }
    const ok = await confirmDialog({ title: t("bk.restoreTitle"), text: t("bk.restoreText"), confirm: t("bk.restoreBtn", { n: p.toRestore }), extra });
    if (!ok) return;
    const r = await act(() => api(`/api/backups/${b.id}/restore`, { method: "POST", body: { confirm: true } }));
    if (r) { toast(t("bk.restored", { n: r.restored })); await load(); }
  }
  async function remove(b) {
    if (!(await confirmDialog({ title: t("bk.deleteTitle"), text: t("bk.deleteText"), confirm: t("common.delete"), danger: true }))) return;
    if (await act(() => api(`/api/backups/${b.id}?confirm=true`, { method: "DELETE" }), { ok: t("bk.deleted") })) await load();
  }
  await load();
  return h("div", {}, pageHead(t("nav.backups"), t("bk.sub"), [createBtn()]),
    h("div", { class: "callout mb-2" }, icon("lock"), h("span", { class: "small" }, t("bk.info"))), list);
}
