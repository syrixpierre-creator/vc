'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .doc (raganork port).
 * Koi bhi message document banao — text, photo, video, audio, sticker.
 */
const mediaDl = require('../lib/mediaDl');
const { getMedia, quotedMsg } = mediaDl;

function extFor(kind, mime) {
  const map = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg',
    'application/pdf': 'pdf'
  };
  return map[mime] || (kind === 'image' ? 'jpg' : kind === 'video' ? 'mp4' : kind === 'audio' ? 'mp3' : 'bin');
}

module.exports = {
  command: 'doc',
  aliases: ['todoc', 'makedoc'],
  description: 'Kisi bhi message ko document banao.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const q = quotedMsg(message);
    // Pehle media try karo
    const media = await getMedia(message, ['image', 'video', 'audio', 'sticker']);
    if (media) {
      const qm = q || {};
      const content = qm.imageMessage || qm.videoMessage || qm.audioMessage || qm.stickerMessage || qm.documentMessage || {};
      const mime = content.mimetype || '';
      const ext = extFor(media.kind, mime);
      const fname = (args[0] || 'QUEEN-AKUMA-file') + '.' + ext;
      const mimetype = mime || (media.kind === 'image' ? 'image/jpeg' : media.kind === 'video' ? 'video/mp4' : media.kind === 'audio' ? 'audio/mpeg' : 'application/octet-stream');
      try {
        await sock.sendMessage(chatId, { document: media.buffer, mimetype, fileName: fname }, { quoted: message });
        return;
      } catch (e) {
        await reply('❌ Document nahi ban paya: ' + String(e.message || e).slice(0, 120));
        return;
      }
    }
    // Phir text
    const text = q
      ? (q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || '')
      : (message.message && (message.message.conversation || (message.message.extendedTextMessage && message.message.extendedTextMessage.text)) || '');
    const body = text || (args || []).join(' ');
    if (!body) {
      await reply('❌ Pehle kisi message (text/photo/video/audio) pe reply karo, phir *.doc* chalao.');
      return;
    }
    const fname = (args[0] || 'QUEEN-AKUMA-message') + '.txt';
    await sock.sendMessage(chatId, { document: Buffer.from(body, 'utf8'), mimetype: 'text/plain', fileName: fname }, { quoted: message });
  }
};
