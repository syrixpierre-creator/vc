const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function streamToBuffer(stream) {
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

/** Unwrap any view-once / nested media shape from quoted or root message */
function extractViewOnceMedia(msgRoot) {
  if (!msgRoot) return null;
  const vv =
    msgRoot.viewOnceMessageV2?.message ||
    msgRoot.viewOnceMessage?.message ||
    msgRoot.viewOnceMessageV2Extension?.message ||
    null;

  const candidates = [];
  if (vv) candidates.push(vv);
  candidates.push(msgRoot);

  for (const node of candidates) {
    if (node.imageMessage) {
      return { type: 'image', media: node.imageMessage, caption: node.imageMessage.caption || '' };
    }
    if (node.videoMessage) {
      return { type: 'video', media: node.videoMessage, caption: node.videoMessage.caption || '' };
    }
    if (node.audioMessage) {
      return { type: 'audio', media: node.audioMessage, caption: '' };
    }
  }
  // direct flags
  if (msgRoot.imageMessage?.viewOnce) {
    return { type: 'image', media: msgRoot.imageMessage, caption: msgRoot.imageMessage.caption || '' };
  }
  if (msgRoot.videoMessage?.viewOnce) {
    return { type: 'video', media: msgRoot.videoMessage, caption: msgRoot.videoMessage.caption || '' };
  }
  return null;
}

module.exports = {
  command: 'viewonce',
  aliases: ['viewmedia', 'vv', 'reveal', 'readvv'],
  category: 'general',
  description: 'Recover view-once image / video / audio',
  usage: '.vv (reply to view-once media)',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const extracted = extractViewOnceMedia(quoted) || extractViewOnceMedia(message.message);

      if (!extracted) {
        return sock.sendMessage(chatId, {
          text: '❌ *Reply* to a view-once image / video / audio.\n\nUsage: reply + `.vv`'
        }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(
        extracted.media,
        extracted.type === 'audio' ? 'audio' : extracted.type
      );
      const buffer = await streamToBuffer(stream);

      if (!buffer || buffer.length < 50) {
        return sock.sendMessage(chatId, {
          text: '❌ Media download empty. View-once already opened/expired ho sakta hai.'
        }, { quoted: message });
      }

      if (extracted.type === 'image') {
        await sock.sendMessage(chatId, {
          image: buffer,
          caption: extracted.caption || '🔓 ViewOnce recovered'
        }, { quoted: message });
      } else if (extracted.type === 'video') {
        await sock.sendMessage(chatId, {
          video: buffer,
          mimetype: extracted.media.mimetype || 'video/mp4',
          caption: extracted.caption || '🔓 ViewOnce recovered'
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          audio: buffer,
          mimetype: extracted.media.mimetype || 'audio/ogg; codecs=opus',
          ptt: !!extracted.media.ptt
        }, { quoted: message });
      }
    } catch (error) {
      console.error('[vv]', error.message);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to recover view-once media.\n' + (error.message || '')
      }, { quoted: message });
    }
  }
};
