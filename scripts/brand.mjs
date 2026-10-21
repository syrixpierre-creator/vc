// Generates the SYRIX VCF brand assets (vector mark, full lockup with outlined text, favicon, social image, PNG icons).
//   node scripts/brand.mjs            (run from the repository root; needs server/node_modules: opentype.js, playwright)
// Outputs into web/assets/. The wordmark is converted to paths so it looks the same everywhere (no font needed).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "server", "package.json"));
const opentype = require("opentype.js");
const OUT = join(ROOT, "web", "assets");
mkdirSync(OUT, { recursive: true });
const font = name => opentype.parse(readFileSync(join(ROOT, "brand", name)).buffer.slice(0));
const bold = font("inter-latin-800-normal.woff");
const semi = font("inter-latin-600-normal.woff");

/** Text -> one SVG path, with tracking (letter spacing in font units of the size). Returns path data and advance width. */
function textPath(f, text, x, y, size, tracking = 0) {
  let cx = x; const parts = [];
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    parts.push(g.getPath(cx, y, size).toPathData(2));
    cx += (g.advanceWidth / f.unitsPerEm) * size + tracking;
  }
  return { d: parts.join(""), width: cx - x - tracking };
}

/* ---------- the mark (64 x 64) ---------- */
// ring with a gap where the sync needle crosses; two small contact networks on either side of the needle
const defs = (id, light = false) => `
  <linearGradient id="${id}r" x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">${light ? '<stop stop-color="#2F55E6"/><stop offset=".55" stop-color="#4F6BF5"/><stop offset="1" stop-color="#7C4DEB"/>' : '<stop stop-color="#F1F5FF"/><stop offset=".5" stop-color="#8EAEFF"/><stop offset="1" stop-color="#9C7BF7"/>'}</linearGradient>
  <linearGradient id="${id}n" x1="8" y1="58" x2="58" y2="6" gradientUnits="userSpaceOnUse">${light ? '<stop stop-color="#1E3FC9"/><stop offset=".6" stop-color="#3D63E0"/><stop offset="1" stop-color="#6E8DFF"/>' : '<stop stop-color="#5B7CFF"/><stop offset=".55" stop-color="#B9CBFF"/><stop offset="1" stop-color="#FFFFFF"/>'}</linearGradient>
  <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>
    <polygon points="7,59 34.5,34.5 58,6 29.5,29.5" fill="#000" stroke="#000" stroke-width="5.5" stroke-linejoin="round"/></mask>`;
const markBody = (id, light = false) => `
  <circle cx="32" cy="32" r="24" fill="none" stroke="url(#${id}r)" stroke-width="4.6" mask="url(#${id}m)"/>
  <polygon points="7,59 34.5,34.5 58,6 29.5,29.5" fill="url(#${id}n)"/>
  <g stroke="${light ? "#5C74D6" : "#CFDCFF"}" stroke-width="1.7" stroke-linecap="round" opacity=".92"><path d="M20.5 21 26.5 15.5M20.5 21 17.5 29.5"/><path d="M43.5 43 48.5 36.5M43.5 43 36.5 48.5"/></g>
  <g fill="${light ? "#2F4BC4" : "#E6EDFF"}"><circle cx="20.5" cy="21" r="3.1"/><circle cx="26.5" cy="15.5" r="2.3"/><circle cx="17.5" cy="29.5" r="2.1"/><circle cx="43.5" cy="43" r="3.1"/><circle cx="48.5" cy="36.5" r="2.3"/><circle cx="36.5" cy="48.5" r="2.1"/></g>`;
const mark = (id = "sx") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="SYRIX VCF"><defs>${defs(id)}</defs>${markBody(id)}</svg>\n`;

/* ---------- full lockup: mark + SYRIX VCF + signature ---------- */
function lockup({ dark = true, tagline = true } = {}) {
  const ink = dark ? "#EEF3FF" : "#0B1220";
  const sub = dark ? "#8E9CB8" : "#4A5873";
  const s = textPath(bold, "SYRIX", 84, 47, 40, 1.5);
  const v = textPath(semi, "VCF", 84 + s.width + 12, 47, 40, 1.5);
  const t = textPath(semi, "BY SYRIX VISION COMPANY", 86, 70, 11.5, 2.6);
  const w = Math.ceil(Math.max(84 + s.width + 12 + v.width, 86 + t.width) + 6);
  const h = tagline ? 80 : 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="SYRIX VCF — BY SYRIX VISION COMPANY">
<defs>${defs("lk", !dark)}<linearGradient id="lkv" x1="0" y1="0" x2="1" y2="0">${dark ? '<stop stop-color="#7FA2FF"/><stop offset="1" stop-color="#A78BFA"/>' : '<stop stop-color="#2F55E6"/><stop offset="1" stop-color="#7C4DEB"/>'}</linearGradient></defs>
<g transform="translate(0 ${tagline ? 8 : 0})">${markBody("lk", !dark)}</g>
<path d="${s.d}" fill="${ink}"/><path d="${v.d}" fill="url(#lkv)"/>${tagline ? `<path d="${t.d}" fill="${sub}"/>` : ""}
</svg>\n`;
}

/* ---------- favicon: the mark on a deep navy tile (readable on light and dark tabs) ---------- */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>${defs("fv")}<linearGradient id="fvb" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop stop-color="#0E1A36"/><stop offset="1" stop-color="#070B14"/></linearGradient></defs>
<rect width="64" height="64" rx="14" fill="url(#fvb)"/><g transform="translate(5 5) scale(.84)">${markBody("fv")}</g></svg>\n`;

/* ---------- social preview (1200 x 630) ---------- */
function og() {
  const head = textPath(bold, "Your contacts,", 96, 330, 76, -1);
  const head2 = textPath(bold, "protected and in sync.", 96, 420, 76, -1);
  const sub = textPath(semi, "Google Contacts sync · VCF backups · Rewards & challenges", 98, 486, 28, 0);
  const lk = lockup({ dark: true });
  const inner = lk.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(lk);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="ogb" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse"><stop stop-color="#060A13"/><stop offset=".62" stop-color="#0B1630"/><stop offset="1" stop-color="#171338"/></linearGradient>
<radialGradient id="ogg" cx="1010" cy="140" r="560" gradientUnits="userSpaceOnUse"><stop stop-color="#4F7BFF" stop-opacity=".38"/><stop offset="1" stop-color="#4F7BFF" stop-opacity="0"/></radialGradient>
<radialGradient id="ogv" cx="1150" cy="640" r="420" gradientUnits="userSpaceOnUse"><stop stop-color="#8B5CF6" stop-opacity=".28"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#ogb)"/><rect width="1200" height="630" fill="url(#ogg)"/><rect width="1200" height="630" fill="url(#ogv)"/>
<g stroke="#2B3B66" stroke-opacity=".45">${Array.from({ length: 10 }, (_, i) => `<path d="M${760 + i * 52} 0 L${560 + i * 80} 630"/>`).join("")}</g>
<g fill="#8EAEFF" opacity=".5">${[[880, 180], [960, 250], [1040, 210], [1000, 330], [1100, 300], [920, 410]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g>
<g stroke="#8EAEFF" stroke-opacity=".35" stroke-width="2" fill="none"><path d="M880 180 960 250 1040 210 1100 300 1000 330 960 250M1000 330 920 410"/></g>
<svg x="96" y="80" width="${Number(vb[1]) * 1.25}" height="${Number(vb[2]) * 1.25}" viewBox="0 0 ${vb[1]} ${vb[2]}">${inner}</svg>
<path d="${head.d}" fill="#FFFFFF"/><path d="${head2.d}" fill="#FFFFFF"/><path d="${sub.d}" fill="#A9B7D3"/>
</svg>\n`;
}

writeFileSync(join(OUT, "logo-mark.svg"), mark());
writeFileSync(join(OUT, "logo-mark-light.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="SYRIX VCF"><defs>${defs("sl", true)}</defs>${markBody("sl", true)}</svg>\n`);
writeFileSync(join(OUT, "logo-full.svg"), lockup({ dark: true }));
writeFileSync(join(OUT, "logo-full-light.svg"), lockup({ dark: false }));
writeFileSync(join(OUT, "logo-wordmark.svg"), lockup({ dark: true, tagline: false }));
writeFileSync(join(OUT, "favicon.svg"), favicon);
writeFileSync(join(OUT, "og.svg"), og());

/* ---------- PNG renders (social image, touch icon, e-mail/app icons) through the bundled Chromium ---------- */
const { chromium } = require("playwright");
const local = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const exe = process.env.PW_CHROMIUM ?? ((await import("node:fs")).existsSync(local) ? local : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function png(svgFile, outFile, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(readFileSync(join(OUT, svgFile))).toString("base64")}" style="width:${w}px;height:${h}px;display:block"></body></html>`);
  await page.screenshot({ path: join(OUT, outFile), omitBackground: true });
}
await png("og.svg", "og.png", 1200, 630);
await png("favicon.svg", "apple-touch-icon.png", 180, 180);
await png("favicon.svg", "icon-192.png", 192, 192);
await png("favicon.svg", "icon-512.png", 512, 512);
await browser.close();
console.log("brand assets written to web/assets/");
