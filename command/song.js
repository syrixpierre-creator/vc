
module.exports = {
  command: 'song',
  aliases: ['music'],
  category: 'download',
  description: 'Download song',
  usage: '.song <name>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const q = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!q) return reply('❌ `.song <name>`');
    await reply('🔍 Searching: *' + q + '*');
    try {
      let downloadApis; try { downloadApis = require('../lib/downloadApis'); } catch {}
      let result = null;
      if (downloadApis) {
        if (downloadApis.ytmp3) result = await downloadApis.ytmp3(q);
        if (!result && downloadApis.song) result = await downloadApis.song(q);
        if (!result && downloadApis.youtubeAudio) result = await downloadApis.youtubeAudio(q);
      }
      if (!result) return reply('❌ Not found. Try `.play ' + q + '`');
      const title = result.title || result.name || q;
      const url = result.url || result.download || result.link || result.audio || result.mp3;
      if (url && /^https?:\/\//i.test(String(url))) {
        // v2.8.9: audio ke SAATH thumbnail + rich card (title, channel, views, duration)
        const { songCaption } = downloadApis;
        const caption = typeof songCaption === 'function' ? songCaption({
          title,
          artist: result.artist || '',
          channel: result.channel || result.author || '',
          views: result.views,
          duration: result.duration || '',
          uploaded: result.uploaded || '',
          source: 'YouTube'
        }) : `🎵 *${title}*`;
        try {
          if (result.thumbnail) {
            await sock.sendMessage(chatId, { image: { url: result.thumbnail }, caption }, { quoted: message });
          }
        } catch (_) {
          await sock.sendMessage(chatId, { text: caption }, { quoted: message }).catch(() => {});
        }
        await sock.sendMessage(chatId, { audio: { url: String(url) }, mimetype: 'audio/mpeg', fileName: String(title).slice(0,40)+'.mp3' }, { quoted: message });
        return;
      }
      return reply('🎵 *' + title + '*\n' + (url || 'No link'));
    } catch (e) {
      return reply('❌ ' + (e.message || e));
    }
  }
};
