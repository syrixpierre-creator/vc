module.exports = {
  command: 'rpg',
  aliases: ['profileRpg', 'myrpg'],
  category: 'game',
  description: 'Smart Engine: rpg',
  usage: '.rpg <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('rpg', text, { category: 'game' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
