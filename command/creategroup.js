/**
 * QUEEN AKUMA v3.5.0 • #11 .create / .newgroup — chat se naya WhatsApp group banao (Flash se)
 * Usage: .create <group name> @user 91xxxxxxxxxx
 * Owner/sudo-only (koi bhi bot se group na banwaye).
 */
module.exports = {
  command: 'create',
  aliases: ['newgroup', 'newgc'],
  category: 'owner',
  description: 'Create a new WhatsApp group from chat',
  usage: '.create <group name> @user 91xxxxxxxxxx',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    const m = message.message || {};
    const ctxInfo = m.extendedTextMessage?.contextInfo || {};
    const mentions = ctxInfo.mentionedJid || [];
    const quotedJid = ctxInfo.participant || null;
    const numbers = (args || []).filter((a) => /^\d{7,15}$/.test(a)).map((n) => `${n}@s.whatsapp.net`);
    const nameParts = (args || []).filter((a) => !/^\d{7,15}$/.test(a));
    const groupName = nameParts.join(' ').trim();
    const participants = [...new Set([...mentions, ...(quotedJid ? [quotedJid] : []), ...numbers])];
    if (!groupName || !participants.length) {
      return reply('👥 *Create Group*\n\nUsage: `.create <group name> @user 91xxxxxxxxxx`\n\nExample: `.create QUEEN AKUMA Fans @rahul 919876543210`');
    }
    try {
      const group = await sock.groupCreate(groupName, participants);
      await sock.sendMessage(group.id, { text: `👋 Welcome to *${groupName}*!\n\nGroup created by QUEEN AKUMA. 🎉` });
      return reply(`✅ Group ban gaya: *${groupName}*\n👥 Members: ${participants.length}`);
    } catch (e) {
      return reply('❌ Group nahi ban paya: ' + (e.message || e));
    }
  },
};
