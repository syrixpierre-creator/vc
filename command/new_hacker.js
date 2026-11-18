module.exports = {
  command: 'hacker',
  aliases: ['hackertext'],
  category: 'ephoto',
  description: 'Smart Engine: hacker',
  usage: '.hacker <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('hacker', text, { category: 'ephoto' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
