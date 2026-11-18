module.exports = {
  command: 'schedulecancel',
  aliases: ['schedcancel', 'cancelschedule', 'unschedule'],
  category: 'utility',
  description: 'Smart Engine: schedulecancel',
  usage: '.schedulecancel <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('schedulecancel', text, { category: 'utility' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
