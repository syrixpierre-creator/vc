 'use strict';
/**
 * QUEEN AKUMA — .compatibility : do naamo ke beech love compatibility % (seeded — same pair = same result).
 * Local, no API. Fun command hai, game nahi.
 * Usage: .compatibility <naam1> | <naam2>  ya  .compatibility @a @b
 */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

module.exports = {
  command: 'compatibility',
  aliases: [],
  category: 'tools',
  description: 'Love compatibility %: .compatibility <naam1> | <naam2>',
  usage: '.compatibility <naam1> | <naam2>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    const mentions = ctxInfo.mentionedJid || [];
    const raw = (args || []).join(' ').trim();
    let a = '';
    let b = '';
    if (mentions.length >= 2) {
      a = mentions[0].split('@')[0];
      b = mentions[1].split('@')[0];
    } else if (raw.includes('|')) {
      [a, b] = raw.split('|').map((s) => s.trim());
    } else if (raw.includes(' vs ')) {
      [a, b] = raw.split(' vs ').map((s) => s.trim());
    } else if (mentions.length === 1) {
      a = (context.senderId || message.key.participant || '').split('@')[0];
      b = mentions[0].split('@')[0];
    } else if (raw) {
      const parts = raw.split(/\s+/);
      if (parts.length >= 2) { a = parts[0]; b = parts.slice(1).join(' '); }
      else { a = (context.senderId || message.key.participant || '').split('@')[0]; b = parts[0]; }
    }
    if (!a || !b) {
      await reply('📌 *Usage:* .compatibility <name> | <name>');
      return;
    }
    const pct = (hashStr(a.toLowerCase() + '♥' + b.toLowerCase()) % 100) + 1;
    const filled = Math.round(pct / 10);
    const bar = ''.repeat(filled) + ''.repeat(10 - filled);
    let line;
    if (pct < 25) line = 'Bas dost hi theek ho 😅';
    else if (pct < 50) line = 'There is something... you can try 🙂';
    else if (pct < 75) line = 'Achhi jodi hai! 💕';
    else if (pct < 90) line = 'Perfect match! 💖 Shaadi pakki samjho 😄';
    else line = 'MADE FOR EACH OTHER! 💍❤️';
    await reply('💞 *Compatibility*\n\n👫 ' + a + ' ❤️ ' + b + '\n[' + bar + '] *' + pct + '%*\n\n' + line);
  },
};
