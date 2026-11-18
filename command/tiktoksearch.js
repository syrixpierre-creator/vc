/**
 * QUEEN AKUMA • .tiktoksearch — Search TikTok videos (v2.8.6, replaces stub)
 * Uses tikwm feed/search (free, no key — same endpoint as random-cmds.js).
 */
const axios = require('axios');
module.exports = {
  command: 'tiktoksearch',
  aliases: ['ttsearch', 'tiktokfind'],
  category: 'download',
  description: 'Search TikTok videos',
  usage: '.tiktoksearch <query>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) return reply('🔍 Usage: `.tiktoksearch funny cats`');
    try {
      const params = new URLSearchParams({ keywords: q, count: '5', cursor: '0', HD: '1' });
      const res = await axios.post('https://tikwm.com/api/feed/search', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Cookie': 'current_language=en', 'User-Agent': 'Mozilla/5.0' },
        timeout: 25000
      });
      const vids = (res.data && res.data.data && res.data.data.videos) || [];
      if (!vids.length) return reply('❌ Kuch nahi mila. Dobara try karo.');
      const lines = vids.slice(0, 5).map((v, i) => {
        const author = (v.author && v.author.nickname) || (v.author && v.author.unique_id) || 'TikTok';
        return `${i + 1}. *${(v.title || 'TikTok video').slice(0, 80)}*\n   👤 ${author} ❤️ ${v.digg_count || 0}\n   https://www.tiktok.com/@${(v.author && v.author.unique_id) || ''}/video/${v.video_id || ''}`;
      }).join('\n\n');
      return reply(`🔍 *TikTok Search:* ${q}\n\n${lines}`);
    } catch (e) {
      return reply('❌ Search failed: ' + String((e && e.message) || e).slice(0, 100));
    }
  }
};
