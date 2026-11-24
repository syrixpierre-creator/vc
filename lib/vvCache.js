'use strict';
/**
 * QUEEN AKUMA — view-once cache.
 * WhatsApp often gives the bot a view-once it can no longer download later
 * (the quote has no media keys, the link expires once opened). So the bot
 * downloads every view-once photo / video / voice note the moment it ARRIVES
 * and keeps it in memory for a short time; .vv then sends it back from here.
 * Limits: 30 minutes, 60 MB in total per bot, 25 MB per file.
 */
const TTL_MS = 30 * 60 * 1000;
const MAX_TOTAL = 60 * 1024 * 1024;
const MAX_FILE = 25 * 1024 * 1024;
const cache = new Map(); // id -> { buffer, kind, mimetype, ptt, at }
let total = 0;

function unwrap(msg) {
  let cur = msg;
  for (let i = 0; i < 8 && cur; i++) {
    const inner = cur.viewOnceMessageV2?.message || cur.viewOnceMessageV2Extension?.message
      || cur.viewOnceMessage?.message || cur.ephemeralMessage?.message
      || cur.documentWithCaptionMessage?.message || cur.editedMessage?.message;
    if (!inner) break;
    cur = inner;
  }
  return cur || null;
}
function isViewOnce(msg) {
  let cur = msg;
  for (let i = 0; i < 8 && cur; i++) {
    if (cur.viewOnceMessage || cur.viewOnceMessageV2 || cur.viewOnceMessageV2Extension) return true;
    const node = cur.imageMessage || cur.videoMessage || cur.audioMessage;
    if (node && node.viewOnce) return true;
    cur = cur.ephemeralMessage?.message || cur.documentWithCaptionMessage?.message || null;
  }
  return false;
}
function findMedia(c) {
  if (!c) return null;
  if (c.imageMessage) return { kind: 'image', node: c.imageMessage };
  if (c.videoMessage) return { kind: 'video', node: c.videoMessage };
  if (c.audioMessage) return { kind: 'audio', node: c.audioMessage };
  return null;
}
function prune() {
  const now = Date.now();
  for (const [id, e] of cache) if (now - e.at > TTL_MS) { total -= e.buffer.length; cache.delete(id); }
  while (total > MAX_TOTAL && cache.size) { const [id, e] = cache.entries().next().value; total -= e.buffer.length; cache.delete(id); }
}

function start(sock) {
  if (!sock || sock.__vvCache) return;
  sock.__vvCache = true;
  let download;
  try { ({ downloadMediaMessage: download } = require('@whiskeysockets/baileys')); } catch (_) { return; }
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const m of messages || []) {
      try {
        if (!m || !m.message || !m.key || m.key.fromMe || !isViewOnce(m.message)) continue;
        const content = unwrap(m.message);
        const media = findMedia(content);
        if (!media) continue;
        console.log(`[vv-cache] view-once ${m.key.id} ${media.kind} mediaKey=${!!(media.node.mediaKey && media.node.mediaKey.length)} directPath=${!!media.node.directPath} url=${!!media.node.url}`);
        const len = Number(media.node.fileLength && media.node.fileLength.toNumber ? media.node.fileLength.toNumber() : media.node.fileLength) || 0;
        if (len > MAX_FILE) continue;
        download({ key: m.key, message: content }, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage })
          .then((buffer) => {
            if (!buffer || !buffer.length || buffer.length > MAX_FILE) return;
            cache.set(m.key.id, { buffer, kind: media.kind, mimetype: media.node.mimetype, ptt: !!media.node.ptt, at: Date.now() });
            total += buffer.length;
            console.log(`[vv-cache] saved ${m.key.id} (${Math.round(buffer.length / 1024)} KB)`);
            prune();
          })
          .catch((e) => console.log('[vv-cache] download failed:', e && e.message));
      } catch (_) {}
    }
  });
  setInterval(prune, 60000).unref();
}

function get(id) { prune(); return id ? cache.get(id) || null : null; }

module.exports = { start, get, unwrap, findMedia };
