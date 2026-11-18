// QUEEN AKUMA v3.5.0 • lib/softban.js (Iris softban se)
// Timed kick: user ko kick karo, time khatam hone par auto re-add.
// Store: data/softban.json [{ chatId, user, until }].
// checkDue(sock) — lib/scheduler.js tick (har 30s) se call hota hai.
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'softban.json');

function load() { try { const d = JSON.parse(fs.readFileSync(STORE, 'utf8')); return Array.isArray(d) ? d : []; } catch (_) { return []; } }
function save(items) { try { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(items, null, 2)); } catch (_) {} }
function add(chatId, user, until) {
  const items = load().filter((x) => !(x.chatId === chatId && x.user === user));
  items.push({ chatId, user, until });
  save(items);
}
function list(chatId) { return load().filter((x) => x.chatId === chatId); }
async function checkDue(sock) {
  if (!sock) return;
  const now = Date.now();
  const items = load();
  const due = items.filter((x) => x.until <= now);
  if (!due.length) return;
  const kept = items.filter((x) => x.until > now);
  for (const d of due) {
    try { await sock.groupParticipantsUpdate(d.chatId, [d.user], 'add'); } catch (_) {}
  }
  save(kept);
}
module.exports = { load, save, add, list, checkDue };
