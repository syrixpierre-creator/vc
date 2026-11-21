/**
 * QUEEN AKUMA • .textstyles — ek text ke saare 40 styles ek saath.
 * QUEEN AKUMA style text-styles feature ka advanced version.
 * Usage: .textstyles <text>   (text max 25 chars, warna message bahut lamba hoga)
 */
const { allFonts } = require('../lib/fonts');
module.exports = {
  command: 'textstyles',
  aliases: ['textstyle', 'allfonts', 'fontall', 'styles'],
  category: 'tools',
  description: 'Show your text in all 40 font styles at once',
  usage: '.textstyles <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let text = (args || []).join(' ').trim();
    if (!text) {
      await sock.sendMessage(chatId, { text: '📌 *Usage:* .textstyles <text>' }, { quoted: message });
      return;
    }
    if (text.length > 25) text = text.slice(0, 25);
    const lines = allFonts.map((f, i) => `${i + 1}. *${f.name}:*\n${f.convert(text)}`);
    let out = `✨ *QUEEN AKUMA Text Styles* — "${text}"\n\n` + lines.join('\n\n');
    if (out.length > 3900) out = out.slice(0, 3900) + '\n…';
    await sock.sendMessage(chatId, { text: out }, { quoted: message });
  }
};
