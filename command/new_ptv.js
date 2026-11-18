module.exports = {
  command: 'ptv',
  aliases: ['vnote', 'videonote'],
  category: 'general',
  description: 'Smart Engine: ptv',
  usage: '.ptv <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('ptv', text, { category: 'general' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
