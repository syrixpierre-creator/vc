module.exports = {
  command: 'stickers',
  aliases: ['stickersearch', 'ssticker'],
  category: 'stickers',
  description: 'Smart Engine: stickers',
  usage: '.stickers <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('stickers', text, { category: 'stickers' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
