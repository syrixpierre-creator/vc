import { $, $$, t, has, setLang, detectLang, translateDom, applyTheme, safeGet, safeSet, currentLang, icon } from "/js/core.js";

/* Public pages: language (with Arabic RTL), theme, the first-visit intro, referral attribution, announcements, countdown. */
const params = new URLSearchParams(location.search);

async function boot() {
  applyTheme();
  await setLang(params.get("lang") ?? detectLang());
  localize();
  wireChrome();
  intro();
  referral();
  countdown();
  announcements();
}

function localize() {
  translateDom();
  for (const sel of $$(".lang-select")) sel.value = currentLang();
  const v = document.querySelector(".hero-visual");
  if (v) { v.style.setProperty("--lbl-synced", JSON.stringify(t("status.synced"))); v.style.setProperty("--lbl-pending", JSON.stringify(t("status.pending"))); }
  const page = document.body.dataset.page;
  if (page) document.title = `${t(page)} — SYRIX VCF`;
  // long documents (legal pages) carry one section per language: show the matching one, English otherwise
  const docs = $$("[data-doc-lang]");
  if (docs.length) {
    const found = docs.some(d => d.dataset.docLang === currentLang());
    for (const d of docs) d.hidden = d.dataset.docLang !== (found ? currentLang() : "en");
    const note = $("#langNote"); if (note) note.hidden = found;
  }
  // sign-in error page: the server redirects with ?e=<code>
  const msg = $("#signinMsg");
  if (msg) { const k = `signin.e.${params.get("e")}`; msg.textContent = t(has(k) ? k : "signin.e.generic"); }
  // sign-in links keep the chosen language (used for new accounts) and a referral code from the URL
  for (const a of $$("a.signin-link")) {
    const u = new URL(a.getAttribute("href"), location.origin);
    u.searchParams.set("lang", currentLang());
    const ref = params.get("ref");
    if (ref && /^[A-Z0-9]{8,12}$/.test(ref)) u.searchParams.set("ref", ref);
    a.setAttribute("href", u.pathname + u.search);
  }
  const theme = $("#themeBtn");
  if (theme) theme.replaceChildren(icon(document.documentElement.dataset.theme === "light" ? "moon" : "sun"));
}

function wireChrome() {
  for (const sel of $$(".lang-select")) sel.addEventListener("change", async () => { await setLang(sel.value); localize(); });
  $("#themeBtn")?.addEventListener("click", () => { applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"); localize(); });
  const burger = $("#burger"), mob = $("#mobileNav");
  burger?.addEventListener("click", () => { const open = mob.hidden; mob.hidden = !open; burger.setAttribute("aria-expanded", String(open)); });
  mob?.addEventListener("click", e => { if (e.target.closest("a")) { mob.hidden = true; burger.setAttribute("aria-expanded", "false"); } });
  const nav = $(".nav");
  const onScroll = () => nav?.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());
}

/** The intro plays on the first visit only (configurable: once per browser session instead), never with reduced motion, and can be skipped. */
async function intro() {
  const el = $("#intro");
  if (!el) return;
  const forced = params.has("intro"); // ?intro forces it (design review), ?nointro disables it
  if (!forced && (matchMedia("(prefers-reduced-motion: reduce)").matches || params.has("nointro") || navigator.webdriver)) return;
  let firstVisitOnly = true;
  try { const r = await fetch("/api/public-config"); if (r.ok) firstVisitOnly = (await r.json()).introFirstVisitOnly !== false; } catch { /* default */ }
  const key = "introSeen";
  const seen = firstVisitOnly ? safeGet(key) : sessionStorage.getItem(key);
  if (seen && !forced) return;
  try { if (firstVisitOnly) safeSet(key, "1"); else sessionStorage.setItem(key, "1"); } catch { /* storage blocked: still fine */ }
  el.hidden = false;
  el.setAttribute("aria-hidden", "false");
  const done = () => { el.classList.add("out"); setTimeout(() => el.remove(), 700); document.removeEventListener("keydown", onKey); };
  const onKey = e => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") done(); };
  $("#introSkip").addEventListener("click", done);
  el.addEventListener("click", e => { if (e.target === el) done(); });
  document.addEventListener("keydown", onKey);
  setTimeout(done, 3100);
}

function referral() {
  const ref = params.get("ref");
  if (ref && /^[A-Z0-9]{8,12}$/.test(ref)) { $("#refNote")?.removeAttribute("hidden"); $("#eyebrow")?.setAttribute("hidden", ""); }
}

function countdown() {
  const d = $("#cdD");
  if (!d) return;
  const tick = () => {
    const now = new Date();
    const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
    let s = Math.max(0, Math.floor((end - now.getTime()) / 1000));
    const days = Math.floor(s / 86400); s -= days * 86400;
    const hours = Math.floor(s / 3600); s -= hours * 3600;
    d.textContent = String(days); $("#cdH").textContent = String(hours).padStart(2, "0"); $("#cdM").textContent = String(Math.floor(s / 60)).padStart(2, "0");
  };
  tick(); setInterval(tick, 30_000);
}

async function announcements() {
  const box = $("#annc");
  if (!box) return;
  try {
    const r = await fetch(`/api/public/announcements?lang=${currentLang()}`);
    if (!r.ok) return;
    const a = (await r.json()).items?.[0];
    if (!a || safeGet(`annc:${a.id}`)) return;
    $("#anncText").textContent = `${a.title}${a.body ? ` — ${a.body}` : ""}`;
    box.hidden = false;
    $("#anncClose").addEventListener("click", () => { box.hidden = true; safeSet(`annc:${a.id}`, "1"); });
  } catch { /* no announcement */ }
}

boot();
