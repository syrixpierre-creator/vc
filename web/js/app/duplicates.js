import { h, icon, t, api, act, toast, empty, initials } from "/js/core.js";
import { pageHead, backLink } from "/js/app/ui.js";

/* Duplicate review: suggested groups, choose which contact to keep, merge (nothing is lost) or mark as different people. */
export default async function duplicates({ app }) {
  const box = h("div", { class: "stack-lg" });
  async function load() {
    const r = await api("/api/contacts/duplicates");
    if (!r.items.length) { box.replaceChildren(h("div", { class: "table-wrap" }, empty("check-circle", t("dup.none"), t("dup.noneP"), h("a", { class: "btn", href: "#/contacts" }, t("dup.back"))))); return; }
    box.replaceChildren(h("p", { class: "muted" }, t("dup.found", { n: r.items.length })), ...r.items.map(group));
  }
  function group(g) {
    const name = `keep-${g.key.slice(0, 8)}`;
    const options = h("div", { class: "dup-options", role: "radiogroup", "aria-label": t("dup.keep") }, g.contacts.map((c, i) => h("label", { class: "dup-option" },
      h("input", { type: "radio", name, value: c.id, checked: i === 0 }),
      h("span", { class: "avatar sm", "aria-hidden": "true" }, initials(c.fullName)),
      h("div", { class: "grow" }, h("b", { dir: "auto" }, c.fullName),
        h("div", { class: "xs muted ltr" }, [...c.phones, ...c.emails].join(" · ") || "—"),
        c.organization ? h("div", { class: "xs faint", dir: "auto" }, c.organization) : null))));
    const merge = h("button", { class: "btn btn-primary btn-sm", type: "button" }, icon("merge"), t("dup.merge", { n: g.contacts.length }));
    const keep = h("button", { class: "btn btn-sm", type: "button" }, t("dup.different"));
    const card = h("section", { class: "card dup-group" },
      h("div", { class: "row between wrap" }, h("div", { class: "chips" }, g.reasons.map(r => h("span", { class: "badge blue" }, t(`dup.reason.${r}`)))), h("span", { class: "xs faint" }, t("dup.keepHint"))),
      options, h("div", { class: "row end wrap" }, keep, merge));
    merge.addEventListener("click", async () => {
      const primaryId = options.querySelector("input:checked").value;
      if (await act(() => api("/api/contacts/merge", { method: "POST", body: { primaryId, otherIds: g.contacts.map(c => c.id).filter(id => id !== primaryId) } }), { btn: merge, ok: t("dup.merged") })) await load();
    });
    keep.addEventListener("click", async () => { if (await act(() => api("/api/contacts/duplicates/dismiss", { method: "POST", body: { key: g.key } }), { btn: keep })) { toast(t("dup.dismissed")); card.remove(); } });
    return card;
  }
  await load();
  void app;
  return h("div", {}, backLink("#/contacts", t("nav.contacts")), pageHead(t("dup.title"), t("dup.sub")), box);
}
