'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .modapk (QUEEN AKUMA port, no aptoide-scraper dep).
 * Aptoide web API se APK search + direct download link.
 * Source 1: ws75.aptoide.com — Source 2: web-api.aptoide.com (same backend).
 * 200MB cap (QUEEN AKUMA rule).
 */
const axios = require('axios');

const MAX_APK = 200 * 1024 * 1024; // 200MB

async function searchAptoide(query, host) {
  const res = await axios.get('https://' + host + '/api/7/apps/search', {
    params: { query, limit: 5 },
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const list = res.data && res.data.datalist && res.data.datalist.list;
  if (!list || !list.length) throw new Error('No APK found');
  return list[0];
}

module.exports = {
  command: 'modapk',
  aliases: ['apk', 'apkdl'],
  category: 'download',
  description: 'Download the APK of any app (Aptoide).',
  usage: '.modapk <app name>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const query = (args || []).join(' ').trim();
    if (!query) {
      await reply('❌ App ka naam do.\nExample: *.modapk whatsapp*');
      return;
    }
    await reply('⏳ APK dhoondh raha hoon: *' + query + '* ...');
    let app = null, lastErr = null;
    for (const host of ['ws75.aptoide.com', 'web-api.aptoide.com']) {
      try { app = await searchAptoide(query, host); break; }
      catch (e) { lastErr = e; }
    }
    if (!app) {
      await reply('❌ *APK not found:* ' + String((lastErr && lastErr.message) || lastErr).slice(0, 120));
      return;
    }
    const dl = app.file && app.file.path;
    if (!dl) {
      await reply('❌ *No download link for this app.*');
      return;
    }
    const sizeMB = app.size ? (app.size / (1024 * 1024)).toFixed(1) : '?';
    if (app.size && app.size > MAX_APK) {
      await reply('⛔ File bahut badi hai (' + sizeMB + ' MB). APKs bigger than 200MB are not sent.');
      return;
    }
    const name = (app.name || query).replace(/[^\w\s.-]/g, '').trim() || query;
    const caption = '📱 *' + name + '*\n📦 Package: ' + (app.package || '—') +
      '\n💾 Size: ' + sizeMB + ' MB\n⭐ Rating: ' + (app.stats && app.stats.rating && app.stats.rating.avg ? app.stats.rating.avg : '—');
    try {
      await sock.sendMessage(chatId, {
        document: { url: dl }, mimetype: 'application/vnd.android.package-archive',
        fileName: name + '.apk', caption
      }, { quoted: message });
    } catch (e) {
      await reply(caption + '\n🔗 Download link: ' + dl + '\n\n⚠️ Could not send the file, use the link.');
    }
  }
};
