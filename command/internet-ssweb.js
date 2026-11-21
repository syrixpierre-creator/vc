'use strict';
/**
 * QUEEN AKUMA — .ssweb (website screenshot, image.thum.io).
 * Pehle ye sirf stub template tha (aur .ssweb naam waise bhi ss2.js ke
 * alias se chalta tha). Ab real: image.thum.io screenshot API (free, no
 * key, live-verified 2026-11-16) se website ka screenshot bhejta hai.
 */
const axios = require('axios');

function normalizeUrl(input) {
  if (!input) return null;
  let u = String(input).trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes('.')) return null;
    return parsed.toString();
  } catch { return null; }
}

module.exports = {
  command: 'ssweb',
  aliases: [],
  category: 'tools',
  description: 'Website ka screenshot lo (image.thum.io, free).',
  usage: '.ssweb <url>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const target = normalizeUrl((args || [])[0]);
    if (!target) {
      await reply('❌ Website URL do.\nExample: *.ssweb google.com* ya *.ssweb https://github.com*');
      return;
    }
    try {
      const shotUrl = 'https://image.thum.io/get/width/1280/' + target;
      const res = await axios.get(shotUrl, {
        responseType: 'arraybuffer', timeout: 45000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const ct = String((res.headers && res.headers['content-type']) || '');
      if (!ct.startsWith('image/') || !res.data || res.data.length < 1000) {
        await reply('❌ *Screenshot failed.* Try another URL.');
        return;
      }
      await sock.sendMessage(chatId, {
        image: Buffer.from(res.data),
        caption: '📸 *Website Screenshot*\n\n🌐 ' + new URL(target).hostname + '\n🔗 ' + target
      }, { quoted: message });
    } catch (e) {
      await reply('❌ Screenshot nahi ban paya: ' + String(e.message || e).slice(0, 120) + '\nThodi der baad try karo.');
    }
  }
};
