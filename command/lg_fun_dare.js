'use strict';
/**
 * QUEEN AKUMA — .truthq / .tod : Truth or Dare (local lists, no API).
 * FIX (audit batch 2): pehle ye sirf lib/compat family-B wrapper tha jo
 * "fun &dare.js" template ki taraf ishara karta tha — compat QUEEN-AKUMA-shape
 * handler chala hi nahi pata tha, isliye .tod par sirf smartEngine fallback
 * ("Command available nahi hai") aata tha. Ab seedha QUEEN-AKUMA-shape real handler.
 * Fun command hai, game nahi. Usage: .tod [truth|dare]
 */
const TRUTHS = [
  'Tumhara sabse embarrassing moment kya tha? 😳',
  'Tumne kabhi kisi ka secret bataya hai? Kiska? 🤫',
  'Tumhara crush kaun hai? Naam batao! 😏',
  'Tumne kabhi jhooth bolke kisi ko fasaya hai? 😅',
  'Tumhari sabse badi khwahish kya hai? ✨',
  'Tum kabhi class me sote hue pakde gaye ho? 😴',
  'Tumhara phone ka wallpaper kya hai aur kyun? 📱',
  'Tumne kabhi khana chhup ke khaya hai? 😂',
  'Tumhara sabse ajeeb sapna kya tha? 🌙',
  'Tum kis cheez se sabse zyada darte ho? 😨',
  'Tumne kabhi kisi ko bina bataye uska khana khaya hai? 🍕',
  'Agar tum ek din ke liye invisible hote, to kya karte? 👻',
];
const DARES = [
  'Apni DP 1 ghante ke liye cartoon wali lagao! 😂',
  'Group me "Main sabse smart hoon" likh ke bhejo! 😎',
  'Apni favourite gaane ki 2 lines yahin gao (likh ke)! 🎤',
  'Apne best friend ko "I love you" message bhejo aur screenshot dikhao! 😜',
  'Apna naam 5 minute ke liye "Bewakoof No.1" rakh lo! 🤣',
  'Group me ek shayari sunao! ✍️',
  'Apne phone ka sabse purana photo group me bhejo! 📸',
  'Ek minute tak sirf emoji me baat karo! 😶',
  'Apne crush ko ek achha sa message bhejo! 💌',
  'Apni aawaz me ek voice note bhejo — "Main ek bandar hoon" 🐒',
  'Apne dushman ki tareef me 2 lines likho! 😇',
  'Kal subah jaldi uth ke good morning message bhejna! 🌅',
];

module.exports = {
  command: 'truthq',
  aliases: ['tod', 'rather', 'choose'],
  category: 'fun',
  description: 'Truth or Dare: .tod [truth|dare]',
  usage: '.tod [truth|dare]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const want = String((args || [])[0] || '').toLowerCase();
    if (want === 'truth' || want === 't' || want === 'sach') {
      await reply('❓ *Truth*\n\n' + pick(TRUTHS));
      return;
    }
    if (want === 'dare' || want === 'd' || want === 'himmat') {
      await reply('🔥 *Dare*\n\n' + pick(DARES));
      return;
    }
    if (Math.random() < 0.5) {
      await reply('❓ *Truth*\n\n' + pick(TRUTHS) + '\n\n_Aur chahiye to `.tod truth` ya `.tod dare` likho._');
    } else {
      await reply('🔥 *Dare*\n\n' + pick(DARES) + '\n\n_Aur chahiye to `.tod truth` ya `.tod dare` likho._');
    }
  },
};
