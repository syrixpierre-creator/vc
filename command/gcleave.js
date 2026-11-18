module.exports = {
  command: 'gcleave',
  aliases: ['leavegroup', 'groupleave', 'leavegc'],
  category: 'owner',
  description: 'Smart Engine: gcleave',
  usage: '.gcleave <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('gcleave', text, { category: 'owner' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
