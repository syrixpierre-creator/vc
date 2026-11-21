'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .mediafire REAL fix (QUEEN AKUMA + queen-akuma + raganork).
 * Purana file sirf stub tha (ytmp3 try karke text bhejta tha).
 * Source 1: MediaFire page scrape (silva pattern) — direct download link.
 * Source 2: raganork-network API — fallback.
 * File 100MB tak document ke roop me bhejta hai, usse bada ho to link + info.
 */
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_SEND = 100 * 1024 * 1024; // 100MB

function mimeFor(name) {
  const ext = String(name || '').split('.').pop().toLowerCase();
  const map = {
    apk: 'application/vnd.android.package-archive', pdf: 'application/pdf',
    zip: 'application/zip', rar: 'application/x-rar-compressed', '7z': 'application/x-7z-compressed',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg',
    mp4: 'video/mp4', mkv: 'video/x-matroska', mov: 'video/quicktime', webm: 'video/webm',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    txt: 'text/plain', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return map[ext] || 'application/octet-stream';
}
function parseSize(str) {
  if (!str) return null;
  const m = String(str).trim().match(/([\d.]+)\s*(KB|MB|GB|B)/i);
  if (!m) return null;
  const mult = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  return parseFloat(m[1]) * (mult[m[2].toUpperCase()] || 1);
}

async function scrapeMediafire(url) {
  const res = await axios.get(url, {
    timeout: 20000, maxRedirects: 5,
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' }
  });
  const html = String(res.data || '');
  const dl = html.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/) ||
             html.match(/"(https:\/\/download\d+\.mediafire\.com[^"]+)"/);
  if (!dl) throw new Error('Download link not found (the file may be deleted)');
  const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/) ||
                    html.match(/class="dl-btn-label[^"]*">([^<]+)<\/span>/);
  const sizeMatch = html.match(/([0-9][0-9.,]*\s*(?:KB|MB|GB))/i);
  return {
    url: dl[1].replace(/&amp;/g, '&'),
    filename: nameMatch ? nameMatch[1].trim() : 'mediafire-file',
    sizeStr: sizeMatch ? sizeMatch[1] : ''
  };
}

async function apiMediafire(url) {
  const res = await axios.get('https://raganork-network.vercel.app/api/mediafire?url=' + encodeURIComponent(url), { timeout: 25000 });
  const d = res.data || {};
  if (!d.link) throw new Error('No link from the API');
  return { url: d.link, filename: d.title || 'mediafire-file', sizeStr: d.size || '' };
}

module.exports = {
  command: 'mediafire',
  aliases: ['mfire', 'mf', 'mfdl'],
  category: 'download',
  description: 'Download a file from a MediaFire link.',
  usage: '.mediafire <mediafire link>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const url = (args || []).join(' ').trim();
    if (!url || url.indexOf('mediafire.com') === -1) {
      await reply('❌ Sahi MediaFire link do.\nExample: *.mediafire https://www.mediafire.com/file/abc/filename/file*');
      return;
    }
    await reply('⏳ MediaFire link nikaal raha hoon...');
    let info = null, lastErr = null;
    try { info = await scrapeMediafire(url); }
    catch (e) { lastErr = e; try { info = await apiMediafire(url); } catch (e2) { lastErr = e2; } }
    if (!info) {
      await reply('❌ *MediaFire download failed:* ' + String((lastErr && lastErr.message) || lastErr).slice(0, 150));
      return;
    }
    const sizeBytes = parseSize(info.sizeStr);
    const caption = '📁 *MediaFire Download*\n\n📄 *File:* ' + info.filename +
      (info.sizeStr ? '\n📦 *Size:* ' + info.sizeStr : '') +
      '\n🔗 *Link:* ' + info.url;
    if (sizeBytes && sizeBytes > MAX_SEND) {
      await reply(caption + '\n\n⚠️ File is bigger than 100MB, here is the link.');
      return;
    }
    try {
      await sock.sendMessage(chatId, {
        document: { url: info.url }, mimetype: mimeFor(info.filename),
        fileName: info.filename, caption
      }, { quoted: message });
    } catch (e) {
      await reply(caption + '\n\n⚠️ Could not send the file, use the link above.');
    }
  }
};
