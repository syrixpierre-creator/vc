/**
 * QUEEN AKUMA — Unified anti system toggles
 * .antisystem | .antistatus
 * Also registers via aliases handled in separate thin files
 */
const groupAnti = require('../lib/groupAnti');

module.exports = {
  command: 'antisystem',
  aliases: ['antistatus', 'antilist', 'protection'],
  category: 'group',
  description: 'Show / manage group anti protections',
  usage: '.antisystem',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    await sock.sendMessage(chatId, { text: groupAnti.statusText(chatId) }, { quoted: message });
  }
};
