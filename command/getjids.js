module.exports = {
  command: 'getjids',
  aliases: ['memberjids', 'gjids', 'getmembers'],
  category: 'group',
  description: 'Smart Engine: getjids',
  usage: '.getjids <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('getjids', text, { category: 'group' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
