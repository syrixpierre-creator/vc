/**
 * QUEEN AKUMA • .style — style number se text convert karo.
 * Usage: .style 5 <text>   (1-40)
 *        .style <text>     (numbered list dikhegi)
 */
const { allFonts } = require('../lib/fonts');
module.exports = {
  command: 'style',
  aliases: ['fancy', 'stylish', 'fancytext'],
  category: 'tools',
  description: 'Convert text with a numbered font style',
  usage: '.style <number 1-40> <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const list = () => {
      const l = allFonts.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
      return sock.sendMessage(chatId, { text: `✍️ *QUEEN AKUMA Text Styles (40)*\n\n${l}\n\nUse: .style <number> <text>\nExample: .style 5 QUEEN AKUMA\nYa: .textstyles QUEEN AKUMA — saare ek saath` }, { quoted: message });
    };
    if (!args || !args.length) return list();
    const n = parseInt(args[0], 10);
    if (isNaN(n)) return list();
    if (n < 1 || n > allFonts.length) {
      await sock.sendMessage(chatId, { text: `❌ Style number 1 se ${allFonts.length} tak hona chahiye.\nExample: .style 5 QUEEN AKUMA` }, { quoted: message });
      return;
    }
    const text = args.slice(1).join(' ').trim();
    if (!text) {
      await sock.sendMessage(chatId, { text: `✍️ *Style #${n} — ${allFonts[n - 1].name}*\n\nUsage: .style ${n} <text>\nExample: .style ${n} QUEEN AKUMA` }, { quoted: message });
      return;
    }
    await sock.sendMessage(chatId, { text: `🔤 *${allFonts[n - 1].name} (#${n})*\n\n${allFonts[n - 1].convert(text)}` }, { quoted: message });
  }
};
