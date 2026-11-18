/**
 * QUEEN AKUMA Smart Engine powered — creator.js
 */
module.exports = {
  command: 'ownerlegacy',
  aliases: [],
  category: 'info',
  description: 'Smart: ownerlegacy',
  usage: '.ownerlegacy <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('ownerlegacy', text, { category: 'info' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
