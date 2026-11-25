'use strict';
/**
 * QUEEN AKUMA — one-time reset: every "anti" protection OFF (antispam, antilink,
 * antidelete, anticall, antibadword, antibug, antisticker…), in every group and
 * globally, for this bot. Runs ONCE per bot (marker file), then never again:
 * what the owner turns back on afterwards stays on.
 *
 * It only flips switches: lists, actions, warnings and other data are kept.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const MARKER = path.join(DATA, '.anti-defaults-off.v1');
const MAX_FILE = 20 * 1024 * 1024;
const isAntiKey = (k) => /^anti/i.test(k) && !/(actions?|warnings?|warncount|limit|list|count|excluded?|allowed|whitelist|blacklist|msg|message|text|words)$/i.test(k);

// true -> false, 'on' -> 'off', { enabled: true } -> { enabled: false } under anti* keys
function walk(node, depth = 0) {
  let changed = 0;
  if (!node || typeof node !== 'object' || depth > 8) return 0;
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (isAntiKey(k)) {
      if (v === true) { node[k] = false; changed++; continue; }
      if (typeof v === 'string' && /^(on|true|enable|enabled|yes)$/i.test(v)) { node[k] = 'off'; changed++; continue; }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        for (const ek of ['enabled', 'enable', 'status', 'on', 'active']) {
          if (v[ek] === true) { v[ek] = false; changed++; }
          else if (typeof v[ek] === 'string' && /^(on|true|enable|enabled)$/i.test(v[ek])) { v[ek] = 'off'; changed++; }
        }
      }
    }
    if (v && typeof v === 'object') changed += walk(v, depth + 1);
  }
  return changed;
}

function resetJsonFiles() {
  let files = 0, flips = 0;
  const list = [];
  try { for (const f of fs.readdirSync(DATA)) if (f.endsWith('.json')) list.push(path.join(DATA, f)); } catch (_) {}
  if (fs.existsSync(path.join(ROOT, 'baileys_store.json'))) list.push(path.join(ROOT, 'baileys_store.json'));
  for (const f of list) {
    try {
      if (fs.statSync(f).size > MAX_FILE) continue;
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      const n = walk(j);
      if (n) { fs.writeFileSync(f, JSON.stringify(j, null, 2)); files++; flips += n; }
    } catch (_) {}
  }
  return { files, flips };
}

function resetSqlite() {
  const db = path.join(ROOT, 'baileys_store.db');
  if (!fs.existsSync(db)) return 0;
  let Database;
  try { Database = require('better-sqlite3'); } catch (_) { return 0; }
  let flips = 0;
  const sql = new Database(db);
  try {
    const rows = sql.prepare("SELECT chat_id, key, value FROM settings WHERE lower(key) LIKE 'anti%'").all();
    const upd = sql.prepare('UPDATE settings SET value=? WHERE chat_id=? AND key=?');
    for (const r of rows) {
      if (!isAntiKey(r.key)) continue;
      let v; try { v = JSON.parse(r.value); } catch (_) { v = r.value; }
      const box = { [r.key]: v };
      if (walk(box)) { upd.run(JSON.stringify(box[r.key]), r.chat_id, r.key); flips++; }
    }
  } catch (_) {} finally { try { sql.close(); } catch (_) {} }
  return flips;
}

function runOnce() {
  try {
    if (fs.existsSync(MARKER)) return null;
    fs.mkdirSync(DATA, { recursive: true });
    const j = resetJsonFiles();
    const s = resetSqlite();
    fs.writeFileSync(MARKER, JSON.stringify({ at: new Date().toISOString(), jsonFiles: j.files, jsonSwitches: j.flips, dbSettings: s }));
    console.log(`[anti] all anti protections set OFF once (${j.flips} switches in ${j.files} files, ${s} db settings)`);
    return { ...j, db: s };
  } catch (e) {
    console.log('[anti] reset skipped:', e.message);
    return null;
  }
}

module.exports = { runOnce, walk };
