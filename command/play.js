'use strict';
/**
 * QUEEN AKUMA — .play <name or YouTube link>
 * Finds the song on YouTube (scraping, no API) and asks: 🎵 Audio or 🎬 Video.
 * The buttons send ".play audio <link>" / ".play video <link>".
 */
const fs = require('fs');
const yt = require('../lib/ytScrape');

const fmtViews = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n || 0));
const safeName = (t) => String(t || 'song').replace(/[^\w\s-]/g, '').trim().slice(0, 60) || 'song';

module.exports = {
  command: 'play',
  aliases: [],
  category: 'download',
  description: 'Play a song or video from YouTube',
  usage: '.play <name or url>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const prefix = (String(context.messageText || '').trim().match(/^[^\w\s]/) || [])[0] || (require('../settings').prefixes || ['.'])[0];
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const react = (e) => sock.sendMessage(chatId, { react: { text: e, key: message.key } }).catch(() => {});

    let mode = null;
    let parts = (args || []).slice();
    if (/^(audio|video|mp3|mp4)$/i.test(parts[0] || '')) mode = /^(audio|mp3)$/i.test(parts.shift()) ? 'audio' : 'video';
    const query = parts.join(' ').trim();
    if (!query) return reply('📌 *Usage:* .play <name or url>');

    await react('🔍');
    let v;
    try { v = await yt.search(query); } catch (_) { v = null; }
    if (!v) { await react('❌'); return reply('❌ *No result found.*'); }

    // Step 1: show the song and let the user choose
    if (!mode) {
      const caption =
        `🎵 *${v.title}*\n\n` +
        (v.author ? `👤 *Channel:* ${v.author}\n` : '') +
        (v.duration ? `⏱️ *Duration:* ${v.duration}\n` : '') +
        `👁️ *Views:* ${fmtViews(v.views)}\n\n` +
        `Choose the format:`;
      const buttons = [
        { buttonId: `${prefix}play audio ${v.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
        { buttonId: `${prefix}play video ${v.url}`, buttonText: { displayText: '🎬 Video' }, type: 1 },
      ];
      await react('🎶');
      try {
        return await sock.sendMessage(chatId, { image: { url: v.thumbnail }, caption, buttons, headerType: 4, footer: 'QUEEN AKUMA' }, { quoted: message });
      } catch (_) {
        return sock.sendMessage(chatId, { text: caption, buttons, headerType: 1, footer: 'QUEEN AKUMA' }, { quoted: message });
      }
    }

    // Step 2: download the chosen format
    if (v.seconds && v.seconds > (mode === 'audio' ? 60 * 60 : 30 * 60)) {
      await react('❌');
      return reply(`❌ *Too long!* Max ${mode === 'audio' ? '60' : '30'} min.`);
    }
    await react('⏳');
    let file;
    try {
      file = await yt.download(v.url, mode);
    } catch (e) {
      await react('❌');
      console.error('[play]', e.detail || e.message);
      const why = { blocked: '❌ *YouTube blocked the download. Try again later.*', 'too-big': '❌ *File too big!*' };
      return reply(why[e.message] || '❌ *Download failed. Try again.*');
    }
    try {
      const size = fs.statSync(file).size;
      const name = safeName(v.title);
      if (mode === 'audio') {
        await sock.sendMessage(chatId, { audio: fs.readFileSync(file), mimetype: 'audio/mpeg', fileName: name + '.mp3' }, { quoted: message });
      } else if (size > 60 * 1048576) {
        await sock.sendMessage(chatId, { document: fs.readFileSync(file), mimetype: 'video/mp4', fileName: name + '.mp4', caption: `🎬 *${v.title}*` }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { video: fs.readFileSync(file), mimetype: 'video/mp4', caption: `🎬 *${v.title}*` }, { quoted: message });
      }
      await react('✅');
    } catch (e) {
      await react('❌');
      return reply('❌ *Could not send the file.*');
    } finally {
      try { fs.unlinkSync(file); } catch (_) {}
    }
  },
};
