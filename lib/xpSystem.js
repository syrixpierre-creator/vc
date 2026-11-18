'use strict';
/**
 * QUEEN AKUMA v3.5.0 — XP / Level / Roles system (QUEEN AKUMA port).
 * Formulas: QUEEN AKUMA lib/levelling.js (xpRange / findLevel / canLevelUp).
 * growth = (PI/E)^1.618 * E * 0.75. Role ladder: 8 roles.
 * Data: data/xp.json {number: {xp, level, messages, lastGain}}.
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'xp.json');
const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

function xpRange(level, multiplier) {
  multiplier = multiplier || 1;
  if (level < 0) throw new TypeError('level cannot be negative value');
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return { min, max, xp: max - min };
}
function findLevel(xp, multiplier) {
  multiplier = multiplier || 1;
  if (xp === Infinity) return Infinity;
  if (isNaN(xp)) return NaN;
  if (xp <= 0) return -1;
  let level = 0;
  do level++;
  while (xpRange(level, multiplier).min <= xp);
  return --level;
}
function canLevelUp(level, xp, multiplier) {
  multiplier = multiplier || 1;
  if (level < 0) return false;
  if (xp === Infinity) return true;
  if (isNaN(xp)) return false;
  if (xp <= 0) return false;
  return level < findLevel(xp, multiplier);
}

const ROLES = [
  { min: 0, name: 'Newbie 🌱' },
  { min: 5, name: 'Member 🌿' },
  { min: 10, name: 'Active 🔥' },
  { min: 20, name: 'Veteran ⚔️' },
  { min: 30, name: 'Elite 💎' },
  { min: 50, name: 'Master 👑' },
  { min: 70, name: 'Legend 🌟' },
  { min: 100, name: 'Mythic 🐉' }
];
function roleFor(level) {
  let role = ROLES[0];
  for (const r of ROLES) if (level >= r.min) role = r;
  return role.name;
}

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return { users: {} }; }
}
function save(store) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (e) {}
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }
function getUser(jid) {
  const store = load();
  const k = key(jid);
  if (!store.users[k]) store.users[k] = { xp: 0, level: 0, messages: 0, lastGain: 0 };
  return { store, user: store.users[k], k };
}
// XP do (cooldown 60s per user). Returns {leveledUp, newLevel, user}.
function addXp(jid, n) {
  const { store, user } = getUser(jid);
  const now = Date.now();
  if (now - (user.lastGain || 0) < 60000) return { leveledUp: false, user };
  user.xp = (user.xp || 0) + n;
  user.messages = (user.messages || 0) + 1;
  user.lastGain = now;
  const newLevel = Math.max(0, findLevel(user.xp));
  const leveledUp = newLevel > (user.level || 0);
  user.level = newLevel;
  save(store);
  return { leveledUp, newLevel, user };
}
function progress(jid) {
  const { user } = getUser(jid);
  const level = user.level || 0;
  const range = xpRange(level);
  const into = (user.xp || 0) - range.min;
  const need = Math.max(1, range.xp);
  return { xp: user.xp || 0, level, role: roleFor(level), into, need, pct: Math.min(100, Math.round((into / need) * 100)), messages: user.messages || 0 };
}
function leaderboard(limit) {
  const store = load();
  return Object.entries(store.users || {})
    .map(([num, u]) => ({ num, xp: u.xp || 0, level: u.level || 0, messages: u.messages || 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit || 10);
}
function rankOf(jid) {
  const k = key(jid);
  const board = leaderboard(100000);
  const idx = board.findIndex((e) => e.num === k);
  return idx === -1 ? null : idx + 1;
}

module.exports = { xpRange, findLevel, canLevelUp, roleFor, ROLES, getUser, addXp, progress, leaderboard, rankOf, key };
