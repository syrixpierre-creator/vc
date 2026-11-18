'use strict';
/**
 * QUEEN AKUMA — .url (quoted media → public URL).
 * Pehle ye sirf stub template tha. Ab real: quoted/own media ko Catbox
 * (lib/uploaders.js uploadFileFast — multi-host race) par upload karke
 * uska public URL deta hai. .tourl ka chhota bhai — same uploader use karta hai.
 */
const { getMedia } = require('../lib/mediaDl');
const { uploadFileFast } = require('../lib/uploaders');

const NAMES = { image: 'image.jpg', video: 'video.mp4', audio: 'audio.mp3', sticker: 'sticker.webp', document: 'file' };

module.exports = {
  command: 'url',
  aliases: [],
  category: 'tools',
  description: 'Quoted media ka public URL banao (upload karke).',
  usage: '.url (photo/video/audio pe reply karke)',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const media = await getMedia(message);
    if (!media) {
      await reply('❌ Kisi photo, video ya audio pe reply karke *.url* chalao.\nBot use upload karke uska link dega.');
      return;
    }
    try {
      const url = await uploadFileFast(media.buffer, NAMES[media.kind] || 'file');
      if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
        await reply('❌ Upload nahi ho paya. Dobara try karo.');
        return;
      }
      await reply('🔗 *Media URL*\n\n' + url + '\n\n_Type: ' + media.kind + ' • Size: ' + (media.buffer.length / 1024).toFixed(1) + ' KB_');
    } catch (e) {
      await reply('❌ Upload nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  }
};
