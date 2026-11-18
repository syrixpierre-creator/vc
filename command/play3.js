/**
 * QUEEN AKUMA — .play3 stable
 */
module.exports = {
  command: 'play3',
  aliases: ['playaudio', 'song3'],
  category: 'download',
  description: 'Play / download song by name',
  usage: '.play3 <song name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!query) return reply('❌ Example: `.play3 shape of you`');
    await reply(`🔍 Searching: *${query}* ...`);
    try {
      let downloadApis;
      try { downloadApis = require('../lib/downloadApis'); } catch (_) {}
      let result = null;
      if (downloadApis) {
        if (typeof downloadApis.ytmp3 === 'function') result = await downloadApis.ytmp3(query);
        if (!result && typeof downloadApis.song === 'function') result = await downloadApis.song(query);
        if (!result && typeof downloadApis.youtubeAudio === 'function') result = await downloadApis.youtubeAudio(query);
      }
      if (!result) {
        return reply(`❌ Result nahi mila.\nTry: \`.play ${query}\` ya \`.song ${query}\``);
      }
      const title = result.title || result.name || query;
      const url = result.url || result.download || result.link || result.audio || result.mp3;
      if (url && /^https?:\/\//i.test(String(url))) {
        await sock.sendMessage(chatId, {
          audio: { url: String(url) },
          mimetype: 'audio/mpeg',
          fileName: `${String(title).slice(0, 40)}.mp3`
        }, { quoted: message });
        return;
      }
      return reply(`🎵 *${title}*\n` + (url ? `Link: ${url}` : 'Link nahi mila — `.play` try karo.'));
    } catch (e) {
      return reply(`❌ Error: ${e.message || e}\nTry \`.play ${query}\``);
    }
  }
};
