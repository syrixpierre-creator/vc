/* SYRIX VCF front-end core. No framework, no build step, no innerHTML: every piece of data goes through
   textContent/attributes, so text stored by a user can never become markup. */

export const LANGS = { en: "English", fr: "Français", pt: "Português", es: "Español", ar: "العربية" };
const RTL = new Set(["ar"]);

/* ---------------- DOM ---------------- */
export function h(tag, props, ...kids) {
  const svg = tag === "svg" || tag === "use" || tag === "path" || tag === "circle" || tag === "rect" || tag === "g" || tag === "line" || tag === "polyline" || tag === "text";
  const el = svg ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.setAttribute("class", Array.isArray(v) ? v.filter(Boolean).join(" ") : v);
    else if (k === "style" && typeof v === "object") for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; }
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "value" && "value" in el) el.value = v;
    else if (k === "checked") el.checked = !!v;
    else if (k === "text") el.textContent = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k === undefined || k === null || k === false || k === true) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export function icon(name, cls = "") {
  const s = h("svg", { class: `i ${cls}`.trim(), "aria-hidden": "true", focusable: "false" });
  s.append(h("use", { href: `/assets/icons.svg#i-${name}` }));
  return s;
}
export const frag = (...kids) => { const f = document.createDocumentFragment(); append(f, kids); return f; };

/* ---------------- i18n ---------------- */
let dict = {}, fallback = {}, lang = "en";
export const currentLang = () => lang;
export function detectLang(serverLang) {
  const stored = safeGet("lang");
  if (stored && LANGS[stored]) return stored;
  if (serverLang && LANGS[serverLang]) return serverLang;
  for (const l of navigator.languages ?? [navigator.language]) { const two = String(l).slice(0, 2).toLowerCase(); if (LANGS[two]) return two; }
  return "en";
}
export async function setLang(l) {
  lang = LANGS[l] ? l : "en";
  if (!Object.keys(fallback).length) fallback = (await import("/js/i18n/en.js")).default;
  dict = lang === "en" ? fallback : (await import(`/js/i18n/${lang}.js`)).default;
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL.has(lang) ? "rtl" : "ltr";
  safeSet("lang", lang);
  document.cookie = `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  return lang;
}
/** t("key", {n: 3}) — plural forms with key + "|one", "|few"... through Intl.PluralRules; missing keys fall back to English. */
export function t(key, vars = {}) {
  let s;
  if (typeof vars.n === "number") {
    const form = new Intl.PluralRules(lang).select(vars.n);
    s = dict[`${key}|${form}`] ?? dict[`${key}|other`] ?? dict[key] ?? fallback[`${key}|${new Intl.PluralRules("en").select(vars.n)}`] ?? fallback[`${key}|other`];
  }
  s ??= dict[key] ?? fallback[key];
  if (s === undefined) return key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : typeof vars[k] === "number" && k === "n" ? num(vars[k]) : String(vars[k])));
}
export const has = key => key in dict || key in fallback;
/** Translation when one exists, otherwise the given text (for values that may be free text, e.g. an admin's note). */
export const tOr = (key, otherwise, vars) => (has(key) ? t(key, vars) : otherwise);
/** Translates [data-i18n] text and [data-i18n-attr="placeholder:key,aria-label:key"] attributes inside `root`. */
export function translateDom(root = document) {
  for (const el of $$("[data-i18n]", root)) el.textContent = t(el.dataset.i18n);
  for (const el of $$("[data-i18n-attr]", root)) for (const pair of el.dataset.i18nAttr.split(",")) { const [a, k] = pair.split(":"); el.setAttribute(a.trim(), t(k.trim())); }
}
const loc = () => (lang === "ar" ? "ar-u-nu-latn" : lang); // Arabic with Western digits: clearer for numbers, money and phone numbers
export const num = n => new Intl.NumberFormat(loc()).format(n);
export const money = (cents, currency = "USD") => new Intl.NumberFormat(loc(), { style: "currency", currency }).format((cents ?? 0) / 100);
export const date = ms => (ms ? new Intl.DateTimeFormat(loc(), { dateStyle: "medium" }).format(new Date(ms)) : "—");
export const dateTime = ms => (ms ? new Intl.DateTimeFormat(loc(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(ms)) : "—");
export const shortDate = ms => new Intl.DateTimeFormat(loc(), { day: "numeric", month: "short" }).format(new Date(ms));
export function ago(ms) {
  if (!ms) return "—";
  const s = (ms - Date.now()) / 1000, a = Math.abs(s);
  const rtf = new Intl.RelativeTimeFormat(loc(), { numeric: "auto" });
  if (a < 60) return rtf.format(Math.round(s), "second");
  if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (a < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  return date(ms);
}
export function countryName(code) { try { return new Intl.DisplayNames([loc()], { type: "region" }).of(code) ?? code; } catch { return code; } }

/* ---------------- storage that never throws (private mode, blocked storage) ---------------- */
export function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
export function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }

/* ---------------- theme ---------------- */
export function applyTheme(pref) {
  const p = pref ?? safeGet("theme") ?? "dark";
  const mode = p === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : p;
  document.documentElement.dataset.theme = mode;
  safeSet("theme", p);
  return mode;
}

/* ---------------- API ---------------- */
export class ApiError extends Error { constructor(status, code, data) { super(code); this.status = status; this.code = code; this.data = data; } }
let csrf = "";
export const setCsrf = v => { csrf = v; };
export let onUnauthorized = () => { location.href = `/api/auth/google/start?next=${encodeURIComponent(location.pathname + location.hash)}`; };
export const setUnauthorizedHandler = f => { onUnauthorized = f; };
export async function api(path, { method = "GET", body, headers = {}, raw = false } = {}) {
  const init = { method, headers: { ...headers }, credentials: "same-origin" };
  if (method !== "GET") init.headers["x-csrf-token"] = csrf;
  if (body !== undefined) {
    const text = typeof body === "string";
    init.headers["content-type"] = text ? "text/plain; charset=utf-8" : "application/json";
    init.body = text ? body : JSON.stringify(body);
  }
  let r;
  try { r = await fetch(path, init); } catch { throw new ApiError(0, "network"); }
  if (r.status === 401) { onUnauthorized(); throw new ApiError(401, "unauthenticated"); }
  if (raw && r.ok) return r;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, String(data.error ?? "generic"), data);
  return data;
}
export function errText(e) {
  if (!(e instanceof ApiError)) return t("err.generic");
  const code = e.code.startsWith("unknown_field:") ? "unknown_field" : e.code;
  return has(`err.${code}`) ? t(`err.${code}`) : e.status === 429 ? t("err.rate_limited") : e.status >= 500 ? t("err.server") : t("err.generic");
}

/* ---------------- feedback ---------------- */
let toastBox;
export function toast(message, kind = "ok") {
  toastBox ??= document.body.appendChild(h("div", { class: "toasts", role: "status", "aria-live": "polite" }));
  const el = h("div", { class: `toast ${kind}` }, icon(kind === "bad" ? "x-circle" : kind === "info" ? "info" : "check-circle"), h("span", {}, message));
  toastBox.append(el);
  setTimeout(() => el.remove(), kind === "bad" ? 6000 : 3500);
}
/** Runs an async action, shows a spinner on `btn`, reports errors in `errBox` or as a toast. Returns the result or undefined. */
export async function act(fn, { btn, errBox, ok } = {}) {
  const label = btn ? [...btn.childNodes] : null;
  if (btn) { btn.disabled = true; btn.replaceChildren(h("span", { class: "spinner", "aria-hidden": "true" }), ...label.filter(n => n.nodeType === 3 || n.tagName !== "svg")); }
  if (errBox) errBox.textContent = "";
  try {
    const r = await fn();
    if (ok) toast(ok);
    return r;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return undefined;
    const m = errText(e);
    if (errBox) errBox.textContent = m; else toast(m, "bad");
    return undefined;
  } finally { if (btn && btn.isConnected) { btn.disabled = false; btn.replaceChildren(...label); } }
}

/* ---------------- dialogs ---------------- */
export function modal({ title, sub, body, actions = [], wide = false, onClose } = {}) {
  const dlg = h("dialog", { class: `modal${wide ? " wide" : ""}`, "aria-labelledby": "dlg-title" });
  const close = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener("close", () => { dlg.remove(); onClose?.(); });
  dlg.addEventListener("click", e => { if (e.target === dlg) close(); });
  dlg.append(h("div", { class: "modal-box" },
    h("div", { class: "modal-head" }, h("div", {}, h("h2", { id: "dlg-title" }, title), sub ? h("p", { class: "sub" }, sub) : null),
      h("button", { class: "btn btn-ghost btn-icon btn-sm", type: "button", "aria-label": t("common.close"), onclick: close }, icon("x"))),
    h("div", { class: "modal-body" }, body),
    actions.length ? h("div", { class: "modal-foot" }, actions) : null));
  document.body.append(dlg);
  dlg.showModal();
  return { dlg, close };
}
/** Confirmation dialog. With `reason: true` a reason (min 3 chars) is required and returned. */
export function confirmDialog({ title, text, confirm = t("common.confirm"), danger = false, reason = false, reasonLabel = t("common.reason"), extra } = {}) {
  return new Promise(resolve => {
    let done = false;
    const input = reason ? h("textarea", { class: "textarea", rows: 3, maxlength: 500, required: true, id: "cf-reason" }) : null;
    const err = h("p", { class: "error-text", role: "alert" });
    const ok = h("button", { class: `btn ${danger ? "btn-danger" : "btn-primary"}`, type: "button" }, confirm);
    const m = modal({ title, sub: text, body: h("div", {}, extra ?? null, input ? h("div", { class: "field" }, h("label", { for: "cf-reason" }, reasonLabel), input, h("span", { class: "hint" }, t("common.reasonHint"))) : null, err),
      actions: [h("button", { class: "btn", type: "button", onclick: () => m.close() }, t("common.cancel")), ok], onClose: () => { if (!done) resolve(null); } });
    ok.addEventListener("click", () => {
      if (input && input.value.trim().length < 3) { err.textContent = t("err.reason_required"); input.focus(); return; }
      done = true; m.close(); resolve({ reason: input ? input.value.trim() : undefined });
    });
    (input ?? ok).focus();
  });
}

/* ---------------- menus ---------------- */
export function menu(trigger, items, { align = "end" } = {}) {
  const wrap = h("div", { class: "menu" });
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  let pop = null;
  const closeMenu = () => { pop?.remove(); pop = null; trigger.setAttribute("aria-expanded", "false"); document.removeEventListener("click", outside, true); document.removeEventListener("keydown", esc); };
  const outside = e => { if (!wrap.contains(e.target)) closeMenu(); };
  const esc = e => { if (e.key === "Escape") { closeMenu(); trigger.focus(); } };
  trigger.addEventListener("click", e => {
    e.stopPropagation();
    if (pop) return closeMenu();
    pop = h("div", { class: `menu-pop${align === "start" ? " start" : ""}`, role: "menu" },
      (typeof items === "function" ? items() : items).map(it => it === "-" ? h("div", { class: "menu-sep" }) : it.label && !it.onClick && !it.href ? h("div", { class: "menu-label" }, it.label)
        : h(it.href ? "a" : "button", { class: `menu-item${it.danger ? " danger" : ""}`, role: "menuitem", ...(it.href ? { href: it.href, ...(it.download ? { download: "" } : {}) } : { type: "button" }),
          onclick: () => { closeMenu(); it.onClick?.(); } }, it.icon ? icon(it.icon) : null, it.text)));
    wrap.append(pop);
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", outside, true);
    document.addEventListener("keydown", esc);
    pop.querySelector(".menu-item")?.focus();
  });
  wrap.append(trigger);
  return wrap;
}

/* ---------------- small helpers ---------------- */
export const debounce = (fn, ms = 250) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { const ta = h("textarea", { style: { position: "fixed", opacity: "0" } }, text); document.body.append(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; }
}
export const initials = name => (name ?? "?").trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase() || "?";
export function avatar(user, cls = "") {
  const el = h("span", { class: `avatar ${cls}`.trim(), "aria-hidden": "true" });
  if (user?.avatarUrl) { const img = h("img", { src: user.avatarUrl, alt: "", referrerpolicy: "no-referrer" }); img.onerror = () => el.replaceChildren(initials(user.name)); el.append(img); }
  else el.append(initials(user?.name));
  return el;
}
export function field(label, control, { hint, id } = {}) {
  const cid = id ?? control.id ?? `f-${Math.random().toString(36).slice(2, 8)}`;
  control.id = cid;
  return h("div", { class: "field" }, h("label", { for: cid }, label), control, hint ? h("span", { class: "hint" }, hint) : null);
}
export function switchEl(label, checked, onchange, { id, hint } = {}) {
  const input = h("input", { type: "checkbox", role: "switch", checked, id, onchange: e => onchange(e.target.checked, e.target) });
  return h("label", { class: "switch" }, input, h("span", { class: "track", "aria-hidden": "true" }), h("span", { class: "grow" }, h("span", { style: { display: "block", fontWeight: "550" } }, label), hint ? h("span", { class: "hint" }, hint) : null));
}
export function progressBar(value, max, cls = "") {
  const p = max > 0 ? Math.min(100, Math.round((value / max) * 1000) / 10) : 0;
  return h("div", { class: `progress ${cls}`.trim(), role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(max), "aria-valuenow": String(value) }, h("span", { style: { "--p": `${p}%` } }));
}
export function ring(value, max, label, size = 72, color = "url(#ringGrad)") {
  const r = size / 2 - 6, c = 2 * Math.PI * r, p = max > 0 ? Math.min(1, value / max) : 0;
  const s = h("svg", { viewBox: `0 0 ${size} ${size}`, width: String(size), height: String(size), "aria-hidden": "true" });
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const lg = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  lg.setAttribute("id", "ringGrad"); lg.setAttribute("x1", "0"); lg.setAttribute("x2", "1");
  for (const [o, col] of [["0", "#4F7BFF"], ["1", "#9B7BF7"]]) { const st = document.createElementNS("http://www.w3.org/2000/svg", "stop"); st.setAttribute("offset", o); st.setAttribute("stop-color", col); lg.append(st); }
  defs.append(lg); s.append(defs);
  s.append(h("circle", { cx: String(size / 2), cy: String(size / 2), r: String(r), fill: "none", stroke: "var(--surface-3)", "stroke-width": "6" }));
  s.append(h("circle", { cx: String(size / 2), cy: String(size / 2), r: String(r), fill: "none", stroke: color, "stroke-width": "6", "stroke-linecap": "round", "stroke-dasharray": `${c * p} ${c}` }));
  return h("div", { class: "ring", style: { width: `${size}px`, height: `${size}px` }, role: "img", "aria-label": label }, s, h("span", { class: "ring-label" }, label));
}
export function empty(iconName, title, text, action) {
  return h("div", { class: "empty" }, h("div", { class: "icon-tile blue" }, icon(iconName)), h("h3", {}, title), text ? h("p", {}, text) : null, action ?? null);
}
export const skeleton = (height = 120) => h("div", { class: "skeleton", style: { height: `${height}px` }, "aria-hidden": "true" });
export function logoMark(cls = "") { return h("img", { class: cls, src: "/assets/logo-mark.svg", alt: "", width: "32", height: "32" }); }
