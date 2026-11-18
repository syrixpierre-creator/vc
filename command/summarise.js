'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .summarise (QUEEN AKUMA port, Pollinations variant).
 * Text ka summary banao. QUEEN AKUMA ka .summarize Gemini-based hai — ye no-key
 * Pollinations variant hai (British spelling bhi chalta hai).
 */
const { geminiText } = require('../lib/aiTools');

module.exports = {
  command: 'summarise',
  aliases: ['summarize2', 'tldr'],
  description: 'Quoted text ya diye gaye text ka summary banao (no key).',
  category: 'ai',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const qm = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.quotedMessage;
    const qText = qm ? (qm.conversation || (qm.extendedTextMessage && qm.extendedTextMessage.text) || '') : '';
    const text = qText || (args || []).join(' ').trim();
    if (!text || text.length < 20) {
      await reply('❌ Summary ke liye thoda lamba text do — kisi message pe reply karke *.summarise* chalao, ya text likho.');
      return;
    }
    await reply('⏳ Summary ban raha hai...');
    const prompt = 'Summarise the following text in clear, short bullet points (max 8 points, same language as the text):\n\n' + text.slice(0, 4000);
    const res = await geminiText(prompt, { maxTokens: 800, temperature: 0.3 });
    if (!res.ok) {
      await reply(res.error || '❌ Summary nahi ban paya.');
      return;
    }
    await reply('📝 *Summary*' + (res.via === 'pollinations' ? ' (Pollinations)' : '') + '\n\n' + res.text);
  }
};
