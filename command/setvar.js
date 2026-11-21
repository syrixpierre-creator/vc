/**
 * QUEEN AKUMA v3.4.0 — Real .setvar (Levanter #7)
 * .setvar KEY=value — owner-only. Value data/vars.json me save hoti hai.
 */
const vars = require('../lib/vars');
function isOwner(senderJid) {
  try { const isOwner = require('../lib/isOwner'); return !!(isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)); } catch (_) { return false; }
}
module.exports = {
  command: 'setvar', aliases: ['setenv', 'varset'], category: 'owner',
  description: 'Set a bot var (from WhatsApp)', usage: '.setvar BOT_NAME=QUEEN AKUMA',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!isOwner(senderJid)) return reply('🚫 *You are not authorized to use this command!*');
    const text = (args || []).join(' ').trim();
    const m = text.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!m) return reply('❌ Usage: `.setvar KEY=value`\nExample: `.setvar BOT_NAME=QUEEN AKUMA`');
    vars.set(m[1], m[2]);
    return reply(`✅ Var set: *${m[1].toUpperCase()}* = ${m[2]}\n\nDekho: \`.getvar ${m[1].toUpperCase()}\` • Sab: \`.allvar\``);
  },
};
