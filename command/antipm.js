/**
 * QUEEN AKUMA — Anti Private Message (from Levanter gist)
 * Blocks or ignores PMs except allowed numbers.
 * .antipm on/off
 * .antipm allow 919876543210
 * .antipm remove 919876543210
 * .antipm list
 */
const db = require('../lib/jsondb');

const NAME = 'antipm';

function load() {
  return db.load(NAME, { enabled: false, allowed: [] });
}

module.exports = {
  command: 'antipm',
  aliases: ['blockpm', 'pmblock'],
  category: 'owner',
  description: 'Block private messages except allowed numbers',
  usage: '.antipm on/off | allow <num> | remove <num> | list',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const data = load();
    const sub = (args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ').replace(/\D/g, '');
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (sub === 'on') {
      data.enabled = true;
      db.save(NAME);
      return reply('✅ *Anti-PM ON*\nAb sirf allowed numbers ke PM accept honge.');
    }
    if (sub === 'off') {
      data.enabled = false;
      db.save(NAME);
      return reply('❌ Anti-PM OFF.');
    }
    if (sub === 'list') {
      if (!data.allowed.length) return reply('📭 Koi allowed number nahi.');
      return reply(`📋 *Allowed Numbers (${data.allowed.length}):*\n` + data.allowed.map(n => `• ${n}`).join('\n'));
    }
    if (sub === 'allow') {
      if (!rest || rest.length < 8) return reply('❌ Number do: `.antipm allow 919876543210`');
      if (!data.allowed.includes(rest)) data.allowed.push(rest);
      db.save(NAME);
      return reply(`✅ Allowed: ${rest}`);
    }
    if (sub === 'remove' || sub === 'del') {
      if (!rest) return reply('❌ Number do');
      data.allowed = data.allowed.filter(n => n !== rest);
      db.save(NAME);
      return reply(`🗑️ Removed: ${rest}`);
    }

    return reply(
`🛡️ *Anti-PM*\n\n` +
`Status: ${data.enabled ? '✅ ON' : '❌ OFF'}\n` +
`Allowed: ${data.allowed.length}\n\n` +
`.antipm on\n.antipm off\n.antipm allow 9198...\n.antipm remove 9198...\n.antipm list`
    );
  },

  async onMessage(sock, message, ctx) {
    try {
      const data = load();
      if (!data.enabled) return;
      if (message.key.fromMe) return;
      const chatId = ctx.chatId;
      if (chatId.endsWith('@g.us')) return; // only PM

      const senderNum = (ctx.senderId || message.key.remoteJid || '').split('@')[0].split(':')[0];
      if (data.allowed.includes(senderNum)) return;

      // Block or ignore
      await sock.sendMessage(chatId, { text: '🚫 Private messages are disabled. Contact owner in group.' }).catch(() => {});
      // Optional: block user
      // await sock.updateBlockStatus(chatId, 'block');
    } catch (e) {}
  }
};
