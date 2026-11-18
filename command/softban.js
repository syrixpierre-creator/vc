/**
 * QUEEN AKUMA v3.5.0 • #5 .softban — timed kick, time khatam to auto re-add (Iris se)
 * Usage: .softban @user 10m | .softban @user 1h | .softban @user 1d
 * .softban list — pending softbans dekho
 * Re-add: lib/scheduler.js tick (har 30s) → lib/softban.checkDue(sock).
 */
const sb = require('../lib/softban');
const scheduler = require('../lib/scheduler');

module.exports = {
  command: 'softban',
  aliases: ['timedkick'],
  category: 'group',
  description: 'Temporarily kick a user — auto re-add when time expires',
  usage: '.softban @user 10m | .softban list',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t, mentions) => sock.sendMessage(chatId, { text: t, mentions: mentions || [] }, { quoted: message });
    const m = message.message || {};
    const ctxInfo = m.extendedTextMessage?.contextInfo || {};
    const mentioned = ctxInfo.mentionedJid || [];

    if ((args[0] || '').toLowerCase() === 'list') {
      const items = sb.list(chatId);
      if (!items.length) return reply('🔨 *Softbans*\n\nKoi pending softban nahi hai.');
      const lines = items.map((x, i) => `${i + 1}. @${x.user.split('@')[0]} — wapas: ${new Date(x.until).toLocaleString('en-IN')}`).join('\n');
      return reply(`🔨 *Softbans (pending)*\n\n${lines}`, items.map((x) => x.user));
    }

    const target = mentioned[0] || (args[0] && /^\d+$/.test(args[0]) ? `${args[0]}@s.whatsapp.net` : null);
    const durArg = args.find((a) => /^\d+\s*[smhd]$/i.test(a));
    if (!target || !durArg) {
      return reply('🔨 *Softban*\n\nUsage: `.softban @user 10m`\nTime: 30s, 10m, 1h, 1d\n\nUser kick hoga aur time khatam hote hi auto wapas add ho jayega.');
    }
    const parsed = scheduler.parseTime(durArg);
    if (!parsed) return reply('❌ Time samajh nahi aaya. Example: `.softban @user 10m`');
    try {
      await sock.groupParticipantsUpdate(chatId, [target], 'remove');
    } catch (e) {
      return reply('❌ Kick nahi ho paya: ' + (e.message || e) + '\n(Bot ko group admin hona chahiye.)');
    }
    sb.add(chatId, target, parsed.at);
    return reply(`🔨 @${target.split('@')[0]} ko softban kar diya — ${parsed.label} baad auto wapas add ho jayega.`, [target]);
  },
};
