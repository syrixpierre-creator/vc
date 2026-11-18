/**
 * QUEEN AKUMA • .youtubesearch — Search YouTube videos (v2.8.6, replaces stub)
 * Uses lib/eliteApi.callRaw('ytsearch') — EliteProTech, verified working.
 */
module.exports = {
  command: 'youtubesearch',
  aliases: ['ytsearch', 'ytfind'],
  category: 'download',
  description: 'Search YouTube videos',
  usage: '.youtubesearch <query>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) return reply('🔍 Usage: `.youtubesearch arijit singh`');
    try {
      const elite = require('../lib/eliteApi');
      const d = await elite.callRaw('ytsearch', { q });
      const vids = (d && d.results && d.results.videos) || (d && d.videos) || [];
      if (!vids.length) return reply('❌ Kuch nahi mila. Dobara try karo.');
      const top = vids.slice(0, 5);
      const lines = top.map((v, i) => `${i + 1}. *${v.title || 'Untitled'}*\n   ${v.url || ''}${v.duration ? ' • ' + v.duration : ''}`).join('\n\n');
      return reply(`🔍 *YouTube Search:* ${q}\n\n${lines}\n\nAudio ke liye: \`.song ${q}\``);
    } catch (e) {
      return reply('❌ Search failed: ' + String((e && e.message) || e).slice(0, 100));
    }
  }
};
