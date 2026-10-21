// Lists translation keys used by the web client and reports keys missing from each dictionary.
// Usage: node scripts/i18n-check.mjs [--keys]   (dynamic keys `prefix.${x}` are listed as prefixes to review)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== "i18n" && f !== "assets") walk(p); } else if (/\.(js|html)$/.test(f)) files.push(p); } })(web);

const NS = /^(sup|signin|nf|nav|err|status|[a-z]+St|diff|site|legal|onb|ov|ct|imp|exp|dup|bk|sync|ref|wal|ch|pg|nt|notif|sp|set|adm|role|roleDesc|metric|reward|mission|ach|levelTitle|secEvent|hist|field|color|method|payoutSource|source|ledger|ledgerReason|xpReason|annKind|annSt|prio|userSt|review|restriction|refReason|claimNote|staffTask|banner|app|support|signin|nf|cookie)\./;
const used = new Set(), dynamic = new Map();
const NOT_KEYS = new Set(["key", "ledger.adjust", "sync.manage"]); // permission names and doc examples that look like keys
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
  for (const m of s.matchAll(/data-i18n-attr="([^"]+)"/g)) for (const pair of m[1].split(",")) used.add(pair.split(":")[1].trim());
  for (const m of s.matchAll(/["']([a-zA-Z]+\.[a-zA-Z0-9_.]+)["']/g)) if (NS.test(m[1]) && !/\.(js|css|svg|html|png|json|woff2?)$/.test(m[1])) used.add(m[1]);
  for (const m of s.matchAll(/`([a-zA-Z]+\.[a-zA-Z0-9_.]*)\$\{([^}]+)\}([a-zA-Z0-9_.]*)`/g)) if (NS.test(m[1])) { const k = `${m[1]}*${m[3]}`; if (!dynamic.has(k)) dynamic.set(k, new Set()); dynamic.get(k).add(f.slice(web.length + 1)); }
}
const dicts = {};
for (const l of ["en", "fr", "pt", "es", "ar"]) { try { dicts[l] = (await import(pathToFileURL(join(web, "js/i18n", `${l}.js`)))).default; } catch { dicts[l] = {}; } }
const base = k => k.replace(/\|\w+$/, "");
if (process.argv.includes("--keys")) { console.log([...used].sort().join("\n")); console.log("\nDYNAMIC:"); for (const [k, f] of dynamic) console.log(k, [...f].join(" ")); process.exit(0); }
let bad = 0;
const enKeys = new Set(Object.keys(dicts.en).map(base));
const missEn = [...used].filter(k => !NOT_KEYS.has(k)).filter(k => !enKeys.has(k)).sort();
if (missEn.length) { bad = 1; console.log(`en: ${missEn.length} used keys missing\n  ${missEn.join("\n  ")}`); }
for (const [prefix] of dynamic) { const [a, b] = prefix.split("*"); if (![...enKeys].some(k => k.startsWith(a) && k.endsWith(b))) { bad = 1; console.log(`en: no keys for dynamic ${prefix}`); } }
for (const l of ["fr", "pt", "es", "ar"]) {
  const have = new Set(Object.keys(dicts[l]).map(base));
  const miss = [...enKeys].filter(k => !have.has(k)), extra = [...have].filter(k => !enKeys.has(k));
  const sameAsEn = Object.keys(dicts.en).filter(k => dicts[l][k] !== undefined && dicts[l][k] === dicts.en[k] && /[a-z]{4,}/.test(dicts.en[k]));
  if (miss.length || extra.length) bad = 1;
  console.log(`${l}: ${miss.length} missing, ${extra.length} extra, ${sameAsEn.length} identical to English`);
  if (miss.length) console.log(`  missing: ${miss.slice(0, 40).join(", ")}${miss.length > 40 ? " ..." : ""}`);
  if (extra.length) console.log(`  extra: ${extra.slice(0, 40).join(", ")}`);
}
// placeholders must match between languages
for (const l of ["fr", "pt", "es", "ar"]) for (const [k, v] of Object.entries(dicts[l])) {
  const ref = dicts.en[k] ?? dicts.en[`${base(k)}|other`] ?? dicts.en[base(k)]; if (ref === undefined) continue;
  const ph = x => [...x.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join();
  if (ph(v) !== ph(ref) && !(k.includes("|") && ph(v).replace("n", "") === ph(ref).replace("n", ""))) { bad = 1; console.log(`${l}: placeholder mismatch ${k}: "${v}"`); }
}
process.exit(bad);
