const { downloadAny } = require('../lib/downloadApis');

module.exports = {
  command: 'facebook',
  aliases: ['fb', 'fbdl'],
  category: 'download',
  description: 'Download Facebook videos',
  usage: '.fb <facebook video link>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(' ').trim();
    if (!url || !/facebook\.com|fb\.watch|fb\.com/i.test(url)) {
      return sock.sendMessage(chatId, {
        text: '📘 *Facebook Downloader*\n\nUsage:\n`.fb <facebook video link>`'
      }, { quoted: message });
    }

    await sock.sendMessage(chatId, { text: '⏳ Downloading Facebook video…' }, { quoted: message }).catch(() => {});

    try {
      const res = await downloadAny(url);
      if (!res || !res.mediaUrl) {
        return sock.sendMessage(chatId, {
          text: '❌ *Video not found.* Try a public video link.'
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        video: { url: res.mediaUrl },
        caption: `📘 *Facebook*\n${res.title || ''}`
      }, { quoted: message });
    } catch (e) {
      console.error('[fb]', e.message);
      await sock.sendMessage(chatId, { text: '❌ FB download fail: ' + e.message }, { quoted: message });
    }
  }
};
