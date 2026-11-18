'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .slideshare (RyzumiMD port).
 * SlideShare deck ko PDF + PPTX me download karo.
 * Source: bioskop-six.vercel.app (third-party host — kabhi down ho sakta hai).
 * Dono format try karta hai; jo milega wo bhej dega.
 */
const axios = require('axios');

async function fetchFormat(url, filetype) {
  const res = await axios.get('https://bioskop-six.vercel.app/slideshare?url=' + encodeURIComponent(url) + '&filetype=' + filetype, { timeout: 40000 });
  const d = res.data || {};
  if (!d.download_url) throw new Error('No download_url for ' + filetype);
  return d.download_url;
}

module.exports = {
  command: 'slideshare',
  aliases: ['slidedl', 'slidesharedl', 'slidedownload'],
  category: 'download',
  description: 'SlideShare deck PDF/PPTX me download karo.',
  usage: '.slideshare <slideshare link>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const url = (args || []).join(' ').trim();
    if (!url || url.indexOf('slideshare.net') === -1) {
      await reply('❌ Sahi SlideShare link do.\nExample: *.slideshare https://www.slideshare.net/user/deck-title*');
      return;
    }
    await reply('⏳ SlideShare deck nikaal raha hoon (PDF + PPTX)...');
    const slug = url.split('/').filter(Boolean).pop().replace(/[^A-Za-z0-9._-]/g, '_') || 'slideshare';
    let sent = 0;
    for (const ft of ['pdf', 'pptx']) {
      try {
        const dl = await fetchFormat(url, ft);
        const mimetype = ft === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        await sock.sendMessage(chatId, {
          document: { url: dl }, mimetype, fileName: slug + '.' + ft,
          caption: '📊 SlideShare deck (' + ft.toUpperCase() + ')'
        }, { quoted: message });
        sent++;
      } catch (e) {}
    }
    if (!sent) {
      await reply('❌ SlideShare download nahi ho paya. Ye third-party host (bioskop-six) par chalta hai — down ho sakta hai. Thodi der baad try karo.');
    }
  }
};
