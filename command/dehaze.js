'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .dehaze + .recolor (QUEEN AKUMA port, LOCAL implementation).
 * QUEEN AKUMA Vyro API use karta tha (unofficial, kabhi bhi band ho sakta hai) —
 * yahan wahi kaam local Jimp se: koi API nahi, kabhi down nahi hoga.
 */
const { Jimp } = require('jimp');
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;

const SHARPEN = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];

const RECOLORS = {
  vivid: { desc: 'Rang bhadkao', run: (img) => img.color([{ apply: 'saturate', params: [50] }]).contrast(0.2) },
  warm: { desc: 'Garam (peela-laal) tone', run: (img) => img.color([{ apply: 'red', params: [25] }]).brightness(1.05).color([{ apply: 'saturate', params: [20] }]) },
  cool: { desc: 'Thanda (neela) tone', run: (img) => img.color([{ apply: 'blue', params: [30] }]).brightness(1.02) },
  vintage: { desc: 'Purana film look', run: (img) => img.sepia().contrast(0.2).brightness(0.95) },
  mono: { desc: 'Black & white', run: (img) => img.greyscale().contrast(0.3) },
  neon: { desc: 'Neon pop', run: (img) => img.color([{ apply: 'saturate', params: [80] }]).contrast(0.4).brightness(1.08) }
};

module.exports = {
  commands: [
    {
      command: 'dehaze', aliases: ['enhancephoto', 'clearphoto'],
      description: 'Dhundlee photo saaf karo — contrast + sharpness (local, no API).',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const media = await getMedia(message, ['image']);
        if (!media) {
          await reply('📌 *Usage:* reply to a photo with .dehaze');
          return;
        }
        try {
          const img = await Jimp.read(media.buffer);
          img.normalize().contrast(0.25).convolute(SHARPEN).brightness(1.05);
          const out = await img.getBuffer('image/jpeg');
          await sock.sendMessage(chatId, { image: out, caption: '✨ Dehazed photo' }, { quoted: message });
        } catch (e) {
          await reply('❌ *Dehaze failed:* ' + String(e.message || e).slice(0, 120));
        }
      }
    },
    {
      command: 'recolor', aliases: ['retint', 'photofilter'],
      description: 'Photo ka rang badlo: .recolor vivid | warm | cool | vintage | mono | neon',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const style = String((args && args[0]) || 'vivid').toLowerCase();
        const rc = RECOLORS[style];
        if (!rc) {
          await reply('❌ Style galat hai. Styles: ' + Object.keys(RECOLORS).join(', ') + '\nExample: .recolor warm');
          return;
        }
        const media = await getMedia(message, ['image']);
        if (!media) {
          await reply('📌 *Usage:* reply to a photo with .recolor ' + style + '* chalao.');
          return;
        }
        try {
          const img = await Jimp.read(media.buffer);
          rc.run(img);
          const out = await img.getBuffer('image/jpeg');
          await sock.sendMessage(chatId, { image: out, caption: '🎨 Recolor: ' + style + ' (' + rc.desc + ')' }, { quoted: message });
        } catch (e) {
          await reply('❌ *Recolor failed:* ' + String(e.message || e).slice(0, 120));
        }
      }
    }
  ]
};
