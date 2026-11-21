 'use strict';
/**
 * QUEEN AKUMA — .compliment2 : random compliment (local list, no API).
 * Usage: .compliment2 [@user]
 */
const COMPLIMENTS = [
  'Your smile makes my day 😊',
  'Your mind is amazing, logic in everything! 🧠',
  'Having a friend like you is pure luck 🍀',
  'Tumhari mehnat ek din zaroor rang layegi 💪',
  'Your style is on another level 😎',
  'Talking with you always makes my mood fresh ✨',
  'Tum bahut ache insaan ho, dil ke saaf ❤️',
  'Your laugh is contagious, everyone starts laughing 😂',
  'Your confidence is inspiring 🔥',
  'Tum har kaam me apna 100% dete ho, respect! 🙌',
  'Tumhara sense of humour best hai 😄',
  'Tum jahan jate ho, wahan positivity le jate ho 🌟',
  'Your ideas are always unique 💡',
  'You are very caring, people love you 🤗',
  'Tumhara future bright hai, bas lage raho 🚀',
  'Tumhare jaisa honest banda rare hai 🙏',
  'Tumhari awaaz sunke sukoon milta hai 🎵',
  'You can be a great leader 👑',
  'Tumhari loyalty priceless hai 💎',
  'The group lights up when you arrive 🎉',
  'Everyone is impressed by your work 👏',
  'Tum bahut talented ho, bas khud pe bharosa rakho 🌈',
  'Time flies in your company ⏰',
  'Tum ek gem ho, bas chamakte raho 💫',
];

module.exports = {
  command: 'compliment2',
  aliases: [],
  category: 'tools',
  description: 'Random compliment: .compliment2 [@user]',
  usage: '.compliment2 [@user]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    const target = (ctxInfo.mentionedJid && ctxInfo.mentionedJid[0])
      || ctxInfo.participant
      || null;
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    if (target) {
      await sock.sendMessage(chatId, {
        text: '💐 *Compliment*\n\n👤 @' + String(target).split('@')[0] + ' — ' + c,
        mentions: [String(target)],
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: '💐 *Compliment*\n\n' + c }, { quoted: message });
    }
  },
};
