'use strict';
/**
 * QUEEN AKUMA — .wallpaper / .4kwall / .hdwall (Wallhaven search).
 * Pehle ye compat wrapper tha jo stub 4kwallpaper.js + smartRun fallback
 * me girta tha. Ab real: wallhaven.cc API v1 (free, no key, live-verified
 * 2026-11-16) se search karke random wallpaper bhejta hai. SFW only.
 */
const axios = require('axios');

module.exports = {
  command: "4kwallpaper2",
  aliases: ["wallpaper","4kwall","hdwall"],
  category: "downloader",
  description: "Search and download 4K wallpapers (Wallhaven, free, no key).",
  usage: ".wallpaper <query>",
  handler: async (sock, message, args, ctx) => {
    const chatId = message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim() || 'nature';
    try {
      const res = await axios.get('https://wallhaven.cc/api/v1/search', {
        params: { q, sorting: 'relevance', categories: '111', purity: '100', per_page: 24 },
        timeout: 20000,
        headers: { 'User-Agent': 'QUEEN AKUMA' }
      });
      const items = (res.data && res.data.data) || [];
      if (!items.length) {
        await reply('❌ *"' + q + '": no wallpaper found.');
        return;
      }
      const pick = items[Math.floor(Math.random() * items.length)];
      const imgUrl = pick.path || (pick.thumbs && pick.thumbs.original);
      if (!imgUrl) { await reply('❌ *Wallpaper image not found. Try again.*'); return; }
      await sock.sendMessage(chatId, {
        image: { url: imgUrl },
        caption: '🖼️ *Wallpaper — ' + q + '*\n\n📐 ' + (pick.resolution || '?') + '  •  👁️ ' + (pick.views || 0).toLocaleString('en-IN') + ' views\n🔗 ' + (pick.url || ('https://wallhaven.cc/w/' + pick.id)) + '\n\n_Source: wallhaven.cc (free, no key)_'
      }, { quoted: message });
    } catch (e) {
      await reply('❌ *Wallpaper not found:* ' + String(e.message || e).slice(0, 120) + '\nThodi der baad try karo.');
    }
  }
};
