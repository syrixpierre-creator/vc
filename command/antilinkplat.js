/**
 * QUEEN AKUMA v3.5.0 • #9 Per-platform antilink (PATRON se)
 * Har platform ka alag toggle — .antilinkfb / .antilinkig / .antilinktg /
 * .antilinktiktok / .antilinktw / .antilinkyt / .antiwame (on/off)
 * .antilinkplat — saare platforms ka status
 * Link wala message delete ho jata hai (admins/owner exempt).
 * Enforcement: onMessage hook (lib/perlink.js).
 */
const perlink = require('../lib/perlink');

const CMD_TO_PLAT = {
  antilinkfb: 'fb', antilinkig: 'ig', antilinktg: 'tg', antilinktiktok: 'tiktok',
  antilinktw: 'tw', antilinkyt: 'yt', antiwame: 'wame',
};

module.exports = {
  command: 'antilinkfb',
  aliases: ['antilinkig', 'antilinktg', 'antilinktiktok', 'antilinktw', 'antilinkyt', 'antiwame', 'antilinkplat'],
  category: 'group',
  description: 'Per-platform antilink — fb/ig/tg/tiktok/twitter/yt/wa.me alag-alag toggle',
  usage: '.antilinkfb on|off | .antilinkplat (status)',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'antilinkfb').toLowerCase();
    if (invoked === 'antilinkplat') {
      const cur = perlink.getChat(chatId);
      const lines = Object.entries(perlink.LABELS).map(([k, label]) => `• ${label}: ${cur[k] ? '✅ ON' : '❌ OFF'}`).join('\n');
      return reply(`🔗 *Per-Platform Antilink*\n\n${lines}\n\n_Toggle: \`.antilinkfb on\` / \`.antilinkig off\` etc._`);
    }
    const plat = CMD_TO_PLAT[invoked];
    if (!plat) return reply('🔗 Usage: `.antilinkfb on|off`');
    const sub = String(args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(sub)) {
      return reply(`🔗 *${perlink.LABELS[plat]} Antilink:* ${perlink.isOn(chatId, plat) ? '✅ ON' : '❌ OFF'}\n\nUsage: \`.${invoked} on\` ya \`.${invoked} off\``);
    }
    perlink.set(chatId, plat, sub === 'on');
    return reply(`🔗 *${perlink.LABELS[plat]} antilink* ${sub === 'on' ? '✅ ON' : '❌ OFF'}`);
  },
  async onMessage(sock, message, context = {}) {
    try {
      const chatId = context.chatId || message.key.remoteJid;
      if (!chatId.endsWith('@g.us')) return false;
      if (message.key.fromMe) return false;
      if (context.isOwnerOrSudoCheck) return false;
      const text = String(context.messageText || context.userMessage || '');
      const plat = perlink.matchPlatform(text);
      if (!plat) return false;
      if (!perlink.isOn(chatId, plat)) return false;
      // Admins exempt
      if (context.isSenderAdmin) return false;
      try { await sock.sendMessage(chatId, { delete: message.key }); } catch (_) {}
      return false;
    } catch (_) { return false; }
  },
};
