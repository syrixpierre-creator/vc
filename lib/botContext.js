'use strict';
/**
 * QUEEN AKUMA — HUB MODE: every bot runs inside ONE Node process (like INCONNU XD).
 *
 * The bot code was written for "one process = one bot": it reads/writes ./data,
 * ./session, baileys_store.*, reads process.env.OWNER_NUMBER, calls process.exit…
 * Instead of rewriting ~1000 commands, each bot runs inside its own *context*
 * (AsyncLocalStorage). While code runs for a bot:
 *   - file paths of the bot's private files (data/, session/, temp/, store files…)
 *     are redirected to instances/<number>/…            (fs is patched once)
 *   - process.env shows the bot's own variables (OWNER_NUMBER, PAIRING_NUMBER…)
 *   - timers are remembered, so stopping a bot clears them
 *   - process.exit() stops THAT bot only, never the whole hub
 *   - process.send / 'message' go through an in-process channel to the manager
 * Outside any bot context everything behaves normally.
 */
const fs = require('fs');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');
const { EventEmitter } = require('events');
const { fileURLToPath } = require('url');

const ROOT = path.resolve(__dirname, '..');
const als = new AsyncLocalStorage();
const HUB = process.env.HUB_MODE === '1';

// top-level names that belong to each bot (same list as manager/instances.js PRIVATE)
const PRIVATE_TOP = new Set(['data', 'session', 'temp', 'tmp', 'baileys_store.json', 'eplugins', 'logs', 'bot.log', 'manager.pid']);
const isDbFile = (name) => /\.(db|sqlite3?)(-wal|-shm|-journal)?$/i.test(name);

function current() { return als.getStore() || null; }
function run(ctx, fn) { return als.run(ctx, fn); }
function exitSession() { return als.exit.bind(als); }

/** Map a path of the code folder to the current bot's folder when it is a private file. */
function mapPath(p) {
  const c = als.getStore();
  if (!c || !c.dir || p == null) return p;
  let s;
  if (typeof p === 'string') s = p;
  else if (p instanceof URL) { if (p.protocol !== 'file:') return p; s = fileURLToPath(p); }
  else if (Buffer.isBuffer(p)) s = p.toString();
  else return p;
  const abs = path.resolve(s);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return p;
  const rel = abs.slice(ROOT.length + 1);
  if (!rel) return p;
  const top = rel.split(path.sep)[0];
  if (top === 'instances') return p;
  if (PRIVATE_TOP.has(top) || isDbFile(top)) return path.join(c.dir, rel);
  return p;
}

// ───────────── install (hub only, once) ─────────────
let installed = false;
class SessionExit extends Error { constructor(code) { super('session exit ' + code); this.sessionExit = true; this.code = code; } }

function patchFs() {
  const one = ['access', 'appendFile', 'chmod', 'chown', 'createReadStream', 'createWriteStream', 'exists', 'lchown', 'lstat',
    'mkdir', 'mkdtemp', 'open', 'opendir', 'readdir', 'readFile', 'readlink', 'realpath', 'rm', 'rmdir', 'stat', 'statfs', 'truncate',
    'unlink', 'utimes', 'watch', 'watchFile', 'unwatchFile', 'writeFile'];
  const two = ['copyFile', 'cp', 'link', 'rename', 'symlink'];
  const wrap1 = (obj, name) => {
    const orig = obj[name];
    if (typeof orig !== 'function' || orig.__hub) return;
    const f = function (p, ...rest) { return orig.call(this, mapPath(p), ...rest); };
    Object.assign(f, orig); f.__hub = true;
    if (orig.native) f.native = function (p, ...rest) { return orig.native.call(this, mapPath(p), ...rest); };
    obj[name] = f;
  };
  const wrap2 = (obj, name) => {
    const orig = obj[name];
    if (typeof orig !== 'function' || orig.__hub) return;
    const f = function (a, b, ...rest) { return orig.call(this, mapPath(a), mapPath(b), ...rest); };
    f.__hub = true;
    obj[name] = f;
  };
  for (const n of one) { wrap1(fs, n); wrap1(fs, n + 'Sync'); if (fs.promises) wrap1(fs.promises, n); }
  for (const n of two) { wrap2(fs, n); wrap2(fs, n + 'Sync'); if (fs.promises) wrap2(fs.promises, n); }
  // existsSync has no async twin in the list above
  wrap1(fs, 'existsSync');
}

function patchEnv() {
  const base = process.env;
  const proxy = new Proxy(base, {
    get(t, k) { const c = als.getStore(); if (c && c.env && typeof k === 'string' && Object.prototype.hasOwnProperty.call(c.env, k)) return c.env[k]; return t[k]; },
    set(t, k, v) { const c = als.getStore(); if (c && c.env) { c.env[k] = String(v); return true; } t[k] = String(v); return true; },
    has(t, k) { const c = als.getStore(); return (c && c.env && k in c.env) || k in t; },
    deleteProperty(t, k) { const c = als.getStore(); if (c && c.env && k in c.env) { delete c.env[k]; return true; } delete t[k]; return true; },
    ownKeys(t) { const c = als.getStore(); const keys = new Set(Reflect.ownKeys(t)); if (c && c.env) for (const k of Object.keys(c.env)) keys.add(k); return [...keys]; },
    getOwnPropertyDescriptor(t, k) {
      const c = als.getStore();
      if (c && c.env && Object.prototype.hasOwnProperty.call(c.env, k)) return { value: c.env[k], writable: true, enumerable: true, configurable: true };
      return Reflect.getOwnPropertyDescriptor(t, k);
    },
  });
  process.env = proxy;
}

function patchTimers() {
  const origI = global.setInterval, origT = global.setTimeout;
  global.setInterval = function (...args) {
    const h = origI.apply(this, args);
    const c = als.getStore();
    if (c && c.timers && !c.stopped) c.timers.add({ h, kind: 'i' });
    return h;
  };
  global.setTimeout = function (fn, ...rest) {
    const c = als.getStore();
    if (!c || !c.timers || typeof fn !== 'function') return origT.call(this, fn, ...rest);
    if (c.stopped) return origT.call(this, () => {}, 0); // stopped bot: nothing runs any more
    const entry = { h: null, kind: 't' };
    entry.h = origT.call(this, (...a) => { c.timers.delete(entry); return fn(...a); }, ...rest);
    c.timers.add(entry);
    return entry.h;
  };
}

function patchProcess() {
  const realExit = process.exit.bind(process);
  process.exit = function (code) {
    const c = als.getStore();
    if (c && c.stop) { c.stop(code == null ? 0 : code); throw new SessionExit(code); }
    return realExit(code);
  };
  // process.send / process.on('message'|'disconnect') inside a bot -> its own channel
  const realOn = process.on.bind(process);
  process.on = function (ev, fn) {
    const c = als.getStore();
    if (c && c.ipc && (ev === 'message' || ev === 'disconnect')) { c.ipc.on(ev, fn); return process; }
    // signal / crash handlers registered by each bot copy would pile up: keep the hub's own
    if (c && /^(SIGINT|SIGTERM|exit|beforeExit|uncaughtException|unhandledRejection)$/.test(ev)) return process;
    return realOn(ev, fn);
  };
  process.addListener = process.on;
  const realSend = process.send;
  Object.defineProperty(process, 'send', {
    configurable: true,
    get() {
      const c = als.getStore();
      if (c && c.ipc) return (msg) => { c.ipc.emit('to-manager', msg); return true; };
      return realSend;
    },
    set(v) { /* keep ours */ },
  });
  realOn('uncaughtException', (e) => { if (e && e.sessionExit) return; console.error('[hub] uncaught:', e && (e.stack || e.message || e)); });
  realOn('unhandledRejection', (e) => { if (e && e.sessionExit) return; console.error('[hub] unhandled:', e && (e.message || e)); });
}

// console output of a bot goes to that bot's log (panel / bot.log), not to the
// hub output (100 bots printing everything is what flooded the logs before)
function patchConsole() {
  const util = require('util');
  for (const m of ['log', 'info', 'warn', 'error', 'debug']) {
    const orig = console[m].bind(console);
    console[m] = (...a) => {
      const c = als.getStore();
      if (c && c.log) { try { c.log(util.format(...a)); } catch (_) {} return; }
      orig(...a);
    };
  }
}

// Each bot gets its OWN copy of the bot's code modules (lib/, command/, index.js,
// settings.js…): their in-memory state (caches, flags, loaded JSON) can never mix
// between bots. npm packages (Baileys, axios…) — the heavy part — stay shared:
// they are loaded once for all bots, which is where the RAM is saved.
function patchModules() {
  const Module = require('module');
  const SELF = __filename;
  const origLoad = Module._load;
  const scoped = (f) => typeof f === 'string' && f.startsWith(ROOT + path.sep) && f !== SELF
    && !f.includes(path.sep + 'node_modules' + path.sep)
    && !f.startsWith(path.join(ROOT, 'manager') + path.sep) && f !== path.join(ROOT, 'manager.js');
  Module._load = function (request, parent, isMain) {
    const c = als.getStore();
    if (!c || !c.modules) return origLoad.apply(this, arguments);
    let filename;
    try { filename = Module._resolveFilename(request, parent, isMain); } catch (_) { return origLoad.apply(this, arguments); }
    if (!scoped(filename)) return origLoad.apply(this, arguments);
    const hit = c.modules.get(filename);
    if (hit) return hit.exports;
    const m = new Module(filename, parent);
    m.filename = filename;
    m.paths = Module._nodeModulePaths(path.dirname(filename));
    c.modules.set(filename, m);
    let ok = false;
    try { m.load(filename); m.loaded = true; ok = true; } finally { if (!ok) c.modules.delete(filename); }
    return m.exports;
  };
}

function install() {
  if (installed || !HUB) return;
  installed = true;
  patchModules();
  patchConsole();
  patchFs();
  patchEnv();
  patchTimers();
  patchProcess();
}

/**
 * Create a bot context. opts: { number, dir, env }.
 * The returned ctx is an EventEmitter-like host for the manager:
 *   ctx.ipc 'to-manager' events  = what the bot sends to the manager
 *   ctx.deliver(msg)             = manager -> bot ('message')
 *   ctx.stop(code)               = stop this bot (timers cleared, socket closed)
 */
function createContext({ number, dir, env }) {
  const ipc = new EventEmitter();
  ipc.setMaxListeners(100);
  const ctx = {
    number, dir, env: { ...(env || {}) }, ipc, timers: new Set(), stopped: false,
    sockets: new Set(), store: null, settings: null, data: {}, modules: new Map(),
    deliver(msg) { als.run(ctx, () => ipc.emit('message', msg)); },
    stop(code) {
      if (ctx.stopped) return;
      ctx.stopped = true;
      for (const t of ctx.timers) { try { t.kind === 'i' ? clearInterval(t.h) : clearTimeout(t.h); } catch (_) {} }
      ctx.timers.clear();
      for (const s of ctx.sockets) {
        try { s.ev && s.ev.removeAllListeners && s.ev.removeAllListeners(); } catch (_) {}
        try { s.end && s.end(undefined); } catch (_) {}
        try { s.ws && s.ws.close && s.ws.close(); } catch (_) {}
      }
      ctx.sockets.clear();
      try { if (ctx.store && ctx.store.close) ctx.store.close(); } catch (_) {}
      setTimeout(() => { try { ctx.modules.clear(); } catch (_) {} }, 5000);
      try { als.run(ctx, () => ipc.emit('disconnect')); } catch (_) {}
      ipc.emit('exit', code == null ? 0 : code);
    },
  };
  return ctx;
}

module.exports = { HUB, ROOT, als, current, run, mapPath, install, createContext, SessionExit, exitSession };
