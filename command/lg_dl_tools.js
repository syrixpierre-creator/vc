'use strict';
/**
 * QUEEN AKUMA — .tweet / .twdl (Twitter/X video+photo download, FxTwitter).
 * Ye file mediafiredl + 8 aliases ki shared compat wrapper hai — sirf
 * tweet/twdl yahan implement kiye gaye hain, baaki aliases (mediafiredl,
 * gitdl, img, searchimg...) purane compat run se chalte hain.
 * API: api.fxtwitter.com (free, no key, live-verified 2026-11-16 — fake
 * tweet par sahi 404 JSON deta hai).
 */
const axios = require('axios');
const { run } = require('../lib/compat');
const META = {"file":"dl-tools.js","family":"B","command":"mediafiredl","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

function invokedName(message, context) {
  const t = String((context && (context.rawText || context.userMessage)) || message.body || message.message?.conversation || (message.message?.extendedTextMessage?.text) || '');
  return t.replace(/^\./, '').split(/\s+/)[0].toLowerCase();
}

function extractStatusId(input) {
  const m = String(input || '').match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i) || String(input || '').match(/^(\d{10,25})$/);
  return m ? m[1] : null;
}

async function tweetDl(sock, message, args, context) {
  const chatId = context.chatId || message.key.remoteJid;
  const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
  const input = (args || []).join(' ').trim();
  const id = extractStatusId(input);
  if (!id) {
    await reply('❌ Twitter/X link do.\nExample: *.tweet https://x.com/user/status/1234567890123456789*');
    return;
  }
  try {
    const res = await axios.get('https://api.fxtwitter.com/status/' + id, { timeout: 20000 });
    const tw = res.data && res.data.tweet;
    if (!tw) {
      await reply('❌ *Tweet not found.* Check the link.');
      return;
    }
    const author = tw.author ? ('@' + tw.author.screen_name + (tw.author.name ? ' (' + tw.author.name + ')' : '')) : '';
    const text = (tw.text || '').slice(0, 500);
    const media = (tw.media && (tw.media.videos || tw.media.photos)) || [];
    const videos = (tw.media && tw.media.videos) || [];
    const photos = (tw.media && tw.media.photos) || [];
    if (videos.length) {
      const best = videos.slice().sort((a, b) => (b.width || 0) - (a.width || 0))[0];
      await sock.sendMessage(chatId, {
        video: { url: best.url },
        caption: '🐦 *Twitter Video*' + (author ? '\n' + author : '') + (text ? '\n\n' + text : '') + '\n\n🔗 https://x.com/i/status/' + id
      }, { quoted: message });
      return;
    }
    if (photos.length) {
      for (const p of photos.slice(0, 4)) {
        await sock.sendMessage(chatId, { image: { url: p.url }, caption: '🐦 *Twitter Photo*' + (author ? '\n' + author : '') }, { quoted: message });
      }
      if (text) await reply('🐦 ' + author + '\n\n' + text);
      return;
    }
    if (text) { await reply('🐦 ' + author + '\n\n' + text + '\n\n_(No media in this tweet.)_'); return; }
    await reply('❌ *Nothing to download from this tweet.*');
  } catch (e) {
    const status = e.response && e.response.status;
    if (status === 404) await reply('❌ *Tweet not found.* Check the link.');
    else await reply('❌ *Twitter download failed:* ' + String(e.message || e).slice(0, 120));
  }
}

module.exports = {
  command: "mediafiredl",
  aliases: ["gitdl","githubdownload","tweet","twdl","img","image","searchimg","git"],
  category: "downloader",
  description: "Download files from MediaFire",
  usage: "",
  handler: async (sock, message, args, ctx) => {
    const name = invokedName(message, ctx);
    if (name === 'tweet' || name === 'twdl') return tweetDl(sock, message, args, ctx);
    return run(META, sock, message, args, ctx);
  }
};
