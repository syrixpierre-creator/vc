const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antimedia',
  aliases: ['antimsg'],
  category: 'group',
  description: 'Toggle antimedia for this group',
  usage: '.antimedia on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antimedia', true);
      return reply('✅ *antimedia* ON for this group');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antimedia', false);
      return reply('❌ *antimedia* OFF for this group');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antimedia');
    return reply('🛡️ *antimedia*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antimedia on` / `.antimedia off`');
  }
};
