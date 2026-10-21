import { h, $, icon, t, api, setCsrf, setLang, detectLang, applyTheme, avatar, menu, toast, act, ApiError, errText, LANGS, currentLang } from "/js/core.js";

/* Signed-in app: shell (sidebar, top bar, bottom tabs on phones), hash router, account banners, notification badge. */
const NAV = [
  { group: "nav.workspace", items: [["overview", "dashboard"], ["contacts", "contacts"], ["backups", "archive"], ["sync", "sync"]] },
  { group: "nav.growth", items: [["referrals", "users"], ["wallet", "wallet"], ["challenges", "target"], ["progress", "crown"]] },
  { group: "nav.community", items: [["notifications", "bell"], ["support", "lifebuoy"], ["settings", "settings"]] },
];
const TABS = [["overview", "dashboard"], ["contacts", "contacts"], ["challenges", "target"], ["wallet", "wallet"]];
const VIEWS = {
  onboarding: () => import("/js/app/onboarding.js"), overview: () => import("/js/app/overview.js"), contacts: () => import("/js/app/contacts.js"),
  duplicates: () => import("/js/app/duplicates.js"), backups: () => import("/js/app/backups.js"), sync: () => import("/js/app/sync.js"),
  referrals: () => import("/js/app/referrals.js"), wallet: () => import("/js/app/wallet.js"), challenges: () => import("/js/app/challenges.js"),
  progress: () => import("/js/app/progress.js"), notifications: () => import("/js/app/notifications.js"), support: () => import("/js/app/support.js"),
  settings: () => import("/js/app/settings.js"),
};

export const app = { me: null, unread: 0, refreshMe, go, render, setUnread };

function parseRoute() {
  const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
  const parts = (path || "overview").split("/");
  const name = VIEWS[parts[0]] ? parts[0] : "overview";
  return { name, params: parts.slice(1), query: new URLSearchParams(query ?? "") };
}
function go(route) { const target = `#/${route}`; if (location.hash === target) render(); else location.hash = target; }

async function refreshMe() {
  const me = await api("/api/me");
  app.me = me;
  setCsrf(me.csrfToken);
  app.unread = me.unreadNotifications;
  return me;
}
function setUnread(n) { app.unread = n; for (const el of document.querySelectorAll("[data-unread]")) { el.textContent = n > 99 ? "99+" : String(n); el.hidden = n === 0; } }

/* ---------------- shell ---------------- */
function navLink(key, ic, cur) {
  return h("a", { class: "nav-item", href: `#/${key}`, "aria-current": cur === key || (key === "contacts" && cur === "duplicates") ? "page" : null },
    icon(ic), h("span", {}, t(`nav.${key}`)), key === "notifications" ? h("span", { class: "count", "data-unread": "", hidden: app.unread === 0 }, String(app.unread)) : null);
}
function sidebar(cur) {
  const me = app.me;
  const side = h("aside", { class: "side", id: "side", "aria-label": t("nav.main") },
    h("a", { class: "brand", href: "/" }, h("img", { src: "/assets/logo-mark.svg", width: "30", height: "30", alt: "" }),
      h("span", { class: "brand-text" }, h("span", { class: "brand-name" }, "SYRIX ", h("b", {}, "VCF")), h("span", { class: "brand-sig" }, "BY SYRIX VISION COMPANY"))),
    NAV.map(g => h("div", { class: "nav-group" }, h("div", { class: "nav-group-label" }, t(g.group)), g.items.map(([k, ic]) => navLink(k, ic, cur)))),
    me.permissions.length ? h("div", { class: "nav-group" }, h("a", { class: "nav-item", href: "/admin/" }, icon("shield"), h("span", {}, t("nav.admin")))) : null,
    h("div", { class: "side-foot" }, userMenu("start")));
  return side;
}
function userMenu(align) {
  const me = app.me;
  const btn = h("button", { class: "user-chip", type: "button", "aria-label": t("nav.account") }, avatar(me, "sm"),
    h("span", { class: "grow" }, h("span", { class: "name truncate" }, me.name), h("span", { class: "meta truncate" }, me.email)), icon("chevron-down", "i-sm"));
  return menu(btn, () => [
    { text: t("nav.settings"), icon: "settings", onClick: () => go("settings") },
    { text: t("nav.support"), icon: "lifebuoy", onClick: () => go("support") },
    ...(me.permissions.length ? [{ text: t("nav.admin"), icon: "shield", href: "/admin/" }] : []),
    { text: t("nav.home"), icon: "external", href: "/" },
    "-",
    { text: t("nav.logout"), icon: "logout", danger: true, onClick: logout },
  ], { align });
}
async function logout() { await act(async () => { await api("/api/auth/logout", { method: "POST", body: {} }); location.href = "/"; }); }

function topbar(cur) {
  const burger = h("button", { class: "btn btn-ghost btn-icon btn-sm nav-burger-app", type: "button", "aria-label": t("nav.menu"), onclick: openDrawer }, icon("menu"));
  const lang = h("select", { class: "select select-sm", "aria-label": t("common.language"), onchange: async e => {
    const l = e.target.value;
    await act(async () => { await api("/api/me", { method: "PATCH", body: { language: l } }); await setLang(l); app.me.language = l; render(); });
  } }, Object.entries(LANGS).map(([k, v]) => h("option", { value: k, selected: k === currentLang() }, v)));
  const theme = h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.theme"), onclick: async () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next); render();
    api("/api/me/settings", { method: "PATCH", body: { theme: next } }).catch(() => undefined);
  } }, icon(document.documentElement.dataset.theme === "light" ? "moon" : "sun"));
  const bell = h("a", { class: "btn btn-ghost btn-icon btn-sm bell", href: "#/notifications", "aria-label": t("nav.notifications") }, icon("bell"),
    h("span", { class: "dot", "data-unread": "", hidden: app.unread === 0 }, String(app.unread)));
  return h("header", { class: "topbar" },
    h("div", { class: "row mobile-only-burger" }, burger),
    h("a", { class: "mobile-brand", href: "#/overview" }, h("img", { src: "/assets/logo-mark.svg", width: "26", height: "26", alt: "" }), "SYRIX VCF"),
    h("nav", { class: "crumbs", "aria-label": t("nav.breadcrumb") }, h("span", {}, "SYRIX VCF"), icon("chevron-right", "i-sm flip"), h("b", {}, t(`nav.${cur === "duplicates" ? "contacts" : cur}`))),
    h("div", { class: "tb-right" }, lang, theme, bell));
}
function tabbar(cur) {
  return h("nav", { class: "tabbar", "aria-label": t("nav.main") },
    TABS.map(([k, ic]) => h("a", { href: `#/${k}`, "aria-current": cur === k ? "page" : null }, icon(ic), h("span", {}, t(`nav.${k}`)))),
    h("button", { type: "button", onclick: openDrawer }, icon("menu"), h("span", {}, t("nav.more"))));
}
function openDrawer() {
  const side = $("#side");
  if (!side) return;
  const scrim = h("div", { class: "scrim", onclick: close });
  function close() { side.classList.remove("open"); scrim.remove(); }
  side.classList.add("open");
  document.body.append(scrim);
  side.addEventListener("click", e => { if (e.target.closest("a")) close(); }, { once: true });
}
function banners() {
  const me = app.me, out = [];
  if (me.status === "pending_deletion") out.push(h("div", { class: "banner bad", role: "alert" }, icon("alert"), h("span", { class: "grow" }, t("banner.deletion", { date: new Date(me.deletionAt).toLocaleDateString(currentLang()) })),
    h("button", { class: "btn btn-sm", type: "button", onclick: e => act(async () => { await api("/api/me/delete/cancel", { method: "POST", body: {} }); await refreshMe(); render(); }, { btn: e.currentTarget, ok: t("banner.deletionCancelled") }) }, t("banner.keepAccount"))));
  if (me.restrictions.includes("read_only")) out.push(h("div", { class: "banner warn", role: "status" }, icon("lock"), h("span", { class: "grow" }, t("banner.readOnly")), h("a", { class: "btn btn-sm", href: "#/support" }, t("nav.support"))));
  else if (me.restrictions.length) out.push(h("div", { class: "banner warn", role: "status" }, icon("info"), h("span", { class: "grow" }, t("banner.restricted", { scopes: me.restrictions.map(s => t(`restriction.${s}`)).join(", ") }))));
  return out;
}

/* ---------------- router ---------------- */
let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  const route = parseRoute();
  const root = $("#root");
  if (!app.me.onboarded && route.name !== "onboarding") return go("onboarding");
  if (route.name === "onboarding") {
    const mod = await VIEWS.onboarding();
    if (seq !== renderSeq) return;
    root.replaceChildren(await mod.default({ app, route }));
    document.title = `${t("onb.title")} · SYRIX VCF`;
    return;
  }
  const content = h("main", { class: "content", id: "content", tabindex: "-1" }, h("div", { class: "skeleton", style: { height: "120px" } }));
  root.replaceChildren(h("div", { class: "app" }, sidebar(route.name), h("div", { class: "main" }, topbar(route.name), banners(), content)), tabbar(route.name));
  document.title = `${t(`nav.${route.name === "duplicates" ? "contacts" : route.name}`)} · SYRIX VCF`;
  try {
    const mod = await VIEWS[route.name]();
    const node = await mod.default({ app, route });
    if (seq !== renderSeq) return;
    content.replaceChildren(node);
    content.focus({ preventScroll: true });
    scrollTo({ top: 0 });
  } catch (e) {
    console.error(e); // shown in the browser console for support; the page shows a friendly message
    if (seq !== renderSeq || (e instanceof ApiError && e.status === 401)) return;
    content.replaceChildren(h("div", { class: "callout bad", role: "alert" }, icon("alert"), h("div", {}, h("b", {}, t("err.pageFailed")), h("div", { class: "small muted" }, errText(e)),
      h("button", { class: "btn btn-sm mt-1", type: "button", onclick: render }, t("common.retry")))));
  }
}

async function pollUnread() {
  try { const r = await api("/api/notifications?limit=1&unread=1"); setUnread(r.unread); } catch { /* offline: keep the last value */ }
}

async function boot() {
  applyTheme();
  let me;
  try { me = await refreshMe(); } catch (e) { if (!(e instanceof ApiError && e.status === 401)) { await setLang(detectLang()); $("#root").replaceChildren(h("div", { class: "center-page" }, h("div", { class: "stack" }, h("p", {}, errText(e))))); } return; }
  applyTheme(me.settings.theme);
  await setLang(me.onboarded ? me.language : detectLang(me.language));
  addEventListener("hashchange", render);
  await render();
  setInterval(pollUnread, 60_000);
  if (new URLSearchParams(location.search).get("welcome") === "1") toast(t("app.welcome"));
}
boot();
