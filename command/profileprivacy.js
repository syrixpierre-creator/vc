module.exports = {
  command: 'profileprivacy',
  aliases: ['pprofile', 'ppp'],
  category: 'privacy',
  description: 'Smart Engine: profileprivacy',
  usage: '.profileprivacy <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('profileprivacy', text, { category: 'privacy' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
