'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .memegen (QUEEN AKUMA port).
 * Image par top/bottom text. API: api.memegen.link (free, no key) — background
 * ke liye image pehle upload hoti hai (lib/uploaders, multi-host race).
 * Fallback: local Jimp meme (koi API nahi).
 */
const axios = require('axios');
const { Jimp, loadFont } = require('jimp');
const fonts = require('@jimp/plugin-print/fonts');
const { measureText } = require('@jimp/plugin-print');
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;
const { uploadFileFast } = require('../lib/uploaders');

const slug = s => encodeURIComponent(String(s || '').trim().replace(/\s+/g, '_'));

async function jimpMeme(buffer, top, bottom) {
  const img = await Jimp.read(buffer);
  img.cover({ w: 512, h: 512 });
  const font = await loadFont(fonts.SANS_32_WHITE);
  const fontBlack = await loadFont(fonts.SANS_32_BLACK);
  const draw = (text, y) => {
    if (!text) return;
    const t = String(text).slice(0, 40);
    const w = measureText(font, t);
    const x = Math.max(8, (512 - w) / 2);
    img.print({ font: fontBlack, x: x + 2, y: y + 2, text: t, maxWidth: 496 });
    img.print({ font, x, y, text: t, maxWidth: 496 });
  };
  draw(top, 12);
  draw(bottom, 512 - 92);
  return img.getBuffer('image/jpeg');
}

module.exports = {
  command: 'memegen',
  aliases: ['meme', 'makememe'],
  description: 'Write top/bottom text on a photo: .memegen top | bottom',
  category: 'fun',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const media = await getMedia(message, ['image']);
    if (!media) {
      await reply('📌 *Usage:* reply to a photo with .memegen <top> | <bottom>');
      return;
    }
    const joined = (args || []).join(' ');
    const parts = joined.split('|').map(s => (s || '').trim());
    const top = parts[0] || '';
    const bottom = parts[1] || '';
    if (!top && !bottom) {
      await reply('📌 *Usage:* .memegen <top> | <bottom>');
      return;
    }
    // API pehle — uploadFileFast {url, host} object deta hai (string nahi);
    // encodeURIComponent(object) => "[object Object]" hota, isliye .url nikalo.
    try {
      const up = await uploadFileFast(media.buffer, 'meme.jpg');
      const bgUrl = up && typeof up === 'object' ? up.url : up;
      if (bgUrl) {
        const url = 'https://api.memegen.link/images/custom/' + slug(top || '_') + '/' + slug(bottom || '_') + '.png?background=' + encodeURIComponent(bgUrl);
        const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000, maxContentLength: 20 * 1024 * 1024 });
        const ct = String((res.headers && res.headers['content-type']) || '');
        if (ct.indexOf('image') !== -1) {
          await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: '😂 Meme ready' }, { quoted: message });
          return;
        }
      }
    } catch (e) {}
    // Fallback: local Jimp
    try {
      const out = await jimpMeme(media.buffer, top.toUpperCase(), bottom.toUpperCase());
      await sock.sendMessage(chatId, { image: out, caption: '😂 Meme ready' }, { quoted: message });
    } catch (e) {
      await reply('❌ Meme nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
