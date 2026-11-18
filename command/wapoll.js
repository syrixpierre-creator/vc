'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .wapoll (raganork port).
 * Native WhatsApp poll banao. QUEEN AKUMA ka .poll/.vote alag hai — ye file unko
 * touch nahi karti.
 * Usage: .wapoll Sawal? | Option 1 | Option 2 | Option 3
 */
module.exports = {
  command: 'wapoll',
  aliases: ['createpoll2', 'askpoll'],
  description: 'Native WhatsApp poll banao: .wapoll Sawal? | Opt 1 | Opt 2',
  category: 'group',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const joined = (args || []).join(' ');
    const parts = joined.split('|').map((s) => (s || '').trim()).filter(Boolean);
    const question = parts[0];
    const options = parts.slice(1);
    if (!question || options.length < 2) {
      await reply('❌ Usage: *.wapoll Sawal? | Option 1 | Option 2*\nKam se kam 2 options chahiye (max 12).');
      return;
    }
    if (options.length > 12) {
      await reply('❌ Max 12 options allowed hain.');
      return;
    }
    try {
      await sock.sendMessage(chatId, {
        poll: { name: question, values: options.slice(0, 12), selectableCount: 1 }
      }, { quoted: message });
    } catch (e) {
      await reply('❌ Poll nahi ban paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
