 'use strict';
/**
 * QUEEN AKUMA — .creart : AI image banao (Pollinations image API, free, no key).
 * Usage: .creart <prompt>
 */
const { pollinationsImage } = require('../lib/aiTools');

module.exports = {
  command: 'creart',
  aliases: [],
  category: 'ai',
  description: 'AI image banao: .creart <prompt>',
  usage: '.creart <prompt>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const prompt = (args || []).join(' ').trim();
    if (!prompt) {
      await reply('🎨 *CreArt*\n\nUsage: `.creart ek laal billi, sunset me`');
      return;
    }
    const res = await pollinationsImage(prompt, { width: 768, height: 768 });
    if (!res.ok) {
      await reply('❌ Image nahi ban payi: ' + String(res.error || '').slice(0, 150));
      return;
    }
    await sock.sendMessage(chatId, { image: res.buffer, caption: '🎨 *' + prompt + '*' }, { quoted: message });
  },
};
