/**
 * QUEEN AKUMA v3.5.0 • #10 Anti-212/265 auto-ban (bot-md _anti212.mjs se — bug fixed)
 * Source bug: `'212' || '212'` sirf 212 check karta tha, 265 kabhi match nahi hota.
 * Yahan dono codes sahi check hote hain + unban path hai (exceptions list).
 * Join karte hi kick: onGroupUpdate hook. Message-level block: lib/chatgates.
 * .anticountry on|off | .anticountry list | .anticountry unban <number>
 */
const ac = require('../lib/anticountry');

module.exports = {
  command: 'anticountry',
  aliases: ['anti212', 'anticc'],
  category: 'group',
  description: 'Auto-ban country codes (212/265) on join — with unban path',
  usage: '.anticountry on|off | .anticountry list | .anticountry unban <number>',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = String(args[0] || '').toLowerCase();
    const s = ac.get();
    if (sub === 'on') { ac.setEnabled(true); return reply(`🛡️ *Anti-Country ON*\n\nBlocked codes: ${s.codes.join(', ')}\nJoin karte hi kick ho jayega.`); }
    if (sub === 'off') { ac.setEnabled(false); return reply('🛡️ *Anti-Country OFF*'); }
    if (sub === 'list') {
      const ex = s.exceptions.length ? `\n\n✅ Exceptions (unbanned): ${s.exceptions.join(', ')}` : '';
      return reply(`🛡️ *Anti-Country:* ${s.enabled ? '✅ ON' : '❌ OFF'}\n\nBlocked codes: ${s.codes.join(', ')}${ex}\n\n_Unban: \`.anticountry unban <number>\`_`);
    }
    if (sub === 'unban') {
      const num = (args[1] || '').replace(/[^0-9]/g, '');
      if (!num) return reply('❌ Number do: `.anticountry unban 212xxxxxxxx`');
      if (ac.addException(num)) return reply(`✅ *${num}* ko exception de diya — ab wo join kar sakta hai.`);
      return reply(`ℹ️ *${num}* pehle se exception me hai.`);
    }
    return reply(`🛡️ *Anti-Country:* ${s.enabled ? '✅ ON' : '❌ OFF'}\n\nBlocked codes: ${s.codes.join(', ')}\n\nUsage:\n• \`.anticountry on\` / \`.anticountry off\`\n• \`.anticountry list\`\n• \`.anticountry unban <number>\``);
  },
  async onGroupUpdate(sock, update) {
    try {
      if (update.action !== 'add') return;
      const s = ac.get();
      if (!s.enabled) return;
      for (const p of update.participants || []) {
        const code = ac.codeOf(p);
        if (code && !ac.isExcepted(p)) {
          try { await sock.groupParticipantsUpdate(update.id, [p], 'remove'); } catch (_) {}
        }
      }
    } catch (_) {}
  },
};
