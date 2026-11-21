 'use strict';
/**
 * QUEEN AKUMA — .aix : AI chat (lib/aiTools geminiText — Gemini key ho to Gemini,
 * nahi to Pollinations free fallback). Usage: .aix <sawal>
 */
const { geminiText } = require('../lib/aiTools');

module.exports = {
  command: 'aix',
  aliases: [],
  category: 'ai',
  description: 'AI se sawal poochho: .aix <sawal>',
  usage: '.aix <sawal>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) {
      await reply('📌 *Usage:* .aix <question>');
      return;
    }
    const res = await geminiText(q, { timeoutMs: 30000 });
    if (res.ok) await reply(res.text);
    else await reply(res.error || '❌ AI jawab nahi de paya.');
  },
};
