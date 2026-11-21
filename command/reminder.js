/**
 * QUEEN AKUMA v3.0.0 — Reminders
 * .setremind 10m <text>   — ek baar
 * .setremind 18:30 <text> — roz us time (daily)
 * .myreminders | .delremind <id>
 */
const sch = require('../lib/scheduler');

module.exports = { commands: [
  {
    command: 'setremind', aliases: [], category: 'tools',
    description: 'Reminder set karo — 10m/2h ya 18:30 (roz)',
    usage: '.setremind 10m <text> | .setremind 18:30 <text>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const sender = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const parsed = sch.parseTime(args[0]);
      const text = (args || []).slice(1).join(' ').trim();
      if (!parsed || !text) {
        return reply('📌 *Usage:* .setremind 10m <text> | .setremind 18:30 <text>');
      }
      const item = sch.add(chatId, text, parsed.at, parsed.repeat, sender);
      return reply(`⏰ *Reminder set!* \n\n🆔 ${item.id}\n📅 ${parsed.repeat === 'daily' ? 'Roz ' + sch.fmtTime(item.at) : sch.fmtTime(item.at)}\n📝 ${text}`);
    }
  },
  {
    command: 'myreminders', aliases: [], category: 'tools',
    description: 'Show the reminders of this chat',
    usage: '.myreminders',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const items = sch.list(chatId);
      if (!items.length) return reply('❌ *No reminders in this chat.*\n📌 *Usage:* .setremind 10m <text>');
      const lines = items.map((it) => `🆔 *${it.id}* — ${it.repeat === 'daily' ? 'roz ' : ''}${sch.fmtTime(it.at)}\n   ${it.text}`).join('\n\n');
      return reply(`⏰ *Reminders*\n\n${lines}\n\nDelete: \`.delremind <id>\``);
    }
  },
  {
    command: 'delremind', aliases: [], category: 'tools',
    description: 'Reminder delete karo',
    usage: '.delremind <id>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const id = (args[0] || '').trim();
      if (!id) return reply('📌 *Usage:* .delremind <id>');
      const ok = sch.remove(chatId, id);
      return reply(ok ? `✅ *Reminder ${id.toUpperCase()} deleted.*` : `❌ *Reminder ${id.toUpperCase()} not found.*`);
    }
  }
] };
