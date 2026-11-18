const db = require('../lib/jsondb');
const settings = require('../settings');

const NAME = 'autoreply';
const lastHit = new Map();

module.exports = {
  command: 'autoreply',
  aliases: ['ar', 'setreply'],
  category: 'owner',
  description: 'Custom keyword auto replies',
  usage: '.autoreply add <keyword> | <reply>  •  del <keyword>  •  list  •  on/off',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const data = db.load(NAME, { enabled: true, rules: {} });
    const sub = (args[0] || '').toLowerCase();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (sub === 'on' || sub === 'off') {
      data.enabled = sub === 'on';
      db.save(NAME);
      return reply(`🤖 Auto reply is now *${data.enabled ? 'ON' : 'OFF'}*`);
    }

    if (sub === 'add') {
      const body = args.slice(1).join(' ');
      const [kw, ...rest] = body.split('|');
      const keyword = (kw || '').trim().toLowerCase();
      const answer = rest.join('|').trim();
      if (!keyword || !answer) return reply('Usage: .autoreply add hello | Hi there! 👋');
      data.rules[keyword] = answer;
      db.save(NAME);
      return reply(`✅ Saved: *${keyword}* → ${answer}`);
    }

    if (sub === 'del' || sub === 'remove') {
      const keyword = args.slice(1).join(' ').trim().toLowerCase();
      if (!data.rules[keyword]) return reply('❌ Keyword not found.');
      delete data.rules[keyword];
      db.save(NAME);
      return reply(`🗑️ Removed *${keyword}*`);
    }

    if (sub === 'list') {
      const keys = Object.keys(data.rules);
      if (!keys.length) return reply('No auto replies set.');
      return reply(`📋 *Auto replies* (${data.enabled ? 'ON' : 'OFF'})\n\n` + keys.map((k, i) => `${i + 1}. ${k} → ${data.rules[k]}`).join('\n'));
    }

    return reply(`*Auto Reply*\n\n.autoreply add <keyword> | <reply>\n.autoreply del <keyword>\n.autoreply list\n.autoreply on / off`);
  },

  async onMessage(sock, message, ctx) {
    const data = db.load(NAME, { enabled: true, rules: {} });
    if (!data.enabled || message.key.fromMe) return;
    const text = (ctx.messageText || '').trim().toLowerCase();
    if (!text || settings.prefixes.some(p => text.startsWith(p))) return;
    const hit = data.rules[text];
    if (!hit) return;
    const key = ctx.chatId;
    if (Date.now() - (lastHit.get(key) || 0) < 3000) return;
    lastHit.set(key, Date.now());
    await sock.sendMessage(ctx.chatId, { text: hit }, { quoted: message });
  }
};
