module.exports = {
  command: 'istock',
  aliases: ['istockdl', 'istockdownload'],
  category: 'download',
  description: 'Smart Engine: istock',
  usage: '.istock <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('istock', text, { category: 'download' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
