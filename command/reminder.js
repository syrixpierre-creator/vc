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
        return reply('❌ Usage:\n`.setremind 10m paani pina hai` — 10 min baad ek baar\n`.setremind 2h meeting hai` — 2 ghante baad\n`.setremind 18:30 good night` — roz shaam 6:30\n\nList: `.myreminders` | Delete: `.delremind <id>`');
      }
      const item = sch.add(chatId, text, parsed.at, parsed.repeat, sender);
      return reply(`⏰ *Reminder set!* \n\n🆔 ${item.id}\n📅 ${parsed.repeat === 'daily' ? 'Roz ' + sch.fmtTime(item.at) : sch.fmtTime(item.at)}\n📝 ${text}`);
    }
  },
  {
    command: 'myreminders', aliases: [], category: 'tools',
    description: 'Is chat ke reminders dekho',
    usage: '.myreminders',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const items = sch.list(chatId);
      if (!items.length) return reply('⏰ Is chat me koi reminder nahi.\n`.setremind 10m <text>` se banao.');
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
      if (!id) return reply('❌ Usage: `.delremind R1A2B3`\nID `.myreminders` se dekho.');
      const ok = sch.remove(chatId, id);
      return reply(ok ? `✅ Reminder *${id.toUpperCase()}* delete ho gaya.` : `❌ Reminder *${id.toUpperCase()}* nahi mila.`);
    }
  }
] };
