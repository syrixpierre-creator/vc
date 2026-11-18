/**
 * QUEEN AKUMA — .antistickerwarn (native, v3.6.3)
 * Pehle ye legacy groupProtection.js ka wrapper tha (cmd() system jo is bot
 * me hai hi nahi) — "cmd is not a function" error deta tha.
 * Ab native hai: sticker action ko warn mode par set karta hai (groupAnti
 * engine) — sticker bhejne par warning milti hai, limit (default 3) poori
 * hone par member kick hota hai. Limit .warnlimit se shared hai.
 */
const groupAnti = require('../lib/groupAnti');

module.exports = {
  command: 'antistickerwarn',
  aliases: ['stickerwarncount', 'antistickerwarncount', 'setstickerwarn', 'antigroupmentionwarn'],
  category: 'group',
  description: 'Warn instead of delete for stickers (kick after N warnings)',
  usage: '.antistickerwarn on|off|<number>|status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      await sock.sendMessage(chatId, { text: '❌ *This command can only be used in groups!*' }, { quoted: message });
      return;
    }
    const arg = String((args && args[0]) || '').toLowerCase().trim();
    const db = groupAnti.load();
    const curAction = groupAnti.getAction(db, 'antisticker');
    const curLimit = db.warningLimit || 3;
    const stickerOn = groupAnti.isOn(db, chatId, 'antisticker');
    // status (sab dekh sakte hain)
    if (arg === 'status' || !arg) {
      await sock.sendMessage(chatId, { text: `⚠️ *ANTI STICKER WARN*\nSticker action: ${curAction.toUpperCase()}\nWarnings before kick: ${curLimit}\nAntisticker: ${stickerOn ? '✅ ON' : '❌ OFF'}\n\nUse: \`.antistickerwarn on\` (warn mode) / \`.antistickerwarn off\` (delete mode) / \`.antistickerwarn 5\` (limit badlo)` }, { quoted: message });
      return;
    }
    // SET — owner/group-admin only (v3.6.0 ownerAdmin pattern)
    const allowed = await require('../lib/ownerAdmin').canToggle(sock, message, context);
    if (!allowed) {
      await sock.sendMessage(chatId, { text: '❌ *Only group admins or the bot owner can use this command.*' }, { quoted: message });
      return;
    }
    if (arg === 'on') {
      groupAnti.setOn(chatId, 'antisticker', true);
      groupAnti.setAction('antisticker', 'warn');
      await sock.sendMessage(chatId, { text: `✅ *Anti-Sticker Warn ON*\n\nSticker bhejne par warning milegi (${curLimit} warnings par kick).` }, { quoted: message });
      return;
    }
    if (arg === 'off') {
      groupAnti.setAction('antisticker', 'delete');
      await sock.sendMessage(chatId, { text: '✅ *Anti-Sticker Warn OFF*\n\nSticker ab seedha delete hoga (warn nahi).' }, { quoted: message });
      return;
    }
    const n = parseInt(arg, 10);
    if (!isNaN(n) && n >= 1 && n <= 10) {
      const d2 = groupAnti.load();
      d2.warningLimit = n;
      groupAnti.save(d2);
      await sock.sendMessage(chatId, { text: `✅ *Sticker warn limit: ${n}*\n\n${n} warnings par member kick hoga. (Ye limit .warnlimit se shared hai.)` }, { quoted: message });
      return;
    }
    await sock.sendMessage(chatId, { text: '❌ Use: `.antistickerwarn on|off|<1-10>|status`' }, { quoted: message });
  },
};
