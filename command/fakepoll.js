'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .fakepoll (GURU port, HONEST version).
 * Stock Baileys se preset votes possible NAHI hain — WhatsApp real vote
 * counts ko pehle se set karne nahi deta. Isliye ye command native poll
 * bhejta hai jisme options ke saath vote numbers LABEL ke roop me likhe
 * hote hain, aur saaf likhta hai ki ye preset labels hain, real votes nahi.
 */
module.exports = {
  command: 'fakepoll',
  aliases: ['presetpoll', 'riggedpoll'],
  description: 'Preset vote numbers wala poll (labels — real votes preset nahi hote).',
  category: 'fun',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const joined = (args || []).join(' ');
    const parts = joined.split('|').map((s) => (s || '').trim()).filter(Boolean);
    const question = parts[0];
    const rawOpts = parts.slice(1);
    if (!question || rawOpts.length < 2) {
      await reply('❌ Usage: *.fakepoll Sawal? | Option 1 (votes) | Option 2 (votes)*\nExample: .fakepoll Best bot? | QUEEN AKUMA 45 | Other 5\n\n⚠️ Note: WhatsApp real votes preset nahi karne deta — vote numbers sirf option labels me dikhenge.');
      return;
    }
    const values = rawOpts.slice(0, 12).map((o) => {
      const m = o.match(/^(.*?)[\s:]+(\d+)\s*(votes?)?$/i);
      if (m) return m[1].trim() + ' — ' + m[2] + ' votes';
      return o;
    });
    try {
      await sock.sendMessage(chatId, {
        poll: { name: question + '  (preset labels — real votes nahi)', values, selectableCount: 1 }
      }, { quoted: message });
      await reply('📊 Fake poll bhej diya.\n⚠️ Vote numbers sirf labels hain — WhatsApp real vote count preset karne ki permission nahi deta.');
    } catch (e) {
      await reply('❌ Poll nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
