/**
 * QUEEN AKUMA Smart Engine powered — yt-play3.js
 */
module.exports = {
  command: 'play3legacy',
  aliases: [],
  category: 'downloader',
  description: 'Smart: play3legacy',
  usage: '.play3legacy <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('play3legacy', text, { category: 'downloader' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
