 'use strict';
/**
 * QUEEN AKUMA — .stickergif : sticker ko GIF banao (ffmpeg, local, no API).
 * Usage: sticker pe reply karke .stickergif
 */
const fs = require('fs');
const mediaDl = require('../lib/mediaDl');
const { getMedia, ffmpeg, writeTmp, cleanup } = mediaDl;

module.exports = {
  command: 'stickergif',
  aliases: [],
  category: 'sticker',
  description: 'Turn a sticker into a GIF: reply to a sticker with .stickergif',
  usage: '.stickergif (sticker pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message, ['sticker']);
    if (!media) {
      await reply('🎬 *Sticker → GIF*\n\nKisi sticker pe reply karke `.stickergif` bhejo.');
      return;
    }
    if (media.buffer.length > 20 * 1024 * 1024) {
      await reply('❌ Sticker bahut bada hai (20MB tak allowed).');
      return;
    }
    const inPath = writeTmp(media.buffer, 'webp');
    const outPath = inPath + '.gif';
    try {
      await ffmpeg(['-y', '-i', inPath, '-vf', 'scale=320:-1:flags=lanczos', '-loop', '0', outPath], 60000);
      const buf = fs.readFileSync(outPath);
      await sock.sendMessage(chatId, { video: buf, gifPlayback: true, caption: '🎬 Sticker → GIF' }, { quoted: message });
    } catch (e) {
      await reply('❌ GIF nahi ban paya: ' + String(e.message || e).slice(0, 120));
    } finally {
      try { cleanup(); } catch (e) {}
      try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
    }
  },
};
