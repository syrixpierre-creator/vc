module.exports = {
  command: 'sora',
  aliases: ['txt2video', 'aiVideo'],
  category: 'ai',
  description: 'Smart Engine: sora',
  usage: '.sora <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('sora', text, { category: 'ai' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
