'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Rent system lib (RyzumiMD port).
 * Group expiry — time khatam hote hi bot group se auto-leave karta hai.
 * Data: data/rent.json {groupJid: {expiresAt, setBy, groupName}}.
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'rent.json');
function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function parseDuration(str) {
  const m = String(str || '').trim().match(/^(\d+)\s*([dhm])$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const mult = { d: 86400000, h: 3600000, m: 60000 };
  return n * (mult[m[2].toLowerCase()] || 0);
}
function fmtRemaining(ms) {
  if (ms <= 0) return 'expired';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm';
}
function setRent(groupJid, durationMs, setBy, groupName) {
  const d = load();
  d[groupJid] = { expiresAt: Date.now() + durationMs, setBy: setBy || '', groupName: groupName || '' };
  save(d);
  return d[groupJid];
}
function getRent(groupJid) { return load()[groupJid] || null; }
function listRent() { return load(); }
function removeRent(groupJid) {
  const d = load();
  delete d[groupJid];
  save(d);
}
// Scheduler tick se har 30s call hota hai.
async function checkDue(sock) {
  const d = load();
  const now = Date.now();
  let changed = false;
  for (const [jid, r] of Object.entries(d)) {
    if (!r.expiresAt || r.expiresAt > now) continue;
    try {
      await sock.sendMessage(jid, { text: '⏰ *Rent khatam!* Bot ka time is group me khatam ho gaya. Rent renew karne ke liye owner se contact karo.' });
    } catch (e) {}
    try { await sock.groupLeave(jid); } catch (e) {}
    delete d[jid];
    changed = true;
  }
  if (changed) save(d);
}

module.exports = { parseDuration, fmtRemaining, setRent, getRent, listRent, removeRent, checkDue };
