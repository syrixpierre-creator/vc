/**
 * Private-mode temporary access
 * Grant when user replies to owner message → limited commands for limited time
 */
const settings = require('../settings');

const TEMP_MS = 15 * 60 * 1000; // 15 minutes
const store = new Map(); // key -> expiresAt

const ALLOWED_COMMANDS = new Set([
  'play', 'song', 'music', 'mp3', 'ytmp3', 'video', 'tiktok', 'facebook', 'fb',
  'menu', 'menu2', 'ping', 'alive', 'uptime', 'runtime', 'sticker', 's', 'toimg',
  'vv', 'viewonce', 'weather', 'define', 'wiki', 'translate'
]);

function digits(v) {
  return String(v || '').replace(/\D/g, '');
}
function sameNum(a, b) {
  const da = digits(a), db = digits(b);
  if (!da || !db) return false;
  if (da === db) return true;
  return da.slice(-10) === db.slice(-10);
}
function keyOf(jid) {
  return digits(jid) || String(jid || '');
}

function grantTempAccess(jid) {
  const k = keyOf(jid);
  if (!k) return false;
  store.set(k, Date.now() + TEMP_MS);
  return true;
}

function hasTempAccess(jid) {
  const k = keyOf(jid);
  if (!k) return false;
  const exp = store.get(k);
  if (!exp) return false;
  if (Date.now() > exp) {
    store.delete(k);
    return false;
  }
  return true;
}

function tempRemainingMin(jid) {
  const k = keyOf(jid);
  const exp = store.get(k);
  if (!exp) return 0;
  return Math.max(0, Math.ceil((exp - Date.now()) / 60000));
}

function isLimitedCommand(cmdName) {
  if (!cmdName) return false;
  return ALLOWED_COMMANDS.has(String(cmdName).toLowerCase().replace(/^\./, ''));
}

/** Detect if message is a reply to owner (or bot-fromMe owner) */
function isReplyToOwner(message, sock) {
  try {
    const msg = message.message || {};
    const ctx =
      msg.extendedTextMessage?.contextInfo ||
      msg.imageMessage?.contextInfo ||
      msg.videoMessage?.contextInfo ||
      msg.stickerMessage?.contextInfo ||
      msg.audioMessage?.contextInfo ||
      msg.documentMessage?.contextInfo ||
      null;
    if (!ctx) return false;

    const owner = settings.ownerNumber;
    const parts = [ctx.participant, ctx.remoteJid, ctx.participantPn].filter(Boolean);
    for (const p of parts) {
      if (sameNum(p, owner)) return true;
    }

    // quoted message was sent by bot account (owner often = bot)
    if (sock?.user) {
      const botIds = [sock.user.id, sock.user.lid, sock.user.jid].filter(Boolean);
      for (const b of botIds) {
        for (const p of parts) {
          if (sameNum(b, p) || String(b).split(':')[0] === String(p).split(':')[0]) return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

module.exports = {
  grantTempAccess,
  hasTempAccess,
  tempRemainingMin,
  isLimitedCommand,
  isReplyToOwner,
  ALLOWED_COMMANDS,
  TEMP_MS
};
