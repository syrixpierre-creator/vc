// QUEEN AKUMA v3.5.0 • lib/perlink.js (PATRON per-platform antilink se)
// Har platform ka alag toggle: fb / ig / tg / tiktok / tw / yt / wame.
// Store: data/perlink.json { chatId: { fb: true, ig: false, ... } }.
// In-memory cache — har message par disk read nahi.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'perlink.json');

const PLATFORMS = {
  fb: /(?:facebook\.com|fb\.com|fb\.watch)/i,
  ig: /instagram\.com/i,
  tg: /(?:t\.me|telegram\.me)/i,
  tiktok: /tiktok\.com/i,
  tw: /(?:twitter\.com|x\.com)/i,
  yt: /(?:youtube\.com|youtu\.be)/i,
  wame: /wa\.me/i,
};
const LABELS = { fb: 'Facebook', ig: 'Instagram', tg: 'Telegram', tiktok: 'TikTok', tw: 'Twitter/X', yt: 'YouTube', wame: 'wa.me' };

function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; } }
let state = load();
function save() { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(state, null, 2)); } catch (_) {} }
function isOn(chatId, plat) { return !!(state[chatId] && state[chatId][plat]); }
function set(chatId, plat, on) {
  if (!state[chatId]) state[chatId] = {};
  state[chatId][plat] = !!on;
  save();
}
function getChat(chatId) { return state[chatId] || {}; }
function matchPlatform(text) {
  const t = String(text || '');
  for (const [k, re] of Object.entries(PLATFORMS)) if (re.test(t)) return k;
  return null;
}
module.exports = { PLATFORMS, LABELS, isOn, set, getChat, matchPlatform };
