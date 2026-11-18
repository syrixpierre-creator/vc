module.exports = {
  command: 'addtogroup',
  aliases: ['groupsprivacy', 'pg'],
  category: 'privacy',
  description: 'Smart Engine: addtogroup',
  usage: '.addtogroup <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('addtogroup', text, { category: 'privacy' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
