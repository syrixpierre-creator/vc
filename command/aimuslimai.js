'use strict';
/**
 * QUEEN AKUMA — .muslimai (Islamic Q&A helper, geminiText backend).
 * Pehle ye lib/apiSwitch + lib/eliteApi use karta tha (unverified chain).
 * Ab real: lib/aiTools.js geminiText — Gemini key ho to Gemini, nahi to
 * Pollinations free fallback (no key). Islamic-assistant prompt ke saath.
 */
const { geminiText } = require('../lib/aiTools');

module.exports = {
  command: 'muslimai',
  aliases: ['aimuslim', 'islami'],
  category: 'ai',
  description: 'Islamic Q&A helper (Gemini/Pollinations, no key needed).',
  usage: '.muslimai <question>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const q = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!q) return reply('❌ Sawal likho.\nExample: *.muslimai Roza kab farz hua?*');
    const res = await geminiText('Answer as a knowledgeable, respectful Islamic assistant. Be brief and accurate, cite Quran/Hadith references when relevant. Answer in the same language as the question:\n\n' + q, { maxTokens: 1200, temperature: 0.3 });
    if (!res.ok) return reply(res.error || '❌ AI se jawab nahi mila. Thodi der baad try karo.');
    return reply('🕌 *Muslim AI*' + (res.via === 'pollinations' ? ' (Pollinations)' : '') + '\n\n' + res.text.slice(0, 3500));
  }
};
