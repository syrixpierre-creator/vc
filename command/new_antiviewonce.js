module.exports = {
  command: 'antiviewonce',
  aliases: ['antivv', 'autovv', 'avv'],
  category: 'moderation',
  description: 'Smart Engine: antiviewonce',
  usage: '.antiviewonce <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('antiviewonce', text, { category: 'moderation' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
