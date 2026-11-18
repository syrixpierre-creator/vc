/*****************************************************************************
 * QUEEN AKUMA — .leakvideo (fixed, no broken compat)
 *****************************************************************************/
const axios = require('axios');

const SOURCES = [
  'https://arslan-apis-v2.vercel.app/leakvideos',
  'https://arslan-apis-v2.vercel.app/leakvideos2'
];

async function resolveVideoUrl() {
  // API may return direct mp4 URL or JSON { url / video / link }
  for (const src of SOURCES) {
    try {
      const r = await axios.get(src, {
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (s) => s < 500,
        headers: { 'User-Agent': 'QUEEN-AKUMA/1.0', Accept: '*/*' }
      });
      if (r.status >= 400) continue;
      const d = r.data;
      if (typeof d === 'string' && /^https?:\/\//i.test(d.trim())) return d.trim();
      if (d && typeof d === 'object') {
        const u = d.url || d.video || d.link || d.result || d.data?.url || d.data?.video;
        if (typeof u === 'string' && /^https?:\/\//i.test(u)) return u;
      }
      // some APIs return the media itself via redirect — use source URL for WhatsApp
      if (r.request?.res?.responseUrl && /\.(mp4|webm)(\?|$)/i.test(r.request.res.responseUrl)) {
        return r.request.res.responseUrl;
      }
      // fallback: send source URL directly as video url (works if endpoint streams mp4)
      return src;
    } catch (_) {}
  }
  return null;
}

module.exports = {
  command: 'leakvideo',
  aliases: ['leakvideo2', 'randomleak', 'rvideo'],
  category: 'fun',
  description: 'Send a random leak/fun video',
  usage: '.leakvideo',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      await sock.sendMessage(chatId, { text: '⏳ Fetching video…' }, { quoted: message }).catch(() => {});
      const videoUrl = await resolveVideoUrl();
      if (!videoUrl) {
        return sock.sendMessage(chatId, { text: '❌ Video source down. Baad me try karo.' }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: '🎬 *Random Video*\n_QUEEN AKUMA_'
      }, { quoted: message });
    } catch (e) {
      console.error('[leakvideo]', e.message);
      return sock.sendMessage(chatId, {
        text: '❌ Video load fail: ' + (e.message || 'unknown') + '\n_Source API offline ho sakti hai._'
      }, { quoted: message });
    }
  }
};
