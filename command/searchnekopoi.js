module.exports = {
  command: 'nekopoi',
  aliases: ['searchnekopoi'],
  category: 'search',
  description: 'Smart Engine: nekopoi',
  usage: '.nekopoi <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('nekopoi', text, { category: 'search' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
