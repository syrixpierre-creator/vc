'use strict';
/**
 * QUEEN AKUMA — .skull (photo skull effect, local Jimp).
 * Pehle ye sirf stub template tha. Ab real: quoted photo par lib/fxEffects.js
 * ka 'skull' effect (greyscale + contrast, dead black-white look) lagata hai.
 * .fx skull wala hi effect hai — ye uska direct naam hai.
 */
const { getMedia } = require('../lib/mediaDl');
const { applyEffect } = require('../lib/fxEffects');

module.exports = {
  command: 'skull',
  aliases: [],
  category: 'tools',
  description: 'Photo par skull effect lagao (dead black-white).',
  usage: '.skull (photo pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message, ['image']);
    if (!media) {
      await reply('❌ Kisi photo pe reply karke *.skull* chalao.\n(.fx skull se bhi yehi effect lagta hai.)');
      return;
    }
    const res = await applyEffect(media.buffer, 'skull');
    if (!res.ok) {
      await reply('❌ ' + (res.error || 'Effect nahi lag paya.'));
      return;
    }
    await sock.sendMessage(chatId, { image: res.buffer, caption: '💀 *Skull Effect*\nDead black-white look • QUEEN AKUMA' }, { quoted: message });
  }
};
