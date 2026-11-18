/**
 * QUEEN AKUMA v3.3.0 — AI Memory
 * Har user ke baare me facts yaad rakhta hai (naam, pasand, purani baatein).
 * data/ai-memory.json me save hota hai. .demonai isko prompt me use karta hai.
 */
const fs = require('fs');
const path = require('path');
const PATH = path.join(__dirname, '..', 'data', 'ai-memory.json');

function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }
function load() {
  try { return JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) { return { users: {} }; }
}
function save(db) {
  try { fs.mkdirSync(path.dirname(PATH), { recursive: true }); fs.writeFileSync(PATH, JSON.stringify(db, null, 2)); } catch (_) {}
}
/** Ek fact yaad rakho (max 20 per user, naye upar). */
function remember(jid, fact) {
  if (!fact || fact.length < 3) return;
  const db = load();
  const k = num(jid);
  if (!db.users[k]) db.users[k] = { facts: [], updatedAt: Date.now() };
  const facts = db.users[k].facts;
  if (facts.includes(fact)) return;
  facts.unshift(fact.slice(0, 200));
  if (facts.length > 20) facts.length = 20;
  db.users[k].updatedAt = Date.now();
  save(db);
}
/** User ke facts — demonai prompt ke liye ek line me. */
function getForPrompt(jid) {
  const db = load();
  const u = db.users[num(jid)];
  if (!u || !u.facts.length) return '';
  return u.facts.slice(0, 8).join(' | ');
}
function getFacts(jid) {
  const db = load();
  const u = db.users[num(jid)];
  return u ? u.facts : [];
}
function forget(jid) {
  const db = load();
  delete db.users[num(jid)];
  save(db);
}
module.exports = { remember, getForPrompt, getFacts, forget, num };
