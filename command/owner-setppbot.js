 'use strict';
/**
 * QUEEN AKUMA — .setppbot : bot ki profile photo badlo (owner-only).
 * Quoted image ya saath bheji image ko download karke Baileys updateProfilePicture karta hai.
 * Usage: image pe reply karke .setppbot
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadImage(msg) {
  const stream = await downloadContentFromMessage(msg, 'image');
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = {
  command: 'setppbot',
  aliases: [],
  category: 'owner',
  description: 'Bot ki profile photo badlo (owner-only): image pe reply karke .setppbot',
  usage: '.setppbot (image pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = quoted?.imageMessage
      || quoted?.ephemeralMessage?.message?.imageMessage
      || quoted?.viewOnceMessage?.message?.imageMessage
      || message.message?.imageMessage
      || message.message?.ephemeralMessage?.message?.imageMessage
      || message.message?.viewOnceMessage?.message?.imageMessage;
    if (!imgMsg) {
      await reply('🖼️ *Set Bot PP*\n\nKisi image pe reply karke `.setppbot` bhejo.');
      return;
    }
    if (typeof sock.updateProfilePicture !== 'function') {
      await reply('❌ *This feature is not available on this connection.*');
      return;
    }
    try {
      const buf = await downloadImage(imgMsg);
      if (!buf || !buf.length) { await reply('❌ *Failed to download the image.*'); return; }
      await sock.updateProfilePicture(sock.user.id, buf);
      await reply('✅ *Bot ki profile photo badal di!*');
    } catch (e) {
      await reply('❌ *Failed to update profile picture:* ' + String(e.message || e).slice(0, 120));
    }
  },
};
