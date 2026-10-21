import { h, $, icon, t, api, setCsrf, setLang, detectLang, applyTheme, avatar, menu, act, ApiError, errText, LANGS, currentLang } from "/js/core.js";

/* Admin console. The server checks every permission; the menu only hides what this account cannot use. */
const NAV = [
  { group: "adm.g.monitor", items: [["overview", "chart", "users.read"], ["audit", "scroll", "audit.read"]] },
  { group: "adm.g.people", items: [["users", "users", "users.read"], ["fraud", "flag", "fraud.review"], ["deletions", "trash", "deletions.manage"], ["support", "lifebuoy", "tickets.read"]] },
  { group: "adm.g.money", items: [["payouts", "wallet", "payouts.read"], ["rewards", "gift", "rewards.fulfil"]] },
  { group: "adm.g.content", items: [["challenges", "target", "challenges.manage"], ["announcements", "megaphone", "announcements.manage"], ["settings", "sliders", "settings.manage"], ["reports", "download", "reports.export"]] },
];
const VIEWS = {
  overview: () => import("/js/admin/overview.js"), users: () => import("/js/admin/users.js"), user: () => import("/js/admin/users.js").then(m => ({ default: m.userDetail })),
  fraud: () => import("/js/admin/system.js").then(m => ({ default: m.fraud })), deletions: () => import("/js/admin/system.js").then(m => ({ default: m.deletions })),
  support: () => import("/js/admin/community.js").then(m => ({ default: m.supportDesk })), payouts: () => import("/js/admin/finance.js").then(m => ({ default: m.payouts })),
  rewards: () => import("/js/admin/finance.js").then(m => ({ default: m.rewards })), challenges: () => import("/js/admin/community.js").then(m => ({ default: m.challenges })),
  announcements: () => import("/js/admin/community.js").then(m => ({ default: m.announcements })), settings: () => import("/js/admin/system.js").then(m => ({ default: m.settings })),
  audit: () => import("/js/admin/system.js").then(m => ({ default: m.audit })), reports: () => import("/js/admin/system.js").then(m => ({ default: m.reports })),
};
export const admin = { me: null, can: p => admin.me.permissions.includes(p), go, render };

function parseRoute() {
  const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
  const parts = (path || "").split("/");
  let name = VIEWS[parts[0]] ? parts[0] : "";
  if (!name) name = allowed()[0]?.[0] ?? "overview";
  return { name, params: parts.slice(1), query: new URLSearchParams(query ?? "") };
}
const allowed = () => NAV.flatMap(g => g.items).filter(([, , p]) => admin.can(p));
function go(r) { const target = `#/${r}`; if (location.hash === target) render(); else location.hash = target; }

function sidebar(cur) {
  const me = admin.me;
  const active = cur === "user" ? "users" : cur;
  const btn = h("button", { class: "user-chip", type: "button" }, avatar(me, "sm"), h("span", { class: "grow" }, h("span", { class: "name truncate" }, me.name), h("span", { class: "meta truncate" }, me.roles.map(r => t(`role.${r}`)).join(", "))), icon("chevron-down", "i-sm"));
  return h("aside", { class: "side", id: "side", "aria-label": t("nav.main") },
    h("a", { class: "brand", href: "#/overview" }, h("img", { src: "/assets/logo-mark.svg", width: "30", height: "30", alt: "" }),
      h("span", { class: "brand-text" }, h("span", { class: "brand-name" }, "SYRIX ", h("b", {}, "VCF")), h("span", { class: "brand-sig" }, "BY SYRIX VISION COMPANY")), h("span", { class: "admin-tag tag-admin" }, "ADMIN")),
    NAV.map(g => { const items = g.items.filter(([, , p]) => admin.can(p)); return items.length ? h("div", { class: "nav-group" }, h("div", { class: "nav-group-label" }, t(g.group)),
      items.map(([k, ic]) => h("a", { class: "nav-item", href: `#/${k}`, "aria-current": active === k ? "page" : null }, icon(ic), h("span", {}, t(`adm.nav.${k}`))))) : null; }),
    h("div", { class: "side-foot" }, h("a", { class: "nav-item", href: "/app/" }, icon("arrow-up-right", "flip"), h("span", {}, t("adm.backToApp"))),
      menu(btn, [{ text: t("adm.backToApp"), icon: "dashboard", href: "/app/" }, "-", { text: t("nav.logout"), icon: "logout", danger: true, onClick: () => act(async () => { await api("/api/auth/logout", { method: "POST", body: {} }); location.href = "/"; }) }], { align: "start" })));
}
function topbar(cur) {
  const lang = h("select", { class: "select select-sm", "aria-label": t("common.language"), onchange: async e => { await api("/api/me", { method: "PATCH", body: { language: e.target.value } }).catch(() => undefined); await setLang(e.target.value); render(); } },
    Object.entries(LANGS).map(([k, v]) => h("option", { value: k, selected: k === currentLang() }, v)));
  const theme = h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.theme"), onclick: () => { applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"); render(); } },
    icon(document.documentElement.dataset.theme === "light" ? "moon" : "sun"));
  const burger = h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("nav.menu"), onclick: () => {
    const side = $("#side"); const scrim = h("div", { class: "scrim", onclick: () => { side.classList.remove("open"); scrim.remove(); } });
    side.classList.add("open"); document.body.append(scrim); side.addEventListener("click", e => { if (e.target.closest("a")) { side.classList.remove("open"); scrim.remove(); } }, { once: true });
  } }, icon("menu"));
  return h("header", { class: "topbar" }, h("div", { class: "row mobile-only-burger" }, burger),
    h("a", { class: "mobile-brand", href: "#/overview" }, h("img", { src: "/assets/logo-mark.svg", width: "26", height: "26", alt: "" }), "ADMIN"),
    h("nav", { class: "crumbs", "aria-label": t("nav.breadcrumb") }, h("span", {}, t("adm.console")), icon("chevron-right", "i-sm flip"), h("b", {}, t(`adm.nav.${cur === "user" ? "users" : cur}`))),
    h("div", { class: "tb-right" }, lang, theme));
}

let seq = 0;
async function render() {
  const my = ++seq;
  const route = parseRoute();
  const content = h("main", { class: "content", id: "content", tabindex: "-1" }, h("div", { class: "skeleton", style: { height: "140px" } }));
  $("#root").replaceChildren(h("div", { class: "app" }, sidebar(route.name), h("div", { class: "main" }, topbar(route.name), content)));
  document.title = `${t(`adm.nav.${route.name === "user" ? "users" : route.name}`)} · Admin · SYRIX VCF`;
  try {
    const mod = await VIEWS[route.name]();
    const node = await mod.default({ admin, route });
    if (my !== seq) return;
    content.replaceChildren(node);
  } catch (e) {
    console.error(e); // shown in the browser console for support; the page shows a friendly message
    if (my !== seq || (e instanceof ApiError && e.status === 401)) return;
    content.replaceChildren(h("div", { class: "callout bad", role: "alert" }, icon("alert"), h("div", {}, h("b", {}, e instanceof ApiError && e.status === 403 ? t("adm.forbidden") : t("err.pageFailed")),
      h("div", { class: "small muted" }, errText(e)), h("button", { class: "btn btn-sm mt-1", type: "button", onclick: render }, t("common.retry")))));
  }
}

async function boot() {
  applyTheme();
  let me;
  try { me = await api("/api/me"); } catch (e) { if (!(e instanceof ApiError && e.status === 401)) $("#root").replaceChildren(h("p", { class: "center-page" }, errText(e))); return; }
  admin.me = me; setCsrf(me.csrfToken);
  applyTheme(me.settings.theme);
  await setLang(me.language ?? detectLang());
  if (!me.permissions.length) { $("#root").replaceChildren(h("div", { class: "center-page" }, h("div", { class: "stack" }, h("img", { src: "/assets/logo-mark.svg", width: "56", height: "56", alt: "" }), h("h1", {}, t("adm.noAccess")), h("p", { class: "muted" }, t("adm.noAccessP")), h("a", { class: "btn btn-primary", href: "/app/" }, t("adm.backToApp"))))); return; }
  addEventListener("hashchange", render);
  await render();
}
boot();
