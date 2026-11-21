module.exports = {
  command: 'unmute',
  aliases: ['open', 'unsilence'],
  category: 'group',
  description: 'Unmute group',
  usage: '.unmute',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    try {
      await sock.groupSettingUpdate(chatId, 'not_announcement');
      return reply('🔓 *Group opened*');
    } catch (e) {
      return reply('❌ *Failed to open group*\nError: ' + (e.message || e));
    }
  }
};
