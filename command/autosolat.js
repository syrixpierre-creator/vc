module.exports = {
  command: 'autosolat',
  aliases: ['sholat', 'praytime', 'jadwalsholat'],
  category: 'islam',
  description: 'Smart Engine: autosolat',
  usage: '.autosolat <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('autosolat', text, { category: 'islam' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
