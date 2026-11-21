const { downloadAny } = require('../lib/downloadApis');

module.exports = {
  command: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'download',
  description: 'Download TikTok video (no watermark when available)',
  usage: '.tiktok <link>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(' ').trim();
    if (!url || !/tiktok\.com|vm\.tiktok/i.test(url)) {
      return sock.sendMessage(chatId, {
        text: '🎵 *TikTok Downloader*\n\nUsage:\n`.tiktok <link>`'
      }, { quoted: message });
    }

    await sock.sendMessage(chatId, { text: '⏳ TikTok download…' }, { quoted: message }).catch(() => {});

    try {
      const res = await downloadAny(url);
      if (!res || !res.mediaUrl) {
        return sock.sendMessage(chatId, {
          text: '❌ *TikTok video not found.* The link must be public.'
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        video: { url: res.mediaUrl },
        caption: `🎵 *TikTok*\n${res.title || ''}`
      }, { quoted: message });
      if (res.audioUrl) {
        await sock.sendMessage(chatId, {
          audio: { url: res.audioUrl },
          mimetype: 'audio/mpeg'
        }, { quoted: message }).catch(() => {});
      }
    } catch (e) {
      console.error('[tt]', e.message);
      await sock.sendMessage(chatId, { text: '❌ TikTok fail: ' + e.message }, { quoted: message });
    }
  }
};
