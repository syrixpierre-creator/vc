/**
 * QUEEN AKUMA v3.5.0 • #7 .onlyadmin — group me bot sirf admins ke liye (YESSER se)
 * .onlyadmin on — is group me sirf admins bot commands chala sakte hain
 * .onlyadmin off — sab chala sakte hain
 * Enforcement: lib/chatgates.shouldBlock() → messageHandler.
 */
const oa = require('../lib/onlyadmin');

module.exports = {
  command: 'onlyadmin',
  aliases: ['adminonly'],
  category: 'group',
  description: 'Only group admins can use the bot in this group',
  usage: '.onlyadmin on|off',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = String(args[0] || '').toLowerCase();
    if (sub === 'on') { oa.set(chatId, true); return reply('🔒 *OnlyAdmin ENABLED*'); }
    if (sub === 'off') { oa.set(chatId, false); return reply('🔓 *OnlyAdmin DISABLED*'); }
    return reply(`🔒 *OnlyAdmin:* ${oa.isOn(chatId) ? '✅ ON' : '❌ OFF'}\n\nUsage: \`.onlyadmin on\` ya \`.onlyadmin off\``);
  },
};
