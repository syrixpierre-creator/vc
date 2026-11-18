module.exports = {
  command: 'npmstalk',
  aliases: ['npmstlk'],
  category: 'stalk',
  description: 'Smart Engine: npmstalk',
  usage: '.npmstalk <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('npmstalk', text, { category: 'stalk' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
