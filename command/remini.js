'use strict';
/**
 * QUEEN AKUMA — .remini (LOCAL photo enhance).
 * Pehle ye princetechn API use karta tha (unverified, hardcoded API key
 * ke saath) — wo backend dead hai. Ab real local implementation: Jimp se
 * 2x upscale + normalize + contrast + sharpen (dehaze.js jaisa pattern).
 * HONEST NOTE: ye AI Remini nahi hai — local enhance hai. Koi AI enhance
 * API free/no-key me available nahi hai.
 * ('upscale' alias hataya gaya — .upscale ab ai-upscaler.js ka hai.)
 */
const { Jimp } = require('jimp');
const { getMedia } = require('../lib/mediaDl');

const SHARPEN = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];

module.exports = {
  command: 'remini',
  aliases: ['enhance'],
  category: 'tools',
  description: 'Photo enhance karo (local Jimp 2x + sharpen — AI nahi).',
  usage: '.remini (photo pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message, ['image']);
    if (!media) {
      await reply('📸 *Remini — Photo Enhance*\n\nKisi photo pe reply karke *.remini* chalao.\n\n_Note: ye local Jimp enhance hai (2x + sharpen) — AI Remini service dead hai, isliye AI enhance nahi milta._');
      return;
    }
    try {
      const img = await Jimp.read(media.buffer);
      const w = Math.min(img.width * 2, 2048);
      const h = Math.min(img.height * 2, 2048);
      img.resize({ w, h });
      img.normalize().contrast(0.2).convolute(SHARPEN).brightness(1.03);
      const out = await img.getBuffer('image/jpeg');
      await sock.sendMessage(chatId, {
        image: out,
        caption: '✨ *Photo Enhanced*\n' + img.width + 'x' + img.height + ' → ' + w + 'x' + h + '\n_Local Jimp enhance — AI Remini nahi._'
      }, { quoted: message });
    } catch (e) {
      await reply('❌ Enhance nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
