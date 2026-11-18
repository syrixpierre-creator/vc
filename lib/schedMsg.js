/**
 * QUEEN AKUMA v3.4.0 — Schedule Message (Levanter setschedule port)
 * data/schedmsg.json: [{ id, chatId, text, at, repeat ('once'|'daily'), createdBy }]
 * .setremind se alag: ye message DUSRO ko bhejta hai (group/DM), khud ko nahi.
 */
const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', 'data', 'schedmsg.json');
const { parseTime } = require('./scheduler');

let sock = null;
let timer = null;

function load() { try { return JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) { return []; } }
function save(items) { try { fs.mkdirSync(path.dirname(PATH), { recursive: true }); fs.writeFileSync(PATH, JSON.stringify(items, null, 2)); } catch (_) {} }
function setSocket(s) { sock = s; }
function genId() { return 'S' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

function add(chatId, text, input, createdBy) {
  const parsed = parseTime(input);
  if (!parsed) return { ok: false, error: 'Time samajh nahi aaya. Use: `10m`, `2h`, `30s`, `1d` ya `18:30` (daily).' };
  const items = load();
  const it = { id: genId(), chatId, text: text.slice(0, 1000), at: parsed.at, repeat: parsed.repeat, createdBy };
  items.push(it);
  save(items);
  return { ok: true, item: it };
}
function list(chatId) { return load().filter((x) => x.chatId === chatId); }
function remove(chatId, id) {
  const items = load();
  const kept = items.filter((x) => !(x.chatId === chatId && x.id === id.toUpperCase()));
  if (kept.length === items.length) return false;
  save(kept);
  return true;
}
function fmtTime(ts) { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }

async function tick() {
  if (!sock) return;
  const now = Date.now();
  const items = load();
  let changed = false;
  for (const it of items) {
    if (it.at > now) continue;
    try { await sock.sendMessage(it.chatId, { text: it.text }); } catch (_) {}
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
module.exports = { setSocket, start, add, list, remove, fmtTime, tick, parseTime };
