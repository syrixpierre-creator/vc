/**
 * QUEEN AKUMA v3.5.0 • #27 Multi-host uploader commands (QUEEN AKUMA lib/uploaders.js se)
 * lib/uploaders.js me 8 hosts hain (Catbox, Qu.ax, Uguu, Pomf2, Tmpfiles,
 * Pixhost, Litterbox, X0.at) — fallback chain + parallel race (uploadFast).
 * Commands: .upfile (auto chain) • .upfast (parallel race) • .upcatbox etc.
 * Kisi bhi media (image/video/audio/document/sticker) par reply karke bhejo.
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const uploaders = require('../lib/uploaders');

const HOST_CMDS = {
  upcatbox: uploaders.uploadToCatbox,
  uppomf: uploaders.uploadToPomf2,
  upquax: uploaders.uploadToQuax,
  upuguu: uploaders.uploadToUguu,
  uptmpfiles: uploaders.uploadToTmpfiles,
  uppixhost: uploaders.uploadToPixhost,
  uplitterbox: uploaders.uploadToLitterbox,
  upx0at: uploaders.uploadToX0,
};

const menu =
  '📤 *Upload — Multi-Host*\n\n' +
  '• `.upfile` — auto fallback chain (Catbox → Qu.ax → Uguu → Pomf2 → Tmpfiles → Pixhost → Litterbox → X0.at)\n' +
  '• `.upfast` — 3 hosts parallel race, jo pehle de wo jeete\n' +
  '• `.upcatbox` `.upquax` `.upuguu` `.uppomf` `.uptmpfiles` `.uppixhost` `.uplitterbox` `.upx0at` — ek host chuno\n\n' +
  '📌 Kisi bhi media par reply karke bhejo, ya media ke saath caption me likho.';

async function getMedia(message) {
  const m = message.message || {};
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
  const node = m.imageMessage || m.videoMessage || m.audioMessage || m.documentMessage || m.stickerMessage
    || quoted?.imageMessage || quoted?.videoMessage || quoted?.audioMessage || quoted?.documentMessage || quoted?.stickerMessage;
  if (!node) return null;
  const type = node.mimetype && node.mimetype.startsWith('image/') ? 'image'
    : node.mimetype && node.mimetype.startsWith('video/') ? 'video'
    : node.mimetype && node.mimetype.startsWith('audio/') ? 'audio'
    : m.documentMessage || quoted?.documentMessage ? 'document' : 'image';
  const stream = await downloadContentFromMessage(node, type === 'document' ? 'document' : type);
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  const ext = (node.mimetype || '').split('/')[1]?.split(';')[0] || 'bin';
  const filename = node.fileName || `upload_${Date.now()}.${ext}`;
  return { buf: Buffer.concat(chunks), filename };
}

module.exports = {
  command: 'uploadhost',
  aliases: ['upfile', 'upfast', ...Object.keys(HOST_CMDS)],
  category: 'tools',
  description: 'Upload any media to a free host — 8 hosts, fallback chain + parallel race',
  usage: '.upfile / .upfast / .upcatbox (reply to media)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'uploadhost').toLowerCase();
    const media = await getMedia(message).catch(() => null);
    if (!media) return reply(menu);
    try {
      let res;
      if (HOST_CMDS[invoked]) res = await HOST_CMDS[invoked](media.buf, media.filename);
      else if (invoked === 'upfast') res = await uploaders.uploadFast(media.buf, media.filename);
      else res = await uploaders.upload(media.buf, media.filename);
      const host = res.host || res.service || invoked;
      return reply(`✅ *Uploaded* (${host})\n\n🔗 ${res.url}`);
    } catch (e) {
      return reply('❌ Upload fail ho gaya: ' + (e.message || e));
    }
  },
};
