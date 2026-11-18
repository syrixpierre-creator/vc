module.exports = {
  command: 'hmod',
  aliases: ['hmods', 'happymod'],
  category: 'apks',
  description: 'Smart Engine: hmod',
  usage: '.hmod <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('hmod', text, { category: 'apks' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
