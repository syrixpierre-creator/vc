'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .getexif (RyzumiMD port).
 * Sticker/image ki EXIF info dikhao. Local — koi API nahi.
 * WebP: node-webpmux (deps me hai). JPEG: EXIF APP1 segment se readable tags.
 */
const { Jimp } = require('jimp');
const mediaDl = require('../lib/mediaDl');
const { getMedia } = mediaDl;

function readableStrings(buf, minLen) {
  const out = [];
  let cur = '';
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b >= 32 && b <= 126) { cur += String.fromCharCode(b); }
    else {
      if (cur.length >= (minLen || 4)) out.push(cur);
      cur = '';
    }
  }
  if (cur.length >= (minLen || 4)) out.push(cur);
  return out;
}

function jpegExifInfo(buf) {
  // APP1 (EXIF) segment dhoondho
  let pos = 2; // SOI skip
  while (pos + 4 < buf.length) {
    if (buf[pos] !== 0xFF) break;
    const marker = buf[pos + 1];
    const len = buf.readUInt16BE(pos + 2);
    if (marker === 0xE1) {
      const seg = buf.slice(pos + 4, pos + 2 + len);
      if (seg.slice(0, 6).toString('latin1') === 'Exif\0\0') {
        const strs = readableStrings(seg.slice(6), 4)
          .filter((s) => /[A-Za-z]{3,}/.test(s) && !/^[0-9:. ]+$/.test(s));
        return strs.slice(0, 20);
      }
      return [];
    }
    if (marker === 0xDA) break; // SOS — image data shuru
    pos += 2 + len;
  }
  return [];
}

module.exports = {
  command: 'getexif',
  aliases: ['exif', 'imginfo'],
  description: 'Sticker/image ki EXIF info dikhao.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const media = await getMedia(message, ['image', 'sticker']);
    if (!media) {
      await reply('❌ Pehle kisi photo/sticker pe reply karo, phir *.getexif* chalao.');
      return;
    }
    try {
      let dims = '';
      try {
        const img = await Jimp.read(media.buffer);
        dims = img.bitmap.width + 'x' + img.bitmap.height;
      } catch (e) {}
      const sizeKB = (media.buffer.length / 1024).toFixed(1);
      let lines = ['🔍 *EXIF / Image Info*\n', '📦 Size: ' + sizeKB + ' KB' + (dims ? '\n📐 Dimensions: ' + dims : '') + '\n🏷️ Type: ' + media.kind];
      if (media.kind === 'sticker') {
        try {
          const { Image } = require('node-webpmux');
          const img = new Image();
          await img.load(media.buffer);
          const exif = img.exif;
          if (exif && exif.length) {
            const strs = readableStrings(Buffer.from(exif), 4).filter((s) => /[A-Za-z]{3,}/.test(s));
            lines.push('\n📋 EXIF (' + exif.length + ' bytes):\n' + (strs.length ? strs.slice(0, 15).join('\n') : '(binary data, readable text nahi)'));
          } else {
            lines.push('\n📋 EXIF: nahi mila (sticker me EXIF nahi hota aksar — sirf pack/author hota hai)');
            if (img.icc) lines.push('🎨 ICC profile: haan');
          }
        } catch (e) {
          lines.push('\n📋 WebP EXIF parse nahi ho paya: ' + String(e.message || e).slice(0, 80));
        }
      } else {
        const tags = jpegExifInfo(media.buffer);
        if (tags.length) lines.push('\n📋 EXIF tags:\n' + tags.join('\n'));
        else lines.push('\n📋 EXIF: nahi mila (ye photo EXIF ke bina save hui hai)');
      }
      await reply(lines.join('\n'));
    } catch (e) {
      await reply('❌ EXIF nahi nikal paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
