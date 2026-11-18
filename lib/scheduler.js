/**
 * QUEEN AKUMA v3.0.0 — Schedule / Reminders
 * .setremind 10m <text>  -> ek baar, 10 minute baad
 * .setremind 18:30 <text> -> roz shaam 6:30 (daily)
 * JSON me save — restart ke baad bhi reminders zinda rehte hain.
 */
const fs = require('fs');
let birthdayLib = null;
try { birthdayLib = require('./birthday'); } catch (_) {}
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'schedules.json');
let sock = null;
let timer = null;

function load() {
  try { const d = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')); return Array.isArray(d) ? d : []; }
  catch (_) { return []; }
}
function save(items) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2));
  } catch (_) {}
}
function setSocket(s) { sock = s; }
function makeId() { return 'R' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

/** "10m"/"2h"/"30s"/"1d" -> ms; "18:30" -> aaj/kal ka timestamp + daily=true. */
function parseTime(input) {
  const s = String(input || '').trim().toLowerCase();
  const dur = s.match(/^(\d+)\s*([smhd])$/);
  if (dur) {
    const n = parseInt(dur[1], 10);
    const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[dur[2]];
    return { at: Date.now() + n * mult, repeat: 'once', label: `${n}${dur[2]}` };
  }
  const hm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const h = parseInt(hm[1], 10), m = parseInt(hm[2], 10);
    if (h > 23 || m > 59) return null;
    const t = new Date();
    t.setHours(h, m, 0, 0);
    if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
    return { at: t.getTime(), repeat: 'daily', label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} roz` };
  }
  return null;
}

function add(chatId, text, at, repeat, by) {
  const items = load();
  const item = { id: makeId(), chatId, text, at, repeat, by: by || '' };
  items.push(item);
  save(items);
  return item;
}
function list(chatId) { return load().filter((x) => x.chatId === chatId); }
function remove(chatId, id) {
  const items = load();
  const before = items.length;
  const kept = items.filter((x) => !(x.chatId === chatId && x.id === id.toUpperCase()));
  if (kept.length === before) return false;
  save(kept);
  return true;
}
function fmtTime(ts) {
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

let lastBirthdayCheck = 0;
async function tick() {
  if (!sock) return;
  const now = Date.now();
  // v3.5.0 — automute + softban + rent due checks (har 30s)
  try { await require('./automute').checkDue(sock); } catch (_) {}
  try { await require('./softban').checkDue(sock); } catch (_) {}
  try { await require('./rent').checkDue(sock); } catch (_) {}
  try { await require('./cloneRent').checkDue(sock); } catch (_) {} // v3.5.0 — expired clone rent auto-stop
  // v3.3.0 Birthday Wisher — ghante me ek baar check karo
  if (birthdayLib && now - lastBirthdayCheck > 3600000) {
    lastBirthdayCheck = now;
    try { await birthdayLib.checkDue(sock, new Date()); } catch (_) {}
  }
  const items = load();
  let changed = false;
  for (const it of items) {
    if (it.at > now) continue;
    const lateMs = now - it.at;
    if (lateMs < 6 * 3600000) {
      try {
        await sock.sendMessage(it.chatId, { text: `⏰ *Reminder*${lateMs > 60000 ? ' (late — bot offline tha)' : ''}\n\n${it.text}` });
      } catch (_) {}
    }
    if (it.repeat === 'daily') { it.at += 24 * 3600000; changed = true; }
    else { items.splice(items.indexOf(it), 1); changed = true; }
  }
  if (changed) save(items);
}
function start() {
  if (timer) return;
  timer = setInterval(() => { tick().catch(() => {}); }, 30000);
  if (timer.unref) timer.unref();
  tick().catch(() => {});
}

module.exports = { setSocket, start, parseTime, add, list, remove, fmtTime, tick };
