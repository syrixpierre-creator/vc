/*****************************************************************************
 *  QUEEN AKUMA • Legacy plugin compatibility layer  (MADE BY INCONNU BOY SENSEI)
 *
 *  Lets plugins written in other popular WhatsApp-bot formats run inside QUEEN AKUMA:
 *    A) handler(m, { conn, text, args, usedPrefix, command, ... })      (Baileys-MD style)
 *    B) cmd({ pattern, alias, ... }, async (conn, mek, m, { from, reply, q, ... }))
 *
 *  Plugins are loaded LAZILY (first use) so start-up stays fast.
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const settings = require('../settings');

let baileys = {};
try { baileys = require('@whiskeysockets/baileys'); } catch {}
const { downloadMediaMessage, getContentType, jidNormalizedUser } = baileys;

// ───────────────────────── helpers ─────────────────────────
const LEGACY_DIR = path.join(__dirname, '..', 'command');
const DB_FILE = path.join(process.cwd(), 'data', 'legacy_db.json');
const names = new Map();               // jid -> pushName
const extraConn = {};                  // conn.game, conn.war ... (state used by plugins)
const loaded = new Map();              // file -> module / registrations

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const num = (jid) => String(jid || '').split(':')[0].split('@')[0];
const norm = (jid) => { try { return jidNormalizedUser(jid); } catch { return jid; } };

const parseMention = (text = '') =>
  [...String(text).matchAll(/@([0-9]{5,16})/g)].map(v => v[1] + '@s.whatsapp.net');

// ───────────────────────── global.db shim ─────────────────────────
function defaultUser(jid) {
  return {
    name: names.get(jid) || num(jid), exp: 0, limit: 9999, money: 0, health: 100, level: 0,
    role: 'Newbie', registered: true, regTime: Date.now(), warning: 0, premium: false,
    premiumTime: 0, banned: false, afk: -1, afkReason: '', lastclaim: 0, age: 18
  };
}
const defaultChat = () => ({
  isBanned: false, welcome: false, detect: false, sWelcome: '', sBye: '', antiLink: false,
  antiBadword: false, delete: false, antiSpam: false, mute: false, expired: 0
});

function autoMap(factory) {
  return new Proxy({}, {
    get(t, k) {
      if (typeof k === 'symbol' || k === 'toJSON') return t[k];
      if (!(k in t)) t[k] = factory(k);
      return t[k];
    },
    has: () => true
  });
}

function initDb() {
  if (global.db && global.db.__demon) return;
  let saved = {};
  try { saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch {}
  const users = autoMap(defaultUser), chats = autoMap(defaultChat);
  Object.assign(users, saved.users || {});
  Object.assign(chats, saved.chats || {});
  global.db = {
    __demon: true,
    data: {
      users, chats,
      settings: autoMap(() => ({ self: false, autoread: false, anticall: false })),
      stats: {}, msgs: {}, sticker: saved.sticker || {}, sewa: {}, others: saved.others || {}
    },
    write: save
  };
  setInterval(save, 60 * 1000).unref();
  process.on('exit', save);
}

let dirty = true;
function save() {
  try {
    if (!global.db || !dirty) return;
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    const d = global.db.data;
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: { ...d.users }, chats: { ...d.chats }, sticker: d.sticker, others: d.others }));
  } catch {}
}

// ───────────────────────── globals used by legacy plugins ─────────────────────────
function initGlobals() {
  const g = global;
  g.APIs = g.APIs || {};
  g.APIs.faa = process.env.FAA_API || g.APIs.faa || 'https://api-faa.my.id';
  g.APIs.deline = process.env.DELINE_API || g.APIs.deline || 'https://api.deline.web.id';
  g.APIKeys = g.APIKeys || {};
  g.wait = '⏳ Please wait...';
  g.wm = `${settings.botName} • ${settings.channelName}`;
  g.namebot = settings.botName;
  g.ownername = settings.botOwner;
  g.nomorown = settings.ownerNumber;
  g.author = settings.botOwner;
  g.stickpack = settings.packname;
  g.stickauth = settings.author;
  g.domain = settings.channelLink;
  g.thumb = g.thumb || '';
  g.apikey = g.apikey || '';
  g.opts = g.opts || { self: false, owner: [settings.ownerNumber] };
  g.fstatus = null; g.fkontak = null; g.fmeta = null;
  g.adReply = {
    contextInfo: {
      forwardingScore: 1, isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: settings.channelId, newsletterName: settings.channelName, serverMessageId: -1
      }
    }
  };
  g.rpg = { emoticon: (k) => ({ exp: '✨', money: '💵', limit: '🎫', health: '❤️', level: '📊' }[k] || '🔹') };
  g.dfail = async (type, m) => {
    const msg = {
      owner: '❌ Owner only command.', rowner: '❌ Owner only command.', group: '❌ Group only command.',
      private: '❌ Private chat only.', admin: '❌ Admins only.', botAdmin: '❌ Make the bot admin first.'
    }[type] || '❌ Not allowed.';
    try { await m.reply(msg); } catch {}
  };
  g.sleepTimer = g.sleepTimer || {};
}

// ───────────────────────── m / conn builders ─────────────────────────
function textOf(msg) {
  if (!msg) return '';
  const t = getContentType ? getContentType(msg) : Object.keys(msg)[0];
  const x = msg[t];
  if (typeof x === 'string') return x;
  return x?.text || x?.caption || x?.selectedDisplayText || '';
}

function makeQuoted(sock, chat, ci) {
  if (!ci?.quotedMessage) return null;
  const raw = {
    key: { remoteJid: chat, id: ci.stanzaId, participant: ci.participant, fromMe: num(ci.participant) === num(sock.user?.id) },
    message: ci.quotedMessage
  };
  let mtype = getContentType(raw.message);
  let msg = raw.message[mtype];
  let viewOnce = false;
  if (/^viewOnceMessage/.test(mtype) && msg?.message) {       // unwrap view-once containers
    viewOnce = true;
    const inner = msg.message;
    mtype = getContentType(inner);
    msg = inner[mtype];
  } else if (msg?.viewOnce) viewOnce = true;
  return {
    key: raw.key, id: ci.stanzaId, chat, sender: norm(ci.participant), fromMe: raw.key.fromMe,
    viewOnce, caption: msg?.caption || '', body: textOf(raw.message),
    mtype, msg, text: textOf(raw.message), mimetype: msg?.mimetype || '',
    isMedia: /image|video|audio|sticker|document/i.test(mtype),
    mentionedJid: msg?.contextInfo?.mentionedJid || [],
    download: () => downloadMediaMessage(raw, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage, logger: console }),
    delete: () => sock.sendMessage(chat, { delete: raw.key }),
    fakeObj: raw, __raw: raw
  };
}

function buildM(sock, message) {
  const chat = message.key.remoteJid;
  const isGroup = chat.endsWith('@g.us');
  const sender = norm(message.key.fromMe ? sock.user.id : (message.key.participant || chat));
  if (message.pushName) names.set(sender, message.pushName);
  const mtype = getContentType(message.message || {});
  const msg = message.message?.[mtype];
  const ci = msg?.contextInfo;
  const text = textOf(message.message);

  const m = {
    key: message.key, id: message.key.id, chat, sender, isGroup, fromMe: !!message.key.fromMe,
    pushName: message.pushName || '', name: message.pushName || num(sender),
    mtype, msg, text, body: text, mimetype: msg?.mimetype || '',
    isMedia: /image|video|audio|sticker|document/i.test(mtype || ''),
    mentionedJid: ci?.mentionedJid || [], message: message.message, messageTimestamp: message.messageTimestamp,
    quoted: makeQuoted(sock, chat, ci),
    isBaileys: false, __raw: message, fakeObj: message
  };
  m.reply = (content, to, options = {}) => {
    const payload = typeof content === 'string'
      ? { text: content, mentions: parseMention(content) }
      : (Buffer.isBuffer(content) ? { image: content } : content);
    return sock.sendMessage(to && typeof to === 'string' ? to : chat, payload, { quoted: message, ...(options || {}) });
  };
  m.download = () => downloadMediaMessage(message, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage, logger: console });
  m.react = (emoji) => sock.sendMessage(chat, { react: { text: emoji, key: message.key } });
  return m;
}

async function toBuffer(src) {
  if (Buffer.isBuffer(src)) return src;
  if (typeof src === 'string') {
    if (/^data:.*?;base64,/i.test(src)) return Buffer.from(src.split(',')[1], 'base64');
    if (/^https?:\/\//i.test(src)) {
      const r = await axios.get(src, { responseType: 'arraybuffer', timeout: 60000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      return Buffer.from(r.data);
    }
    if (fs.existsSync(src)) return fs.readFileSync(src);
  }
  return Buffer.alloc(0);
}

function buildConn(sock) {
  const unwrapQuoted = (opts) => {
    if (opts && opts.quoted) {
      const q = opts.quoted;
      if (q.__raw) return { ...opts, quoted: q.__raw };
      if (q.fakeObj) return { ...opts, quoted: q.fakeObj };
    }
    return opts;
  };

  const own = {
    sendMessage: (jid, content, options) => sock.sendMessage(jid, content, unwrapQuoted(options)),
    reply: (jid, text, quoted, options = {}) =>
      sock.sendMessage(jid, { text, mentions: parseMention(text), ...options }, unwrapQuoted({ quoted })),
    parseMention,
    getName: async (jid) => {
      jid = norm(jid);
      if (jid.endsWith('@g.us')) {
        try { return (await sock.groupMetadata(jid)).subject; } catch { return num(jid); }
      }
      return names.get(jid) || num(jid);
    },
    sendFile: async (jid, file, filename = '', caption = '', quoted, ptt = false, options = {}) => {
      const buf = await toBuffer(file);
      let mime = options.mimetype || '';
      if (!mime) {
        try { mime = (await require('file-type').fromBuffer(buf))?.mime || ''; } catch {}
      }
      const q = unwrapQuoted({ quoted });
      let content;
      if (options.asDocument) content = { document: buf, mimetype: mime || 'application/octet-stream', fileName: filename || 'file', caption };
      else if (options.asSticker || (mime === 'image/webp' && !caption)) content = { sticker: buf };
      else if (/^image\//.test(mime)) content = { image: buf, caption };
      else if (/^video\//.test(mime)) content = { video: buf, caption, gifPlayback: !!options.gifPlayback };
      else if (/^audio\//.test(mime)) content = { audio: buf, mimetype: ptt ? 'audio/ogg; codecs=opus' : (mime || 'audio/mpeg'), ptt };
      else content = { document: buf, mimetype: mime || 'application/octet-stream', fileName: filename || 'file', caption };
      return sock.sendMessage(jid, content, q);
    },
    sendSticker: (jid, buf, quoted) => sock.sendMessage(jid, { sticker: buf }, unwrapQuoted({ quoted })),
    sendText: (jid, text, quoted, options = {}) =>
      sock.sendMessage(jid, { text, ...options }, unwrapQuoted({ quoted })),
    decodeJid: (jid) => norm(jid)
  };

  return new Proxy(sock, {
    get(t, p) {
      if (p in own) return own[p];
      if (p in extraConn) return extraConn[p];
      const v = t[p];
      return typeof v === 'function' ? v.bind(t) : v;
    },
    set(t, p, v) { if (p in t) t[p] = v; else extraConn[p] = v; return true; },
    has(t, p) { return p in own || p in extraConn || p in t; }
  });
}

// ───────────────────────── registrar for cmd({pattern}) style ─────────────────────────
let capture = null;
function registrarFn(info, fn) {
  if (capture && info && typeof fn === 'function') capture.push({ info, fn });
  return fn;
}
const registrar = new Proxy(registrarFn, {
  get(t, p) {
    if (p === 'commands') return [];
    if (p === 'fakevCard' || p === 'fakeVCard') return null;
    if (p === 'cmd' || p === 'malvin' || p === 'bandah' || p === 'smd' || p === 'anony' || p === 'lite' || p === 'default') return registrarFn;
    return typeof t[p] !== 'undefined' ? t[p] : registrarFn;
  },
  apply: (t, th, a) => registrarFn(...a)
});

// ───────────────────────── common helpers some plugins import ─────────────────────────
const functions = {
  getBuffer: async (url, opts = {}) => toBuffer(url),
  fetchJson: async (url, opts = {}) => (await axios.get(url, { timeout: 60000, ...opts })).data,
  getRandom: (ext = '') => `${Math.floor(Math.random() * 10000)}${ext}`,
  sleep, runtime: (s) => {
    s = Number(s); const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), mi = Math.floor(s % 3600 / 60), se = Math.floor(s % 60);
    return `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${mi ? mi + 'm ' : ''}${se}s`;
  },
  formatp: (n) => `${(n / 1024 / 1024).toFixed(2)} MB`,
  isUrl: (u) => /https?:\/\/[^\s]+/i.test(u || ''),
  getGroupAdmins: (participants = []) => participants.filter(p => p.admin).map(p => p.id),
  h2k: (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n)),
  tiny: (t) => t, jsonformat: (o) => JSON.stringify(o, null, 2), delay: sleep
};

// ───────────────────────── loading ─────────────────────────
/**
 * Charge un fichier legacy et détecte son VRAI format (le champ family des
 * wrappers était souvent faux → la commande tombait sur le moteur de secours).
 * Retour : { style, regs, mod }
 *   style 'B'      → regs = [{ info, fn }] (cmd/malvin/lite/sam/gmd…)
 *   style 'A'      → mod = handler(m, { conn, text, … })
 *   style 'plain'  → mod = async (sock, message, args)
 *   style 'native' → mod = { command, handler } ou { commands: [...] }
 *   style 'none'   → rien d'exploitable
 */
function loadAny(file) {
  if (loaded.has(file)) return loaded.get(file);
  const full = path.join(LEGACY_DIR, file);
  if (!fs.existsSync(full)) { console.warn('[compat] legacy plugin not found:', file); const r = { style: 'none', regs: [], mod: null }; loaded.set(file, r); return r; }
  // déjà chargé au démarrage (sans capture) → on le recharge pour capturer ses cmd()
  try { delete require.cache[require.resolve(full)]; } catch (_) {}
  let mod = null, regs = [];
  capture = [];
  try { mod = require(full); }
  catch (e) { console.error('[compat] load failed', file, e && e.message); }
  finally { regs = capture; capture = null; }
  if (mod && mod.default && !regs.length) mod = mod.default;
  let style = 'none';
  if (regs.length) style = 'B';
  else if (typeof mod === 'function') style = (mod.command || mod.help || mod.tags) ? 'A' : 'plain';
  else if (mod && typeof mod === 'object' && (typeof mod.handler === 'function' || Array.isArray(mod.commands))) style = 'native';
  const r = { style, regs, mod };
  loaded.set(file, r);
  return r;
}

/** Compatibilité : ancienne API loadFile(file, family). */
function loadFile(file, family) {
  const r = loadAny(file);
  if (r.style === 'B') return r.regs;
  if (r.style === 'A' || r.style === 'plain') return r.mod;
  return family === 'B' ? [] : r.mod;
}

/** Noms qu'un handler style A accepte (regex / tableau / chaîne). */
function aMatches(h, name) {
  const c = h && h.command; if (!c) return true;
  const one = (x) => x instanceof RegExp ? x.test(name) : String(x).toLowerCase() === name;
  return Array.isArray(c) ? c.some(one) : one(c);
}

async function ctxFor(sock, message, ctx, m) {
  const chat = m.chat;
  let metadata = null, participants = [];
  if (m.isGroup) {
    try { metadata = await sock.groupMetadata(chat); participants = metadata.participants || []; } catch {}
  }
  const isOwner = !!(ctx.senderIsOwnerOrSudo || message.key.fromMe);
  return {
    isOwner, isAdmin: !!ctx.isSenderAdmin, isBotAdmin: !!ctx.isBotAdmin,
    metadata, participants,
    groupAdmins: participants.filter(p => p.admin).map(p => p.id),
    groupName: metadata?.subject || ''
  };
}

/**
 * Execute a legacy plugin.
 * meta = { file, family:'A'|'B', command, perms:{owner,rowner,group,admin,botAdmin,private} }
 */
function invokedName(ctx = {}, fallback) {
  let t = String(ctx.userMessage || ctx.rawText || '').trim();
  for (const p of settings.prefixes) if (t.startsWith(p)) { t = t.slice(p.length); break; }
  return (t.split(/\s+/)[0] || fallback || '').toLowerCase() || fallback;
}


// --- Native delegation -------------------------------------------------------------------
// Many restored wrappers (imp_*.js) point at files that are already native QUEEN AKUMA commands
// ({ command, handler }). They are not legacy plugins, so run them directly instead of the
// legacy emulation (which used to fall through to "Command available nahi hai").
let NATIVE_FILES = null;
const nativeCache = new Map();
function nativeModuleFor(file) {
  if (!NATIVE_FILES) {
    try { NATIVE_FILES = new Set(require('./compat_native.json')); } catch (_) { NATIVE_FILES = new Set(); }
  }
  if (!NATIVE_FILES.has(file)) return null;
  if (nativeCache.has(file)) return nativeCache.get(file);
  let mod = null;
  try {
    const full = path.join(LEGACY_DIR, file);
    const m = require(full);
    const d = m && m.default ? m.default : m;
    if (d && typeof d === 'object' && typeof d.handler === 'function') mod = d;
  } catch (e) {
    console.error('[compat] native load failed', file, e.message);
  }
  nativeCache.set(file, mod);
  return mod;
}

async function run(meta, sock, message, args, ctx = {}) {
  const nat = nativeModuleFor(meta.file);
  if (nat) {
    try { return await nat.handler(sock, message, args, ctx); }
    catch (e) {
      console.error('[native:' + meta.file + ']', e && e.message);
      try { await sock.sendMessage(message.key.remoteJid, { text: '❌ ' + (meta.command || nat.command) + ' failed: ' + String((e && e.message) || e).slice(0, 120) }, { quoted: message }); } catch (_) {}
      return;
    }
  }
  return runLegacy(meta, sock, message, args, ctx);
}

async function fallbackSmart(sock, m, message, meta, args) {
  try {
    const { smartRun, sendResult } = require('./smartEngine');
    const result = await smartRun(meta.command, (args || []).join(' '), { category: 'legacy' });
    await sendResult(sock, m.chat, message, result);
  } catch (e2) {
    try { await m.reply('❌ ' + (e2.message || e2)); } catch {}
  }
}

async function runLegacy(meta, sock, message, args, ctx = {}) {
  initDb(); initGlobals();
  meta = { ...meta, registered: meta.command, command: invokedName(ctx, meta.command) };
  const conn = buildConn(sock);
  const m = buildM(sock, message);
  const c = await ctxFor(sock, message, ctx, m);
  const p = meta.perms || {};

  if (p.private && m.isGroup) return m.reply('❌ Private chat only.');
  if (p.botAdmin && m.isGroup && !c.isBotAdmin) return m.reply('❌ Make the bot admin first.');

  const prefix = (ctx.usedPrefix || ctx.prefix || settings.prefixes[0]);
  const text = (args || []).join(' ');
  const tryBlock = async (fn) => {
    try { return await fn(); }
    catch (e) {
      // Baileys-MD plugins signal user-facing messages with `throw 'text'`
      if (typeof e === 'string') { try { await m.reply(e); } catch {} return; }
      console.error(`[legacy:${meta.file}]`, e && e.message);
      try { await m.reply(`❌ ${meta.command} failed: ${String(e && e.message || e).slice(0, 120)}`); } catch {}
    }
  };

  const L = loadAny(meta.file);

  // ── format natif { command, handler } (wrapper qui pointait sur un plugin natif)
  if (L.style === 'native') {
    let target = L.mod;
    if (Array.isArray(L.mod.commands)) {
      const name = meta.command;
      target = L.mod.commands.find(x => x && (String(x.command).toLowerCase() === name || (x.aliases || []).map(a => String(a).toLowerCase()).includes(name)))
        || (typeof L.mod.handler === 'function' ? L.mod : L.mod.commands[0]);
    }
    if (target && typeof target.handler === 'function') return tryBlock(() => target.handler(sock, message, args, ctx));
    return fallbackSmart(sock, m, message, meta, args);
  }

  // ── fonction simple (sock, message, args)
  if (L.style === 'plain') return tryBlock(() => L.mod(sock, message, args, ctx));

  // ── style A : handler(m, { conn, text, ... })
  if (L.style === 'A') {
    const handler = L.mod;
    return tryBlock(() => handler.call(conn, m, {
      conn, text, args, usedPrefix: prefix, command: meta.command, noPrefix: text, match: [text],
      isOwner: c.isOwner, isROwner: c.isOwner, isMods: c.isOwner, isPrems: c.isOwner,
      isAdmin: c.isAdmin, isBotAdmin: c.isBotAdmin, isRegistered: true,
      participants: c.participants, groupMetadata: c.metadata || {}, chat: global.db.data.chats[m.chat],
      user: global.db.data.users[m.sender], senderJid: m.sender
    }));
  }

  if (L.style !== 'B') return fallbackSmart(sock, m, message, meta, args);

  // ── style B : cmd({ pattern, alias }, fn) — on cherche la BONNE commande
  const regs = L.regs;
  const name = meta.command;
  const wanted = [name, String(meta.registered || '').toLowerCase()].filter(Boolean);
  const matches = (r) => {
    if (!r || !r.info) return false;
    const pat = String(r.info.pattern || '').toLowerCase();
    const al = [].concat(r.info.alias || r.info.aliases || []).map(a => String(a).toLowerCase());
    return wanted.some(w => pat === w || al.includes(w));
  };
  const reg = regs.find(matches) || (regs.length === 1 ? regs[0] : null);
  if (!reg || typeof reg.fn !== 'function') {
    // ne plus lancer une autre commande du fichier au hasard
    return m.reply(`❌ Commande *${name}* introuvable dans ${meta.file}.`);
  }
  const reply = (t, o) => m.reply(t, null, o);
  const react = (e) => m.react(e);

  // format Gifted-Tech : gmd(info, async (from, Gifted, conText) => {})
  if (reg.info.__style === 'gmd') {
    const quotedMsg = m.quoted ? m.quoted.fakeObj?.message : null;
    const conText = {
      m, mek: message, edit: null, react, del: () => m.quoted?.delete?.(), arg: args, args, q: text, text,
      reply, from: m.chat, sender: m.sender, pushName: m.pushName, isGroup: m.isGroup,
      isSuperUser: c.isOwner, isSuperAdmin: c.isOwner, superUser: c.isOwner, isAdmin: c.isAdmin, isBotAdmin: c.isBotAdmin,
      groupMetadata: c.metadata, participants: c.participants, groupAdmins: c.groupAdmins, groupName: c.groupName,
      quoted: m.quoted, quotedMsg, quotedUser: m.quoted?.sender, mentionedJid: m.mentionedJid, fromMe: m.fromMe,
      botPrefix: prefix, botName: settings.botName, botFooter: `> ${settings.botName}`, botPic: settings.menuImage,
      botVersion: settings.version, botMode: settings.commandMode, timeZone: settings.timeZone, packName: settings.packname,
      newsletterJid: settings.channelId, newsletterUrl: settings.channelLink, body: m.text,
      GiftedTechApi: process.env.GIFTED_API || 'https://api.giftedtech.co.ke', GiftedApiKey: process.env.GIFTED_API_KEY || 'gifted',
      gmdBuffer: toBuffer, getMediaBuffer: toBuffer,
    };
    return tryBlock(() => reg.fn(m.chat, conn, conText));
  }

  return tryBlock(() => reg.fn(conn, message, m, {
    from: m.chat, quoted: m.quoted, body: text ? `${prefix}${meta.command} ${text}` : `${prefix}${meta.command}`,
    isCmd: true, command: meta.command, args, q: text, text, isGroup: m.isGroup, sender: m.sender,
    senderNumber: num(m.sender), botNumber: num(sock.user?.id), botNumber2: norm(sock.user?.id),
    pushname: m.pushName, isMe: m.fromMe, isOwner: c.isOwner, isCreator: c.isOwner, isDev: c.isOwner,
    isAdmin: c.isAdmin, isAdmins: c.isAdmin, isBotAdmins: c.isBotAdmin,
    groupMetadata: c.metadata, metadata: c.metadata, groupName: c.groupName, participants: c.participants,
    groupAdmins: c.groupAdmins, prefix, reply,
    react, config: { PREFIX: prefix, OWNER_NUMBER: settings.ownerNumber, BOT_NAME: settings.botName },
    userConfig: {}
  }));
}

module.exports = { run, loadFile, loadAny, aMatches, registrar, functions, toBuffer, parseMention, buildM, buildConn, initDb, initGlobals };
