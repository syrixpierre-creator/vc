module.exports = {
  command: 'didyoumean',
  aliases: ['dym', 'didyoumen'],
  category: 'tools',
  description: 'Smart Engine: didyoumean',
  usage: '.didyoumean <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('didyoumean', text, { category: 'tools' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
