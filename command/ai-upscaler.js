'use strict';
/**
 * QUEEN AKUMA — .upscale (LOCAL Jimp implementation).
 * Pehle ye sirf stub template tha. Ab: quoted image 2x upscale karta hai
 * (Jimp resize + normalize + sharpen). Ye LOCAL enhance hai — koi AI
 * upscaler API nahi (Remini jaisi services dead/unverified hain).
 * Jimp 1.6.1 API: resize({w,h}) options-object, brightness MULTIPLIER hai.
 */
const { Jimp } = require('jimp');
const { getMedia } = require('../lib/mediaDl');

const SHARPEN = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];

module.exports = {
  command: 'upscale',
  aliases: [],
  category: 'ai',
  description: 'Quoted image ko 2x upscale karo (local Jimp enhance).',
  usage: '.upscale (image pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message, ['image']);
    if (!media) {
      await reply('❌ Kisi photo pe reply karke *.upscale* chalao.\nYe local 2x enhance hai (AI upscaler nahi).');
      return;
    }
    try {
      const img = await Jimp.read(media.buffer);
      const w = Math.min(img.width * 2, 2048);
      const h = Math.min(img.height * 2, 2048);
      img.resize({ w, h });
      img.normalize().contrast(0.15).convolute(SHARPEN);
      const out = await img.getBuffer('image/jpeg');
      await sock.sendMessage(chatId, {
        image: out,
        caption: '🔍 *Upscaled (2x)*\n' + img.width + 'x' + img.height + ' → ' + w + 'x' + h + '\n_Local Jimp enhance — AI upscaler nahi._'
      }, { quoted: message });
    } catch (e) {
      await reply('❌ Upscale nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
