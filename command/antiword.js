const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antiword',
  aliases: ['antiwords', 'blockword'],
  category: 'group',
  description: 'Delete messages containing blocked words (per group)',
  usage: '.antiword on|off|add <word>|del <word>|list|status',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
    const sub = (args[0] || '').toLowerCase();
    const word = args.slice(1).join(' ').trim();
    if (['on', '1', 'true'].includes(sub)) {
      groupAnti.setOn(chatId, 'antiword', true);
      const n = groupAnti.getWords(groupAnti.load(), chatId).length;
      return reply('✅ *antiword* ON for this group' + (n ? ` (${n} words)` : '\n⚠️ Word list is empty. Add words: `.antiword add <word>`'));
    }
    if (['off', '0', 'false'].includes(sub)) { groupAnti.setOn(chatId, 'antiword', false); return reply('❌ *antiword* OFF for this group'); }
    if (sub === 'add') {
      if (!word) return reply('Usage: `.antiword add <word>`');
      return reply(groupAnti.addWord(chatId, word) ? `✅ Added: *${word.toLowerCase()}*` : 'ℹ️ Word already in list');
    }
    if (sub === 'del' || sub === 'remove') {
      if (!word) return reply('Usage: `.antiword del <word>`');
      return reply(groupAnti.delWord(chatId, word) ? `🗑️ Removed: *${word.toLowerCase()}*` : 'ℹ️ Word not found');
    }
    const db = groupAnti.load();
    const on = groupAnti.isOn(db, chatId, 'antiword');
    const words = groupAnti.getWords(db, chatId);
    if (sub === 'list') return reply('🚫 *Blocked words*\n' + (words.length ? words.map((w, i) => `${i + 1}. ${w}`).join('\n') : '_(none)_'));
    return reply('🛡️ *antiword*: ' + (on ? '✅ ON' : '❌ OFF') + `\nWords: ${words.length}\nUsage: .antiword on|off|add <word>|del <word>|list`);
  }
};
