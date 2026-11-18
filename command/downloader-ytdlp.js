/**
 * QUEEN AKUMA v2.6.0 - .ytdlp (real handler; old version only replied "is working")
 * Uses the verified download chain: Elite ytmp4/ytmp3 -> noobs/tikwm -> fallbacks.
 * (No yt-dlp binary is bundled; API chain is what works on all hosts.)
 */
const { downloadAny, youtubeAudio, youtubeVideo } = require('../lib/downloadApis');

module.exports = {
  command: 'ytdlp',
  aliases: ['ytdl'],
  category: 'download',
  description: 'Download YouTube/TikTok/FB video or audio from a link',
  usage: '.ytdlp <link>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const url = (args || []).join(' ').trim();
    if (!url || !/^https?:\/\//i.test(url)) return reply('📥 *ytdlp*\nUsage: `.ytdlp <link>`\nYouTube / TikTok / Facebook link do.');
    await sock.sendMessage(chatId, { text: '⏳ Download ho raha hai…' }, { quoted: message }).catch(() => {});
    try {
      if (/youtube\.com|youtu\.be/i.test(url)) {
        const v = await youtubeVideo(url);
        if (v && v.download) {
          return sock.sendMessage(chatId, { video: { url: v.download }, mimetype: 'video/mp4', caption: `🎬 *${v.title || 'YouTube'}*` }, { quoted: message });
        }
        const a = await youtubeAudio(url);
        if (a && a.download) {
          return sock.sendMessage(chatId, { audio: { url: a.download }, mimetype: 'audio/mpeg' }, { quoted: message });
        }
      }
      const res = await downloadAny(url);
      if (res && res.mediaUrl) {
        return sock.sendMessage(chatId, { video: { url: res.mediaUrl }, mimetype: 'video/mp4', caption: `🎬 *${res.title || 'Video'}*\n_via ${res.source}_` }, { quoted: message });
      }
      if (res && res.audioUrl) {
        return sock.sendMessage(chatId, { audio: { url: res.audioUrl }, mimetype: 'audio/mpeg' }, { quoted: message });
      }
      return reply('❌ Download nahi hua — saari APIs fail.\n• Link sahi hai check karo\n• Instagram / Twitter / Pinterest ke liye abhi koi free API live nahi hai\n• `.apicheck` se live status dekho, `.addapi` se apna API jodo');
    } catch (e) {
      return reply('❌ ytdlp: ' + (e.message || e));
    }
  }
};
