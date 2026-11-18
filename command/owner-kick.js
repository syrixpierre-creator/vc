/**
 * QUEEN AKUMA Smart Engine powered — owner-kick.js
 */
module.exports = {
  command: 'kicklegacy',
  aliases: [],
  category: 'group',
  description: 'Smart: kicklegacy',
  usage: '.kicklegacy <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('kicklegacy', text, { category: 'group' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
