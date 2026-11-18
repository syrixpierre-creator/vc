const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antitag',
  aliases: ['antimention'],
  category: 'group',
  description: 'Toggle antitag for this group',
  usage: '.antitag on|off|status',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    // v3.6.0 OWNER/ADMIN LOCK — sirf owner ya group admin on/off kar sakta hai (status public).
    if ((sub === 'on' || sub === '1' || sub === 'true' || sub === 'off' || sub === '0' || sub === 'false') && !(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
    if (sub === 'on' || sub === '1' || sub === 'true') {
      groupAnti.setOn(chatId, 'antitag', true);
      return reply('✅ *antitag* ON for this group');
    }
    if (sub === 'off' || sub === '0' || sub === 'false') {
      groupAnti.setOn(chatId, 'antitag', false);
      return reply('❌ *antitag* OFF for this group');
    }
    const on = groupAnti.isOn(groupAnti.load(), chatId, 'antitag');
    return reply('🛡️ *antitag*: ' + (on ? '✅ ON' : '❌ OFF') + '\nUsage: `.antitag on` / `.antitag off`');
  },
  async handleTagDetection(sock, chatId, message, senderId) {
    try {
      if (!String(chatId).endsWith('@g.us') || message.key.fromMe) return false;
      if (!groupAnti.isOn(groupAnti.load(), chatId, 'antitag')) return false;
      const m = message.message || {};
      const ci = (m.extendedTextMessage || m.imageMessage || m.videoMessage || m.documentMessage || {}).contextInfo || {};
      const mentioned = ci.mentionedJid || [];
      if (mentioned.length < 5) return false;
      const sender = senderId || message.key.participant;
      const isAdmin = require('../lib/isAdmin');
      const { isSenderAdmin } = await isAdmin(sock, chatId, sender);
      if (isSenderAdmin) return false;
      await sock.sendMessage(chatId, { delete: message.key }).catch(() => {});
      await sock.sendMessage(chatId, {
        text: '🚫 Mass tagging is not allowed here, @' + String(sender).split('@')[0],
        mentions: [sender]
      }).catch(() => {});
      return true;
    } catch (e) { console.error('[antitag]', e.message); return false; }
  }
};
