/**
 * QUEEN AKUMA v3.5.0 • #6 .tagadmins — sirf group admins ko tag karo (CHAMA/OVL se)
 * Usage: .tagadmins [optional message]
 */
module.exports = {
  command: 'tagadmins',
  aliases: ['tagadmin', 'admins'],
  category: 'group',
  description: 'Mention all group admins',
  usage: '.tagadmins [message]',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    let metadata = null;
    try { metadata = await sock.groupMetadata(chatId); } catch (_) {}
    const admins = (metadata?.participants || []).filter((p) => p.admin).map((p) => p.id);
    if (!admins.length) return sock.sendMessage(chatId, { text: '👑 Is group me koi admin nahi mila.' }, { quoted: message });
    const list = admins.map((a) => `@${a.split('@')[0]}`).join(' ');
    return sock.sendMessage(chatId, {
      text: `👑 *Group Admins*${text ? `\n\n${text}` : ''}\n\n${list}`,
      mentions: admins,
    }, { quoted: message });
  },
};
