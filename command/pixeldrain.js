'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .pixeldrain (RyzumiMD port).
 * Pixeldrain link se file download karo.
 * Source 1: official API /api/file/<id>/info (no key, public files).
 * Source 2: page scrape (window.viewer_data).
 * 300MB cap (RyzumiMD rule).
 */
const axios = require('axios');
const cheerio = require('cheerio');

const MAX_FILE = 300 * 1024 * 1024; // 300MB
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractId(url) {
  const m = String(url || '').match(/pixeldrain\.com\/(?:u\/|api\/file\/|l\/)?([A-Za-z0-9]{6,})/);
  return m ? m[1] : null;
}

async function infoApi(id) {
  const res = await axios.get('https://pixeldrain.com/api/file/' + id + '/info', { timeout: 15000, headers: { 'User-Agent': UA } });
  const d = res.data || {};
  if (d.success === false || !d.id) throw new Error(d.value || 'File nahi mili');
  return { id: d.id, name: d.name, mime: d.mime_type, size: d.size };
}

async function scrapePage(url) {
  const res = await axios.get(url, { timeout: 20000, headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' } });
  const $ = cheerio.load(String(res.data || ''));
  const scriptData = $('script').eq(0).html() || '';
  const jsonData = /window\.viewer_data\s*=\s*({.*?});/.exec(scriptData);
  if (!jsonData) throw new Error('Page se file info nahi mili');
  const viewerData = JSON.parse(jsonData[1]);
  const f = viewerData.api_response;
  if (!f || !f.id) throw new Error('File nahi mili');
  return { id: f.id, name: f.name, mime: f.mime_type, size: f.size };
}

module.exports = {
  command: 'pixeldrain',
  aliases: ['pddl', 'pd'],
  category: 'download',
  description: 'Pixeldrain link se file download karo.',
  usage: '.pixeldrain <pixeldrain link>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const url = (args || []).join(' ').trim();
    const id = extractId(url);
    if (!id) {
      await reply('❌ Sahi Pixeldrain link do.\nExample: *.pixeldrain https://pixeldrain.com/u/AbCdEfGh*');
      return;
    }
    await reply('⏳ Pixeldrain file nikaal raha hoon...');
    let info = null, lastErr = null;
    try { info = await infoApi(id); }
    catch (e) { lastErr = e; try { info = await scrapePage(url); } catch (e2) { lastErr = e2; } }
    if (!info) {
      await reply('❌ Pixeldrain download nahi ho paya: ' + String((lastErr && lastErr.message) || lastErr).slice(0, 150));
      return;
    }
    if (info.size && info.size > MAX_FILE) {
      await reply('⛔ File bahut badi hai (' + (info.size / (1024 * 1024)).toFixed(1) + ' MB). 300MB se zyada wali file nahi bhejta.');
      return;
    }
    const dlUrl = 'https://pixeldrain.com/api/file/' + info.id + '?download';
    const sizeMB = info.size ? (info.size / (1024 * 1024)).toFixed(1) + ' MB' : '?';
    const caption = '📁 *Pixeldrain*\n\n📄 *File:* ' + (info.name || 'file') + '\n📦 *Size:* ' + sizeMB;
    try {
      if (info.mime && info.mime.indexOf('video/') === 0) {
        await sock.sendMessage(chatId, { video: { url: dlUrl }, mimetype: info.mime, fileName: info.name, caption }, { quoted: message });
      } else if (info.mime && info.mime.indexOf('image/') === 0) {
        await sock.sendMessage(chatId, { image: { url: dlUrl }, caption }, { quoted: message });
      } else if (info.mime && info.mime.indexOf('audio/') === 0) {
        await sock.sendMessage(chatId, { audio: { url: dlUrl }, mimetype: info.mime, fileName: info.name }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { document: { url: dlUrl }, mimetype: info.mime || 'application/octet-stream', fileName: info.name || 'file', caption }, { quoted: message });
      }
    } catch (e) {
      await reply(caption + '\n🔗 *Link:* ' + dlUrl + '\n\n⚠️ File seedha nahi bhej paya, link se download kar lo.');
    }
  }
};
