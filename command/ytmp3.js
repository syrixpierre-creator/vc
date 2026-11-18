const { youtubeAudio, songCaption } = require('../lib/downloadApis');

module.exports = {
  command: 'ytmp3',
  aliases: ['yta', 'ytaudio'],
  category: 'download',
  description: 'YouTube to MP3',
  usage: '.ytmp3 <youtube link>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(' ').trim();
    if (!url || !/youtube\.com|youtu\.be/i.test(url)) {
      return sock.sendMessage(chatId, {
        text: '🎧 *YouTube MP3*\n\nUsage:\n`.ytmp3 <youtube link>`'
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: '⏳ MP3 convert…' }, { quoted: message }).catch(() => {});
    try {
      const res = await youtubeAudio(url);
      if (!res || !res.download) {
        return sock.sendMessage(chatId, { text: '❌ Audio nahi mila / API busy.' }, { quoted: message });
      }
      // v2.8.9: audio ke SAATH thumbnail + rich card (title, channel, views, duration)
      const caption = songCaption({
        title: res.title || 'YouTube Audio',
        artist: res.artist || '',
        channel: res.channel || res.author || '',
        views: res.views,
        duration: res.duration || '',
        uploaded: res.uploaded || '',
        source: 'YouTube'
      });
      try {
        if (res.thumbnail) {
          await sock.sendMessage(chatId, {
            image: { url: res.thumbnail },
            caption
          }, { quoted: message });
        }
      } catch (_) {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message }).catch(() => {});
      }
      await sock.sendMessage(chatId, {
        audio: { url: res.download },
        mimetype: 'audio/mpeg',
        fileName: `${(res.title || 'audio').slice(0, 40)}.mp3`
      }, { quoted: message });
    } catch (e) {
      await sock.sendMessage(chatId, { text: '❌ ' + e.message }, { quoted: message });
    }
  }
};
