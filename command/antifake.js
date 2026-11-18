const db = require('../lib/jsondb');

const NAME = 'antifake';

const jidOf = (p) => (typeof p === 'string' ? p : (p?.phoneNumber || p?.id || ''));

module.exports = {
  command: 'antifake',
  aliases: ['antiforeign', 'countrylock'],
  category: 'admin',
  description: 'Auto-remove new members whose number does not start with allowed country codes',
  usage: '.antifake on 91 92  •  .antifake off  •  .antifake list',
  groupOnly: true,
  adminOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const data = db.load(NAME, {});
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'on') {
      const codes = args.slice(1).map(c => c.replace(/\D/g, '')).filter(Boolean);
      if (!codes.length) return reply('Usage: .antifake on 91 92\n(only numbers starting with these country codes can join)');
      data[chatId] = { enabled: true, codes };
      db.save(NAME);
      return reply(`🛡️ *Anti-Fake ON*\nAllowed country codes: ${codes.map(c => '+' + c).join(', ')}\n\n_Bot must be admin._`);
    }
    if (sub === 'off') {
      delete data[chatId];
      db.save(NAME);
      return reply('🛡️ Anti-Fake is now *OFF* for this group.');
    }
    if (sub === 'list' || !sub) {
      const cfg = data[chatId];
      return reply(cfg?.enabled ? `🛡️ Anti-Fake ON\nAllowed: ${cfg.codes.map(c => '+' + c).join(', ')}` : '🛡️ Anti-Fake is OFF.\n\nUse: .antifake on 91 92');
    }
    return reply('Usage: .antifake on 91 92 | off | list');
  },

  async onGroupUpdate(sock, update) {
    const { id, participants, action } = update;
    if (action !== 'add') return;
    const data = db.load(NAME, {});
    const cfg = data[id];
    if (!cfg?.enabled) return;

    const botNum = (sock.user?.id || '').split(':')[0].split('@')[0];
    for (const p of participants || []) {
      const jid = jidOf(p);
      if (!jid || jid.endsWith('@lid')) continue; // can't read number from LID
      const num = jid.split(':')[0].split('@')[0];
      if (num === botNum) continue;
      if (!cfg.codes.some(c => num.startsWith(c))) {
        try {
          await sock.groupParticipantsUpdate(id, [jid], 'remove');
          await sock.sendMessage(id, { text: `🚫 Removed @${num} — country code not allowed in this group.`, mentions: [jid] });
        } catch (e) {
          console.error('[antifake]', e.message);
        }
      }
    }
  }
};
