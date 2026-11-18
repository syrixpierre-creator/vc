/**
 * QUEEN AKUMA v3.0.0 — Plugin Store
 * WhatsApp se hi naye plugins install karo, bina redeploy kiye.
 * Sirf owner. Sirf GitHub raw URLs (allowlist). Static safety scan.
 * Install ke baad commandHandler.reloadCommands() se hot-load hota hai.
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const COMMAND_DIR = path.join(__dirname, '..', 'command');
// Dépôt de la boutique de plugins — mets le tien dans .env : PLUGIN_STORE_REPO=owner/repo
const STORE_REPO = process.env.PLUGIN_STORE_REPO || 'INCONNU-BOY-SENSEI/QUEEN-AKUMA';
const GITHUB_RAW = `https://raw.githubusercontent.com/${STORE_REPO}/main/store-plugins/`;

// Built-in catalog — owner data/plugin-catalog.json se override kar sakta hai.
const DEFAULT_CATALOG = [
  { name: 'motivate', desc: 'Roz ek motivational quote (.motivate)', file: GITHUB_RAW + 'motivate.js' },
  { name: 'countdown', desc: 'Kisi date tak countdown (.countdown 2026-12-31)', file: GITHUB_RAW + 'countdown.js' },
  { name: 'password', desc: 'Strong password generator (.password 16)', file: GITHUB_RAW + 'password.js' },
];

// Safety scan — ye patterns wala plugin install nahi hoga.
const BLOCKED = [
  'child_process', 'execSync', 'spawn', 'eval(', 'new Function',
  'process.env', 'GITHUB_TOKEN', 'TELEGRAM_BOT_TOKEN', 'creds.json',
  'fs.unlink', 'fs.writeFile', 'rm -rf', '.env'
];

function getCatalog() {
  try {
    const custom = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'plugin-catalog.json'), 'utf8'));
    if (Array.isArray(custom) && custom.length) return custom;
  } catch (_) {}
  return DEFAULT_CATALOG;
}
function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    return (u.hostname === 'raw.githubusercontent.com' || u.hostname === 'github.com') && u.pathname.endsWith('.js');
  } catch (_) { return false; }
}
function validate(code) {
  if (!/command:\s*['"]/.test(code) || !/handler\s*[:\(]/.test(code)) {
    return 'Plugin me `command:` + `handler:` nahi mila — ye valid QUEEN AKUMA command nahi hai.';
  }
  for (const bad of BLOCKED) {
    if (code.includes(bad)) return `Safety scan fail: plugin me blocked pattern hai (${bad}).`;
  }
  if (code.length > 200 * 1024) return 'Plugin 200KB se bada hai.';
  return null;
}
function installedList() {
  try {
    return fs.readdirSync(COMMAND_DIR).filter((f) => f.startsWith('store_') && f.endsWith('.js'))
      .map((f) => f.slice(6, -3));
  } catch (_) { return []; }
}
async function install(nameOrUrl) {
  const catalog = getCatalog();
  let entry = catalog.find((c) => c.name === nameOrUrl);
  let url = entry ? entry.file : nameOrUrl;
  if (!isAllowedUrl(url)) return { ok: false, error: 'Sirf GitHub raw .js URLs allowed hain.\nExample: `.store install motivate` ya `.store install https://raw.githubusercontent.com/.../plugin.js`' };
  let code;
  try {
    const r = await axios.get(url, { timeout: 20000, responseType: 'text', maxContentLength: 200 * 1024 });
    code = String(r.data || '');
  } catch (e) {
    return { ok: false, error: 'Download fail: ' + (e.response ? 'HTTP ' + e.response.status + ' — file GitHub par hai? (bot ko GitHub push karo, phir try karo)' : e.message) };
  }
  const problem = validate(code);
  if (problem) return { ok: false, error: problem };
  const name = entry ? entry.name : (url.split('/').pop().replace(/\.js$/, '') || 'plugin').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  const dest = path.join(COMMAND_DIR, `store_${name}.js`);
  fs.writeFileSync(dest, code);
  try { require('./commandHandler').reloadCommands(); } catch (_) {}
  return { ok: true, name, file: `store_${name}.js` };
}
function remove(name) {
  const dest = path.join(COMMAND_DIR, `store_${name}.js`);
  if (!fs.existsSync(dest)) return { ok: false, error: `Plugin '${name}' installed nahi hai.` };
  fs.unlinkSync(dest);
  try { require('./commandHandler').reloadCommands(); } catch (_) {}
  return { ok: true, name };
}
module.exports = { getCatalog, install, remove, installedList, isAllowedUrl, validate };
