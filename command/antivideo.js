const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antivideo',
  aliases: [],
  category: 'group',
  description: 'Toggle antivideo for this group',
  usage: '.antivideo on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antivideo', true);
      return reply('✅ *antivideo* ON for this group');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antivideo', false);
      return reply('❌ *antivideo* OFF for this group');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antivideo');
    return reply('🛡️ *antivideo*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antivideo on` / `.antivideo off`');
  }
};
