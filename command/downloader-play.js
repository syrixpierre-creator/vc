/**
 * QUEEN AKUMA Smart Engine powered — downloader-play.js
 */
module.exports = {
  command: 'playlegacy',
  aliases: [],
  category: 'downloader',
  description: 'Smart: playlegacy',
  usage: '.playlegacy <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('playlegacy', text, { category: 'downloader' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
