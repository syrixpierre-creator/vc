/**
 * OSINT access control
 * - global enabled on/off
 * - owner always allowed
 * - whitelist of jids/numbers for others
 */
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const FILE = path.join(process.cwd(), 'data', 'osint-access.json');

function load() {
  try {
    if (!fs.existsSync(FILE)) {
      return { enabled: true, users: [] };
    }
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return {
      enabled: j.enabled !== false,
      users: Array.isArray(j.users) ? j.users.map(String) : []
    };
  } catch {
    return { enabled: true, users: [] };
  }
}

function save(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  return data;
}

function digits(v) {
  return String(v || '').replace(/\D/g, '');
}

function normEntry(v) {
  const d = digits(v);
  if (d.length >= 8) return d;
  return String(v || '').toLowerCase();
}

function isOwnerJid(jid) {
  const o = digits(settings.ownerNumber);
  const s = digits(jid);
  if (!o || !s) return false;
  return s === o || s.endsWith(o) || o.endsWith(s.slice(-10)) || s.includes(o);
}

function isAllowed(jid, fromMe) {
  if (fromMe) return true;
  if (isOwnerJid(jid)) return true;
  const st = load();
  if (!st.enabled) return false;
  const d = digits(jid);
  return st.users.some((u) => {
    const ud = digits(u);
    if (ud && d && (d === ud || d.endsWith(ud) || ud.endsWith(d.slice(-10)))) return true;
    return String(u) === String(jid);
  });
}

function setEnabled(v) {
  const st = load();
  st.enabled = !!v;
  return save(st);
}

function addUser(entry) {
  const st = load();
  const e = normEntry(entry);
  if (!e) return { ok: false, error: 'invalid number' };
  if (!st.users.includes(e)) st.users.push(e);
  save(st);
  return { ok: true, users: st.users };
}

function removeUser(entry) {
  const st = load();
  const e = normEntry(entry);
  st.users = st.users.filter((u) => u !== e && digits(u) !== e);
  save(st);
  return { ok: true, users: st.users };
}

function listUsers() {
  return load().users;
}

module.exports = {
  load,
  save,
  isAllowed,
  isOwnerJid,
  setEnabled,
  addUser,
  removeUser,
  listUsers,
  digits,
  normEntry
};
