/**
 * QUEEN AKUMA v3.5.0 • GAAJU .slowmode — per-group slow mode
 * .slowmode on/off — 1 msg / 30s default
 * .slowmode set <msgs> <secs> — jaise .slowmode set 2 10
 * .slowmode — status dekho
 * Over-limit messages auto-delete hote hain; admins exempt.
 */
const sm = require('../lib/slowmode');

module.exports = {
  command: 'slowmode',
  aliases: ['slow', 'slowchat'],
  category: 'group',
  description: 'Limit message rate per member in groups',
  usage: '.slowmode on|off | .slowmode set <msgs> <secs>',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const g = sm.get(chatId);
    const sub = String(args[0] || '').toLowerCase();
    if (!sub || sub === 'status') {
      return reply(`🐢 *Slow Mode*\n\nState: ${g.enabled ? '✅ ON' : '❌ OFF'}\nRate: ${g.limit} msg / ${g.window}s\n\nUsage:\n• \`.slowmode on\` / \`.slowmode off\`\n• \`.slowmode set 2 10\``);
    }
    if (sub === 'on') { sm.set(chatId, { enabled: true }); return reply(`🐢 *Slow Mode ON*\nRate: ${g.limit} msg / ${g.window}s`); }
    if (sub === 'off') { sm.set(chatId, { enabled: false }); return reply('🐢 *Slow Mode OFF*'); }
    if (sub === 'set') {
      const limit = parseInt(args[1], 10); const win = parseInt(args[2], 10);
      if (!limit || !win || limit < 1 || win < 1) return reply('❌ Usage: `.slowmode set <msgs> <secs>`\nExample: `.slowmode set 2 10`');
      sm.set(chatId, { limit, window: win });
      return reply(`✅ Slow mode updated: *${limit} msg / ${win}s*`);
    }
    return reply('🐢 Usage: `.slowmode on|off` or `.slowmode set <msgs> <secs>`');
  },
  async onMessage(sock, message, context = {}) {
    try {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = context.senderId || message.key.participant || message.key.remoteJid;
      if (!chatId.endsWith('@g.us')) return false;
      await sm.checkMessage(sock, message, chatId, sender);
    } catch (_) {}
    return false;
  },
};
