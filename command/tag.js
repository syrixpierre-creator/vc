
module.exports = {
  command: 'tag',
  aliases: ['everyone', 'all'],
  category: 'group',
  description: 'Tag all members',
  usage: '.tag [text]',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ *This command can only be used in groups!*' }, { quoted: message });
    }
    try {
      const meta = await sock.groupMetadata(chatId);
      const parts = (meta.participants || []).map(p => p.id);
      const text = (args || []).join(' ').trim() || '👋';
      await sock.sendMessage(chatId, { text: text + '\n\n' + parts.map(u => '@' + u.split('@')[0]).join(' '), mentions: parts }, { quoted: message });
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + (e.message || e) }, { quoted: message });
    }
  }
};
