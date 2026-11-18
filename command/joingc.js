module.exports = {
  command: 'joingc',
  aliases: ['join', 'joingroup'],
  category: 'owner',
  description: 'Smart Engine: joingc',
  usage: '.joingc <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('joingc', text, { category: 'owner' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
