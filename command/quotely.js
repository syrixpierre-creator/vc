'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .quotely (QUEEN AKUMA / OVL port).
 * Quoted text se designed quote sticker. API: bot.lyo.su/quote/generate (free, no key).
 * Fallback: local Jimp quote card (avatar + naam + text) — koi API nahi.
 */
const axios = require('axios');
const { Jimp, loadFont } = require('jimp');
const fonts = require('@jimp/plugin-print/fonts');
const mediaDl = require('../lib/mediaDl');
const { quotedMsg, quotedSender, avatarUrl } = mediaDl;
const { sticker5 } = require('../lib/sticker');
const settings = require('../settings');

async function jimpQuote(avatarBuf, name, text) {
  const card = await new Jimp({ width: 512, height: 512, color: 0x111827ff });
  if (avatarBuf) {
    try {
      const av = await Jimp.read(avatarBuf);
      av.cover({ w: 96, h: 96 }).circle();
      card.composite(av, 24, 24);
    } catch (e) {}
  }
  const fontName = await loadFont(fonts.SANS_32_WHITE);
  const fontBody = await loadFont(fonts.SANS_16_WHITE);
  card.print({ font: fontName, x: 136, y: 40, text: String(name || 'User').slice(0, 24), maxWidth: 360, maxHeight: 50 });
  card.print({ font: fontBody, x: 24, y: 150, text: String(text || '').slice(0, 500), maxWidth: 464, maxHeight: 330 });
  return card.getBuffer('image/png');
}

module.exports = {
  command: 'quotely',
  aliases: ['q', 'quote'],
  description: 'Make a quote sticker from a quoted message.',
  category: 'fun',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const q = quotedMsg(message);
    if (!q) {
      await reply('📌 *Usage:* reply to a message with .quotely');
      return;
    }
    const qText = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) ||
      (q.imageMessage && q.imageMessage.caption) || (q.videoMessage && q.videoMessage.caption) || '';
    if (!qText) {
      await reply('❌ *The quoted message has no text.*');
      return;
    }
    const sender = quotedSender(message) || message.key.participant || message.key.remoteJid;
    const name = String(sender).split('@')[0];
    const pack = (settings && (settings.packname || settings.packName)) || 'QUEEN AKUMA';
    const author = (settings && settings.author) || 'INCONNU BOY SENSEI';
    // API pehle
    try {
      let pfp = null;
      try { pfp = await sock.profilePictureUrl(sender, 'image'); } catch (e) {}
      const bg = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
      const body = {
        type: 'quote', format: 'png', backgroundColor: bg, width: 512, height: 512, scale: 3,
        messages: [{
          avatar: true,
          from: { first_name: name, language_code: 'en', name, photo: { url: pfp || 'https://cdn.discordapp.com/embed/avatars/0.png' } },
          text: qText, replyMessage: {}
        }]
      };
      const res = await axios.post('https://bot.lyo.su/quote/generate', body, { timeout: 20000 });
      const b64 = res.data && res.data.result && res.data.result.image;
      if (b64) {
        const img = Buffer.from(b64, 'base64');
        const webp = await sticker5(img, null, pack, author);
        await sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
        return;
      }
    } catch (e) {}
    // Fallback: local Jimp card
    try {
      let avatarBuf = null;
      try {
        const avUrl = await avatarUrl(sock, sender);
        const r = await axios.get(avUrl, { responseType: 'arraybuffer', timeout: 12000 });
        avatarBuf = Buffer.from(r.data);
      } catch (e) {}
      const png = await jimpQuote(avatarBuf, name, qText);
      const webp = await sticker5(png, null, pack, author);
      await sock.sendMessage(chatId, { sticker: webp }, { quoted: message });
    } catch (e) {
      await reply('❌ Quote sticker nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
