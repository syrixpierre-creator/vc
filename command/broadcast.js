module.exports = {
  command: 'broadcast',
  aliases: ['bc', 'bcgroup'],
  category: 'owner',
  description: 'Broadcast message to all groups',
  usage: '.broadcast <text>',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!text) return reply('❌ `.broadcast <message>`');
    try {
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups || {});
      await reply(`📢 Broadcasting to ${ids.length} groups...`);
      let ok = 0, fail = 0;
      for (const id of ids) {
        try {
          await sock.sendMessage(id, { text: `📢 *Broadcast*\n\n${text}` });
          ok++;
        } catch { fail++; }
      }
      return reply(`✅ Done\nSuccess: ${ok}\nFailed: ${fail}`);
    } catch (e) {
      return reply('❌ ' + (e.message || e));
    }
  }
};
