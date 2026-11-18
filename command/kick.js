
module.exports = {
  command: 'kick',
  aliases: ['remove', 'ban'],
  category: 'group',
  description: 'Kick member',
  usage: '.kick @user',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!chatId.endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    try {
      const ctx = message.message?.extendedTextMessage?.contextInfo || {};
      let target = (ctx.mentionedJid && ctx.mentionedJid[0]) || ctx.participant;
      if (!target && args[0]) {
        const n = String(args[0]).replace(/\D/g, '');
        if (n) target = n + '@s.whatsapp.net';
      }
      if (!target) return reply('❌ `.kick @user` ya reply karke');
      await sock.groupParticipantsUpdate(chatId, [target], 'remove');
      return reply('✅ Removed');
    } catch (e) {
      return reply('❌ Kick failed: ' + (e.message || e) + '\nBot admin hona chahiye.');
    }
  }
};
