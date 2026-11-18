module.exports = {
  command: 'gitclone2',
  aliases: ['githubdl2', 'clone2'],
  category: 'download',
  description: 'Smart Engine: gitclone2',
  usage: '.gitclone2 <input>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    try {
      const { smartRun, sendResult } = require('../lib/smartEngine');
      const result = await smartRun('gitclone2', text, { category: 'download' });
      await sendResult(sock, chatId, message, result);
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
