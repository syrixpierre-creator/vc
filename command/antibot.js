const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antibot',
  aliases: [],
  category: 'group',
  description: 'Toggle antibot for this group',
  usage: '.antibot on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antibot', true);
      return reply('✅ *antibot* ON for this group');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antibot', false);
      return reply('❌ *antibot* OFF for this group');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antibot');
    return reply('🛡️ *antibot*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antibot on` / `.antibot off`');
  }
};
