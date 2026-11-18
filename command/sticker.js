
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
module.exports = {
  command: 'sticker',
  aliases: ['s', 'stiker', 'stick'],
  category: 'tools',
  description: 'Create sticker from image/video',
  usage: '.sticker (reply media)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const msg = quoted ? { message: quoted, key: message.message.extendedTextMessage.contextInfo.stanzaId ? message.key : message.key } : message;
      const hasMedia = !!(
        message.message?.imageMessage || message.message?.videoMessage ||
        quoted?.imageMessage || quoted?.videoMessage
      );
      if (!hasMedia) return reply('❌ Image/video pe reply karke `.sticker` likho');
      // Prefer existing sticker helper if any
      let buffer;
      try {
        const target = (quoted && (quoted.imageMessage || quoted.videoMessage))
          ? { key: message.key, message: quoted }
          : message;
        buffer = await downloadMediaMessage(target, 'buffer', {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
      } catch (e) {
        return reply('❌ Media download fail: ' + (e.message || e));
      }
      await sock.sendMessage(chatId, {
        sticker: buffer
      }, { quoted: message });
    } catch (e) {
      return reply('❌ Sticker error: ' + (e.message || e) + '\nTry again with image reply.');
    }
  }
};
