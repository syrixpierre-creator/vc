/**
 * QUEEN AKUMA — Temporary Kick (from Tarkiin gist)
 * .tkick @user  or reply
 * Kicks user and re-adds after 5 minutes.
 */
module.exports = {
  command: 'tkick',
  aliases: ['tempkick', 'tk'],
  category: 'group',
  description: 'Temporary kick - re-adds user after 5 minutes',
  usage: '.tkick @user  |  reply + .tkick',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t, opts = {}) => sock.sendMessage(chatId, { text: t, ...opts }, { quoted: message });

    let target = null;
    const ci = message.message?.extendedTextMessage?.contextInfo;
    if (ci?.mentionedJid?.[0]) target = ci.mentionedJid[0];
    else if (ci?.participant) target = ci.participant;
    else if (args[0]) {
      const num = args[0].replace(/\D/g, '');
      if (num.length >= 8) target = num + '@s.whatsapp.net';
    }

    if (!target) return reply('❌ Usage: `.tkick @user` ya message pe reply karke `.tkick`');

    try {
      const meta = await sock.groupMetadata(chatId);
      const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net' || sock.user.id;
      const botParticipant = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
      if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) {
        return reply('❌ Bot admin nahi hai.');
      }

      const targetP = meta.participants.find(p => p.id === target);
      if (targetP && ['admin', 'superadmin'].includes(targetP.admin)) {
        return reply(`❌ @${target.split('@')[0]} admin hai, kick nahi kar sakta.`, { mentions: [target] });
      }

      await reply(`⏳ @${target.split('@')[0]} ko temporary kick kar raha hoon...\n5 minute baad wapas add hoga.`, { mentions: [target] });

      await sock.groupParticipantsUpdate(chatId, [target], 'remove');

      setTimeout(async () => {
        try {
          await sock.groupParticipantsUpdate(chatId, [target], 'add');
          await sock.sendMessage(chatId, {
            text: `✅ @${target.split('@')[0]} ko wapas add kar diya (temp kick khatam).`,
            mentions: [target]
          });
        } catch (e) {
          console.error('[tkick re-add]', e.message);
          await sock.sendMessage(chatId, { text: `❌ Re-add fail: ${e.message}` }).catch(() => {});
        }
      }, 5 * 60 * 1000);

    } catch (e) {
      console.error('[tkick]', e);
      return reply('❌ Error: ' + (e.message || e));
    }
  }
};
