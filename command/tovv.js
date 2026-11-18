'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .tovv (OVL/PATRON port).
 * Quoted photo/video/audio ko view-once message bana ke bhejo.
 * Stock Baileys: { image/video/audio, viewOnce: true }.
 */
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;

module.exports = {
  command: 'tovv',
  aliases: ['viewonce', 'vvsend', 'sendvv'],
  description: 'Quoted photo/video ko view-once bana ke bhejo.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const media = await getMedia(message, ['image', 'video', 'audio']);
    if (!media) {
      await reply('❌ Pehle kisi photo/video/audio pe reply karo, phir *.tovv* chalao.');
      return;
    }
    try {
      if (media.kind === 'image') {
        await sock.sendMessage(chatId, { image: media.buffer, viewOnce: true, caption: args.join(' ') || '' }, { quoted: message });
      } else if (media.kind === 'video') {
        await sock.sendMessage(chatId, { video: media.buffer, viewOnce: true, caption: args.join(' ') || '' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { audio: media.buffer, mimetype: 'audio/mpeg', viewOnce: true }, { quoted: message });
      }
      await reply('✅ View-once bhej diya. Ek baar khulne ke baad gayab ho jayega.');
    } catch (e) {
      await reply('❌ View-once nahi bhej paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
