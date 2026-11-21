/**
 * QUEEN AKUMA v3.5.0 • #16 .leavegc2 — DM se number deke kisi bhi group se leave karo (TKM se)
 * .leavegc2 — bot ke saare groups ki numbered list
 * .leavegc2 <number> — us group se leave karo
 * Owner-only.
 */
module.exports = {
  command: 'leavegc2',
  aliases: ['leave2'],
  category: 'owner',
  description: 'Leave any group by number (from DM)',
  usage: '.leavegc2 | .leavegc2 <number>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    let groups = {};
    try { groups = await sock.groupFetchAllParticipating(); } catch (e) {
      return reply('❌ Groups list nahi mil payi: ' + (e.message || e));
    }
    const list = Object.values(groups || {});
    if (!list.length) return reply('❌ *The bot is not in any group.*');
    const n = parseInt(args[0], 10);
    if (!isNaN(n) && n >= 1 && n <= list.length) {
      const g = list[n - 1];
      try {
        await sock.groupLeave(g.id);
        return reply(`👋 Group se leave kar diya: *${g.subject || g.id}*`);
      } catch (e) {
        return reply('❌ *Failed to leave:* ' + (e.message || e));
      }
    }
    const lines = list.slice(0, 50).map((g, i) => `${i + 1}. ${g.subject || g.id} (${(g.participants || []).length} members)`).join('\n');
    return reply(`📋 *Bot groups* (${list.length})\n\n${lines}\n\n📌 *Usage:* .leavegc2 <number>`);
  },
};
