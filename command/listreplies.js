module.exports = {
  command: 'listreplies',
  aliases: ['autoreplies', 'replylist', 'replies'],
  category: 'owner',
  description: 'Smart Engine: listreplies',
  usage: '.listreplies <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('listreplies', text, { category: 'owner' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
