module.exports = {
  command: 'chhistory',
  aliases: ['oldposts', 'chlist'],
  category: 'tools',
  description: 'Smart Engine: chhistory',
  usage: '.chhistory <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('chhistory', text, { category: 'tools' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
