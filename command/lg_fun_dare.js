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
  'Have you ever told someone secret? Whose? 🤫',
  'Who is your crush? Tell the name! 😏',
  'Have you ever trapped someone with a lie? 😅',
  'What is your biggest wish? ✨',
  'Tum kabhi class me sote hue pakde gaye ho? 😴',
  'What is your phone wallpaper and why? 📱',
  'Have you ever eaten food secretly? 😂',
  'Tumhara sabse ajeeb sapna kya tha? 🌙',
  'Tum kis cheez se sabse zyada darte ho? 😨',
  'Have you ever eaten someone food without telling them? 🍕',
  'If you were invisible for a day, what would you do? 👻',
];
const DARES = [
  'Put a cartoon profile picture for 1 hour! 😂',
  'Send "I am the smartest" in the group! 😎',
  'Apni favourite gaane ki 2 lines yahin gao (likh ke)! 🎤',
  'Send "I love you" to your best friend and show the screenshot! 😜',
  'Change your name to "Fool No.1" for 5 minutes! 🤣',
  'Group me ek shayari sunao! ✍️',
  'Send the oldest photo on your phone to the group! 📸',
  'Talk only in emojis for one minute! 😶',
  'Send a nice message to your crush! 💌',
  'Send a voice note saying "I am a monkey" 🐒',
  'Write 2 lines praising your enemy! 😇',
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
      await reply('❓ *Truth*\n\n' + pick(TRUTHS) + '\n\n_More: .tod truth or .tod dare_');
    } else {
      await reply('🔥 *Dare*\n\n' + pick(DARES) + '\n\n_More: .tod truth or .tod dare_');
    }
  },
};
