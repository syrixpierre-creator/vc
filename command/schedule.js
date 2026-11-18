/**
 * QUEEN AKUMA v3.4.0 — Schedule Message (Levanter #5)
 * .setschedule <time> <message> — ya kisi message par reply karke .setschedule <time>
 * .getschedule — list | .delschedule <id> — delete
 * Group me admin/owner only; DM me owner only.
 */
const schedMsg = require('../lib/schedMsg');

const num = (j) => String(j || '').split(':')[0].split('@')[0];
async function canManage(senderJid, sock, chatId, isGroup) {
  try {
    const isOwner = require('../lib/isOwner');
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return true;
    if (isGroup && await isOwner(senderJid, sock, chatId)) return true;
  } catch (_) {}
  if (!isGroup) return false;
  try {
    const meta = await sock.groupMetadata(chatId);
    const me = (meta.participants || []).find((p) => String(p.id).replace(/\D/g, '').endsWith(num(senderJid).slice(-10)));
    return !!(me && (me.admin === 'admin' || me.admin === 'superadmin'));
  } catch (_) { return false; }
}

module.exports = { commands: [
  {
    command: 'setschedule', aliases: ['schedule', 'schedulemsg'], category: 'group',
    description: 'Message schedule karo — group/DM me time par bhejega',
    usage: '.setschedule 10m <message> | .setschedule 18:30 (reply)',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!(await canManage(senderJid, sock, chatId, isGroup))) return reply('❌ *Only group admins or the bot owner can use this command.*');
      const timeInput = args[0] || '';
      let text = args.slice(1).join(' ').trim();
      if (!text) {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const q = quoted?.conversation || quoted?.extendedTextMessage?.text || quoted?.imageMessage?.caption || '';
        text = String(q || '').trim();
      }
      if (!timeInput || !text) return reply('❌ Usage: `.setschedule 10m Good morning sabko` ya message par reply karke `.setschedule 18:30`');
      const res = schedMsg.add(chatId, text, timeInput, senderJid);
      if (!res.ok) return reply('❌ ' + res.error);
      return reply(`✅ *Message schedule ho gaya!*\n\nID: \`${res.item.id}\`\nTime: ${schedMsg.fmtTime(res.item.at)}${res.item.repeat === 'daily' ? ' (roz)' : ''}\nMessage: ${text.slice(0, 100)}\n\nDekho: \`.getschedule\` • Delete: \`.delschedule ${res.item.id}\``);
    },
  },
  {
    command: 'getschedule', aliases: ['listschedule', 'myschedule'], category: 'group',
    description: 'Scheduled messages ki list dekho', usage: '.getschedule',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!(await canManage(senderJid, sock, chatId, isGroup))) return reply('❌ Sirf group admin ya owner dekh sakta hai.');
      const items = schedMsg.list(chatId);
      if (!items.length) return reply('📅 Koi scheduled message nahi hai.\nAdd karo: `.setschedule 10m <message>`');
      return reply(`📅 *Scheduled Messages (${items.length}):*\n\n${items.map((it) => `\`${it.id}\` — ${schedMsg.fmtTime(it.at)}${it.repeat === 'daily' ? ' (roz)' : ''}\n  ${it.text.slice(0, 80)}`).join('\n\n')}`);
    },
  },
  {
    command: 'delschedule', aliases: ['delsched', 'cancelschedule'], category: 'group',
    description: 'Scheduled message delete karo', usage: '.delschedule <id>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (!(await canManage(senderJid, sock, chatId, isGroup))) return reply('❌ Sirf group admin ya owner delete kar sakta hai.');
      const id = (args[0] || '').trim();
      if (!id) return reply('❌ Usage: `.delschedule S1234`');
      return reply(schedMsg.remove(chatId, id) ? `✅ Scheduled message \`${id.toUpperCase()}\` delete kar diya.` : '❌ ID nahi mili. `.getschedule` se dekho.');
    },
  },
] };
