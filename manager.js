#!/usr/bin/env node
'use strict';
/**
 * QUEEN AKUMA — Manager multi-session.
 *
 * Il n'y a plus de bot principal : chaque numéro WhatsApp est un bot à part
 * entière, lancé dans SON PROPRE process Node, avec son propre dossier
 * (instances/<numéro>/) : session, données, propriétaire, réglages, plugins.
 * Si un bot plante ou dépasse sa RAM, seul lui redémarre.
 *
 *   node manager.js                 → démarre tous les bots + le panel web
 *   node manager.js add <num> [owner]
 *   node manager.js remove <num> [--purge]
 *   node manager.js list
 *   node manager.js import <num>    → reprend l'ancienne session unique (./session)
 *
 * Les commandes CLI modifient bots.json ; un manager déjà lancé le relit tout seul.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const inst = require('./manager/instances');

try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch (_) {}

const BOTS_FILE = path.join(__dirname, 'bots.json');
const PANEL_PORT = parseInt(process.env.PORT || '5000', 10);
const BOT_PORT_BASE = parseInt(process.env.BOT_PORT_BASE || '6100', 10);
const MAX_BOTS = parseInt(process.env.MAX_BOTS || '0', 10); // 0 = illimité
const PUBLIC_PAIRING = String(process.env.PUBLIC_PAIRING || '').toLowerCase() === 'true';
const BOT_MAX_RAM_MB = process.env.BOT_MAX_RAM_MB || '';      // ex: 400 → MAX_RAM_MB du bot
const BOT_NODE_ARGS = (process.env.BOT_NODE_ARGS || '').split(' ').filter(Boolean);

// Variables qui appartiennent à UN bot : jamais héritées du .env global, sinon
// tous les bots partageraient la même base, le même bot Telegram, la même
// session GitHub, etc. À définir par bot (champ "env" dans bots.json ou
// instances/<num>/.env).
const PER_BOT_VARS = [
  'SESSION_ID', 'PAIRING_NUMBER', 'PORT', 'BOT_ID',
  'MONGO_URL', 'POSTGRES_URL', 'MYSQL_URL', 'DB_URL',
  'TELEGRAM_BOT_TOKEN', 'TG_BOT_TOKEN', 'TELEGRAM_OWNER_ID', 'TELEGRAM_OWNERS',
  'GITHUB_TOKEN', 'GITHUB_REPO', 'GITHUB_BRANCH',
  'OWNER_NUMBER', 'OWNER_NAME', 'OWNERS', 'OWNER_LID', 'BOT_NAME',
  'ADMIN_PASSWORD', 'PUBLIC_PAIRING', 'MAX_BOTS', 'BOT_PORT_BASE', 'BOT_NODE_ARGS', 'BOT_MAX_RAM_MB', 'PEERS', 'PEER_KEY',
];

// ───────────────────────── bots.json ─────────────────────────
function loadBots() {
  try {
    const d = JSON.parse(fs.readFileSync(BOTS_FILE, 'utf8'));
    return Array.isArray(d.bots) ? d.bots : [];
  } catch (_) { return []; }
}
function saveBots(bots) {
  const tmp = BOTS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ bots }, null, 2));
  fs.renameSync(tmp, BOTS_FILE);
}
function nextPort(bots) {
  const used = new Set(bots.map((b) => b.port));
  let p = BOT_PORT_BASE;
  while (used.has(p) || p === PANEL_PORT) p++;
  return p;
}
function addBotConfig(number, owner, extra = {}) {
  const n = inst.cleanNumber(number);
  if (!n) return { ok: false, error: 'Numéro invalide (10 à 15 chiffres, indicatif pays inclus, sans +).' };
  const o = owner ? inst.cleanNumber(owner) : n;
  if (!o) return { ok: false, error: 'Numéro propriétaire invalide.' };
  const bots = loadBots();
  if (bots.find((b) => b.number === n)) return { ok: false, error: `Le bot ${n} existe déjà.` };
  if (MAX_BOTS > 0 && bots.length >= MAX_BOTS) return { ok: false, error: `Limite atteinte (${MAX_BOTS} bots).` };
  const bot = { number: n, owner: o, enabled: true, port: nextPort(bots), createdAt: new Date().toISOString(), env: {}, ...extra };
  bots.push(bot);
  saveBots(bots);
  return { ok: true, bot };
}
function updateBotConfig(number, patch) {
  const bots = loadBots();
  const b = bots.find((x) => x.number === number);
  if (!b) return null;
  Object.assign(b, patch);
  saveBots(bots);
  return b;
}
function removeBotConfig(number) {
  const bots = loadBots();
  const i = bots.findIndex((b) => b.number === number);
  if (i < 0) return false;
  bots.splice(i, 1);
  saveBots(bots);
  return true;
}

// ───────────────────────── CLI ─────────────────────────
function cli(argv) {
  const [cmd, a, b] = argv;
  if (cmd === 'add') {
    const r = addBotConfig(a, b);
    if (!r.ok) { console.error('❌ ' + r.error); process.exit(1); }
    console.log(`✅ Bot ${r.bot.number} ajouté (propriétaire ${r.bot.owner}).`);
    console.log('   Le code d\'appairage s\'affiche dans les logs du manager et sur le panel.');
    return true;
  }
  if (cmd === 'remove') {
    const n = inst.cleanNumber(a);
    if (!n || !removeBotConfig(n)) { console.error('❌ Bot introuvable.'); process.exit(1); }
    if (argv.includes('--purge')) { inst.deleteInstance(n); console.log(`🗑️ Bot ${n} retiré et dossier supprimé.`); }
    else console.log(`🗑️ Bot ${n} retiré (dossier instances/${n} conservé ; --purge pour le supprimer).`);
    return true;
  }
  if (cmd === 'list') {
    const bots = loadBots();
    if (!bots.length) console.log('Aucun bot. Ajoute-en un : node manager.js add <numéro>');
    for (const x of bots) console.log(`${x.enabled ? '🟢' : '⚪'} ${x.number}  owner=${x.owner}  port=${x.port}  session=${inst.hasSession(x.number) ? 'oui' : 'non'}`);
    return true;
  }
  if (cmd === 'import') {
    const n = inst.cleanNumber(a);
    const old = path.join(__dirname, 'session');
    if (!n) { console.error('❌ Usage : node manager.js import <numéro>'); process.exit(1); }
    if (!fs.existsSync(path.join(old, 'creds.json'))) { console.error('❌ Pas d\'ancienne session dans ./session'); process.exit(1); }
    const bots = loadBots();
    let bot = bots.find((x) => x.number === n);
    if (!bot) { const r = addBotConfig(n, b); if (!r.ok) { console.error('❌ ' + r.error); process.exit(1); } bot = r.bot; }
    const dir = inst.ensureInstance(bot);
    fs.rmSync(path.join(dir, 'session'), { recursive: true, force: true });
    fs.cpSync(old, path.join(dir, 'session'), { recursive: true });
    // reprend aussi les données de l'ancien bot unique
    fs.rmSync(path.join(dir, 'data'), { recursive: true, force: true });
    fs.cpSync(path.join(__dirname, 'data'), path.join(dir, 'data'), { recursive: true });
    inst.setOwner(n, bot.owner);
    console.log(`✅ Ancienne session + données importées dans instances/${n}.`);
    return true;
  }
  if (cmd && cmd !== 'start') {
    console.log('Usage : node manager.js [start | add <num> [owner] | remove <num> [--purge] | list | import <num> [owner]]');
    process.exit(1);
  }
  return false;
}

// ───────────────────────── Supervision ─────────────────────────
const LOG_LINES = 300;
const LOG_MAX_BYTES = 5 * 1024 * 1024;
const runtime = new Map(); // number -> état vivant

function rt(number) {
  if (!runtime.has(number)) {
    runtime.set(number, {
      child: null, status: 'stopped', code: null, codeAt: null, jid: null,
      startedAt: null, restarts: 0, backoff: 2000, logs: [], timer: null, wantRunning: false,
    });
  }
  return runtime.get(number);
}

// Bot logs: kept in memory for the panel and written to bot.log in batches
// (async, every 2 s). Writing each line synchronously blocked the manager — and
// with it the website — when many bots were logging.
const logQueue = new Map(); // number -> [lines]
function pushLog(number, line) {
  const r = rt(number);
  const clean = line.replace(/\x1b\[[0-9;]*m/g, '');
  r.logs.push(clean);
  if (r.logs.length > LOG_LINES) r.logs.splice(0, r.logs.length - LOG_LINES);
  let q = logQueue.get(number);
  if (!q) { q = []; logQueue.set(number, q); }
  if (q.length < 2000) q.push(`[${new Date().toISOString()}] ${clean}\n`);
}
let flushing = false;
setInterval(async () => {
  if (flushing) return;
  flushing = true;
  try {
    for (const [number, q] of [...logQueue]) {
      if (!q.length) continue;
      logQueue.set(number, []);
      const f = path.join(inst.instanceDir(number), 'bot.log');
      try {
        const st = await fs.promises.stat(f).catch(() => null);
        if (st && st.size > LOG_MAX_BYTES) await fs.promises.rename(f, f + '.1').catch(() => {});
        await fs.promises.appendFile(f, q.join(''));
      } catch (_) {}
    }
  } finally { flushing = false; }
}, 2000).unref();

function parseEnv(txt) {
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, '');
    out[m[1]] = v;
  }
  return out;
}

function childEnv(bot) {
  const env = { ...process.env };
  for (const k of PER_BOT_VARS) delete env[k];
  // .env propre au bot (facultatif) : instances/<num>/.env
  try {
    Object.assign(env, parseEnv(fs.readFileSync(path.join(inst.instanceDir(bot.number), '.env'), 'utf8')));
  } catch (_) {}
  Object.assign(env, bot.env || {});
  env.DEMON_MANAGED = '1';
  env.BOT_ID = bot.number;
  env.PAIRING_NUMBER = bot.number;
  env.PORT = String(bot.port);
  if (BOT_MAX_RAM_MB && !env.MAX_RAM_MB) env.MAX_RAM_MB = BOT_MAX_RAM_MB;
  return env;
}

function startBot(bot) {
  const r = rt(bot.number);
  r.wantRunning = true;
  // Fresh attempt: clear any previous permanent/crash state so a retry works.
  r.permanentError = null;
  r.fastCrashes = 0;
  r.backoff = r.backoff || 2000;
  if (r.child) return;
  clearTimeout(r.timer);
  try { inst.ensureInstance(bot); } catch (e) {
    r.status = 'error'; pushLog(bot.number, '[manager] préparation impossible : ' + e.message);
    return;
  }
  const dir = inst.instanceDir(bot.number);
  const args = ['--preserve-symlinks', '--preserve-symlinks-main', ...BOT_NODE_ARGS, ...(bot.nodeArgs || []), 'index.js'];
  const child = spawn(process.execPath, args, { cwd: dir, env: childEnv(bot), stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  r.child = child;
  r.status = inst.hasSession(bot.number) ? 'starting' : 'pairing';
  r.code = null; r.codeAt = null; r.jid = null;
  r.startedAt = Date.now();
  pushLog(bot.number, `[manager] démarrage (pid ${child.pid})`);

  const onData = (buf) => {
    for (const line of String(buf).split(/\r?\n/)) if (line.trim()) {
      pushLog(bot.number, line);
      if (process.env.MANAGER_VERBOSE === '1') console.log(`[${bot.number}] ${line}`);
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);

  child.on('message', (msg) => {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'pairing-code') {
      r.code = msg.code; r.codeAt = Date.now(); r.status = 'pairing';
      console.log(`🔑 [${bot.number}] Code d'appairage : ${msg.code}`);
    } else if (msg.type === 'pair-request') {
      pairFromBot(bot.number, msg);
    } else if (msg.type === 'chreact-request') {
      channelReactAll(bot.number, msg);
    } else if (msg.type === 'chreact-done') {
      const job = reactJobs.get(msg.id);
      if (job) job.done(!!msg.ok);
    } else if (msg.type === 'status') {
      r.status = msg.status;
      if (msg.status === 'connected') {
        r.code = null; r.jid = msg.jid || null; r.backoff = 2000;
        console.log(`✅ [${bot.number}] connecté`);
      }
      if (msg.status === 'logged-out') {
        // Unlinked by the user: stop it (no endless new pairing codes). Re-pair from the site.
        console.log(`⚠️ [${bot.number}] logged out — stopped.`);
        updateBotConfig(bot.number, { enabled: false });
        setTimeout(() => stopBot(bot.number).then(() => { r.status = 'logged-out'; }), 1000);
      }
      if (msg.status === 'invalid-number') {
        // Permanent failure: stop this bot, don't crash-loop it.
        r.permanentError = 'invalid-number';
        r.wantRunning = false;
        console.log(`⛔ [${bot.number}] numéro invalide — bot arrêté (pas de redémarrage).`);
      }
    }
  });

  child.on('exit', (code, signal) => {
    r.child = null;
    pushLog(bot.number, `[manager] process terminé (code ${code}, signal ${signal || '-'})`);
    if (r.permanentError) { r.status = r.permanentError; r.wantRunning = false; return; }
    if (!r.wantRunning) { r.status = 'stopped'; return; }
    const ranFor = Date.now() - (r.startedAt || 0);
    // Crash-loop guard: if the bot keeps dying within a few seconds of starting,
    // it's broken (bad session, missing dep, OOM). Stop after N fast crashes and
    // surface it instead of restarting forever.
    if (ranFor < 12000) r.fastCrashes = (r.fastCrashes || 0) + 1;
    else { r.fastCrashes = 0; r.backoff = 2000; }
    if (r.fastCrashes >= 5) {
      r.status = 'crashed';
      r.wantRunning = false;
      pushLog(bot.number, `[manager] trop de crashs rapides — bot arrêté. Voir le log ci-dessus pour la cause.`);
      console.log(`⛔ [${bot.number}] crash en boucle — arrêté. Vérifie son log (panel ou instances/${bot.number}/bot.log).`);
      return;
    }
    r.restarts++;
    r.status = 'restarting';
    const wait = r.backoff;
    r.backoff = Math.min(r.backoff * 2, 60000);
    pushLog(bot.number, `[manager] redémarrage dans ${Math.round(wait / 1000)}s`);
    r.timer = setTimeout(() => {
      const fresh = loadBots().find((b) => b.number === bot.number);
      if (fresh && fresh.enabled && r.wantRunning) startBot(fresh);
      else r.status = 'stopped';
    }, wait);
  });
}

// Pairing that is never finished: stop the process after PAIR_TIMEOUT_MIN (default 4)
// so abandoned requests from the website do not pile up and overload the server.
const PAIR_TIMEOUT_MS = (parseFloat(process.env.PAIR_TIMEOUT_MIN || '4') || 4) * 60000;
setInterval(() => {
  for (const [number, r] of runtime) {
    if (!r.child || r.status === 'connected') continue;
    if (inst.hasSession(number)) continue;
    if (Date.now() - (r.startedAt || Date.now()) < PAIR_TIMEOUT_MS) continue;
    pushLog(number, '[manager] pairing not finished in time — stopped');
    updateBotConfig(number, { enabled: false });
    stopBot(number).then(() => { r.status = 'expired'; r.code = null; });
  }
}, 30000).unref();

// .channelreact — every connected bot (of every server) reacts to one channel post.
const reactJobs = new Map();
function reactLocal(req) {
  return new Promise((resolve) => {
    const targets = [...runtime.entries()].filter(([, x]) => x.child && x.status === 'connected');
    if (!targets.length) return resolve({ ok: 0, total: 0 });
    const emojis = Array.isArray(req.emojis) && req.emojis.length ? req.emojis : ['❤️'];
    const id = req.id || Date.now().toString(36);
    let ok = 0, left = targets.length, finished = false;
    const finish = () => { if (finished) return; finished = true; resolve({ ok, total: targets.length }); };
    const timer = setTimeout(finish, 150000);
    targets.forEach(([num, x], i) => {
      const sub = id + ':' + num;
      reactJobs.set(sub, {
        done: (good) => {
          if (!reactJobs.delete(sub)) return;
          if (good) ok++;
          if (--left === 0) { clearTimeout(timer); finish(); }
        },
      });
      setTimeout(() => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        try { x.child.send({ type: 'chreact-do', id: sub, jid: req.jid, postId: req.postId, emoji }); }
        catch (_) { const j = reactJobs.get(sub); if (j) j.done(false); }
      }, i * 400);
    });
  });
}
async function channelReactAll(fromNumber, req) {
  const jobs = [reactLocal(req)];
  for (const base of PEERS) {
    jobs.push(peerFetch(base, '/peer/chreact', { method: 'POST', body: JSON.stringify({ jid: req.jid, postId: req.postId, emojis: req.emojis, id: req.id }), timeout: 160000 })
      .then((r) => ({ ok: Number(r.body.reacted) || 0, total: Number(r.body.total) || 0 })).catch(() => ({ ok: 0, total: 0 })));
  }
  const parts = await Promise.all(jobs);
  const ok = parts.reduce((x, y) => x + (Number(y.ok) || 0), 0);
  const total = parts.reduce((x, y) => x + (Number(y.total) || 0), 0);
  const from = runtime.get(fromNumber);
  try { if (from && from.child) from.child.send({ type: 'chreact-result', id: req.id, ok, total }); } catch (_) {}
  console.log(`📢 [${fromNumber}] channel react → ${ok}/${total} bot(s)`);
}

function stopBot(number) {
  const r = rt(number);
  r.wantRunning = false;
  clearTimeout(r.timer);
  if (!r.child) { r.status = 'stopped'; return Promise.resolve(); }
  return new Promise((resolve) => {
    const c = r.child;
    const kill = setTimeout(() => { try { c.kill('SIGKILL'); } catch (_) {} }, 8000);
    c.once('exit', () => { clearTimeout(kill); resolve(); });
    try { c.kill('SIGTERM'); } catch (_) { resolve(); }
  });
}

async function restartBot(number) {
  await stopBot(number);
  const bot = loadBots().find((b) => b.number === number);
  if (bot && bot.enabled) startBot(bot);
}

/** Fait correspondre les process lancés avec bots.json. */
async function reconcile() {
  const bots = loadBots();
  const wanted = new Set(bots.filter((b) => b.enabled).map((b) => b.number));
  // Start only bots that are linked (have a session). A number that never finished
  // pairing is not started again: it would just sit there using CPU/RAM.
  // Starts are spread out (one every 1.5 s) so a restart does not freeze the server.
  let delayMs = 0;
  for (const b of bots) {
    if (!b.enabled) continue;
    const r = rt(b.number);
    if (r.child || r.timer && r.wantRunning) continue;
    if (!inst.hasSession(b.number)) { updateBotConfig(b.number, { enabled: false }); r.status = 'expired'; continue; }
    r.wantRunning = true;
    r.timer = setTimeout(() => { const fresh = loadBots().find((x) => x.number === b.number); if (fresh && fresh.enabled) startBot(fresh); }, delayMs);
    delayMs += 1500;
  }
  for (const [number, r] of runtime) {
    if (!wanted.has(number) && (r.child || r.wantRunning)) await stopBot(number);
    if (!bots.find((b) => b.number === number) && !r.child) runtime.delete(number);
  }
}

function rssMb(pid) {
  try {
    const m = fs.readFileSync(`/proc/${pid}/status`, 'utf8').match(/VmRSS:\s+(\d+)/);
    return m ? Math.round(parseInt(m[1], 10) / 1024) : null;
  } catch (_) { return null; }
}

function botView(b) {
  const r = rt(b.number);
  return {
    number: b.number, owner: b.owner, enabled: b.enabled, port: b.port, label: b.label || '',
    status: r.status, code: r.code, codeAt: r.codeAt, jid: r.jid,
    pid: r.child ? r.child.pid : null, ramMb: r.child ? rssMb(r.child.pid) : null,
    uptime: r.child && r.startedAt ? Date.now() - r.startedAt : 0,
    restarts: r.restarts, hasSession: inst.hasSession(b.number),
  };
}

// ───────────────────────── Panel web ─────────────────────────
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function isAdmin(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [, pass = ''] = Buffer.from(h.slice(6), 'base64').toString().split(/:(.*)/s);
  const a = Buffer.from(pass), bb = Buffer.from(ADMIN_PASSWORD);
  return a.length === bb.length && crypto.timingSafeEqual(a, bb);
}

// Public pages from memory (read once per minute at most): instant answer.
const staticCache = new Map();
function sendStatic(res, name, type, maxAge) {
  let e = staticCache.get(name);
  if (!e || Date.now() - e.t > 60000) {
    try { e = { body: fs.readFileSync(path.join(__dirname, 'manager', name)), t: Date.now() }; staticCache.set(name, e); }
    catch (_) { res.writeHead(404); return res.end(); }
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': e.body.length, 'Cache-Control': `public, max-age=${maxAge}` });
  res.end(e.body);
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => { d += c; if (d.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (_) { resolve({}); } });
  });
}

// anti-abus pour l'appairage public : 3 demandes / 10 min / IP
// Anti-abuse for NEW bot creation only. Each bot is an independent process;
// re-requesting a code for a bot that already exists is always free, so a
// failing/testing bot never blocks another number. 0 = unlimited.
const PAIR_RATE_MAX = parseInt(process.env.PAIR_RATE_MAX || '20', 10);
const PAIR_RATE_WINDOW = parseInt(process.env.PAIR_RATE_WINDOW_MS || '600000', 10);
const pairHits = new Map();
function newBotLimited(ip) {
  if (PAIR_RATE_MAX <= 0) return false;
  const now = Date.now();
  const arr = (pairHits.get(ip) || []).filter((t) => now - t < PAIR_RATE_WINDOW);
  pairHits.set(ip, arr);
  return arr.length >= PAIR_RATE_MAX;
}
function recordNewBot(ip) {
  const arr = pairHits.get(ip) || [];
  arr.push(Date.now());
  pairHits.set(ip, arr);
}

// Start (or restart) the bot of a number so it produces a pairing code.
function requestPairing(number, ip, source) {
  const n = inst.cleanNumber(number);
  if (!n) return { http: 400, body: { ok: false, error: 'Invalid number.' } };
  // Existing bot: re-requesting its code is always free (never rate-limited),
  // so each bot stays independent — one bot never blocks another.
  const existing = loadBots().find((b) => b.number === n);
  if (existing) {
    if (inst.hasSession(n) && rt(n).status === 'connected') return { http: 409, body: { ok: false, error: 'This number already has a connected bot.' } };
    if (!existing.enabled) updateBotConfig(n, { enabled: true });
    if (!rt(n).child) startBot(loadBots().find((b) => b.number === n));
    return { http: 200, body: { ok: true, number: n } };
  }
  // New bot: the only rate-limited path (anti-abuse). Counts only on success.
  if (newBotLimited(ip)) return { http: 429, body: { ok: false, error: 'Too many new bots. Try again in a few minutes.' } };
  const r = addBotConfig(n, n, { source });
  if (!r.ok) return { http: 400, body: r };
  recordNewBot(ip);
  startBot(r.bot);
  return { http: 200, body: { ok: true, number: n } };
}

// .pair inside WhatsApp: a bot asks the manager for the code of a number.
async function pairFromBot(fromNumber, req) {
  const answer = (body) => {
    const from = runtime.get(fromNumber);
    try { if (from && from.child) from.child.send({ type: 'pair-result', id: req.id, ...body }); } catch (_) {}
  };
  // A bot already waiting for its code: restart it so a fresh code is made.
  const pre = inst.cleanNumber(req.number);
  if (pre && pre !== fromNumber && rt(pre).child && rt(pre).status !== 'connected') await stopBot(pre);
  const r = requestPairing(req.number, 'bot:' + fromNumber, 'whatsapp');
  if (!r.body.ok) return answer({ ok: false, error: r.body.error });
  const n = r.body.number;
  const started = Date.now();
  const tick = setInterval(() => {
    const x = rt(n);
    if (x.code) { clearInterval(tick); return answer({ ok: true, code: x.code }); }
    if (x.status === 'invalid-number') { clearInterval(tick); return answer({ ok: false, error: 'invalid-number' }); }
    if (x.status === 'connected') { clearInterval(tick); return answer({ ok: false, error: 'This number already has a connected bot.' }); }
    if (Date.now() - started > 60000) { clearInterval(tick); answer({ ok: false, error: 'timeout' }); }
  }, 1000);
}

const PANEL_HTML = path.join(__dirname, 'manager', 'panel.html');
const PAIR_HTML = path.join(__dirname, 'manager', 'pair.html');

// ───────────── Several servers, one website (load balancing) ─────────────
// PEERS=http://127.0.0.1:5001,... on the server that hosts the website. New
// numbers go to the server with the fewest linked bots; a number that already
// exists stays on its server. PEER_KEY (same on all servers) protects the
// internal calls.
const PEERS = String(process.env.PEERS || '').split(',').map((x) => x.trim().replace(/\/+$/, '')).filter(Boolean);
const PEER_KEY = process.env.PEER_KEY || '';
const peerOf = new Map(); // number -> peer url (where it lives)
const isPeerCall = (req) => PEER_KEY && req.headers['x-peer-key'] === PEER_KEY;
async function peerFetch(base, pathAndQuery, opts = {}) {
  const r = await fetch(base + pathAndQuery, {
    ...opts,
    headers: { 'content-type': 'application/json', 'x-peer-key': PEER_KEY, ...(opts.headers || {}) },
    signal: AbortSignal.timeout(opts.timeout || 4000),
  });
  let body = {};
  try { body = await r.json(); } catch (_) {}
  return { status: r.status, body };
}
function localStats() {
  const bots = loadBots();
  return {
    active: bots.filter((b) => rt(b.number).status === 'connected').length,
    linked: bots.filter((b) => inst.hasSession(b.number)).length,
    total: bots.length,
  };
}
async function findPeerFor(n) {
  if (peerOf.has(n)) return peerOf.get(n);
  for (const base of PEERS) {
    try { const r = await peerFetch(base, '/pair/status?local=1&number=' + n, { timeout: 2500 }); if (r.status === 200) { peerOf.set(n, base); return base; } } catch (_) {}
  }
  return null;
}
async function pickServer(n) {
  if (loadBots().some((b) => b.number === n)) return null; // already here
  const there = await findPeerFor(n);
  if (there) return there;
  let best = null, bestLinked = localStats().linked;
  for (const base of PEERS) {
    try {
      const r = await peerFetch(base, '/pair/stats?local=1', { timeout: 2500 });
      if (r.status === 200 && typeof r.body.linked === 'number' && r.body.linked < bestLinked) { best = base; bestLinked = r.body.linked; }
    } catch (_) { /* peer down: skip it */ }
  }
  return best; // null = this server
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  // ── routes publiques ──
  if (p === '/health') return send(res, 200, { ok: true, bots: loadBots().length });
  // Public site: the home page of the domain (akuma.skyhost.tech) is the pairing page.
  if (p === '/robots.txt') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('User-agent: *\nAllow: /\n'); }
  if (p === '/health') return send(res, 200, { ok: true, uptime: Math.round(process.uptime()) });
  if (PUBLIC_PAIRING && (p === '/' || p === '/pair') && req.method === 'GET') return sendStatic(res, 'pair.html', 'text/html; charset=utf-8', 60);
  if (p === '/bot.jpg' && req.method === 'GET') return sendStatic(res, 'bot.jpg', 'image/jpeg', 86400 * 7);
  if (PUBLIC_PAIRING && p === '/pair' && req.method === 'POST') {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const { number } = await readBody(req);
    if (PEERS.length && !isPeerCall(req)) {
      const n = inst.cleanNumber(number);
      if (!n) return send(res, 400, { ok: false, error: 'Invalid number.' });
      const target = await pickServer(n);
      if (target) {
        try {
          const r = await peerFetch(target, '/pair', { method: 'POST', body: JSON.stringify({ number: n }), headers: { 'x-forwarded-for': ip }, timeout: 15000 });
          if (r.body && r.body.ok) peerOf.set(n, target);
          return send(res, r.status, r.body);
        } catch (_) { /* peer down: take it here */ }
      }
    }
    const r = requestPairing(number, ip, 'public');
    return send(res, r.http, r.body);
  }
  if (PUBLIC_PAIRING && p === '/pair/stats') {
    const st = localStats();
    if (url.searchParams.get('local') === '1' || !PEERS.length) return send(res, 200, { ok: true, ...st });
    const servers = [{ server: 1, ...st }];
    let i = 1;
    for (const base of PEERS) {
      i++;
      try { const r = await peerFetch(base, '/pair/stats?local=1', { timeout: 2500 }); if (r.status === 200) servers.push({ server: i, active: r.body.active, linked: r.body.linked, total: r.body.total }); }
      catch (_) { servers.push({ server: i, down: true }); }
    }
    const sum = (k) => servers.reduce((a, x) => a + (x[k] || 0), 0);
    return send(res, 200, { ok: true, active: sum('active'), linked: sum('linked'), total: sum('total'), servers });
  }
  if (p === '/peer/chreact' && req.method === 'POST') {
    if (!isPeerCall(req)) return send(res, 403, { ok: false });
    const body = await readBody(req);
    const r = await reactLocal(body);
    return send(res, 200, { ok: true, reacted: r.ok, total: r.total });
  }
  if (PUBLIC_PAIRING && p === '/pair/status') {
    const n = inst.cleanNumber(url.searchParams.get('number'));
    const b = n && loadBots().find((x) => x.number === n);
    if (!b && n && PEERS.length && url.searchParams.get('local') !== '1') {
      const base = await findPeerFor(n);
      if (base) { try { const r = await peerFetch(base, '/pair/status?local=1&number=' + n); return send(res, r.status, r.body); } catch (_) {} }
    }
    if (!b) return send(res, 404, { ok: false });
    const v = botView(b);
    return send(res, 200, { ok: true, status: v.status, code: v.code });
  }

  // ── tout le reste : admin ──
  if (!isAdmin(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="QUEEN AKUMA manager"' });
    return res.end('Authentification requise');
  }
  if (p === '/' || p === '/panel') return send(res, 200, fs.readFileSync(PANEL_HTML, 'utf8'), 'text/html'); // '/' only when public pairing is off
  if (p === '/api/bots' && req.method === 'GET') return send(res, 200, { bots: loadBots().map(botView), publicPairing: PUBLIC_PAIRING, maxBots: MAX_BOTS });
  if (p === '/api/bots' && req.method === 'POST') {
    const body = await readBody(req);
    const r = addBotConfig(body.number, body.owner, body.label ? { label: String(body.label).slice(0, 40) } : {});
    if (!r.ok) return send(res, 400, r);
    startBot(r.bot);
    return send(res, 200, { ok: true, bot: botView(r.bot) });
  }
  const m = p.match(/^\/api\/bots\/(\d{10,15})(?:\/(start|stop|restart|repair|logs|owner))?$/);
  if (m) {
    const [, number, action] = m;
    const bot = loadBots().find((b) => b.number === number);
    if (!bot) return send(res, 404, { ok: false, error: 'Bot introuvable' });
    if (!action && req.method === 'DELETE') {
      await stopBot(number);
      removeBotConfig(number);
      if (url.searchParams.get('purge') === '1') inst.deleteInstance(number);
      runtime.delete(number);
      return send(res, 200, { ok: true });
    }
    if (action === 'logs') return send(res, 200, { logs: rt(number).logs });
    if (req.method !== 'POST') return send(res, 405, { ok: false });
    if (action === 'start') { updateBotConfig(number, { enabled: true }); startBot({ ...bot, enabled: true }); }
    if (action === 'stop') { updateBotConfig(number, { enabled: false }); await stopBot(number); }
    if (action === 'restart') await restartBot(number);
    if (action === 'repair') {
      await stopBot(number);
      inst.resetSession(number);
      updateBotConfig(number, { enabled: true });
      startBot({ ...bot, enabled: true });
    }
    if (action === 'owner') {
      const body = await readBody(req);
      const o = inst.cleanNumber(body.owner);
      if (!o) return send(res, 400, { ok: false, error: 'Numéro invalide' });
      updateBotConfig(number, { owner: o });
      inst.ensureInstance({ ...bot, owner: o });
      inst.setOwner(number, o);
      await restartBot(number);
    }
    return send(res, 200, { ok: true, bot: botView(loadBots().find((b) => b.number === number)) });
  }
  send(res, 404, { ok: false, error: 'Not found' });
}

// ───────────────────────── Lancement ─────────────────────────
function main() {
  if (cli(process.argv.slice(2))) return;

  if (!ADMIN_PASSWORD) {
    ADMIN_PASSWORD = crypto.randomBytes(6).toString('hex');
    console.log(`🔐 ADMIN_PASSWORD non défini — mot de passe temporaire du panel : ${ADMIN_PASSWORD}`);
  }
  fs.mkdirSync(inst.INSTANCES, { recursive: true });
  if (!fs.existsSync(BOTS_FILE)) saveBots([]);

  const server = http.createServer((req, res) => {
    handle(req, res).catch((e) => { try { send(res, 500, { ok: false, error: e.message }); } catch (_) {} });
  });
  server.listen(PANEL_PORT, () => {
    console.log(`🌐 Panel multi-session : http://localhost:${PANEL_PORT}/  (utilisateur : n'importe lequel, mot de passe : ADMIN_PASSWORD)`);
    if (PUBLIC_PAIRING) console.log(`🔓 Appairage public : http://localhost:${PANEL_PORT}/pair`);
  });

  // Build / refresh the shared command index once, before the bots start: then
  // every bot starts with lazy commands (much less RAM per bot).
  try {
    const t = Date.now();
    require('child_process').spawnSync(process.execPath, ['-e', "require('./lib/commandHandler').loadCommands()"], { cwd: __dirname, timeout: 180000, stdio: 'ignore', env: { ...process.env, DEMON_MANAGED: '' } });
    console.log(`🗂️  command index ready (${Date.now() - t} ms)`);
  } catch (e) { console.log('command index: ' + e.message); }

  reconcile();
  const n = loadBots().length;
  console.log(n ? `🤖 ${n} bot(s) configuré(s).` : '🤖 Aucun bot. Ajoute-en un depuis le panel ou : node manager.js add <numéro>');

  // bots.json modifié à la main ou via la CLI → on applique
  let t = null;
  fs.watchFile(BOTS_FILE, { interval: 2000 }, () => { clearTimeout(t); t = setTimeout(() => reconcile(), 500); });

  const shutdown = async () => {
    console.log('Arrêt de tous les bots...');
    fs.unwatchFile(BOTS_FILE);
    await Promise.all([...runtime.keys()].map((k) => stopBot(k)));
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
