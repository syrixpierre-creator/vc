'use strict';
/**
 * QUEEN AKUMA — .save (status / media saver).
 * Pehle ye sirf stub template tha. Ab real: jis message/status pe reply
 * karo, uska media (photo/video/audio/document) ya text download karke
 * wapas bhejta hai — status save karne ke liye. (Bookmark ke liye .bookmark
 * hai; ye turant copy bhejta hai.)
 */
const { getMedia } = require('../lib/mediaDl');

module.exports = {
  command: 'save',
  aliases: [],
  category: 'tools',
  description: 'Save a quoted status/media and send it back.',
  usage: '.save (kisi photo/video/status pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message);
    if (media) {
      const caption = '💾 *Saved*\n_Type: ' + media.kind + ' • Size: ' + (media.buffer.length / 1024).toFixed(1) + ' KB_';
      try {
        if (media.kind === 'image') await sock.sendMessage(chatId, { image: media.buffer, caption }, { quoted: message });
        else if (media.kind === 'video') await sock.sendMessage(chatId, { video: media.buffer, caption }, { quoted: message });
        else if (media.kind === 'audio') await sock.sendMessage(chatId, { audio: media.buffer, mimetype: 'audio/mpeg', fileName: 'saved.mp3' }, { quoted: message });
        else if (media.kind === 'sticker') await sock.sendMessage(chatId, { sticker: media.buffer }, { quoted: message });
        else await sock.sendMessage(chatId, { document: media.buffer, mimetype: 'application/octet-stream', fileName: 'saved-file' }, { quoted: message });
        return;
      } catch (e) {
        await reply('❌ *Save failed:* ' + String(e.message || e).slice(0, 120));
        return;
      }
    }
    // Text save
    const qm = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.quotedMessage;
    const qText = qm ? (qm.conversation || (qm.extendedTextMessage && qm.extendedTextMessage.text) || '') : '';
    const ownText = message.message && (message.message.conversation || (message.message.extendedTextMessage && message.message.extendedTextMessage.text) || '');
    const text = qText || (ownText || '').replace(/^\.save\s*/i, '').trim();
    if (text) {
      await sock.sendMessage(chatId, { document: Buffer.from(text, 'utf8'), mimetype: 'text/plain', fileName: 'saved-message.txt', caption: '💾 *Saved text*' }, { quoted: message });
      return;
    }
    await reply('❌ Kisi photo, video, audio ya text pe reply karke *.save* chalao.');
  }
};
