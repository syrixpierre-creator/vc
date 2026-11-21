module.exports = {
  command: 'mute',
  aliases: ['silence', 'close'],
  category: 'group',
  description: 'Mute group (admins only chat)',
  usage: '.mute',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    try {
      await sock.groupSettingUpdate(chatId, 'announcement');
      return reply('🔒 *Group closed*');
    } catch (e) {
      return reply('❌ *Failed to close group*\nError: ' + (e.message || e));
    }
  }
};
