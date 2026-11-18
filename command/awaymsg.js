'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Away-msg scheduler (queen-akuma port).
 * Time-window DM auto-reply: raat ko bot khud "away" message bhejta hai.
 * Owner set karta hai: .setaway 22:00-08:00 <message>
 * Sirf DM me reply karta hai, group me nahi. Har sender ko 60 min me ek baar.
 * Data: data/autoreply.json
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'autoreply.json');
function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return { enabled: false }; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function parseHM(s) {
  const m = String(s || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
function inWindow(start, end, nowMin) {
  if (start <= end) return nowMin >= start && nowMin < end;
  return nowMin >= start || nowMin < end; // overnight window
}
const lastReply = new Map(); // sender -> timestamp (spam rokne ke liye)

module.exports = {
  commands: [
    {
      command: 'setaway',
      aliases: ['awayon'],
      description: 'Away auto-reply set karo: .setaway 22:00-08:00 <message> (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const range = (args || [])[0];
        const msg = (args || []).slice(1).join(' ').trim();
        const m = String(range || '').match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
        if (!m || !msg) {
          await reply('❌ Usage: *.setaway 22:00-08:00 <message>*\nExample: .setaway 22:00-08:00 Main so raha hoon, subah reply karunga.');
          return;
        }
        const start = parseHM(m[1]), end = parseHM(m[2]);
        if (start == null || end == null) { await reply('❌ Time galat hai. Format: HH:MM-HH:MM (24h).'); return; }
        save({ enabled: true, start, end, startStr: m[1], endStr: m[2], message: msg });
        await reply('✅ *Away auto-reply ON*\n\n⏰ Window: ' + m[1] + ' – ' + m[2] + ' (IST)\n💬 Message: ' + msg + '\n\nIs time me DM aane par bot khud ye reply bhej dega. Band karne ke liye: *.awayoff*');
      }
    },
    {
      command: 'awayoff',
      aliases: ['awaydisable'],
      description: 'Away auto-reply band karo (owner-only).',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
        if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
        const st = load();
        st.enabled = false;
        save(st);
        await reply('✅ Away auto-reply OFF ho gaya.');
      }
    },
    {
      command: 'awaymsg',
      aliases: ['awaystatus'],
      description: 'Away auto-reply ki status dikhao.',
      category: 'owner',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const st = load();
        if (!st.enabled) {
          await reply('ℹ️ Away auto-reply OFF hai.\nSet karne ke liye: *.setaway 22:00-08:00 <message>*');
          return;
        }
        await reply('🌙 *Away Auto-Reply ON*\n\n⏰ Window: ' + st.startStr + ' – ' + st.endStr + ' (IST)\n💬 Message: ' + st.message);
      }
    }
  ],
  // DM auto-reply hook
  async onMessage(sock, message, context = {}) {
    try {
      const st = load();
      if (!st.enabled) return;
      const chatId = message.key.remoteJid;
      if (!chatId || chatId.endsWith('@g.us') || chatId === 'status@broadcast') return;
      const sender = message.key.participant || chatId;
      // Owner ke messages par reply nahi
      if (context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck) return;
      const now = new Date(Date.now() + (5.5 * 3600 * 1000)); // IST
      const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
      if (!inWindow(st.start, st.end, nowMin)) return;
      const last = lastReply.get(sender) || 0;
      if (Date.now() - last < 3600000) return; // 60 min me ek baar
      lastReply.set(sender, Date.now());
      await sock.sendMessage(chatId, { text: '🌙 ' + st.message }, { quoted: message });
    } catch (e) {}
  }
};
