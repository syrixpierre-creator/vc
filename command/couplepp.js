'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .couplepp (QUEEN AKUMA port).
 * Matching couple profile pics (male + female). GitHub raw JSON, single source.
 */
const axios = require('axios');

module.exports = {
  command: 'couplepp',
  aliases: ['couplepic', 'cpp'],
  description: 'Matching couple profile pics bhejo.',
  category: 'fun',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    try {
      const res = await axios.get('https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json', { timeout: 20000 });
      const list = res.data;
      if (!Array.isArray(list) || !list.length) throw new Error('List khaali mili');
      const pick = list[Math.floor(Math.random() * list.length)];
      if (!pick.male || !pick.female) throw new Error('Pair incomplete mila');
      await sock.sendMessage(chatId, { image: { url: pick.male }, caption: '👦 Couple PP (male)' }, { quoted: message });
      await sock.sendMessage(chatId, { image: { url: pick.female }, caption: '👧 Couple PP (female)' }, { quoted: message });
    } catch (e) {
      await reply('❌ Couple PP nahi mile: ' + String(e.message || e).slice(0, 120) + '\nTry again later.');
    }
  }
};
