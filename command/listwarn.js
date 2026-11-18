module.exports = {
  command: 'listwarn',
  aliases: ['warns', 'warningslist', 'getwarn'],
  category: 'admin',
  description: 'Smart Engine: listwarn',
  usage: '.listwarn <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('listwarn', text, { category: 'admin' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
