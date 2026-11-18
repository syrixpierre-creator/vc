module.exports = {
  command: 'cyberimg',
  aliases: ['cyber', 'cyberspace'],
  category: 'images',
  description: 'Smart Engine: cyberimg',
  usage: '.cyberimg <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('cyberimg', text, { category: 'images' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
