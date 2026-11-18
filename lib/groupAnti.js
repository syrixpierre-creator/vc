/**
 * QUEEN AKUMA — Group Anti Protection Engine
 * Based on solid anti-link / anti-media / anti-vv / anti-forward logic
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '../data/groupAnti.json');
// any URL: http(s)://, www., WhatsApp/Telegram invite links, or bare domain with a common TLD
const LINK_RE = /(?:https?:\/\/|www\.)\S+|(?:chat\.whatsapp\.com|wa\.me|t\.me|whatsapp\.com\/channel)\/\S+|\b[a-z0-9-]{2,}\.(?:com|net|org|in|io|xyz|link|ly|info|app|site|online|shop|top|vip|live|tv|gg|cc|co)(?:\/\S*)?\b/i;

const ANTI_KEYS = [
  'antilink', 'antispam', 'antisticker', 'antiforward', 'antibot',
  'antiaudio', 'antivideo', 'antidoc', 'antiimage', 'antilocation',
  'antipoll', 'antivoice', 'antivv', 'antiword', 'antitag', 'anticontact',
  'antimedia', 'antimention', 'antibug'
];

// default ON for these — antilink OFF by default (owner decision 2026-11-16:
// non-admin ke URL commands (.mediafire link etc.) block ho jate the;
// jahan chahiye wahan .antilink on se on kar lo)
const DEFAULT_ON = new Set(['antispam', 'antibug']);

function load() {
  try {
    if (fs.existsSync(DATA)) return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  } catch (_) {}
  return { groups: {}, antiActions: {}, warnings: {}, warningLimit: 3 };
}

function save(db) {
  try {
    const dir = path.dirname(DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[groupAnti] save', e.message);
  }
}

function isOn(db, jid, key) {
  const g = db.groups[jid] || {};
  if (g[key] === true) return true;
  if (g[key] === false) return false;
  return DEFAULT_ON.has(key);
}

function setOn(jid, key, value) {
  const db = load();
  if (!db.groups[jid]) db.groups[jid] = {};
  db.groups[jid][key] = !!value;
  save(db);
  return !!value;
}

function getAction(db, key) {
  return (db.antiActions && db.antiActions[key]) || 'delete'; // delete | warn | kick
}

function setAction(key, action) {
  const db = load();
  if (!db.antiActions) db.antiActions = {};
  db.antiActions[key] = action;
  save(db);
}

function detectKind(message) {
  const m = message.message || {};
  const isViewOnce = !!(m.viewOnceMessage || m.viewOnceMessageV2 || m.viewOnceMessageV2Extension);
  const inner = isViewOnce
    ? (m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m.viewOnceMessageV2Extension?.message || {})
    : m;
  const ctx =
    inner.extendedTextMessage?.contextInfo ||
    inner.imageMessage?.contextInfo ||
    inner.videoMessage?.contextInfo ||
    inner.stickerMessage?.contextInfo ||
    Object.values(inner).find((v) => v && typeof v === 'object' && v.contextInfo)?.contextInfo ||
    {};

  if (isViewOnce) return 'antivv';
  if (inner.stickerMessage) return 'antisticker';
  if (inner.audioMessage?.ptt) return 'antivoice';
  if (inner.audioMessage) return 'antiaudio';
  if (inner.videoMessage) return 'antivideo';
  if (inner.documentMessage) return 'antidoc';
  if (inner.imageMessage) return 'antiimage';
  if (inner.locationMessage || inner.liveLocationMessage) return 'antilocation';
  if (inner.pollCreationMessage || inner.pollUpdateMessage) return 'antipoll';
  if (inner.contactMessage || inner.contactsArrayMessage) return 'anticontact';
  if (ctx.isForwarded || Number(ctx.forwardingScore) > 0) return 'antiforward';
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length >= 5) return 'antitag';
  return null;
}

function getText(message) {
  const m = message.message || {};
  const inner =
    m.viewOnceMessage?.message ||
    m.viewOnceMessageV2?.message ||
    m.conversation !== undefined ? m : m;
  const msg = m.ephemeralMessage?.message || m;
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    ''
  ).trim();
}

const spamMap = new Map(); // jid+sender -> timestamps
function spamCheck(jid, sender) {
  const key = jid + '|' + sender;
  const now = Date.now();
  let arr = spamMap.get(key) || [];
  arr = arr.filter((t) => now - t < 8000);
  arr.push(now);
  spamMap.set(key, arr);
  return arr.length >= 6; // 6 msgs in 8s
}

function bugCheck(text, mentions) {
  if (!text && (!mentions || !mentions.length)) return null;
  if (text && text.length > 4000) return 'Message too long';
  if (mentions && mentions.length > 20) return 'Too many mentions';
  if (text) {
    if (/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]{10,}/.test(text)) return 'Virtex / invisible chars';
    if (/(.)\1{80,}/.test(text)) return 'Repeated character spam';
    if (/[\u0300-\u036F]{20,}/.test(text)) return 'Combining marks spam';
  }
  return null;
}

/**
 * Process incoming group message for anti rules.
 * Returns true if message was handled (deleted/kicked) and should stop.
 */
async function processMessage(sock, message, ctx = {}) {
  try {
    const jid = ctx.chatId || message.key.remoteJid;
    if (!jid || !jid.endsWith('@g.us')) return false;
    if (message.key.fromMe) return false;

    const db = load();
    const anyOn = ANTI_KEYS.some((k) => isOn(db, jid, k));
    if (!anyOn) return false;

    const sender = message.key.participant || ctx.senderId;
    if (!sender) return false;

    // skip group admins
    let isAdmin = false;
    let isBotAdmin = false;
    try {
      const meta = await sock.groupMetadata(jid);
      const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const botLid = sock.user?.lid;
      for (const p of meta.participants || []) {
        const id = p.id || p;
        const admin = p.admin === 'admin' || p.admin === 'superadmin';
        if (id === sender && admin) isAdmin = true;
        if ((id === botId || (botLid && id === botLid) || String(id).includes(String(sock.user?.id || '').split(':')[0])) && admin) {
          isBotAdmin = true;
        }
      }
      // also match without device part
      if (!isAdmin) {
        const sNum = String(sender).replace(/\D/g, '');
        for (const p of meta.participants || []) {
          if ((p.admin === 'admin' || p.admin === 'superadmin') && String(p.id).replace(/\D/g, '').includes(sNum.slice(-10))) {
            isAdmin = true;
            break;
          }
        }
      }
    } catch (_) {}

    if (isAdmin) return false;

    const text = getText(message);
    const kind = detectKind(message);
    const ctxInfo =
      message.message?.extendedTextMessage?.contextInfo ||
      message.message?.imageMessage?.contextInfo ||
      {};
    const mentions = ctxInfo.mentionedJid || [];

    // antimedia = any media
    const mediaKinds = ['antisticker', 'antivoice', 'antiaudio', 'antivideo', 'antidoc', 'antiimage'];
    let triggered = null;
    let reason = '';

    if (isOn(db, jid, 'antilink') && LINK_RE.test(text)) {
      triggered = 'antilink';
      reason = 'Group link not allowed';
    } else if (kind && isOn(db, jid, kind)) {
      triggered = kind;
      reason = kind.replace(/^anti/, 'Anti-') + ' blocked';
    } else if (isOn(db, jid, 'antimedia') && mediaKinds.includes(kind)) {
      triggered = 'antimedia';
      reason = 'Media not allowed';
    } else if (isOn(db, jid, 'antimention') && mentions.length > 0) {
      triggered = 'antimention';
      reason = 'Mentions are not allowed';
    } else if (isOn(db, jid, 'antiword') && matchBadWord(db, jid, text)) {
      triggered = 'antiword';
      reason = 'Blocked word';
    } else if (isOn(db, jid, 'antibot') && isBotMessage(message)) {
      triggered = 'antibot';
      reason = 'Bots are not allowed';
    } else if (isOn(db, jid, 'antibug')) {
      const bug = bugCheck(text, mentions);
      if (bug) {
        triggered = 'antibug';
        reason = bug;
      }
    }

    if (!triggered && isOn(db, jid, 'antispam')) {
      if (spamCheck(jid, sender)) {
        triggered = 'antispam';
        reason = 'Spam detected';
      }
    }

    if (!triggered) return false;

    const action = getAction(db, triggered);

    // always try delete
    await sock.sendMessage(jid, { delete: message.key }).catch(() => {});

    if (action === 'kick' && isBotAdmin) {
      await sock.groupParticipantsUpdate(jid, [sender], 'remove').catch(() => {});
      await sock.sendMessage(jid, {
        text: `🚫 *${triggered}* — @${sender.split('@')[0]} removed\n${reason}`,
        mentions: [sender]
      }).catch(() => {});
    } else if (action === 'warn') {
      const n = String(sender).replace(/\D/g, '') || sender;
      if (!db.warnings) db.warnings = {};
      db.warnings[n] = (db.warnings[n] || 0) + 1;
      save(db);
      const limit = db.warningLimit || 3;
      await sock.sendMessage(jid, {
        text: `⚠️ @${sender.split('@')[0]} warning ${db.warnings[n]}/${limit}\nReason: ${reason}`,
        mentions: [sender]
      }).catch(() => {});
      if (db.warnings[n] >= limit && isBotAdmin) {
        await sock.groupParticipantsUpdate(jid, [sender], 'remove').catch(() => {});
        db.warnings[n] = 0;
        save(db);
      }
    } else {
      await sock.sendMessage(jid, {
        text: `🗑️ *${triggered}*\n@${sender.split('@')[0]} — ${reason}`,
        mentions: [sender]
      }).catch(() => {});
    }
    return true;
  } catch (e) {
    console.error('[groupAnti]', e.message);
    return false;
  }
}

// ---- antiword / antibot helpers ----
function getWords(db, jid) {
  return (db.words && db.words[jid]) || [];
}
function matchBadWord(db, jid, text) {
  if (!text) return false;
  const words = getWords(db, jid);
  if (!words.length) return false;
  const t = text.toLowerCase();
  return words.some((w) => {
    const x = String(w).toLowerCase().trim();
    if (!x) return false;
    const esc = x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try { return new RegExp('(^|[^\\p{L}\\p{N}])' + esc + '($|[^\\p{L}\\p{N}])', 'iu').test(t); } catch (_) { return t.includes(x); }
  });
}
function addWord(jid, word) {
  const db = load();
  if (!db.words) db.words = {};
  const list = db.words[jid] || (db.words[jid] = []);
  const w = String(word).toLowerCase().trim();
  if (!w || list.includes(w)) return false;
  list.push(w); save(db); return true;
}
function delWord(jid, word) {
  const db = load();
  const list = (db.words && db.words[jid]) || [];
  const i = list.indexOf(String(word).toLowerCase().trim());
  if (i < 0) return false;
  list.splice(i, 1); save(db); return true;
}
// Baileys-based bots tag their message ids with a BAE5 prefix (16 chars)
function isBotMessage(message) {
  const id = String(message.key?.id || '');
  return id.startsWith('BAE5') && id.length === 16;
}

function statusText(jid) {
  const db = load();
  const lines = ANTI_KEYS.map((k) => {
    const on = isOn(db, jid, k);
    return `• ${k}: ${on ? '✅ ON' : '❌ OFF'}`;
  });
  return `🛡️ *Group Anti Status*\n\n${lines.join('\n')}\n\nToggle: \`.antilink on/off\` etc.\nAction: \`.antiaction delete|warn|kick\``;
}

module.exports = {
  ANTI_KEYS,
  getWords,
  addWord,
  delWord,
  matchBadWord,
  isBotMessage,
  load,
  save,
  isOn,
  setOn,
  getAction,
  setAction,
  processMessage,
  statusText,
  detectKind
};
