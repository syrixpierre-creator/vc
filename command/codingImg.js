module.exports = {
  command: 'coding',
  aliases: ['codingimg', 'programming', 'programmingimg'],
  category: 'images',
  description: 'Smart Engine: coding',
  usage: '.coding <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('coding', text, { category: 'images' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
