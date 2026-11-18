/**
 * QUEEN AKUMA v3.0.0 — .bol : text ko voice note banao (gTTS, free, no key)
 * Usage: .bol <text>  (max 500 chars)
 */
const vm = require('../lib/voiceMode');

module.exports = {
  command: 'bol',
  aliases: [],
  category: 'tools',
  description: 'Text ko voice note banao',
  usage: '.bol <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    if (!text) return reply('❌ Usage: `.bol Namaste, kaise ho?`\nText ko voice note bana kar bhejunga.');
    if (text.length > 500) return reply('❌ Text 500 characters se chhota rakho.');
    const res = await vm.speak(text);
    if (!res.ok) return reply('❌ Voice ban nahi paya: ' + (res.error || 'unknown') + '\nBaad me try karo.');
    await sock.sendMessage(chatId, { audio: res.buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
  }
};
