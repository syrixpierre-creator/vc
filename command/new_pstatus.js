module.exports = {
  command: 'pstatus',
  aliases: ['privacystatus', 'pstats'],
  category: 'privacy',
  description: 'Smart Engine: pstatus',
  usage: '.pstatus <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('pstatus', text, { category: 'privacy' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
