'use strict';
/**
 * QUEEN AKUMA • .muslim-ai — Islamic AI assistant.
 * Pehle ye api.ootaizumi.web.id use karta tha (DEAD — probe me fail).
 * Ab real: lib/aiTools.js geminiText — Gemini key ho to Gemini, nahi to
 * Pollinations free fallback (no key).
 */
const { geminiText } = require('../lib/aiTools');

module.exports = {
  command: 'muslim-ai',
  aliases: ['muslimai', 'islamicai'],
  category: 'ai',
  description: 'Ask the Islamic AI assistant (Gemini/Pollinations, no key needed).',
  usage: '.muslim-ai <question>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim() || 'assalamualaikum';
    const res = await geminiText('Answer as a knowledgeable, respectful Islamic assistant. Be brief and accurate, cite Quran/Hadith references when relevant. Answer in the same language as the question:\n\n' + text, { maxTokens: 1200, temperature: 0.3 });
    if (!res.ok) return reply(res.error || '❌ Muslim AI se jawab nahi mila. Thodi der baad try karo.');
    await reply('🕌 *Muslim AI*' + (res.via === 'pollinations' ? ' (Pollinations)' : '') + '\n\n' + res.text.slice(0, 3000));
  }
};
