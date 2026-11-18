module.exports = {
  command: 'block',
  aliases: ['blokir'],
  category: 'owner',
  description: 'Block a user',
  usage: '.block @user / reply',
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
      if (!target) return reply('❌ `.block @user` ya reply');
      await sock.updateBlockStatus(target, 'block');
      return reply('✅ Blocked: ' + target.split('@')[0]);
    } catch (e) {
      return reply('❌ ' + (e.message || e));
    }
  }
};
