const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antimention',
  aliases: ['amention', 'mentionblock', 'nomention'],
  category: 'group',
  description: 'Delete messages from non-admins that mention/tag anyone',
  usage: '.antimention on|off|status',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    if (['on', '1', 'true'].includes(sub)) { groupAnti.setOn(chatId, 'antimention', true); return reply('✅ *antimention* ON for this group\n_Bot must be admin to delete messages._'); }
    if (['off', '0', 'false'].includes(sub)) { groupAnti.setOn(chatId, 'antimention', false); return reply('❌ *antimention* OFF for this group'); }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antimention');
    return reply('🏷️ *antimention*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antimention on|off`');
  }
};
