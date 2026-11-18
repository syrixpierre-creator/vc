module.exports = {
  command: 'sfile',
  aliases: ['sfl', 'sfileapk'],
  category: 'apks',
  description: 'Smart Engine: sfile',
  usage: '.sfile <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('sfile', text, { category: 'apks' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
