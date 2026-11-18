'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Clone (sub-bot) rent manager lib.
 * .rentbot se jo clone bot rent par diya jata hai, uska hisaab yahan hai:
 *   kisko diya, kab se, kab tak, kitne paise, online hai ya nahi.
 * Data: data/cloneRent.json { records: {number: {...}}, history: [...] }
 *   record: { number, authId, renterName, price, startedAt, expiresAt,
 *             status: 'active', notes, source }
 *   expiresAt null = unlimited (jab tak .rentremove / .stoprent na ho).
 * History me expired / removed / stopped records rehte hain — purana
 * hisaab (.rentexpired) dekhne ke liye.
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'cloneRent.json');

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (d && typeof d === 'object') {
      if (!d.records) d.records = {};
      if (!Array.isArray(d.history)) d.history = [];
      return d;
    }
  } catch (e) {}
  return { records: {}, history: [] };
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}

// Number ko digits-only banao; match hamesha last-10-digits se (country
// code / :lid suffix / leading 0 se farak nahi padta).
function normNumber(s) {
  return String(s || '').replace(/[^0-9]/g, '');
}
function numKey(s) {
  const d = normNumber(s);
  return d.length > 10 ? d.slice(-10) : d;
}
function matchNumber(a, b) {
  return numKey(a) && numKey(a) === numKey(b);
}

function parseDuration(str) {
  const m = String(str || '').trim().match(/^(\d+)\s*([dhm])$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const mult = { d: 86400000, h: 3600000, m: 60000 };
  return n * (mult[m[2].toLowerCase()] || 0);
}
function fmtRemaining(ms) {
  if (ms == null) return 'unlimited';
  if (ms <= 0) return 'EXPIRED';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm';
}
function fmtDateIST(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  } catch (e) { return new Date(ts).toString(); }
}
function fmtPrice(p) {
  if (p == null || p === '') return '—';
  return '₹' + p;
}

function getRecord(number) {
  const d = load();
  const k = numKey(number);
  for (const [num, r] of Object.entries(d.records)) {
    if (numKey(num) === k) return r;
  }
  return null;
}
function listRecords() {
  const d = load();
  return Object.values(d.records).sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0));
}
function listHistory() {
  const d = load();
  return d.history.slice().sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));
}

// Rent add/update karo. durationMs null = unlimited.
function setRent(number, opts) {
  opts = opts || {};
  const d = load();
  const num = normNumber(number);
  const now = Date.now();
  const prev = getRecord(num);
  const rec = {
    number: num,
    authId: opts.authId || (prev && prev.authId) || '',
    renterName: opts.renterName !== undefined ? opts.renterName : ((prev && prev.renterName) || ''),
    price: opts.price !== undefined ? opts.price : ((prev && prev.price) || null),
    startedAt: (prev && prev.startedAt) || now,
    expiresAt: opts.durationMs ? now + opts.durationMs : (opts.durationMs === null ? null : ((prev && prev.expiresAt) || null)),
    status: 'active',
    notes: opts.notes || ((prev && prev.notes) || ''),
    source: opts.source || ((prev && prev.source) || 'manual')
  };
  d.records[num] = rec;
  save(d);
  return rec;
}
// .rentbot connect hone par basic record banao (agar pehle se nahi hai).
function ensureRecord(number, authId) {
  const prev = getRecord(number);
  if (prev) {
    if (authId && prev.authId !== authId) {
      const d = load();
      d.records[prev.number] = Object.assign({}, prev, { authId: authId, status: 'active' });
      save(d);
      return d.records[prev.number];
    }
    return prev;
  }
  return setRent(number, { authId: authId || '', source: 'rentbot' });
}
function extendRent(number, durationMs) {
  const d = load();
  const rec = getRecord(number);
  if (!rec) return null;
  const now = Date.now();
  const base = (rec.expiresAt && rec.expiresAt > now) ? rec.expiresAt : now;
  rec.expiresAt = base + durationMs;
  d.records[rec.number] = rec;
  save(d);
  return rec;
}
// Record hatao — history me daalo (status: removed/stopped/expired).
function closeRecord(number, status) {
  const d = load();
  const rec = getRecord(number);
  if (!rec) return null;
  delete d.records[rec.number];
  d.history.unshift(Object.assign({}, rec, { status: status || 'removed', closedAt: Date.now() }));
  if (d.history.length > 200) d.history.length = 200;
  save(d);
  return rec;
}
function removeRent(number) { return closeRecord(number, 'removed'); }

// ---- Unified clone list (online conns + disk sessions + DB + rent records) ----
// Har jagah (.rentlist / .listrent / .stoprent) YEHI order use hota hai,
// taaki index number har command me same rahe.
function readDiskSessions() {
  const out = [];
  try {
    const clonesDir = path.join(process.cwd(), 'session', 'clones');
    if (!fs.existsSync(clonesDir)) return out;
    for (const dir of fs.readdirSync(clonesDir)) {
      const base = path.join(clonesDir, dir);
      if (!fs.statSync(base).isDirectory()) continue;
      let number = '';
      let status = 'unknown';
      try {
        const sj = JSON.parse(fs.readFileSync(path.join(base, 'session.json'), 'utf8'));
        if (sj.userNumber) number = String(sj.userNumber);
        if (sj.status) status = sj.status;
      } catch (e) {}
      if (!number) {
        try {
          const creds = JSON.parse(fs.readFileSync(path.join(base, 'creds.json'), 'utf8'));
          const meId = (creds.me && creds.me.id) || creds.meId || '';
          number = normNumber(String(meId).split(':')[0]);
        } catch (e) {}
      }
      out.push({ authId: dir, number: number, status: status });
    }
  } catch (e) {}
  return out;
}

function listAllClones() {
  const byKey = new Map();
  const put = (entry) => {
    const k = numKey(entry.number);
    if (!k) return;
    const prev = byKey.get(k);
    if (!prev) { byKey.set(k, entry); return; }
    // Merge: online jeetta hai, phir jiske paas zyada info ho.
    byKey.set(k, {
      number: prev.number || entry.number,
      name: entry.name || prev.name || '',
      authId: entry.authId || prev.authId || '',
      online: prev.online || entry.online,
      status: (prev.online || entry.online) ? 'online' : (prev.status || entry.status || 'offline'),
      conn: prev.conn || entry.conn || null,
      rent: entry.rent || prev.rent || null
    });
  };

  // 1. Online conns
  try {
    for (const conn of (global.conns || [])) {
      const user = (conn && conn.user) || {};
      const num = normNumber(String(user.id || '').split(':')[0]);
      put({ number: num, name: user.name || '', authId: '', online: true, status: 'online', conn: conn, rent: null });
    }
  } catch (e) {}

  // 2. Disk sessions (restart ke baad bhi dikhenge)
  for (const s of readDiskSessions()) {
    put({ number: s.number, name: '', authId: s.authId, online: false, status: s.status || 'offline', conn: null, rent: null });
  }

  // 3. DB stored clones (agar DB env ho)
  try {
    const store = require('./lightweight_store');
    if (process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL) {
      // sync nahi hai — DB list async hoti hai; yahan skip (disk + conns hi source of truth).
    }
  } catch (e) {}

  // 4. Rent records (bina connection ke bhi — pending / record-only)
  for (const rec of listRecords()) {
    put({ number: rec.number, name: rec.renterName || '', authId: rec.authId || '', online: false, status: 'record-only', conn: null, rent: rec });
  }

  const list = Array.from(byKey.values());
  // Rent record attach karo (jo upar merge me miss hua ho)
  for (const e of list) {
    if (!e.rent) e.rent = getRecord(e.number);
    if (e.rent && e.rent.renterName && !e.name) e.name = e.rent.renterName;
    if (!e.online && e.rent && e.status === 'record-only') e.status = 'rented-offline';
  }
  // Stable order: online pehle, phir offline, phir record-only — har group me number-wise.
  const rank = (e) => e.online ? 0 : (e.authId ? 1 : 2);
  list.sort((a, b) => (rank(a) - rank(b)) || (a.number < b.number ? -1 : 1));
  return list;
}

// Index (1-based, .rentlist wali numbering) ya number se entry dhoondo.
function resolveTarget(input, list) {
  list = list || listAllClones();
  const s = String(input || '').trim();
  if (!s) return null;
  const idx = parseInt(s, 10);
  if (!isNaN(idx) && String(idx) === s && idx >= 1 && idx <= list.length) return list[idx - 1];
  const k = numKey(s);
  return list.find((e) => numKey(e.number) === k) || null;
}

// Scheduler tick (har 30s) — expired rent wale clone ko roko.
async function checkDue(sock) {
  const d = load();
  const now = Date.now();
  let changed = false;
  for (const rec of Object.values(d.records)) {
    if (!rec.expiresAt || rec.expiresAt > now) continue;
    // Online clone hai to logout karo.
    try {
      const conn = (global.conns || []).find((c) => {
        const num = normNumber(String(((c && c.user) || {}).id || '').split(':')[0]);
        return num && matchNumber(num, rec.number);
      });
      if (conn) {
        try { await conn.logout(); } catch (e) {}
        try { conn.end(); } catch (e) {}
        const i = global.conns.indexOf(conn);
        if (i > -1) global.conns.splice(i, 1);
      }
    } catch (e) {}
    closeRecord(rec.number, 'expired');
    changed = true;
    try {
      const owner = require('../settings').ownerNumber;
      if (owner && sock && sock.sendMessage) {
        await sock.sendMessage(owner + '@s.whatsapp.net', {
          text: '⏰ *Rent expired:* @' + rec.number + (rec.renterName ? ' (' + rec.renterName + ')' : '') + ' ka rent khatam ho gaya — clone stop kar diya gaya hai.',
          mentions: [rec.number + '@s.whatsapp.net']
        });
      }
    } catch (e) {}
  }
  return changed;
}

module.exports = {
  normNumber, numKey, matchNumber,
  parseDuration, fmtRemaining, fmtDateIST, fmtPrice,
  getRecord, listRecords, listHistory,
  setRent, ensureRecord, extendRent, removeRent, closeRecord,
  listAllClones, resolveTarget, readDiskSessions,
  checkDue
};
