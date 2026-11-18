/**
 * QUEEN AKUMA • .fullpp — bot ki profile pic bina crop ke set karo (owner only).
 * QUEEN AKUMA se port kiya gaya: sharp se 720x720 resize + w:profile:picture
 * IQ query, isliye photo crop nahi hoti. QUEEN AKUMA ka .setpp crop karta hai.
 */
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isOwnerOrSudo = require('../lib/isOwner');

async function getBuffer(msg, type) {
  const stream = await downloadContentFromMessage(msg, type);
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'fullpp',
  aliases: ['fulldp', 'setfullpp'],
  category: 'owner',
  description: 'Set bot profile picture without cropping (owner only)',
  usage: '.fullpp (reply to an image)',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderId = message.key.participant || message.key.remoteJid;
    let allowed = message.key.fromMe;
    if (!allowed) { try { allowed = await isOwnerOrSudo(senderId, sock, chatId); } catch {} }
    if (!allowed) return reply('🚫 *You are not authorized to use this command!* command.');
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = quoted?.imageMessage || quoted?.ephemeralMessage?.message?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage;
    if (!imgMsg) return reply('❌ Usage: .fullpp\nKisi photo par reply karke bhejo.');
    let mediaPath;
    try {
      const buffer = await getBuffer(imgMsg, 'image');
      const tmpDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      mediaPath = path.join(tmpDir, `fullpp-${Date.now()}.jpg`);
      await fs.promises.writeFile(mediaPath, buffer);
      const sharp = require('sharp');
      const img = await sharp(mediaPath).resize(720, 720, { fit: 'inside', withoutEnlargement: true }).jpeg().toBuffer();
      await sock.query({
        tag: 'iq',
        attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }],
      });
      await reply('✅ *Profile picture updated!*\nQuality: HIGH  •  Crop: NONE');
    } catch (e) {
      await reply('❌ Fullpp failed: ' + String((e && e.message) || e).slice(0, 200) + '\nJPG/PNG photo par reply karke dobara try karo.');
    } finally {
      if (mediaPath) { try { await fs.promises.unlink(mediaPath); } catch {} }
    }
  }
};
