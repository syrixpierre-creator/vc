// Generates the static document pages (legal, support, sign-in error, 404) with the same header and footer as the home page.
// Edit the content in scripts/pages/*.mjs, then run: node scripts/pages.mjs   (output goes to web/, commit both)
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import terms from "./pages/terms.mjs";
import privacy from "./pages/privacy.mjs";
import rewardRules from "./pages/reward-rules.mjs";
import challengeRules from "./pages/challenge-rules.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const UPDATED = "2026-10-21";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ic = (name, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="/assets/icons.svg#i-${name}"/></svg>`;
const LANG_OPTIONS = `<option value="en">English</option><option value="fr">Français</option><option value="pt">Português</option><option value="es">Español</option><option value="ar">العربية</option>`;

function page({ path, titleKey, title, description, body, noindex = false }) {
  return `<!doctype html>
<html lang="en" dir="ltr" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} — SYRIX VCF</title>
<meta name="description" content="${esc(description)}">
${noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="%APP_URL%${path}">`}
<meta name="theme-color" content="#060A13">
<meta property="og:site_name" content="SYRIX VCF">
<meta property="og:title" content="${esc(title)} — SYRIX VCF">
<meta property="og:image" content="%APP_URL%/assets/og.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/core.css">
<link rel="stylesheet" href="/css/site.css">
<script type="module" src="/js/site.js"></script>
</head>
<body class="site" data-page="${titleKey}">
<a class="skip-link" href="#main" data-i18n="site.skip">Skip to content</a>
<header class="nav" id="top">
  <div class="wrap nav-in">
    <a class="brand" href="/" aria-label="SYRIX VCF — BY SYRIX VISION COMPANY">
      <img src="/assets/logo-mark.svg" width="34" height="34" alt="">
      <span class="brand-text"><span class="brand-name">SYRIX <b>VCF</b></span><span class="brand-sig">BY SYRIX VISION COMPANY</span></span>
    </a>
    <nav class="nav-links" aria-label="Main" data-i18n-attr="aria-label:site.nav.main">
      <a href="/#features" data-i18n="site.nav.features">Features</a><a href="/#rewards" data-i18n="site.nav.rewards">Rewards</a><a href="/#challenges" data-i18n="site.nav.challenges">Challenges</a>
      <a href="/#security" data-i18n="site.nav.security">Security</a><a href="/#faq" data-i18n="site.nav.faq">FAQ</a>
    </nav>
    <div class="nav-right">
      <label class="sr-only" for="langSel" data-i18n="common.language">Language</label>
      <select class="select select-sm lang-select" id="langSel">${LANG_OPTIONS}</select>
      <button class="btn btn-ghost btn-icon btn-sm" id="themeBtn" type="button" data-i18n-attr="aria-label:common.theme">${ic("sun")}</button>
      <a class="btn btn-primary btn-sm signin-link" href="/api/auth/google/start?next=%2Fapp%2F" data-i18n="site.nav.signin">Sign in</a>
      <button class="btn btn-ghost btn-icon btn-sm nav-burger" id="burger" type="button" aria-expanded="false" aria-controls="mobileNav" data-i18n-attr="aria-label:site.nav.menu">${ic("menu")}</button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobileNav" hidden>
    <a href="/#features" data-i18n="site.nav.features">Features</a><a href="/#rewards" data-i18n="site.nav.rewards">Rewards</a><a href="/#challenges" data-i18n="site.nav.challenges">Challenges</a>
    <a href="/#security" data-i18n="site.nav.security">Security</a><a href="/#faq" data-i18n="site.nav.faq">FAQ</a><a href="/support" data-i18n="site.footer.support">Support</a>
  </nav>
</header>
<main id="main" class="doc">
<div class="doc-in">
${body.trim()}
</div>
</main>
<footer class="footer">
  <div class="wrap footer-in">
    <div class="footer-brand">
      <img src="/assets/logo-full.svg" class="logo-dark" width="210" height="47" alt="SYRIX VCF — BY SYRIX VISION COMPANY">
      <img src="/assets/logo-full-light.svg" class="logo-light" width="210" height="47" alt="SYRIX VCF — BY SYRIX VISION COMPANY">
      <p class="muted small" data-i18n="site.footer.about">Contact management, Google Contacts sync and VCF backups, with referral rewards and monthly challenges.</p>
      <a class="small" href="mailto:syrixcompany@gmail.com">${ic("mail", "i i-sm inline")} syrixcompany@gmail.com</a>
    </div>
    <nav class="footer-col" aria-label="Product" data-i18n-attr="aria-label:site.footer.product"><h3 data-i18n="site.footer.product">Product</h3><a href="/#features" data-i18n="site.nav.features">Features</a><a href="/#rewards" data-i18n="site.nav.rewards">Rewards</a><a href="/#challenges" data-i18n="site.nav.challenges">Challenges</a><a href="/app/" data-i18n="site.footer.open">Open the app</a></nav>
    <nav class="footer-col" aria-label="Legal" data-i18n-attr="aria-label:site.footer.legal"><h3 data-i18n="site.footer.legal">Legal</h3><a href="/legal/terms" data-i18n="legal.terms">Terms of use</a><a href="/legal/privacy" data-i18n="legal.privacy">Privacy policy</a><a href="/legal/reward-rules" data-i18n="legal.rewards">Reward rules</a><a href="/legal/challenge-rules" data-i18n="legal.challenges">Challenge rules</a></nav>
    <nav class="footer-col" aria-label="Help" data-i18n-attr="aria-label:site.footer.help"><h3 data-i18n="site.footer.help">Help</h3><a href="/support" data-i18n="site.footer.support">Support</a><a href="/#faq" data-i18n="site.nav.faq">FAQ</a><a href="/api/openapi.json" data-i18n="site.footer.api">API reference</a></nav>
  </div>
  <div class="wrap footer-bottom">
    <span class="sig">SYRIX VCF — BY SYRIX VISION COMPANY</span>
    <span class="faint small">© <span id="year">2026</span> Syrix Vision Company</span>
    <label class="row small">${ic("globe", "i i-sm")}<span class="sr-only" data-i18n="common.language">Language</span><select class="select select-sm lang-select" id="langSel2">${LANG_OPTIONS}</select></label>
  </div>
</footer>
</body>
</html>
`;
}

/* Legal documents: one <article data-doc-lang> per language; site.js shows the reader's language, English otherwise. */
const LEGAL = [
  ["terms", "legal.terms", "Terms of use", "The terms for using SYRIX VCF.", terms],
  ["privacy", "legal.privacy", "Privacy policy", "What SYRIX VCF stores, why, for how long, and your rights.", privacy],
  ["reward-rules", "legal.rewards", "Reward rules", "How referrals qualify, the $10.00 milestone reward and how payouts work.", rewardRules],
  ["challenge-rules", "legal.challenges", "Challenge rules", "How monthly challenges work, are verified and rewarded.", challengeRules],
];
for (const [slug, key, title, description, doc] of LEGAL) {
  const toc = `<nav class="toc" aria-label="Legal" data-i18n-attr="aria-label:site.footer.legal">${LEGAL.map(([s, k, t]) => `<a href="/legal/${s}"${s === slug ? ` aria-current="page"` : ""} data-i18n="${k}">${t}</a>`).join("")}</nav>`;
  const articles = Object.entries(doc).map(([lang, html]) => `<article data-doc-lang="${lang}" lang="${lang}"${lang === "ar" ? ` dir="rtl"` : ""}${lang === "en" ? "" : " hidden"}>\n${html.trim()}\n</article>`).join("\n");
  const body = `<h1 data-i18n="${key}">${title}</h1>
<p class="updated"><span data-i18n="legal.updated">Last updated</span>: <time datetime="${UPDATED}">${UPDATED}</time></p>
${toc}
<div class="callout lang-note" id="langNote" hidden>${ic("globe")}<span data-i18n="legal.enOnly">This document is shown in English until a reviewed translation is available.</span></div>
${articles}`;
  mkdirSync(join(web, "legal"), { recursive: true });
  writeFileSync(join(web, "legal", `${slug}.html`), page({ path: `/legal/${slug}`, titleKey: key, title, description, body }));
}

/* Support: how to reach a person; tickets are opened from the app (signed in). */
writeFileSync(join(web, "support.html"), page({ path: "/support", titleKey: "sup.title", title: "Support", description: "Get help with SYRIX VCF: tickets, e-mail and answers to common questions.", body: `
<h1 data-i18n="sup.title">Support</h1>
<p class="updated" data-i18n="sup.lead">A person from the team answers every request, usually within two business days.</p>
<div class="grid-2 mt-3">
  <section class="card"><span class="icon-tile blue">${ic("lifebuoy")}</span><h2 class="h-small mt-2" data-i18n="sup.ticketH">Open a ticket</h2><p data-i18n="sup.ticketP">Signed-in users can open and follow tickets for bugs, payments, accounts, partnerships and ideas.</p>
    <a class="btn btn-primary mt-2" href="/app/#/support">${ic("message")}<span data-i18n="sup.ticketBtn">Go to my tickets</span></a></section>
  <section class="card"><span class="icon-tile violet">${ic("mail")}</span><h2 class="h-small mt-2" data-i18n="sup.mailH">Write to us</h2><p data-i18n="sup.mailP">No account, or cannot sign in? Send an e-mail and describe what happened.</p>
    <a class="btn mt-2" href="mailto:syrixcompany@gmail.com">${ic("send")}<span>syrixcompany@gmail.com</span></a></section>
</div>
<div class="callout warn mt-3">${ic("shield")}<div><b data-i18n="sup.safeH">The team will never ask for your passwords</b><p class="small mt-1" data-i18n="sup.safeP">Nobody from SYRIX VCF asks for your Google password, PINs, recovery codes, private keys or card numbers. Ignore any message that does.</p></div></div>
<h2 data-i18n="sup.topicsH">Before you write</h2>
<ul>
  <li><a href="/#faq" data-i18n="sp.faq">Frequently asked questions</a></li>
  <li><a href="/legal/reward-rules" data-i18n="legal.rewards">Reward rules</a></li>
  <li><a href="/legal/challenge-rules" data-i18n="legal.challenges">Challenge rules</a></li>
  <li><a href="/legal/privacy" data-i18n="legal.privacy">Privacy policy</a></li>
</ul>` }));

/* Sign-in errors: the server redirects here with ?e=<code>; site.js picks the message. */
writeFileSync(join(web, "signin-error.html"), page({ path: "/signin-error", titleKey: "signin.title", title: "Sign-in problem", description: "Sign-in could not be completed.", noindex: true, body: `
<div class="center-block">
<span class="icon-tile warn big">${ic("alert")}</span>
<h1 class="mt-2" data-i18n="signin.title">Sign-in problem</h1>
<p class="mt-2" id="signinMsg" data-i18n="signin.e.generic">Sign-in could not be completed. Please try again.</p>
<div class="row wrap mt-3"><a class="btn btn-google signin-link" href="/api/auth/google/start?next=%2Fapp%2F"><svg class="i" viewBox="0 0 48 48" aria-hidden="true"><use href="/assets/icons.svg#i-google"/></svg><span data-i18n="signin.retry">Try again with Google</span></a>
<a class="btn" href="/support" data-i18n="site.faq.contact">Contact support</a></div>
</div>` }));

writeFileSync(join(web, "404.html"), page({ path: "/404", titleKey: "nf.title", title: "Page not found", description: "This page does not exist.", noindex: true, body: `
<div class="center-block">
<span class="icon-tile blue big">${ic("search")}</span>
<h1 class="mt-2" data-i18n="nf.title">Page not found</h1>
<p class="mt-2" data-i18n="nf.p">The link may be old or mistyped. Nothing on your account was changed.</p>
<div class="row wrap mt-3"><a class="btn btn-primary" href="/" data-i18n="nf.home">Back to the home page</a><a class="btn" href="/app/" data-i18n="site.footer.open">Open the app</a></div>
</div>` }));

writeFileSync(join(web, "site.webmanifest"), JSON.stringify({
  name: "SYRIX VCF", short_name: "SYRIX VCF", description: "Contacts protected and in sync. By Syrix Vision Company.",
  start_url: "/app/", scope: "/", display: "standalone", background_color: "#060A13", theme_color: "#060A13",
  icons: [{ src: "/assets/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png" }, { src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml" }],
}, null, 2) + "\n");
console.log("pages written");
