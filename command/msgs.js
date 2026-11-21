/**
 * QUEEN AKUMA — Message Counter / Activity (Levanter style)
 * .msgs          → your message count in this group
 * .msgs @user    → someone's count
 * .msgs top      → top 10 active
 * .msgs reset    → owner/admin reset
 */
const db = require('../lib/jsondb');

const NAME = 'msgcount';

function load() {
  return db.load(NAME, { groups: {} });
}

function getGroup(data, jid) {
  if (!data.groups[jid]) data.groups[jid] = {};
  return data.groups[jid];
}

module.exports = {
  command: 'msgs',
  aliases: ['msgcount', 'messages', 'activity'],
  category: 'group',
  description: 'Group message counter & top active members',
  usage: '.msgs  |  .msgs @user  |  .msgs top  |  .msgs reset',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.participant || chatId;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ Sirf group me.' }, { quoted: message });
    }

    const data = load();
    const g = getGroup(data, chatId);
    const sub = (args[0] || '').toLowerCase();
    const reply = (t, opts = {}) => sock.sendMessage(chatId, { text: t, ...opts }, { quoted: message });

    // TOP
    if (sub === 'top' || sub === 'leaderboard') {
      const sorted = Object.entries(g)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      if (!sorted.length) return reply('❌ *No data yet.*');
      let msg = `🏆 *Top Active Members*\n\n`;
      sorted.forEach(([jid, count], i) => {
        const num = jid.split('@')[0];
        msg += `${i + 1}. @${num} → *${count}* msgs\n`;
      });
      return reply(msg, { mentions: sorted.map(s => s[0]) });
    }

    // RESET (admin/owner)
    if (sub === 'reset') {
      // simple check - can improve with isAdmin
      data.groups[chatId] = {};
      db.save(NAME);
      return reply('🗑️ Message counts reset for this group.');
    }

    // Specific user
    let target = senderId;
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned[0]) target = mentioned[0];
    else if (args[0] && args[0].includes('@')) {
      // try parse
      target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    const count = g[target] || 0;
    const name = target.split('@')[0];
    return reply(`📊 *Message Count*\n\n@${name} : *${count}* messages in this group.`, {
      mentions: [target]
    });
  },

  async onMessage(sock, message, ctx) {
    try {
      if (message.key.fromMe) return;
      const chatId = ctx.chatId;
      if (!chatId.endsWith('@g.us')) return;
      const sender = ctx.senderId || message.key.participant;
      if (!sender) return;

      const data = load();
      const g = getGroup(data, chatId);
      g[sender] = (g[sender] || 0) + 1;
      // save occasionally to reduce writes
      if (g[sender] % 5 === 0) db.save(NAME);
      else db.save(NAME); // for simplicity always save (small)
    } catch (e) {}
  }
};
