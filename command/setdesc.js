module.exports = {
  command: 'setdesc',
  aliases: ['setdescription', 'gdesc'],
  category: 'group',
  description: 'Smart Engine: setdesc',
  usage: '.setdesc <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('setdesc', text, { category: 'group' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
