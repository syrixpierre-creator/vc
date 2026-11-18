/** Promote/Demote notifications toggle (per group). Used by promote.js / demote.js events. */
const db = require('../lib/jsondb');
const NAME = 'pdm';
function isEnabled(groupJid) {
  const d = db.load(NAME, {});
  return d[groupJid] !== false; // default ON
}
module.exports = {
  command: 'pdm',
  aliases: ['promotedemote', 'pdmnotify'],
  category: 'group',
  description: 'Turn promote/demote notifications on or off for this group',
  usage: '.pdm on|off|status',
  groupOnly: true,
  adminOnly: true,
  isEnabled,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    const d = db.load(NAME, {});
    if (sub === 'on') { d[chatId] = true; db.save(NAME); return reply('✅ Promote/Demote notifications *ON*'); }
    if (sub === 'off') { d[chatId] = false; db.save(NAME); return reply('❌ Promote/Demote notifications *OFF*'); }
    return reply('👑 PDM is ' + (isEnabled(chatId) ? '✅ ON' : '❌ OFF') + '\nUsage: `.pdm on|off`');
  }
};
