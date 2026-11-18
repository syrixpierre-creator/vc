/**
 * QUEEN AKUMA • .qrcode — QR code image from text/URL (v2.8.6, replaces stub)
 * Uses lib/publicApis.qrBuffer (qrserver, free, no key — verified working).
 */
module.exports = {
  command: 'qrcode',
  aliases: ['makeqr', 'qr'],
  category: 'tools',
  description: 'Generate a QR code image from text or URL',
  usage: '.qrcode <text>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    if (!text) return reply('🔳 Usage: `.qrcode https://example.com`\nYa: `.qrcode hello`');
    try {
      const { qrBuffer } = require('../lib/publicApis');
      const buf = await qrBuffer(text);
      if (!buf) return reply('❌ QR generate nahi hua. Dobara try karo.');
      await sock.sendMessage(chatId, { image: buf, caption: `🔳 *QR Code*\n${text.slice(0, 200)}` }, { quoted: message });
    } catch (e) {
      return reply('❌ QR failed: ' + String((e && e.message) || e).slice(0, 100));
    }
  }
};
