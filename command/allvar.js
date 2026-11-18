/**
 * QUEEN AKUMA v3.4.0 — Real .allvar / .getvar / .delvar (Levanter #7)
 * Owner-only. Values data/vars.json me rehti hain.
 */
const vars = require('../lib/vars');
function isOwner(senderJid) {
  try { const isOwner = require('../lib/isOwner'); return !!(isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)); } catch (_) { return false; }
}
function guard(senderJid, reply) {
  if (!isOwner(senderJid)) { reply('🚫 *You are not authorized to use this command!*'); return false; }
  return true;
}
module.exports = { commands: [
  {
    command: 'allvar', aliases: ['vars', 'allvars'], category: 'owner',
    description: 'Saare vars dekho', usage: '.allvar',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!guard(senderJid, reply)) return;
      const d = vars.all();
      const keys = Object.keys(d);
      if (!keys.length) return reply('📦 Koi var set nahi hai.\nSet karo: `.setvar KEY=value`');
      return reply(`📦 *Bot Vars (${keys.length}):*\n\n${keys.map((k) => `• *${k}* = ${d[k]}`).join('\n')}`);
    },
  },
  {
    command: 'getvar', aliases: ['getenv', 'varget'], category: 'owner',
    description: 'Ek var ki value dekho', usage: '.getvar KEY',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!guard(senderJid, reply)) return;
      const key = (args[0] || '').trim();
      if (!key) return reply('❌ Usage: `.getvar KEY`');
      const v = vars.get(key);
      if (v === undefined) return reply(`❌ Var *${key.toUpperCase()}* nahi mila.\nSab dekho: \`.allvar\``);
      return reply(`📦 *${key.toUpperCase()}* = ${v}`);
    },
  },
  {
    command: 'delvar', aliases: ['delenv', 'vardelete'], category: 'owner',
    description: 'Var delete karo', usage: '.delvar KEY',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!guard(senderJid, reply)) return;
      const key = (args[0] || '').trim();
      if (!key) return reply('❌ Usage: `.delvar KEY`');
      return reply(vars.del(key) ? `✅ Var *${key.toUpperCase()}* delete kar diya.` : `❌ Var *${key.toUpperCase()}* nahi mila.`);
    },
  },
] };
