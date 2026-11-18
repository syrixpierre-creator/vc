module.exports = {
  command: 'joke2',
  aliases: ['funny2', 'jokes2'],
  category: 'fun',
  description: 'Smart Engine: joke2',
  usage: '.joke2 <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('joke2', text, { category: 'fun' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
