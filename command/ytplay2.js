/**
 * QUEEN AKUMA • .ytplay2 — Play YouTube audio by search (v2.8.6, replaces stub)
 * Uses lib/downloadApis.youtubeAudio (EliteProTech first, verified working).
 */
module.exports = {
  command: 'ytplay2',
  aliases: ['play2', 'ytplayx'],
  category: 'download',
  description: 'Play YouTube audio by song name',
  usage: '.ytplay2 <song name>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) return reply('🎵 Usage: `.ytplay2 arijit singh tum hi ho`');
    try {
      const { youtubeAudio } = require('../lib/downloadApis');
      const r = await youtubeAudio(q);
      if (!r || !r.mediaUrl) return reply('❌ Audio nahi mila. Dobara try karo ya `.song ' + q + '` try karo.');
      const title = r.title || q;
      if (r.mediaUrl.startsWith('http')) {
        await sock.sendMessage(chatId, { audio: { url: r.mediaUrl }, mimetype: 'audio/mpeg', fileName: title.slice(0, 60) + '.mp3' }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { audio: Buffer.from(r.mediaUrl, 'base64'), mimetype: 'audio/mpeg', fileName: title.slice(0, 60) + '.mp3' }, { quoted: message });
      }
    } catch (e) {
      return reply('❌ Play failed: ' + String((e && e.message) || e).slice(0, 100));
    }
  }
};
