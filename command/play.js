let axios; try { axios = require('axios'); } catch (_) { axios = null; }
const { spotifySearch, spotifyDownload, youtubeAudio, songCaption } = require('../lib/downloadApis');

module.exports = {
  command: 'play',
  aliases: ['music', 'ytplay'],
  category: 'music',
  description: 'Play / download song (Spotify + YT fallback)',
  usage: '.play <song name>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(' ').trim();
    if (!query) {
      return sock.sendMessage(chatId, {
        text: '🎵 *Play*\n\nUsage: `.play <song name>`'
      }, { quoted: message });
    }

    await sock.sendMessage(chatId, { text: `🔍 Searching: *${query}*...` }, { quoted: message }).catch(() => {});

    try {
      // 1) Spotify search (verified live API)
      const search = await spotifySearch(query);
      const tracks = search?.tracks || search?.result || (Array.isArray(search) ? search : []);
      const first = tracks[0];

      if (first && (first.url || first.link)) {
        const trackUrl = first.url || first.link;
        const dl = await spotifyDownload(trackUrl);
        if (dl && dl.download) {
          // v2.8.9: rich card — cover + title + singer + source
          const caption = songCaption({
            title: dl.title || first.title || query,
            artist: dl.artist || first.artist || '',
            album: dl.album || first.album || '',
            source: 'Spotify'
          });
          try {
            if (dl.cover) {
              await sock.sendMessage(chatId, {
                image: { url: dl.cover },
                caption
              }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
              audio: { url: dl.download },
              mimetype: 'audio/mpeg',
              fileName: `${(dl.title || 'song').replace(/[^\w\s-]/g, '').slice(0, 40)}.mp3`
            }, { quoted: message });
            return;
          } catch (e) {
            // fall through to yt
            console.error('[play] send audio', e.message);
          }
        }
      }

      // 2) Fallback: YouTube search + mp3 (v2.6.0: youtubeAudio now searches
      // via Elite ytsearch for plain song names too, not just URLs)
      // v2.8.9: audio ke SAATH thumbnail + rich card (title, channel,
      // views, duration) — pehle sirf audio aata tha.
      const yt = await youtubeAudio(query);
      if (yt && yt.download) {
        const caption = songCaption({
          title: yt.title || query,
          artist: yt.artist || '',
          channel: yt.channel || yt.author || '',
          views: yt.views,
          duration: yt.duration || '',
          uploaded: yt.uploaded || '',
          source: 'YouTube'
        });
        try {
          if (yt.thumbnail) {
            await sock.sendMessage(chatId, {
              image: { url: yt.thumbnail },
              caption
            }, { quoted: message });
          }
        } catch (_) {
          // thumbnail fail ho to bhi audio bhejo
          await sock.sendMessage(chatId, { text: caption }, { quoted: message }).catch(() => {});
        }
        await sock.sendMessage(chatId, {
          audio: { url: yt.download },
          mimetype: 'audio/mpeg',
          fileName: `${(yt.title || 'song').replace(/[^\w\s-]/g, '').slice(0, 40)}.mp3`
        }, { quoted: message });
        return;
      }

      return sock.sendMessage(chatId, {
        text:
          '❌ Song download fail.\n\n' +
          '• Try another name\n' +
          '• Or `.play` with exact Spotify/YT link\n' +
          '• The API may be busy'
      }, { quoted: message });
    } catch (err) {
      console.error('[play]', err.message);
      return sock.sendMessage(chatId, {
        text: '❌ Error: ' + (err.message || 'unknown')
      }, { quoted: message });
    }
  }
};
