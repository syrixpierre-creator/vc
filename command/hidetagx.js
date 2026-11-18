/**
 * QUEEN AKUMA • .hidetagx — Hidden tag all members (v2.8.6, replaces stub)
 * Same as .hidetag: group ke saare members ko bina dikhaye mention karta hai.
 */
module.exports = {
  command: 'hidetagx',
  aliases: ['htagx'],
  category: 'group',
  description: 'Hidden tag all members',
  usage: '.hidetagx [text]',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ *This command can only be used in groups!*' }, { quoted: message });
    }
    try {
      const meta = await sock.groupMetadata(chatId);
      const parts = (meta.participants || []).map((p) => p.id);
      if (!parts.length) return sock.sendMessage(chatId, { text: '❌ Group members nahi mile.' }, { quoted: message });
      const text = (args || []).join(' ').trim() || '‎';
      await sock.sendMessage(chatId, { text, mentions: parts });
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + String((e && e.message) || e).slice(0, 120) }, { quoted: message });
    }
  }
};
