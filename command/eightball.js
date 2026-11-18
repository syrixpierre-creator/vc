module.exports = {
  command: '8ball',
  aliases: ['eightball', 'magic8ball'],
  category: 'fun',
  description: 'Smart Engine: 8ball',
  usage: '.8ball <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('8ball', text, { category: 'fun' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
