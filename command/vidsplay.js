module.exports = {
  command: 'vidsplay',
  aliases: ['vidsplaydl', 'vidsplayvideo'],
  category: 'download',
  description: 'Smart Engine: vidsplay',
  usage: '.vidsplay <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('vidsplay', text, { category: 'download' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
