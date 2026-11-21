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
      return sock.sendMessage(chatId, { text: '❌ *Please make the bot an admin first.*' }, { quoted: message });
    }
    if (String(args[0] || '').toLowerCase() !== 'confirm') {
      return sock.sendMessage(chatId, {
        text: '⚠️ *All non-admin members will be removed.*\nConfirm: .kickall confirm'
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
        return sock.sendMessage(chatId, { text: '❌ *No members to remove (all are admins or bot).*' }, { quoted: message });
      }
      let ok = 0;
      for (const jid of targets) {
        try {
          await sock.groupParticipantsUpdate(chatId, [jid], 'remove');
          ok++;
        } catch (_) {}
      }
      return sock.sendMessage(chatId, { text: `✅ *Successfully removed ${ok} members*` }, { quoted: message });
    } catch (e) {
      return sock.sendMessage(chatId, { text: '❌ *Failed to remove members*\nError: ' + e.message }, { quoted: message });
    }
  }
};
