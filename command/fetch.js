/**
 * QUEEN AKUMA • .fetch — Fetch a URL and show its content (v2.8.6, replaces stub)
 */
const axios = require('axios');
module.exports = {
  command: 'fetch',
  aliases: ['geturl', 'curl'],
  category: 'tools',
  description: 'Fetch a URL and show its content',
  usage: '.fetch <url>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const url = (args || [])[0];
    if (!url || !/^https?:\/\//i.test(url)) return reply('🌐 Usage: `.fetch https://example.com`');
    try {
      const r = await axios.get(url, { timeout: 20000, maxContentLength: 200000, headers: { 'User-Agent': 'QUEEN-AKUMA/2.8.6' } });
      let body = typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2);
      body = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!body) body = '(empty response)';
      return reply(`🌐 *${url}*\nStatus: ${r.status}\n\n${body.slice(0, 3000)}`);
    } catch (e) {
      return reply(`❌ Fetch failed: ${String((e && e.message) || e).slice(0, 120)}`);
    }
  }
};
