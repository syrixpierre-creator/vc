module.exports = {
  command: 'verified',
  aliases: ['bluetick', 'verify', 'blueverified'],
  category: 'utility',
  description: 'Smart Engine: verified',
  usage: '.verified <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('verified', text, { category: 'utility' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
