import { h, icon, t, api, act, setLang, countryName, LANGS, currentLang, switchEl } from "/js/core.js";

/* Six steps: country, language, Google Contacts, sync preference, privacy, done. Contacts access is optional. */
export default async function onboarding({ app }) {
  const { items: countries } = await api("/api/countries");
  const guess = (navigator.language.split("-")[1] ?? "").toUpperCase();
  const state = { step: 0, country: app.me.countryCode ?? (countries.some(c => c.code === guess) ? guess : "FR"), lang: currentLang(), wantsContacts: true, autoSync: true, privacy: false };
  const root = h("div", { class: "onb" });
  const STEPS = ["country", "language", "contacts", "sync", "privacy", "done"];

  function stepBody() {
    const s = STEPS[state.step];
    if (s === "country") {
      const sorted = countries.map(c => ({ ...c, name: countryName(c.code) })).sort((a, b) => a.name.localeCompare(b.name, currentLang()));
      const sel = h("select", { class: "select", id: "onbCountry", onchange: e => { state.country = e.target.value; dial.textContent = sorted.find(c => c.code === state.country)?.dial ?? ""; } },
        sorted.map(c => h("option", { value: c.code, selected: c.code === state.country }, `${c.name} (${c.dial})`)));
      const dial = h("b", { class: "num ltr" }, sorted.find(c => c.code === state.country)?.dial ?? "");
      return [h("h2", {}, t("onb.countryH")), h("p", { class: "muted" }, t("onb.countryP")), h("div", { class: "field" }, h("label", { for: "onbCountry" }, t("onb.country")), sel),
        h("div", { class: "callout" }, icon("phone"), h("span", {}, t("onb.dialNote"), " ", dial))];
    }
    if (s === "language") {
      return [h("h2", {}, t("onb.langH")), h("p", { class: "muted" }, t("onb.langP")),
        h("div", { class: "choice-grid", role: "radiogroup", "aria-label": t("common.language") }, Object.entries(LANGS).map(([k, v]) => h("label", { class: "choice" },
          h("input", { type: "radio", name: "lang", value: k, checked: k === state.lang, onchange: async () => { state.lang = k; await setLang(k); draw(); } }), h("span", { lang: k }, v))))];
    }
    if (s === "contacts") {
      return [h("div", { class: "icon-tile blue" }, icon("cloud")), h("h2", {}, t("onb.contactsH")), h("p", { class: "muted" }, t("onb.contactsP")),
        h("ul", { class: "stack small" }, ["onb.c1", "onb.c2", "onb.c3", "onb.c4"].map(k => h("li", { class: "row" }, icon("check-circle", "i-sm"), h("span", {}, t(k))))),
        switchEl(t("onb.contactsWant"), state.wantsContacts, v => { state.wantsContacts = v; }, { hint: t("onb.contactsLater") })];
    }
    if (s === "sync") {
      return [h("div", { class: "icon-tile violet" }, icon("sync")), h("h2", {}, t("onb.syncH")), h("p", { class: "muted" }, t("onb.syncP")),
        switchEl(t("onb.autoSync"), state.autoSync, v => { state.autoSync = v; }, { hint: t("onb.autoSyncHint") })];
    }
    if (s === "privacy") {
      return [h("div", { class: "icon-tile ok" }, icon("shield")), h("h2", {}, t("onb.privacyH")),
        h("div", { class: "grid-2" }, h("div", { class: "card" }, h("h3", { class: "small" }, t("onb.storeH")), h("p", { class: "small muted mt-1" }, t("onb.storeP"))),
          h("div", { class: "card" }, h("h3", { class: "small" }, t("onb.googleH")), h("p", { class: "small muted mt-1" }, t("onb.googleP"))),
          h("div", { class: "card" }, h("h3", { class: "small" }, t("onb.neverH")), h("p", { class: "small muted mt-1" }, t("onb.neverP"))),
          h("div", { class: "card" }, h("h3", { class: "small" }, t("onb.controlH")), h("p", { class: "small muted mt-1" }, t("onb.controlP")))),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "privacyOk", checked: state.privacy, onchange: e => { state.privacy = e.target.checked; next.disabled = !state.privacy; } }),
          h("span", {}, t("onb.privacyAck"), " ", h("a", { href: "/legal/privacy", target: "_blank", rel: "noopener" }, t("legal.privacy")), "."))];
    }
    return [h("div", { class: "icon-tile ok" }, icon("check-circle")), h("h2", {}, t("onb.doneH")), h("p", { class: "muted" }, t("onb.doneP")),
      h("ul", { class: "stack small" }, [["user-plus", "onb.next1"], ["upload", "onb.next2"], ["users", "onb.next3"], ["target", "onb.next4"]].map(([ic, k]) => h("li", { class: "row" }, icon(ic, "i-sm"), h("span", {}, t(k)))))];
  }

  let next;
  function draw() {
    const s = STEPS[state.step];
    const back = h("button", { class: "btn btn-ghost", type: "button", disabled: state.step === 0 || s === "done", onclick: () => { state.step--; draw(); } }, icon("chevron-left", "flip"), t("common.back"));
    if (s === "privacy") next = h("button", { class: "btn btn-primary", type: "button", disabled: !state.privacy, onclick: e => finish(e.currentTarget) }, t("onb.finish"));
    else if (s === "done") next = state.wantsContacts
      ? h("div", { class: "row wrap end" }, h("a", { class: "btn", href: "#/overview" }, t("onb.later")),
        h("button", { class: "btn btn-primary", type: "button", onclick: e => act(async () => { const r = await api("/api/google-contacts/connect", { method: "POST", body: {} }); location.href = r.url; }, { btn: e.currentTarget }) }, icon("cloud"), t("onb.connectNow")))
      : h("a", { class: "btn btn-primary", href: "#/overview" }, t("onb.openApp"), icon("arrow-right", "flip"));
    else next = h("button", { class: "btn btn-primary", type: "button", onclick: () => { state.step++; draw(); } }, t("common.next"), icon("arrow-right", "flip"));
    root.replaceChildren(h("div", { class: "onb-card", role: "dialog", "aria-labelledby": "onbTitle" },
      h("div", { class: "onb-top" }, h("div", { class: "row" }, h("img", { src: "/assets/logo-mark.svg", width: "28", height: "28", alt: "" }), h("b", { id: "onbTitle" }, t("onb.title"))),
        h("div", { class: "onb-steps", "aria-label": t("onb.stepOf", { n: state.step + 1, total: STEPS.length }) }, STEPS.map((_, i) => h("span", { class: i <= state.step ? "on" : "" })))),
      h("div", { class: "onb-body" }, stepBody(), h("p", { class: "error-text", id: "onbErr", role: "alert" })),
      h("div", { class: "onb-foot" }, back, next)));
    root.querySelector("input, select, button.btn-primary")?.focus();
  }
  async function finish(btn) {
    await act(async () => {
      await api("/api/me/onboarding", { method: "POST", body: { countryCode: state.country, language: state.lang, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, autoSync: state.autoSync, privacyAcknowledged: true } });
      await app.refreshMe();
      state.step++;
      draw();
    }, { btn, errBox: root.querySelector("#onbErr") });
  }
  draw();
  return root;
}
