/**
 * QUEEN AKUMA v3.5.0 • #12 .fullgpp — group profile pic bina crop ke (Flash Gpp.js se)
 * Quoted image ko 720x720 (scaleToFit, no crop) karke group PP set karta hai.
 * Group-only + admin-only + bot-admin-only.
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Jimp } = require('jimp');

async function getBuffer(imageMsg) {
  const stream = await downloadContentFromMessage(imageMsg, 'image');
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'fullgpp',
  aliases: ['fullgp'],
  category: 'group',
  description: 'Set group profile picture without cropping (720px, uncropped)',
  usage: '.fullgpp (reply to an image)',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const m = message.message || {};
    const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = quoted?.imageMessage || m.imageMessage;
    if (!imageMsg) {
      return reply('📌 *Usage:* reply to an image with .fullgpp');
    }
    try {
      const buf = await getBuffer(imageMsg);
      const image = await Jimp.read(buf);
      const resized = image.crop({ x: 0, y: 0, w: image.bitmap.width, h: image.bitmap.height }).scaleToFit({ w: 720, h: 720 });
      const imgBuffer = await resized.getBuffer('image/jpeg');
      await sock.query({
        tag: 'iq',
        attrs: { to: chatId, type: 'set', xmlns: 'w:profile:picture' },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: imgBuffer }],
      });
      return reply('✅ Group profile pic set ho gayi — bina crop ke!');
    } catch (e) {
      return reply('❌ *Failed to set group picture:* ' + (e.message || e) + '\n(The bot must be a group admin.)');
    }
  },
};
