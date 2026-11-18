module.exports = {
  command: 'schedulelist',
  aliases: ['schedlist', 'schedules', 'reminders'],
  category: 'utility',
  description: 'Smart Engine: schedulelist',
  usage: '.schedulelist <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('schedulelist', text, { category: 'utility' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
