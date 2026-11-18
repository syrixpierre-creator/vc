// QUEEN AKUMA v3.5.0 • lib/slowmode.js (QUEEN AKUMA slowmode.js se)
// Per-group slow mode: har user ko window me sirf N messages; zyada wale delete.
// Admins exempt. Store: data/slowmode.json { chatId: { enabled, limit, window } }.
// GAAJU wala startup-reset-to-OFF copy nahi kiya — state restart ke baad bhi rehta hai.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'slowmode.json');

function load() { try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch (_) { return {}; } }
let state = load();
function save() { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(state, null, 2)); } catch (_) {} }
function get(chatId) { return Object.assign({ enabled: false, limit: 1, window: 30 }, state[chatId] || {}); }
function set(chatId, patch) { state[chatId] = Object.assign(get(chatId), patch); save(); }

const tracker = new Map(); // chatId::senderNum -> { count, start }
const adminCache = new Map(); // chatId -> { admins: Set, ts }
const ADMIN_CACHE_TTL = 60000;

async function isGroupAdmin(sock, chatId, senderNum) {
  const cached = adminCache.get(chatId);
  if (cached && Date.now() - cached.ts < ADMIN_CACHE_TTL) return cached.admins.has(senderNum);
  try {
    const meta = await sock.groupMetadata(chatId);
    const admins = new Set(meta.participants.filter((p) => p.admin).map((p) => p.id.split('@')[0].split(':')[0]));
    adminCache.set(chatId, { admins, ts: Date.now() });
    return admins.has(senderNum);
  } catch (_) { return false; }
}

// Over-limit message ho to delete karo. Returns true agar delete kiya.
async function checkMessage(sock, message, chatId, senderId) {
  const g = get(chatId);
  if (!g.enabled) return false;
  if (message.key.fromMe) return false;
  const senderNum = String(senderId || '').split('@')[0].split(':')[0];
  if (!senderNum) return false;
  if (await isGroupAdmin(sock, chatId, senderNum)) return false;
  const key = `${chatId}::${senderNum}`;
  const now = Date.now();
  const win = (g.window || 30) * 1000;
  const t = tracker.get(key) || { count: 0, start: now };
  if (now - t.start > win) { t.count = 1; t.start = now; } else { t.count++; }
  tracker.set(key, t);
  if (t.count > (g.limit || 1)) {
    try { await sock.sendMessage(chatId, { delete: message.key }); } catch (_) {}
    return true;
  }
  return false;
}

module.exports = { get, set, checkMessage };
