module.exports = {
  command: 'quote2',
  aliases: ['quotes2', 'randomquote'],
  category: 'quotes',
  description: 'Smart Engine: quote2',
  usage: '.quote2 <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('quote2', text, { category: 'quotes' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
