module.exports = {
  command: 'groupinfo',
  aliases: ['ginfo', 'gi', 'infogc'],
  category: 'group',
  description: 'Smart Engine: groupinfo',
  usage: '.groupinfo <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('groupinfo', text, { category: 'group' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
