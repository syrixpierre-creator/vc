 'use strict';
/**
 * QUEEN AKUMA — .compliment2 : random compliment (local list, no API).
 * Usage: .compliment2 [@user]
 */
const COMPLIMENTS = [
  'Tumhari smile dekh ke din ban jata hai 😊',
  'Tumhara dimaag kamaal ka hai — har baat me logic! 🧠',
  'Tum jaisa dost milna luck ki baat hai 🍀',
  'Tumhari mehnat ek din zaroor rang layegi 💪',
  'Tumhara style alag level ka hai 😎',
  'Tumhare saath baat karke mood fresh ho jata hai ✨',
  'Tum bahut ache insaan ho, dil ke saaf ❤️',
  'Tumhari hasi contagious hai — sab hasne lagte hain 😂',
  'Tumhara confidence dekh ke inspiration milti hai 🔥',
  'Tum har kaam me apna 100% dete ho, respect! 🙌',
  'Tumhara sense of humour best hai 😄',
  'Tum jahan jate ho, wahan positivity le jate ho 🌟',
  'Tumhare ideas hamesha hatke hote hain 💡',
  'Tum bahut caring ho, log tumhe pasand karte hain 🤗',
  'Tumhara future bright hai, bas lage raho 🚀',
  'Tumhare jaisa honest banda rare hai 🙏',
  'Tumhari awaaz sunke sukoon milta hai 🎵',
  'Tum ek achhe leader ban sakte ho 👑',
  'Tumhari loyalty priceless hai 💎',
  'Tumhare aane se group ki raunak badh jati hai 🎉',
  'Tumhara kaam dekh ke sab impress hote hain 👏',
  'Tum bahut talented ho, bas khud pe bharosa rakho 🌈',
  'Tumhari company me time ka pata hi nahi chalta ⏰',
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
