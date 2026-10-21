import { h, icon, t, api, act, toast, field, switchEl, confirmDialog, countryName, LANGS, setLang, applyTheme, ago, dateTime, currentLang, avatar } from "/js/core.js";
import { pageHead, card } from "/js/app/ui.js";

/* Profile, language, region, appearance, notifications, privacy, sessions, security check-up, data export, deletion. */
export default async function settings({ app }) {
  const [countries, sessions, events] = await Promise.all([api("/api/countries"), api("/api/me/sessions"), api("/api/me/security-events")]);
  const me = app.me;
  const s = me.settings;
  const tab = h("div", { class: "tabs", role: "tablist" });
  const panels = {};
  const TABS = ["profile", "notifications", "privacy", "security", "data"];
  const show = k => { for (const b of tab.children) b.setAttribute("aria-selected", String(b.dataset.k === k)); for (const [pk, el] of Object.entries(panels)) el.hidden = pk !== k; history.replaceState(null, "", `#/settings?tab=${k}`); };
  TABS.forEach(k => tab.append(h("button", { class: "tab", role: "tab", type: "button", "data-k": k, onclick: () => show(k) }, t(`set.tab.${k}`))));
  const patchMe = async (body, btn, errBox) => { const r = await act(() => api("/api/me", { method: "PATCH", body }), { btn, errBox, ok: t("common.saved") }); if (r) await app.refreshMe(); return r; };
  const patchSettings = async body => { if (await act(() => api("/api/me/settings", { method: "PATCH", body }), { ok: t("common.saved") })) await app.refreshMe(); };

  /* ---------- profile ---------- */
  const err1 = h("p", { class: "error-text", role: "alert" });
  const name = h("input", { class: "input", value: me.name, maxlength: 80 });
  const country = h("select", { class: "select" }, countries.items.map(c => ({ ...c, n: countryName(c.code) })).sort((a, b) => a.n.localeCompare(b.n, currentLang()))
    .map(c => h("option", { value: c.code, selected: c.code === me.countryCode }, `${c.n} (${c.dial})`)));
  const zones = Intl.supportedValuesOf("timeZone");
  const tz = h("select", { class: "select" }, zones.map(z => h("option", { value: z, selected: z === (me.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone) }, z.replace(/_/g, " "))));
  const lang = h("select", { class: "select" }, Object.entries(LANGS).map(([k, v]) => h("option", { value: k, selected: k === me.language }, v)));
  const saveProfile = h("button", { class: "btn btn-primary", type: "button" }, t("common.save"));
  saveProfile.addEventListener("click", async () => {
    const changedLang = lang.value !== me.language;
    if (await patchMe({ name: name.value.trim(), countryCode: country.value, timeZone: tz.value, language: lang.value }, saveProfile, err1) && changedLang) { await setLang(lang.value); app.render(); }
  });
  const theme = h("div", { class: "seg", role: "group", "aria-label": t("set.theme") }, ["dark", "light", "system"].map(v => h("button", { type: "button", "aria-pressed": String(s.theme === v), onclick: async e => {
    for (const b of e.target.parentNode.children) b.setAttribute("aria-pressed", String(b === e.target));
    applyTheme(v); await patchSettings({ theme: v });
  } }, t(`set.themes.${v}`))));
  const phone = h("input", { class: "input ltr", type: "tel", placeholder: me.phoneMasked ?? (me.dialCode ? `${me.dialCode} …` : "+33 6 12 34 56 78"), autocomplete: "tel" });
  const err2 = h("p", { class: "error-text", role: "alert" });
  const savePhone = h("button", { class: "btn", type: "button" }, t("common.save"));
  savePhone.addEventListener("click", async () => { if (await act(() => api("/api/me/phone", { method: "PUT", body: { phone: phone.value } }), { btn: savePhone, errBox: err2, ok: t("common.saved") })) { phone.value = ""; await app.refreshMe(); app.render(); } });
  panels.profile = h("div", { class: "stack-lg" },
    card(t("set.profile"), h("div", {}, h("div", { class: "row mb-2" }, avatar(me), h("div", {}, h("b", {}, me.email), h("div", { class: "xs faint" }, t("set.googleId")))),
      field(t("set.name"), name), h("div", { class: "grid-2" }, field(t("set.country"), country, { hint: t("set.countryHint", { dial: me.dialCode || "—" }) }), field(t("set.timeZone"), tz)),
      field(t("common.language"), lang), err1, h("div", { class: "row end" }, saveProfile))),
    card(t("set.appearance"), h("div", { class: "row between wrap" }, h("span", { class: "small muted" }, t("set.themeHint")), theme)),
    card(t("set.phone"), h("div", {}, h("p", { class: "small muted mb-2" }, me.phoneMasked ? t("set.phoneCurrent", { phone: me.phoneMasked }) : t("set.phoneNone")),
      h("div", { class: "input-group" }, phone, savePhone), h("p", { class: "hint mt-1" }, t("set.phoneHint")), err2)));

  /* ---------- notifications ---------- */
  panels.notifications = card(t("set.notifications"), h("div", { class: "stack-lg" },
    switchEl(t("set.n.progress"), s.notifyInappProgress, v => patchSettings({ notifyInappProgress: v }), { hint: t("set.n.progressHint") }),
    switchEl(t("set.n.rewards"), s.notifyEmailRewards, v => patchSettings({ notifyEmailRewards: v }), { hint: t("set.n.rewardsHint") }),
    switchEl(t("set.n.reminders"), s.notifyReminders, v => patchSettings({ notifyReminders: v }), { hint: t("set.n.remindersHint") }),
    switchEl(t("set.n.marketing"), s.notifyEmailMarketing, v => patchSettings({ notifyEmailMarketing: v }), { hint: t("set.n.marketingHint") }),
    h("div", { class: "callout" }, icon("info"), h("span", { class: "small" }, t("set.n.essential")))));

  /* ---------- privacy ---------- */
  const pseudo = h("input", { class: "input", value: me.pseudonym ?? "", maxlength: 24, pattern: "[A-Za-z0-9_-]{3,24}", autocomplete: "off" });
  const err3 = h("p", { class: "error-text", role: "alert" });
  const savePseudo = h("button", { class: "btn", type: "button" }, t("common.save"));
  savePseudo.addEventListener("click", () => patchMe({ pseudonym: pseudo.value.trim() || null }, savePseudo, err3));
  panels.privacy = h("div", { class: "stack-lg" },
    card(t("set.leaderboard"), h("div", { class: "stack-lg" },
      h("div", {}, field(t("set.pseudonym"), pseudo, { hint: t("set.pseudonymHint") }), h("div", { class: "row end" }, savePseudo), err3),
      switchEl(t("set.optIn"), me.leaderboardOptIn, async (v, input) => { if (!(await patchMe({ leaderboardOptIn: v }))) input.checked = !v; }, { hint: t("set.optInHint") }),
      switchEl(t("set.publicProfile"), s.profilePublic, v => patchSettings({ profilePublic: v }), { hint: t("set.publicProfileHint") }))),
    card(t("set.contactsAccess"), h("div", { class: "row between wrap" }, h("p", { class: "small muted grow" }, t("set.contactsAccessP")), h("a", { class: "btn btn-sm", href: "#/sync" }, icon("sync"), t("set.manage")))));

  /* ---------- security ---------- */
  const sessionList = h("div", { class: "list" }, sessions.items.map(x => h("div", { class: "list-item" },
    h("span", { class: "icon-tile" }, icon("device")),
    h("div", { class: "grow" }, h("div", { class: "title" }, describeAgent(x.userAgent), x.current ? h("span", { class: "badge ok", style: { marginInlineStart: "8px" } }, t("set.thisDevice")) : null),
      h("div", { class: "meta" }, `${x.network ?? "—"} · ${t("set.lastActive", { when: ago(x.lastSeenAt) })}`)),
    x.current ? null : h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: e => act(async () => { await api(`/api/me/sessions/${x.id}`, { method: "DELETE" }); e.target.closest(".list-item").remove(); }, { btn: e.currentTarget, ok: t("set.signedOut") }) }, t("set.signOut")))));
  const revokeOthers = h("button", { class: "btn btn-sm", type: "button", disabled: sessions.items.length < 2, onclick: e => act(async () => { const r = await api("/api/me/sessions/revoke-others", { method: "POST", body: {} }); toast(t("set.revoked", { n: r.revoked })); app.render(); }, { btn: e.currentTarget }) }, icon("logout"), t("set.signOutOthers"));
  const checkup = [["sessions", "set.ck.sessions", () => api("/api/me/security-checkup", { method: "POST", body: { task: "sessions" } })],
    ["connected_access", "set.ck.access", () => api("/api/me/security-checkup", { method: "POST", body: { task: "connected_access" } })],
    ["privacy", "set.ck.privacy", () => { show("privacy"); return Promise.resolve(); }], ["backup", "set.ck.backup", () => { app.go("backups"); return Promise.resolve(); }]];
  panels.security = h("div", { class: "stack-lg" },
    card(t("set.checkup"), h("div", { class: "list" }, checkup.map(([k, label, fn]) => h("div", { class: "list-item" }, h("span", { class: "icon-tile ok" }, icon("shield")), h("div", { class: "grow small" }, t(label)),
      h("button", { class: "btn btn-sm", type: "button", onclick: e => act(fn, { btn: e.currentTarget, ok: k === "sessions" || k === "connected_access" ? t("set.ck.done") : undefined }) }, t(k === "sessions" || k === "connected_access" ? "set.ck.confirm" : "common.open"))))), { sub: t("set.checkupSub") }),
    card(t("set.sessions"), sessionList, { right: revokeOthers }),
    card(t("set.events"), events.items.length ? h("div", { class: "list" }, events.items.slice(0, 15).map(e => h("div", { class: "list-item" }, h("div", { class: "grow" }, h("div", { class: "small" }, t(`secEvent.${e.kind}`)), h("div", { class: "meta" }, `${e.network ?? ""} ${dateTime(e.at)}`)))))
      : h("p", { class: "small muted" }, "—")));

  /* ---------- data & deletion ---------- */
  panels.data = h("div", { class: "stack-lg" },
    card(t("set.export"), h("div", { class: "row between wrap" }, h("p", { class: "small muted grow" }, t("set.exportP")), h("a", { class: "btn", href: "/api/me/export", download: "" }, icon("download"), t("set.exportBtn")))),
    card(t("set.delete"), h("div", { class: "stack" }, h("p", { class: "small muted" }, t("set.deleteP")),
      me.status === "pending_deletion"
        ? h("div", { class: "callout bad" }, icon("alert"), h("div", { class: "grow small" }, t("banner.deletion", { date: new Date(me.deletionAt).toLocaleDateString(currentLang()) })),
          h("button", { class: "btn btn-sm", type: "button", onclick: e => act(async () => { await api("/api/me/delete/cancel", { method: "POST", body: {} }); await app.refreshMe(); app.render(); }, { btn: e.currentTarget, ok: t("banner.deletionCancelled") }) }, t("banner.keepAccount")))
        : h("div", { class: "row" }, h("button", { class: "btn btn-danger", type: "button", onclick: deleteAccount }, icon("trash"), t("set.deleteBtn"))))), { cls: "danger-zone" }));

  async function deleteAccount() {
    const typed = h("input", { class: "input", autocomplete: "off", placeholder: "DELETE", "aria-label": t("set.typeDelete") });
    const ok = await confirmDialog({ title: t("set.deleteTitle"), text: t("set.deleteText"), confirm: t("set.deleteBtn"), danger: true, extra: field(t("set.typeDelete"), typed) });
    if (!ok) return;
    if (typed.value.trim() !== "DELETE") { toast(t("err.confirmation_required"), "bad"); return; }
    if (await act(() => api("/api/me/delete", { method: "POST", body: { confirm: "DELETE" } }))) { await app.refreshMe(); app.render(); }
  }

  const view = h("div", {}, pageHead(t("nav.settings"), t("set.sub")), tab, ...Object.values(panels));
  show(new URLSearchParams(location.hash.split("?")[1] ?? "").get("tab") ?? "profile");
  return view;
}

function describeAgent(ua) {
  if (!ua) return t("set.unknownDevice");
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "";
  return [br, os].filter(Boolean).join(" · ") || t("set.unknownDevice");
}
