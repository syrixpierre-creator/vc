/*****************************************************************************
 * QUEEN AKUMA — Anti-Delete
 * .antidelete on|off     → groups
 * .selfantidelete on|off → DM / private (also stores own msgs in DM)
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'antidelete.json');
const STORE_PATH = path.join(process.cwd(), 'data', 'antidelete-store.json');
const TEMP_MEDIA_DIR = path.join(process.cwd(), 'tmp', 'antidelete');

// v3.5.0 audit-fix — SPLIT-BRAIN (asli bug: "ON dikhta hai par kaam nahi hota"):
// index.js pehle lib/messageHandler require karta hai (line 53) — jo is file ka
// instance A banata hai (hooks: storeMessage/handleMessageRevocation) — phir
// commandHandler.loadCommands() (line 62) `delete require.cache` karke dobara
// require karta hai — instance B (.antidelete command handler). Module-level
// store/stats/config alag hote to: command instance B me ON hota, par hooks
// instance A ko pata hi nahi chalta (uski cache me group=false rehta) —
// delete hua message kabhi store hi nahi hota, recover karne ko kuch nahi.
// Isliye shared state global par hai: dono instance ek hi store/stats dekhte
// hain, aur config file se re-read hoti hai (mtime check).
const SHARED_KEY = '__demonAntideleteShared';
const shared = global[SHARED_KEY] || (global[SHARED_KEY] = {
  store: new Map(),
  stats: { seen: 0, recovered: 0, last: '-' },
  storeLoaded: false
});
const messageStore = shared.store;
const stats = shared.stats;
const MAX_STORE = 1000;

let configCache = { group: false, self: false, own: true, groupDest: 'chat' };
let configLoaded = false;
let configMtime = -1;

function ensureDirs() {
  try {
    if (!fs.existsSync(path.dirname(CONFIG_PATH))) fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
  } catch (_) {}
}

function loadConfigSync() {
  ensureDirs();
  try {
    // mtime check: dusre instance ne file save ki ho to reload karo.
    // (Har getConfig() par statSync hota hai — file chhoti hai, sasta hai.)
    let mtime = -1;
    try { mtime = fs.statSync(CONFIG_PATH).mtimeMs; } catch (_) { mtime = -1; }
    if (configLoaded && mtime === configMtime) return configCache;
    if (mtime !== -1) {
      const j = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      const group = typeof j.enabled === 'boolean' && j.group === undefined ? !!j.enabled : !!j.group;
      // own = also recover messages deleted from the bot's OWN number (default ON)
      configCache = { group, self: !!j.self, own: !j.ownSkip, groupDest: j.groupDest === 'me' ? 'me' : 'chat' };
    }
    configMtime = mtime;
  } catch {
    configCache = { group: false, self: false, own: true, groupDest: 'chat' };
    configMtime = -1;
  }
  configLoaded = true;
  return configCache;
}

function saveConfig(cfg) {
  configCache = { group: !!cfg.group, self: !!cfg.self, own: cfg.own !== false, groupDest: cfg.groupDest === 'me' ? 'me' : 'chat' };
  ensureDirs();
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ group: configCache.group, self: configCache.self, ownSkip: !configCache.own, groupDest: configCache.groupDest }, null, 2));
    try { configMtime = fs.statSync(CONFIG_PATH).mtimeMs; } catch (_) {}
  } catch (e) {
    console.error('[antidelete] save:', e.message);
  }
  return configCache;
}

function getConfig() {
  loadConfigSync(); // file badli ho (dusre instance ne save kiya) to reload
  return { ...configCache };
}

function clearStore() {
  const n = messageStore.size;
  messageStore.clear();
  saveStoreToDisk();
  stats.last = 'cleared ' + n + ' stored messages';
  return n;
}

function statusText() {
  const c = getConfig();
  return `*🛡️ ANTI-DELETE STATUS*\n\n` +
    `• Group (.antidelete): ${c.group ? '✅ ON' : '❌ OFF'}\n` +
    `• DM (.selfantidelete): ${c.self ? '✅ ON' : '❌ OFF'}\n` +
    `• Own-number deletes: ${c.own ? '✅ recovered' : '❌ ignored'}  (.antidelete own on/off)\n` +
    `• Group report goes to: ${c.groupDest === 'me' ? 'bot chat (Message yourself)' : 'the same group'}  (.antidelete dest me/chat)\n\n` +
    `📦 Messages stored: ${messageStore.size}\n` +
    `🗑️ Deletes seen: ${stats.seen} | ♻️ Recovered: ${stats.recovered}\n` +
    `ℹ️ Last: ${stats.last}\n\n` +
    `_Messages received AFTER turning ON are stored (restart-proof) and recovered when deleted._`;
}

function trimStore() {
  if (messageStore.size <= MAX_STORE) return;
  const keys = [...messageStore.keys()];
  for (let i = 0; i < keys.length - MAX_STORE; i++) {
    const old = messageStore.get(keys[i]);
    if (old?.mediaPath) try { fs.unlinkSync(old.mediaPath); } catch (_) {}
    messageStore.delete(keys[i]);
  }
}

// v2.8.3: store disk par bhi save hota hai — bot restart/redeploy ke baad
// bhi delete hue messages recover ho sakte hain (pehle sirf memory me tha).
let storeSaveTimer = null;
let storeDirty = false;
function saveStoreToDisk() {
  ensureDirs();
  try {
    const arr = [...messageStore.entries()].slice(-MAX_STORE).map(([id, o]) => ({
      id, sender: o.sender, chat: o.chat, isGroup: o.isGroup, content: o.content,
      mediaType: o.mediaType, mediaPath: o.mediaPath, fromMe: o.fromMe,
      pushName: o.pushName, sentAt: o.sentAt, time: o.time
    }));
    fs.writeFileSync(STORE_PATH, JSON.stringify(arr));
  } catch (_) {}
}
function scheduleStoreSave() {
  storeDirty = true;
  if (storeSaveTimer) return;
  storeSaveTimer = setTimeout(() => {
    storeSaveTimer = null;
    if (!storeDirty) return;
    storeDirty = false;
    saveStoreToDisk();
  }, 5000);
  if (storeSaveTimer.unref) storeSaveTimer.unref();
}
function loadStoreFromDisk() {
  try {
    if (!fs.existsSync(STORE_PATH)) return;
    const arr = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    if (!Array.isArray(arr)) return;
    for (const e of arr.slice(-MAX_STORE)) {
      if (!e || !e.id) continue;
      const mediaPath = e.mediaPath && fs.existsSync(e.mediaPath) ? e.mediaPath : '';
      messageStore.set(e.id, {
        sender: e.sender || '', chat: e.chat || '', isGroup: !!e.isGroup,
        content: e.content || '', mediaType: e.mediaType || '', mediaPath,
        fromMe: !!e.fromMe, pushName: e.pushName || '', sentAt: e.sentAt || e.time || Date.now(), time: e.time || Date.now()
      });
    }
  } catch (_) {}
}

function isGroupJid(jid) {
  return String(jid || '').endsWith('@g.us');
}

function isPrivateJid(jid) {
  const j = String(jid || '');
  if (!j || isGroupJid(j)) return false;
  if (j === 'status@broadcast') return false;
  if (j.endsWith('@newsletter')) return false;
  if (j.endsWith('@broadcast')) return false;
  // phone, lid, or plain pn
  return (
    j.endsWith('@s.whatsapp.net') ||
    j.endsWith('@lid') ||
    j.includes('@') ||
    /^\d{8,}$/.test(j)
  );
}

function unwrapMessage(message) {
  let msg = message?.message || {};
  if (msg.ephemeralMessage?.message) msg = msg.ephemeralMessage.message;
  if (msg.viewOnceMessage?.message) msg = msg.viewOnceMessage.message;
  if (msg.viewOnceMessageV2?.message) msg = msg.viewOnceMessageV2.message;
  if (msg.documentWithCaptionMessage?.message) msg = msg.documentWithCaptionMessage.message;
  return msg;
}

async function downloadMediaQuick(msgContent, type) {
  try {
    const stream = await downloadContentFromMessage(msgContent, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  } catch {
    return null;
  }
}

function extractText(msg) {
  if (!msg) return '';
  if (msg.conversation) return msg.conversation;
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
  if (msg.imageMessage?.caption) return msg.imageMessage.caption;
  if (msg.videoMessage?.caption) return msg.videoMessage.caption;
  if (msg.documentMessage?.caption) return msg.documentMessage.caption;
  if (msg.buttonsResponseMessage?.selectedDisplayText) return msg.buttonsResponseMessage.selectedDisplayText;
  if (msg.listResponseMessage?.title) return msg.listResponseMessage.title;
  return '';
}

/**
 * Store for recovery
 * DM/self: store BOTH sides (fromMe + others) so any delete can recover
 * Group: store others only (not bot)
 */
async function storeMessage(sock, message) {
  try {
    const cfg = getConfig();
    if (!cfg.group && !cfg.self) return;
    if (!message?.key?.id) return;

    const chatId = message.key.remoteJid || '';
    const isGroup = isGroupJid(chatId);
    const isPrivate = isPrivateJid(chatId);

    if (isGroup && !cfg.group) return;
    if (isPrivate && !cfg.self) return;
    if (!isGroup && !isPrivate) return;

    // groups: skip bot's own messages; DM: keep both
    if (isGroup && message.key.fromMe && !cfg.own) return;

    const messageId = message.key.id;
    const sender = message.key.participant || message.key.remoteJid;
    const msg = unwrapMessage(message);

    // skip pure protocol
    if (msg.protocolMessage) return;

    let content = extractText(msg);
    let mediaType = '';
    let mediaPath = '';

    const saveMedia = (node, type, ext) => {
      mediaType = type;
      downloadMediaQuick(node, type === 'audio' ? 'audio' : type === 'sticker' ? 'sticker' : type).then((buf) => {
        if (!buf) return;
        const p = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
        writeFile(p, buf)
          .then(() => {
            const o = messageStore.get(messageId);
            if (o) {
              o.mediaPath = p;
              o.mediaType = type;
            }
          })
          .catch(() => {});
      }).catch(() => {});
    };

    if (msg.imageMessage) {
      content = msg.imageMessage.caption || content;
      saveMedia(msg.imageMessage, 'image', 'jpg');
    } else if (msg.videoMessage) {
      content = msg.videoMessage.caption || content;
      saveMedia(msg.videoMessage, 'video', 'mp4');
    } else if (msg.stickerMessage) {
      saveMedia(msg.stickerMessage, 'sticker', 'webp');
    } else if (msg.audioMessage) {
      saveMedia(msg.audioMessage, 'audio', 'ogg');
    } else if (msg.documentMessage) {
      content = msg.documentMessage.fileName || content || 'document';
      saveMedia(msg.documentMessage, 'document', 'bin');
    }

    messageStore.set(messageId, {
      sender,
      chat: chatId,
      isGroup,
      content: content || '',
      mediaType,
      mediaPath,
      fromMe: !!message.key.fromMe,
      pushName: message.pushName || '',
      sentAt: (Number(message.messageTimestamp && message.messageTimestamp.low !== undefined ? message.messageTimestamp.low : message.messageTimestamp) || Math.floor(Date.now() / 1000)) * 1000,
      time: Date.now()
    });
    trimStore();
    scheduleStoreSave();
  } catch (err) {
    console.error('[antidelete] storeMessage:', err.message);
  }
}

function isRevokeType(pt) {
  // Baileys / WA variants
  // v3.4.1: type 14 = MESSAGE_EDIT — edit delete NAHI hai, antiedit handle karega
  return (
    pt === 0 ||
    pt === 'REVOKE' ||
    String(pt).toUpperCase() === 'REVOKE'
  );
}

function ownJid(sock) {
  const n = String(sock.user?.id || '').split(':')[0].split('@')[0];
  return n ? n + '@s.whatsapp.net' : null;
}

function fmtIST(ms) {
  return new Date(ms).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', hour12: true, day: 'numeric', month: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit'
  });
}

/**
 * Recover a deleted message by id.
 * DM  -> report goes to the bot/owner's own chat ("Message yourself")
 * Group -> report goes to the same group (old behaviour)
 */
async function recoverDeleted(sock, messageId, deletedBy, opts = {}) {
  const cfg = getConfig();
  stats.seen++;
  if (!cfg.group && !cfg.self) { stats.last = 'skipped: antidelete/selfantidelete are OFF'; return false; }

  const original = messageStore.get(messageId);
  if (!original) {
    console.log('[antidelete] delete seen but not in store:', messageId);
    stats.last = 'skipped: message was not stored (arrived before ON / bot restarted / too old)';
    return false;
  }
  if (original.isGroup && !cfg.group) { stats.last = 'skipped: group antidelete OFF'; return false; }
  if (!original.isGroup && !cfg.self) { stats.last = 'skipped: selfantidelete (DM) OFF'; return false; }

  const me = ownJid(sock);
  const sender = original.sender;
  const senderNum = String(sender || '').split('@')[0];
  const deletedNum = String(deletedBy || sender || '').split('@')[0];
  const senderName = original.pushName || senderNum;

  // DM: ignore deletes made by the owner/bot itself (nothing to "catch")
  if ((opts.byMe || original.fromMe) && !cfg.own) {
    messageStore.delete(messageId);
    stats.last = 'skipped: own message (own recovery OFF)';
    return false;
  }

  let chatLine;
  if (original.isGroup) {
    let gname = original.chat;
    try { gname = (await sock.groupMetadata(original.chat)).subject || gname; } catch (_) {}
    chatLine = `👥 *Group:* ${gname}\n`;
  } else {
    chatLine = `💬 *Chat:* Private (DM)\n`;
  }

  const text =
    `🗑️ *DELETED MESSAGE DETECTED*\n\n` +
    `👤 *From:* ${senderName} (@${senderNum})\n` +
    `🧹 *Deleted by:* @${deletedNum}\n` +
    chatLine +
    `🕒 *Sent:* ${fmtIST(original.sentAt || original.time)}\n` +
    `⏱️ *Deleted:* ${fmtIST(Date.now())}\n\n` +
    (original.content ? `💬 *Message:*\n${original.content}` : `💬 *Message:* _(media / empty)_`);

  const target = original.isGroup ? (cfg.groupDest === 'me' && me ? me : original.chat) : (me || original.chat);
  const mentions = [sender, deletedBy].filter(Boolean);
  await sock.sendMessage(target, { text, mentions });

  // media (may still be downloading: wait briefly)
  if (original.mediaType && !original.mediaPath) {
    for (let i = 0; i < 10 && !original.mediaPath; i++) await new Promise((r) => setTimeout(r, 300));
  }
  if (original.mediaPath && fs.existsSync(original.mediaPath)) {
    try {
      const cap = `🗑️ *Deleted ${original.mediaType}* — from ${senderName} (@${senderNum})`;
      const m = [sender].filter(Boolean);
      const url = { url: original.mediaPath };
      if (original.mediaType === 'image') await sock.sendMessage(target, { image: url, caption: cap, mentions: m });
      else if (original.mediaType === 'video') await sock.sendMessage(target, { video: url, caption: cap, mentions: m });
      else if (original.mediaType === 'sticker') await sock.sendMessage(target, { sticker: url });
      else if (original.mediaType === 'audio') await sock.sendMessage(target, { audio: url, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      else if (original.mediaType === 'document') await sock.sendMessage(target, { document: url, fileName: original.content || 'deleted.bin', mimetype: 'application/octet-stream', caption: cap, mentions: m });
    } catch (e) {
      console.error('[antidelete] media send:', e.message);
    }
    try { fs.unlinkSync(original.mediaPath); } catch (_) {}
  }

  messageStore.delete(messageId);
  scheduleStoreSave();
  stats.recovered++;
  stats.last = 'recovered -> ' + (target === me ? 'bot chat' : 'same group');
  console.log('[antidelete] recovered', messageId, '->', target);
  return true;
}

// Delete arrives as protocolMessage REVOKE inside messages.upsert
async function handleMessageRevocation(sock, revocationMessage) {
  try {
    const outer = revocationMessage.message || {};
    const proto = outer.protocolMessage || outer.ephemeralMessage?.message?.protocolMessage || null;
    if (!proto || !isRevokeType(proto.type)) return;
    const messageId = proto.key?.id;
    if (!messageId) return;
    const deletedBy =
      revocationMessage.key?.participant || proto.key?.participant ||
      revocationMessage.participant || revocationMessage.key?.remoteJid;
    await recoverDeleted(sock, messageId, deletedBy, { byMe: !!revocationMessage.key?.fromMe });
  } catch (err) {
    console.error('[antidelete] revoke:', err.message);
  }
}

// Delete arrives as messages.update (message becomes null / REVOKE stub)
async function handleMessageUpdates(sock, updates) {
  try {
    for (const u of updates || []) {
      const upd = u.update || {};
      const revoked = upd.message === null || upd.messageStubType === 1 || upd.messageStubType === 'REVOKE';
      const id = u.key?.id;
      if (!revoked || !id) continue;
      await recoverDeleted(sock, id, u.key?.participant || u.key?.remoteJid, { byMe: !!u.key?.fromMe });
    }
  } catch (err) {
    console.error('[antidelete] update:', err.message);
  }
}

loadConfigSync();
// Disk store sirf pehli baar load karo — dusra instance wahi shared Map use karta hai.
if (!shared.storeLoaded) { shared.storeLoaded = true; loadStoreFromDisk(); }

module.exports = {
  command: 'antidelete',
  aliases: ['antidel', 'adel', 'gantidelete'],
  category: 'admin',
  description: 'Group anti-delete ON/OFF. DM: .selfantidelete',
  usage: '.antidelete on|off',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const cfg = getConfig();
    const action = (args[0] || '').toLowerCase();

    if (!action || action === 'status') {
      return sock.sendMessage(chatId, { text: statusText() }, { quoted: message });
    }
    if (action === 'dest') {
      const v = (args[1] || '').toLowerCase();
      if (!['me', 'chat'].includes(v)) return sock.sendMessage(chatId, { text: `ℹ️ Group deleted-message report goes to: *${cfg.groupDest}*\nUsage: .antidelete dest me|chat\n(me = bot's own chat, chat = same group)` }, { quoted: message });
      // v3.6.0 OWNER/ADMIN LOCK (info dekhna public, set gate hai)
      if (!(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      saveConfig({ ...cfg, groupDest: v });
      return sock.sendMessage(chatId, { text: `✅ Group reports will go to: *${v === 'me' ? 'bot chat (Message yourself)' : 'the same group'}*` }, { quoted: message });
    }
    if (action === 'own') {
      const v = (args[1] || '').toLowerCase();
      if (!['on', 'off'].includes(v)) return sock.sendMessage(chatId, { text: `ℹ️ Own-message recovery: *${cfg.own ? 'ON' : 'OFF'}*\nUsage: .antidelete own on|off\n(ON = bot also recovers messages deleted from YOUR own number — useful for testing)` }, { quoted: message });
      // v3.6.0 OWNER/ADMIN LOCK (info dekhna public, set gate hai)
      if (!(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      saveConfig({ ...cfg, own: v === 'on' });
      return sock.sendMessage(chatId, { text: `✅ Own-message recovery *${v.toUpperCase()}*` }, { quoted: message });
    }
    if (action === 'on') {
      // v3.6.0 OWNER/ADMIN LOCK (status dekhna public rehta hai)
      if (!(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return sock.sendMessage(chatId, { text: '❌ *Only group admins or the bot owner can use this command.*' }, { quoted: message });
      saveConfig({ ...cfg, group: true });
      return sock.sendMessage(chatId, { text: '✅ *Group Anti-Delete ON*' }, { quoted: message });
    }
    if (action === 'off') {
      // v3.6.0 OWNER/ADMIN LOCK
      if (!(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return sock.sendMessage(chatId, { text: '❌ *Only group admins or the bot owner can use this command.*' }, { quoted: message });
      saveConfig({ ...cfg, group: false });
      return sock.sendMessage(chatId, { text: '❌ *Group Anti-Delete OFF*' }, { quoted: message });
    }
    return sock.sendMessage(chatId, { text: 'Usage: `.antidelete on` or `.antidelete off`' }, { quoted: message });
  },

  handleMessageRevocation,
  handleMessageUpdates,
  recoverDeleted,
  storeMessage,
  getConfig,
  saveConfig,
  statusText,
  clearStore,
  loadConfigSync
};
