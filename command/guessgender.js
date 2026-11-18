'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .guessgender (XLICON-V2 port).
 * Naam se gender guess karo. genderize.io — free, no key (single source).
 */
const axios = require('axios');

module.exports = {
  command: 'guessgender',
  aliases: ['gender', 'genderguess'],
  description: 'Naam se gender guess karo.',
  category: 'fun',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const name = String((args || [])[0] || '').trim();
    if (!/^[A-Za-z]{2,30}$/.test(name)) {
      await reply('❌ Ek naam do (sirf letters).\nExample: *.guessgender Inconnu*');
      return;
    }
    try {
      const res = await axios.get('https://api.genderize.io', { params: { name }, timeout: 15000 });
      const d = res.data || {};
      if (!d.gender) {
        await reply('❓ *' + name + '* ke liye gender guess nahi ho paya (data nahi mila).');
        return;
      }
      const pct = d.probability != null ? Math.round(d.probability * 100) : '?';
      const emoji = d.gender === 'male' ? '👨' : '👩';
      await reply(emoji + ' *' + name + '*\n\nGender: *' + (d.gender === 'male' ? 'Male' : 'Female') + '*\nConfidence: ' + pct + '%\n(Records: ' + (d.count != null ? Number(d.count).toLocaleString('en-IN') : '—') + ')');
    } catch (e) {
      await reply('❌ Gender guess nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
