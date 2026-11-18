 'use strict';
/**
 * QUEEN AKUMA — .imstupid : Stupid Meter (fun rate, .gayrate jaisa).
 * Same user + same day = same result (seeded). Local, no API. Game nahi.
 * Usage: .imstupid [@user]
 */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

module.exports = {
  command: 'imstupid',
  aliases: [],
  category: 'tools',
  description: 'Stupid Meter: .imstupid [@user]',
  usage: '.imstupid [@user]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    const target = (ctxInfo.mentionedJid && ctxInfo.mentionedJid[0])
      || ctxInfo.participant
      || message.key.participant
      || context.senderId
      || message.key.remoteJid;
    const today = new Date().toISOString().slice(0, 10);
    const pct = (hashStr(String(target) + '|' + today) % 100) + 1;
    const filled = Math.round(pct / 10);
    const bar = ''.repeat(filled) + ''.repeat(10 - filled);
    let line;
    if (pct < 20) line = 'Bilkul normal dimaag — tension mat lo 😌';
    else if (pct < 40) line = 'Thoda sa silly, par cute ho 😄';
    else if (pct < 60) line = 'Aadha dimaag chhutti par hai 😂';
    else if (pct < 80) line = 'Stupidity level HIGH — certificate banta hai 🤣';
    else line = 'LEGENDARY bewakoof! 🏆🤪';
    const num = String(target).split('@')[0];
    await sock.sendMessage(chatId, {
      text: '🤪 *Stupid Meter*\n\n👤 @' + num + '\n[' + bar + '] *' + pct + '% stupid*\n\n' + line,
      mentions: [String(target)],
    }, { quoted: message });
  },
};
