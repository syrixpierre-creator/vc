const { youtubeVideo } = require('../lib/downloadApis');

module.exports = {
  command: 'video',
  aliases: ['ytmp4', 'ytv', 'ytvideo'],
  category: 'download',
  description: 'Download YouTube video',
  usage: '.video <youtube link>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(' ').trim();
    if (!url || !/youtube\.com|youtu\.be/i.test(url)) {
      return sock.sendMessage(chatId, {
        text: '🎬 *YouTube Video*\n\nUsage:\n`.video <youtube link>`'
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: '⏳ YouTube video…' }, { quoted: message }).catch(() => {});
    try {
      const res = await youtubeVideo(url);
      if (!res || !res.download) {
        return sock.sendMessage(chatId, { text: '❌ *Video not found / API busy.*' }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        video: { url: res.download },
        caption: `🎬 *${res.title || 'YouTube'}*`
      }, { quoted: message });
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + e.message }, { quoted: message });
    }
  }
};
