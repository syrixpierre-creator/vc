/**
 * QUEEN AKUMA v3.0.0 — Multi-Bot Manager commands (owner-only)
 * .addbot <number> | .bots | .removebot <number>
 */
const mb = require('../lib/multiBot');
const isOwnerOrSudo = require('../lib/isOwner');

function isOwner(senderJid, sock, chatId) {
  return isOwnerOrSudo.isOwnerOnly(senderJid) || isOwnerOrSudo(senderJid, sock, chatId);
}

module.exports = { commands: [
  {
    command: 'addbot', aliases: [], category: 'owner',
    description: 'Make another WhatsApp number a bot on this host',
    usage: '.addbot <number>',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!message.key.fromMe && !await isOwner(senderJid, sock, chatId)) return reply('🚫 *You are not authorized to use this command!*');
      const number = (args[0] || '').trim();
      if (!number) return reply('📌 *Usage:* .addbot <number>');
      await reply('⏳ *Starting extra bot...*');
      const r = await mb.addBot(number);
      if (!r.ok) return reply('❌ ' + r.error);
      if (r.status === 'connected') return reply(`✅ *Extra bot connected:* ${r.number}`);
      return reply(`🔑 *Pairing code (${r.number}):* \`${r.code}\``);
    }
  },
  {
    command: 'bots', aliases: ['mybots'], category: 'owner',
    description: 'Show the extra bots',
    usage: '.bots',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!message.key.fromMe && !await isOwner(senderJid, sock, chatId)) return reply('🚫 *You are not authorized to use this command!*');
      const list = mb.listBots();
      if (!list.length) return reply(`❌ *No extra bots.*\n📌 *Usage:* .addbot <number>`);
      const lines = list.map((b) => `📱 ${b.number} — *${b.status}*`).join('\n');
      return reply(`🤖 *Multi-Bot Manager*\n\n${lines}\n\nAdd: \`.addbot <number>\`\nRemove: \`.removebot <number>\``);
    }
  },
  {
    command: 'removebot', aliases: [], category: 'owner',
    description: 'Extra bot hatao (session delete)',
    usage: '.removebot <number>',
    ownerOnly: true,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!message.key.fromMe && !await isOwner(senderJid, sock, chatId)) return reply('🚫 *You are not authorized to use this command!*');
      const number = (args[0] || '').trim();
      if (!number) return reply('❌ Usage: `.removebot 919876543210`');
      const r = mb.removeBot(number);
      if (!r.ok) return reply('❌ ' + r.error);
      return reply(`✅ *Extra bot ${r.number} removed.*`);
    }
  }
] };
