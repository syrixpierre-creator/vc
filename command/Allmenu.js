module.exports = {
  command: 'allmenulegacy',
  aliases: [],
  category: 'main',
  description: 'legacy allmenu disabled',
  usage: '.allmenulegacy',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    await sock.sendMessage(chatId, { text: 'Use *.allmenu* or *.menu*' }, { quoted: message });
  }
};
