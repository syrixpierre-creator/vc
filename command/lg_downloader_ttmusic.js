'use strict';
/**
 * QUEEN AKUMA — .ttmusic / .ttmp3 (TikTok music download, tikwm).
 * Pehle ye compat wrapper tha jo vreden API (DEAD — probe me 000) wale
 * legacy plugin ko call karta tha. Ab real: tikwm.com API (free, no key,
 * live-verified 2026-11-16 — fake URL par sahi JSON error deta hai) se
 * TikTok video ka music (mp3) nikalta hai.
 */
const axios = require('axios');

module.exports = {
  command: "ttmusic",
  aliases: ["ttmp3"],
  category: "downloader",
  description: "TikTok video ka music (mp3) download karo (tikwm, free).",
  usage: ".ttmp3 <tiktok link>",
  handler: async (sock, message, args, ctx) => {
    const chatId = message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const input = (args || []).join(' ').trim();
    if (!/tiktok\.com|vt\.tiktok\.com/i.test(input)) {
      await reply('❌ TikTok video link do.\nExample: *.ttmp3 https://www.tiktok.com/@user/video/123...*');
      return;
    }
    try {
      const res = await axios.get('https://www.tikwm.com/api/', {
        params: { url: input }, timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const data = res.data || {};
      if (data.code !== 0 || !data.data) {
        await reply('❌ TikTok music nahi mila: ' + String(data.msg || 'video private/deleted ho sakta hai.').slice(0, 150));
        return;
      }
      const d = data.data;
      const musicUrl = d.music || (d.music_info && d.music_info.play);
      if (!musicUrl) {
        await reply('❌ Is video ka music nahi mila (music band ho sakta hai).');
        return;
      }
      const title = (d.music_info && d.music_info.title) || d.title || 'TikTok Music';
      const author = (d.author && d.author.nickname) || (d.music_info && d.music_info.author) || '';
      await sock.sendMessage(chatId, {
        audio: { url: musicUrl }, mimetype: 'audio/mpeg', fileName: String(title).slice(0, 60) + '.mp3'
      }, { quoted: message });
      await reply('🎵 *TikTok Music*\n\n🎧 ' + String(title).slice(0, 120) + (author ? '\n👤 ' + String(author).slice(0, 80) : ''));
    } catch (e) {
      await reply('❌ TikTok music download nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
