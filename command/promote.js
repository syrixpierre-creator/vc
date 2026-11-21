
module.exports = {
  command: 'promote',
  aliases: ['admin'],
  category: 'group',
  description: 'Promote to admin',
  usage: '.promote @user',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!chatId.endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    try {
      const ctx = message.message?.extendedTextMessage?.contextInfo || {};
      let target = (ctx.mentionedJid && ctx.mentionedJid[0]) || ctx.participant;
      if (!target) return reply('📌 *Usage:* .promote @user or reply to a message with .promote');
      await sock.groupParticipantsUpdate(chatId, [target], 'promote');
      return reply('✅ *Member promoted*');
    } catch (e) {
      return reply('❌ *Failed to promote member*\nError: ' + (e.message || e));
    }
  },
  async handlePromotionEvent(sock, id, participants, author) {
    try {
      try { if (!require('./pdm').isEnabled(id)) return; } catch (_) {}
      const names = (participants || []).map((p) => '@' + String(typeof p === 'string' ? p : (p.id || p)).split('@')[0]);
    const jids = (participants || []).map((p) => (typeof p === 'string' ? p : (p.id || String(p))));
      const by = author ? '\n👤 By: @' + String(author).split('@')[0] : '';
      await sock.sendMessage(id, {
        text: '👑 *Promotion*\n' + names.join(', ') + ' is now an admin!' + by,
        mentions: author ? [...jids, author] : jids
      });
    } catch (e) { console.error('[promote] event error:', e.message); }
  }
};
