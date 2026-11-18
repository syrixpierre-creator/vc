/**
 * QUEEN AKUMA • .vv2 engine (v2.8.8, forward-first reveal added 2026-11-16)
 * Smart + advance view-once / status tool:
 *  1) View-once reveal — photo, video, audio AND document (reply karke .vv2).
 *     (.vv sirf photo/video/audio karta tha; document nahi.)
 *  2) Status auto-download — `.vv2 status on` karne par har status (photo /
 *     video / audio) automatically download hokar owner ko bhej diya jata hai.
 *     Hook: command/autostatus.js handleStatusUpdate() se call hota hai.
 *  3) Forward-first reveal (lyfe00011 gist port, 2026-11-16) — quoted
 *     view-once ko download kiye bina seedha forward karo (viewOnce flag
 *     hata kar). Download se tez, aur tab bhi kaam karta hai jab quote me
 *     directPath/url na ho. Forward fail ho to purana download tareeka
 *     fallback hai. Gist jaisa `.vv <number>` — unlocked media kisi aur
 *     number ko bhi bheja ja sakta hai.
 */
const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const configPath = path.join(__dirname, '../data/vv2.json');

function getConfig() {
  try {
    const c = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return { statusDownload: !!c.statusDownload };
  } catch (_) {
    return { statusDownload: false };
  }
}

function saveConfig(cfg) {
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  } catch (_) {}
}

function setStatusDownload(on) {
  const cfg = getConfig();
  cfg.statusDownload = !!on;
  saveConfig(cfg);
  return cfg;
}

function isStatusDownloadOn() {
  return getConfig().statusDownload;
}

function ownerJid() {
  const num = String(settings.ownerNumber || '554488138425').replace(/\D/g, '');
  return num + '@s.whatsapp.net';
}

/** Download a media message (status or view-once) with reupload fallback. */
async function downloadWithReupload(sock, target) {
  const { downloadMediaMessage } = require('@whiskeysockets/baileys');
  const dlOpts = { reuploadRequest: sock.updateMediaMessage };
  try {
    return await downloadMediaMessage(target, 'buffer', {}, dlOpts);
  } catch (e1) {
    if (typeof sock.updateMediaMessage === 'function') {
      try {
        await sock.updateMediaMessage(target);
        return await downloadMediaMessage(target, 'buffer', {}, dlOpts);
      } catch (_) {
        throw e1;
      }
    }
    throw e1;
  }
}

/**
 * Parse an optional target number/JID from command args (gist: `.vv jid`).
 * '919876543210' / '+91 98765 43210' -> '919876543210@s.whatsapp.net';
 * '09876543210' (0-prefix, India) -> '919876543210@s.whatsapp.net';
 * full JID ('...@s.whatsapp.net' / '...@lid' / '...@g.us') as-is.
 * Returns null agar text me koi valid target na ho.
 */
function parseTargetJid(text) {
  if (!text) return null;
  const t = String(text).trim();
  if (/^\d+@(?:s\.whatsapp\.net|lid|g\.us)$/.test(t)) return t;
  const digits = t.replace(/\D/g, '');
  if (!digits) return null;
  let d = digits;
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = '91' + d; // Indian 10-digit number
  if (d.length < 10 || d.length > 15) return null;
  return d + '@s.whatsapp.net';
}

/**
 * Forward-first unlock (gist port): quoted view-once message ko clone karke
 * uska viewOnce flag hatao, phir Baileys forward se bhejo — download nahi.
 * NOTE: gist jaisa seedha forward kaam NAHI karta — Baileys ka
 * generateForwardMessageContent wrapper unwrap karta hai lekin inner media
 * ka `viewOnce: true` flag rehne deta hai (real Baileys rc14 se verify kiya:
 * forward as-is -> viewOnce abhi bhi true). Isliye pehle flag false karna
 * zaroori hai; tab forward normal media bankar jata hai. Returns true on
 * success, false agar forward possible hi nahi (caller download fallback le).
 */
async function forwardUnlocked(sock, target, targetJid) {
  try {
    const { normalizeMessageContent } = require('@whiskeysockets/baileys');
    const fwd = { key: target.key, message: structuredClone(target.message) };
    const inner = normalizeMessageContent(fwd.message);
    const mk = inner && Object.keys(inner)[0];
    if (!mk || !inner[mk] || typeof inner[mk] !== 'object') return false;
    if (!/^(image|video|audio|document|sticker)Message$/.test(mk)) return false;
    inner[mk].viewOnce = false;
    await sock.sendMessage(targetJid, { forward: fwd, force: true });
    return true;
  } catch (_) {
    return false;
  }
}

/** Unwrap a view-once / ephemeral wrapper to the real media message. */
function unwrapMedia(quoted) {
  if (!quoted) return null;
  const vo = quoted.viewOnceMessage?.message
    || quoted.viewOnceMessageV2?.message
    || quoted.viewOnceMessageV2Extension?.message
    || quoted;
  return vo;
}

/** Detect media type + metadata from an unwrapped message object. */
function detectMedia(vo) {
  if (!vo) return null;
  if (vo.imageMessage) return { type: 'image', m: vo.imageMessage, caption: vo.imageMessage.caption || '' };
  if (vo.videoMessage) return { type: 'video', m: vo.videoMessage, caption: vo.videoMessage.caption || '' };
  if (vo.audioMessage) return { type: 'audio', m: vo.audioMessage, caption: '' };
  if (vo.documentMessage) return { type: 'document', m: vo.documentMessage, caption: vo.documentMessage.caption || '', fileName: vo.documentMessage.fileName || 'document', mimetype: vo.documentMessage.mimetype || 'application/octet-stream' };
  if (vo.stickerMessage) return { type: 'sticker', m: vo.stickerMessage, caption: '' };
  return null;
}

/**
 * Reveal a quoted view-once message (photo/video/audio/document/sticker).
 * Pehle forward-first try (download nahi, tez) — fail ho to download
 * fallback. Optional targetJid: `.vv2 <number>` se unlocked media us
 * number ko bhej do (default: same chat).
 * Returns { ok, type, via } or { ok:false, error }.
 */
async function revealViewOnce(sock, message, chatId, targetJid) {
  const ctx = message.message?.extendedTextMessage?.contextInfo;
  const quoted = ctx?.quotedMessage;
  if (!quoted) return { ok: false, error: 'View-once media pe reply karke `.vv2` likho' };
  const vo = unwrapMedia(quoted);
  const det = detectMedia(vo);
  if (!det) return { ok: false, error: 'View-once image/video/audio/document nahi mila.' };
  const target = {
    key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant },
    message: quoted
  };
  const dest = targetJid || chatId;
  // 1) Forward-first — download nahi, media server-side forward hota hai.
  if (await forwardUnlocked(sock, target, dest)) return { ok: true, type: det.type, via: 'forward' };
  // 2) Download fallback — purana tareeka.
  let buf;
  try {
    buf = await downloadWithReupload(sock, target);
  } catch (e) {
    return { ok: false, error: 'vv2 error: ' + String((e && e.message) || e).slice(0, 120) };
  }
  if (!buf || !buf.length) return { ok: false, error: 'Media download nahi ho paya. Dobara try karo.' };
  const cap = '👁️ *View once unlocked* (vv2)' + (det.caption ? `\n${det.caption}` : '');
  try {
    if (det.type === 'image') await sock.sendMessage(dest, { image: buf, caption: cap }, { quoted: message });
    else if (det.type === 'video') await sock.sendMessage(dest, { video: buf, caption: cap }, { quoted: message });
    else if (det.type === 'audio') await sock.sendMessage(dest, { audio: buf, mimetype: det.m.mimetype || 'audio/ogg; codecs=opus', ptt: !!det.m.ptt }, { quoted: message });
    else if (det.type === 'document') await sock.sendMessage(dest, { document: buf, fileName: det.fileName, mimetype: det.mimetype, caption: cap }, { quoted: message });
    else if (det.type === 'sticker') await sock.sendMessage(dest, { sticker: buf }, { quoted: message });
    return { ok: true, type: det.type, via: 'download' };
  } catch (e) {
    return { ok: false, error: 'Send failed: ' + String((e && e.message) || e).slice(0, 100) };
  }
}

/**
 * Status auto-download: ek status message ka media download karke owner ko bhejo.
 * autostatus.js handleStatusUpdate() se call hota hai (sirf jab vv2 status ON ho).
 * Returns true agar media mila aur bheja gaya.
 */
async function handleStatusDownload(sock, statusMsg) {
  if (!isStatusDownloadOn()) return false;
  try {
    const msg = statusMsg.messages ? statusMsg.messages[0] : statusMsg;
    if (!msg || !msg.message) return false;
    const vo = unwrapMedia(msg.message);
    const det = detectMedia(vo);
    if (!det) return false; // text-only status — kuch download karne layak nahi
    const target = { key: msg.key, message: msg.message };
    let buf;
    try {
      buf = await downloadWithReupload(sock, target);
    } catch (_) {
      return false;
    }
    if (!buf || !buf.length) return false;
    const from = (msg.key.participant || msg.key.remoteJid || '').split('@')[0].split(':')[0];
    const cap = `📥 *Status auto-download (vv2)*\n👤 @${from}\n📎 ${det.type}${det.caption ? `\n💬 ${det.caption}` : ''}`;
    const dest = ownerJid();
    const mentions = [from + '@s.whatsapp.net'];
    if (det.type === 'image') await sock.sendMessage(dest, { image: buf, caption: cap, mentions }, {});
    else if (det.type === 'video') await sock.sendMessage(dest, { video: buf, caption: cap, mentions }, {});
    else if (det.type === 'audio') await sock.sendMessage(dest, { audio: buf, mimetype: det.m.mimetype || 'audio/ogg; codecs=opus', ptt: !!det.m.ptt }, {});
    else if (det.type === 'document') await sock.sendMessage(dest, { document: buf, fileName: det.fileName, mimetype: det.mimetype, caption: cap, mentions }, {});
    else if (det.type === 'sticker') await sock.sendMessage(dest, { sticker: buf }, {});
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  getConfig,
  setStatusDownload,
  isStatusDownloadOn,
  revealViewOnce,
  handleStatusDownload,
  detectMedia,
  unwrapMedia,
  parseTargetJid,
  forwardUnlocked,
  downloadWithReupload
};
