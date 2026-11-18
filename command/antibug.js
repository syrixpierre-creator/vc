const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antibug',
  aliases: ['antibugs', 'anticrash', 'antivirtex'],
  category: 'group',
  description: 'Toggle antibug for this group',
  usage: '.antibug on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antibug', true);
      return reply('✅ *antibug* ON for this group');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antibug', false);
      return reply('❌ *antibug* OFF for this group');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antibug');
    return reply('🛡️ *antibug*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antibug on` / `.antibug off`');
  }
};
