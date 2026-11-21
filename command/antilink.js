const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antilink',
  aliases: [],
  category: 'group',
  description: 'Toggle antilink for this group',
  usage: '.antilink on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antilink', true);
      return reply('✅ *Antilink ENABLED*');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antilink', false);
      return reply('✅ *Antilink DISABLED*');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antilink');
    return reply('❌ *Invalid option!*\n\nAvailable options:\n- on\n- off\n\nCurrent: ' + (on ? 'ON' : 'OFF'));
  },
  // Link enforcement is done by lib/groupAnti.processMessage (called from messageHandler).
  // This export exists so the early hook in messageHandler never throws.
  async handleLinkDetection() { return false; }
};
