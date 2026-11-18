const isAdmin = require('../lib/isAdmin');
const settings = require('../settings');

module.exports = {
  command: 'kickall',
  aliases: ['removeall', 'kickeveryone'],
  category: 'admin',
  description: 'Remove all non-admin members from group (owner/admin only)',
  usage: '.kickall confirm',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const owner = String(settings.ownerNumber || '').replace(/\D/g, '');
    const senderDig = String(sender || '').replace(/\D/g, '');
    const isOwner = message.key.fromMe || (owner && senderDig.includes(owner));

    const st = await isAdmin(sock, chatId, sender);
    if (!st.isSenderAdmin && !isOwner) {
      return sock.sendMessage(chatId, { text: '❌ *Only group admins or the bot owner can use this command.*' }, { quoted: message });
    }
    if (!st.isBotAdmin) {
      return sock.sendMessage(chatId, { text: '❌ Pehle bot ko *admin* banao.' }, { quoted: message });
    }
    if (String(args[0] || '').toLowerCase() !== 'confirm') {
      return sock.sendMessage(chatId, {
        text: '⚠️ *DANGER*\nSaare non-admin members remove ho jayenge.\n\nConfirm: `.kickall confirm`'
      }, { quoted: message });
    }
    try {
      const meta = await sock.groupMetadata(chatId);
      const botId = (sock.user?.id || '').split(':')[0].split('@')[0];
      const targets = (meta.participants || [])
        .filter((p) => !p.admin && !p.superadmin)
        .map((p) => p.id)
        .filter((id) => id && !String(id).includes(botId));
      if (!targets.length) {
        return sock.sendMessage(chatId, { text: '✅ Koi non-admin member nahi mila.' }, { quoted: message });
      }
      let ok = 0;
      for (const jid of targets) {
        try {
          await sock.groupParticipantsUpdate(chatId, [jid], 'remove');
          ok++;
        } catch (_) {}
      }
      return sock.sendMessage(chatId, { text: `✅ Kickall done. Removed: *${ok}*` }, { quoted: message });
    } catch (e) {
      return sock.sendMessage(chatId, { text: '❌ Kickall failed: ' + e.message }, { quoted: message });
    }
  }
};
