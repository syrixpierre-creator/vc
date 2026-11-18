module.exports = {
  command: 'unblock',
  aliases: ['unblokir'],
  category: 'owner',
  description: 'Unblock a user',
  usage: '.unblock @user / reply',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    try {
      const ctx = message.message?.extendedTextMessage?.contextInfo || {};
      let target = (ctx.mentionedJid && ctx.mentionedJid[0]) || ctx.participant;
      if (!target && args[0]) {
        const n = String(args[0]).replace(/\D/g, '');
        if (n) target = n + '@s.whatsapp.net';
      }
      if (!target) return reply('❌ `.unblock @user` ya reply');
      await sock.updateBlockStatus(target, 'unblock');
      return reply('✅ Unblocked: ' + target.split('@')[0]);
    } catch (e) {
      return reply('❌ ' + (e.message || e));
    }
  }
};
