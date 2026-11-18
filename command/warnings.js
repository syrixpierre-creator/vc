/** Warning tools backed by lib/groupAnti: .warnings  .resetwarn  .warnlimit */
const groupAnti = require('../lib/groupAnti');
const num = (j) => String(j || '').replace(/\D/g, '');
function targetOf(message, args) {
  const ci = message.message?.extendedTextMessage?.contextInfo || {};
  return (ci.mentionedJid && ci.mentionedJid[0]) || ci.participant || (args[0] && /\d{6,}/.test(args[0]) ? num(args[0]) + '@s.whatsapp.net' : null);
}
module.exports = {
  command: 'warnings',
  aliases: ['checkwarn', 'warncount', 'mywarn', 'warns'],
  category: 'group',
  description: 'Show warning count of a user (reply/mention) or yourself',
  usage: '.warnings [@user]',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const t = targetOf(message, args) || message.key.participant || context.senderId;
    const db = groupAnti.load();
    const n = db.warnings?.[num(t)] || 0;
    return sock.sendMessage(chatId, { text: `⚠️ @${num(t)} has *${n}/${db.warningLimit || 3}* warnings`, mentions: [t] }, { quoted: message });
  },
  commands: [
    {
      command: 'resetwarn', aliases: ['resetwarns', 'clearwarn', 'clearwarns', 'warnreset', 'delwarn'],
      category: 'group', description: 'Reset warnings of a user (reply/mention)', usage: '.resetwarn @user',
      groupOnly: true, adminOnly: true,
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const t = targetOf(message, args);
        if (!t) return sock.sendMessage(chatId, { text: 'Usage: reply to or mention a user: `.resetwarn @user`' }, { quoted: message });
        const db = groupAnti.load();
        if (!db.warnings) db.warnings = {};
        db.warnings[num(t)] = 0; groupAnti.save(db);
        return sock.sendMessage(chatId, { text: `✅ Warnings reset for @${num(t)}`, mentions: [t] }, { quoted: message });
      }
    },
    {
      command: 'warnlimit', aliases: ['setwarncount', 'setwarnlimit', 'warnlimitset'],
      category: 'group', description: 'Set how many warnings lead to a kick (default 3)', usage: '.warnlimit <1-20>',
      groupOnly: true,
      async handler(sock, message, args, context = {}) {
        const chatId = context.chatId || message.key.remoteJid;
        const n = parseInt(args[0], 10);
        const db = groupAnti.load();
        if (!n || n < 1 || n > 20) return sock.sendMessage(chatId, { text: `Usage: \`.warnlimit <1-20>\`\nCurrent: *${db.warningLimit || 3}*` }, { quoted: message });
        // v3.6.0 OWNER/ADMIN LOCK — pehle adminOnly: true tha (bot-admin bhi
        // require karta tha); ab in-handler check: owner/group-admin kaafi hai.
        // Usage (galat number) public rehta hai — sirf set gate hai.
        if (!(await require('../lib/ownerAdmin').canToggle(sock, message, context))) return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
        db.warningLimit = n; groupAnti.save(db);
        return sock.sendMessage(chatId, { text: `✅ Warn limit set to *${n}* (user is kicked when reached; action must be "warn" via .antiaction)` }, { quoted: message });
      }
    }
  ]
};
