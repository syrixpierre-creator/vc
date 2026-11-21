/**
 * QUEEN AKUMA • .toimg — sticker ko wapas image banao.
 * Real implementation (Mishu se port kiye gaye data/sticker-converter par).
 * Pehle sirf stub tha (AI fallback), ab asli convert hota hai.
 */
const converter = require('../data/sticker-converter');

module.exports = {
  command: 'toimg',
  aliases: ['tophoto', 'toimage', 'stickertoimg'],
  category: 'sticker',
  description: 'Reply to a sticker to convert it back to an image',
  usage: '.toimg (reply to a sticker)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMsg = quoted?.stickerMessage || message.message?.stickerMessage;
      if (!stickerMsg) return reply('❌ *Usage:* .toimg\nKisi sticker par reply karke bhejo.');
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const buf = Buffer.concat(chunks);
      if (!buf.length) return reply('❌ *Failed to download the sticker. Try again.*');
      const img = await converter.convertStickerToImage(buf);
      await sock.sendMessage(chatId, { image: img, caption: '✅ Sticker → Image' }, { quoted: message });
    } catch (e) {
      await reply('❌ Convert failed: ' + String((e && e.message) || e).slice(0, 200));
    }
  }
};
