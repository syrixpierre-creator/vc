/**
 * QUEEN AKUMA v3.3.0 — Birthday Wisher
 * data/birthdays.json: { chatId: [{ name, day, month, jid }] }
 * checkDue(sock): roz subah 8 baje wish karta hai (scheduler se call hota hai).
 */
const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', 'data', 'birthdays.json');

function load() { try { return JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) { return {}; } }
function save(db) { try { fs.mkdirSync(path.dirname(PATH), { recursive: true }); fs.writeFileSync(PATH, JSON.stringify(db, null, 2)); } catch (_) {} }
function add(chatId, name, day, month, jid) {
  const db = load();
  if (!db[chatId]) db[chatId] = [];
  db[chatId] = db[chatId].filter((b) => b.name.toLowerCase() !== name.toLowerCase());
  db[chatId].push({ name, day, month, jid: jid || '', lastWished: '' });
  save(db);
}
function list(chatId) { return (load()[chatId] || []); }
function del(chatId, name) {
  const db = load();
  if (!db[chatId]) return false;
  const before = db[chatId].length;
  db[chatId] = db[chatId].filter((b) => b.name.toLowerCase() !== name.toLowerCase());
  save(db);
  return db[chatId].length < before;
}
async function checkDue(sock, now = new Date()) {
  const db = load();
  const today = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  if (now.getHours() < 8) return; // subah 8 baje ke baad
  for (const [chatId, list] of Object.entries(db)) {
    for (const b of list) {
      if (b.day === now.getDate() && b.month === now.getMonth() + 1 && b.lastWished !== today) {
        b.lastWished = today;
        save(db);
        const mention = b.jid ? `@${String(b.jid).split('@')[0]}` : b.name;
        try {
          await sock.sendMessage(chatId, { text: `🎂 *Happy Birthday ${b.name}!* 🎉🎈\n\n${mention} ko janamdin ki dher saari shubhkamnayein! 🥳🎁\n\n_QUEEN AKUMA ki taraf se_ 🎊`, mentions: b.jid ? [b.jid] : [] });
        } catch (_) {}
      }
    }
  }
}
module.exports = { add, list, del, checkDue };
