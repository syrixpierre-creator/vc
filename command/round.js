'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .round + .fusion (OVL port).
 * .round — photo ko rounded-corner sticker banao (local Jimp, no API).
 * .fusion — audio + video ek saath merge karo, ek hi message me (local ffmpeg).
 */
const fs = require('fs');
const { Jimp } = require('jimp');
const mediaDl = require('../lib/mediaDl');
const { getMedia, getMediaPair, writeTmp, cleanup, ffmpeg } = mediaDl;
const { sticker5 } = require('../lib/sticker');
const settings = require('../settings');

function roundCorners(img, r) {
  const w = img.bitmap.width, h = img.bitmap.height;
  img.scan(0, 0, w, h, function (x, y, idx) {
    const outsideCircle = (cx, cy) => {
      const dx = x - cx, dy = y - cy;
      return dx * dx + dy * dy > r * r;
    };
    let outside = false;
    if (x < r && y < r) outside = outsideCircle(r, r);
    else if (x >= w - r && y < r) outside = outsideCircle(w - r - 1, r);
    else if (x < r && y >= h - r) outside = outsideCircle(r, h - r - 1);
    else if (x >= w - r && y >= h - r) outside = outsideCircle(w - r - 1, h - r - 1);
    if (outside) img.bitmap.data[idx + 3] = 0;
  });
  return img;
}

module.exports = {
  commands: [
    {
      command: 'round', aliases: ['rounded', 'roundsticker'],
      description: 'Make a rounded-corner sticker from a photo.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const media = await getMedia(message, ['image', 'sticker']);
        if (!media) {
          await reply('📌 *Usage:* reply to a photo or sticker with .round');
          return;
        }
        try {
          const img = await Jimp.read(media.buffer);
          img.cover({ w: 512, h: 512 });
          roundCorners(img, 64);
          const png = await img.getBuffer('image/png');
          const pack = (settings && (settings.packname || settings.packName)) || 'QUEEN AKUMA';
          const author = (settings && settings.author) || 'INCONNU BOY SENSEI';
          const webp = await sticker5(png, null, pack, author);
          await sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
        } catch (e) {
          await reply('❌ Round sticker nahi ban paya: ' + String(e.message || e).slice(0, 120));
        }
      }
    },
    {
      command: 'fusion', aliases: ['avfusion', 'mergeav2'],
      description: 'Merge audio + video: reply to an audio while sending a video.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const pair = await getMediaPair(message);
        const own = pair.own, quoted = pair.quoted;
        let videoBuf = null, audioBuf = null;
        if (own && quoted) {
          if (own.kind === 'video' && quoted.kind === 'audio') { videoBuf = own.buffer; audioBuf = quoted.buffer; }
          else if (own.kind === 'audio' && quoted.kind === 'video') { audioBuf = own.buffer; videoBuf = quoted.buffer; }
        }
        if (!videoBuf || !audioBuf) {
          await reply('📌 *Usage:* reply to an audio/video with .fusion');
          return;
        }
        const vIn = writeTmp(videoBuf, 'mp4');
        const aIn = writeTmp(audioBuf, 'mp3');
        const outPath = vIn + '.fusion.mp4';
        try {
          await ffmpeg(['-y', '-i', vIn, '-i', aIn, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath], 120000);
          await sock.sendMessage(chatId, { video: fs.readFileSync(outPath), caption: '🔀 Fusion ready' }, { quoted: message });
        } catch (e) {
          await reply('❌ *Fusion failed:* ' + String(e.message || e).slice(0, 150));
        } finally { cleanup(vIn, aIn, outPath); }
      }
    }
  ]
};
