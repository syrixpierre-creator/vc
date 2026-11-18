const { isBadPayload, cleanText, safeReplyText } = require('./safeResponse');
/**
 * QUEEN AKUMA Smart Engine — latest multi-API routing
 * Makes unknown/stub/legacy commands do real work via modern APIs
 */
const https = require('https');
const http = require('http');

function httpGet(url, timeout = 18000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
        try {
          if (/^\s*<(!DOCTYPE|html|head|body)/i.test(d) || d.includes('window.location')) {
            return reject(new Error('API returned HTML page (down/wrong endpoint)'));
          }
          resolve(JSON.parse(d));
        } catch {
          if (/^\s*<(!DOCTYPE|html)/i.test(d)) return reject(new Error('HTML response'));
          resolve({ result: d });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function tryElite(name, text) {
  try {
    const elite = require('./eliteApi');
    const data = await elite.call(name, text);
    let out = data?.result ?? data?.response ?? data?.message ?? data?.data ?? data?.text ?? data;
    if (out && typeof out === 'object') out = JSON.stringify(out, null, 2);
    out = cleanText(out);
    if (out) return out;
  } catch (_) {}
  return null;
}

async function tryAi(text) {
  try {
    const { ai } = require('./apiSwitch');
    const t = await ai(text);
    if (t) return cleanText(t);
  } catch (_) {}
  const elite = await tryElite('gemini', text) || await tryElite('chatgpt', text) || await tryElite('ai', text);
  return elite;
}

async function tryDownload(query) {
  try {
    const d = require('./downloadApis');
    if (d.ytmp3) {
      const r = await d.ytmp3(query);
      if (r) return r;
    }
    if (d.song) {
      const r = await d.song(query);
      if (r) return r;
    }
    if (d.youtubeAudio) {
      const r = await d.youtubeAudio(query);
      if (r) return r;
    }
  } catch (_) {}
  return null;
}

/** Route by command name / category */
async function smartRun(command, text, ctx = {}) {
  const cmd = String(command || '').toLowerCase();
  const q = String(text || '').trim();

  // AI family
  if (/^(ai|gpt|gemini|chatgpt|llama|bard|claude|botai|ask|eliteai|epai)/.test(cmd) || ctx.category === 'ai') {
    if (!q) return { type: 'text', text: `❌ Usage: .${cmd} <question>` };
    const ans = await tryAi(q);
    if (ans) return { type: 'text', text: `✨ *${cmd}*\n\n${ans.slice(0, 3500)}` };
    return { type: 'text', text: '❌ AI APIs busy. Try later / set ELITE_API_KEY or GEMINI_API_KEY.' };
  }

  // Download / media
  if (/^(play|song|music|ytmp3|ytmp4|video|ytdl|youtube|tiktok|instagram|ig|fb|facebook|mediafire|spotify|twitter|pinterest)/.test(cmd) || ctx.category === 'download') {
    if (!q) return { type: 'text', text: `❌ Usage: .${cmd} <name or url>` };
    const r = await tryDownload(q);
    if (r) {
      const title = r.title || r.name || q;
      const url = r.url || r.download || r.link || r.audio || r.mp3 || r.video;
      if (url && /^https?:\/\//i.test(String(url))) {
        if (/\.mp4|video/i.test(String(url)) || /ytmp4|video|tiktok|fb/.test(cmd)) {
          return { type: 'video', url: String(url), caption: `📥 *${title}*` };
        }
        return { type: 'audio', url: String(url), title: String(title).slice(0, 40) };
      }
      return { type: 'text', text: `🎵 *${title}*\n${url || JSON.stringify(r).slice(0, 500)}` };
    }
    // elite download paths
    for (const ep of ['ytmp3', 'youtube', 'tiktok', 'instagram']) {
      const t = await tryElite(ep, q);
      if (t) return { type: 'text', text: `📥 *${cmd}*\n${t.slice(0, 3000)}` };
    }
    return { type: 'text', text: `❌ Download failed for: ${q}\nTry .play / .song / .epytmp3` };
  }

  // Search
  if (/^(google|wiki|weather|npm|github|lyrics|playstore|anime|movie|search)/.test(cmd) || ctx.category === 'search') {
    if (!q && !/^(quote|joke|fact)/.test(cmd)) return { type: 'text', text: `❌ Usage: .${cmd} <query>` };
    for (const ep of [cmd.replace(/^ep/, ''), 'google', 'wiki']) {
      const t = await tryElite(ep, q || 'random');
      if (t) return { type: 'text', text: `🔎 *${cmd}*\n${t.slice(0, 3500)}` };
    }
    const ans = await tryAi(`Search/answer briefly: ${cmd} ${q}`);
    if (ans) return { type: 'text', text: `🔎 *${cmd}*\n${ans.slice(0, 3500)}` };
    return { type: 'text', text: `❌ No result for ${cmd}` };
  }

  // Tools
  if (/^(translate|qr|ssweb|shorturl|base64|calc|ip|whois|tts|emojimix|tourl|styletext)/.test(cmd) || ctx.category === 'tools') {
    if (!q) return { type: 'text', text: `❌ Usage: .${cmd} <input>` };
    const t = await tryElite(cmd, q) || await tryAi(`${cmd}: ${q}`);
    if (t) return { type: 'text', text: `🛠 *${cmd}*\n${t.slice(0, 3500)}` };
    return { type: 'text', text: `❌ Tool unavailable: ${cmd}` };
  }

  // Image gen
  if (/^(imagine|flux|remini|enhance|wallpaper|toanime|removebg)/.test(cmd) || ctx.category === 'image') {
    if (!q) return { type: 'text', text: `❌ Usage: .${cmd} <prompt/url>` };
    const t = await tryElite(cmd, q) || await tryElite('imagine', q);
    if (t) {
      const url = (String(t).match(/https?:\/\/\S+\.(jpg|png|webp|jpeg)/i) || [])[0];
      if (url) return { type: 'image', url, caption: `🖼 *${cmd}*` };
      return { type: 'text', text: `🖼 *${cmd}*\n${t.slice(0, 3000)}` };
    }
    return { type: 'text', text: `❌ Image API busy for .${cmd}` };
  }

  // Group / owner soft
  if (ctx.category === 'group' || /^(kick|promote|demote|tag|hidetag|antilink|welcome|mute|unmute)/.test(cmd)) {
    return { type: 'text', text: `👥 *${cmd}* — use native group commands: .kick .promote .tag .hidetag .antilink .welcome` };
  }

  // Fun / game
  if (ctx.category === 'game' || ctx.category === 'fun' || /^(joke|quote|truth|dare|slot|rpg|hunt)/.test(cmd)) {
    if (/joke|quote|fact|advice/.test(cmd)) {
      const t = await tryElite(cmd, q) || await tryAi(`Tell a short ${cmd}`);
      if (t) return { type: 'text', text: `🎭 ${t.slice(0, 2000)}` };
    }
    return { type: 'text', text: `🎮 *${cmd}* active.\n${q ? 'Input: ' + q : 'Try with args or play in group.'}` };
  }

  // Generic unknown / unmatched — never forward raw API HTML
  if (q) {
    const t = cleanText(await tryAi(q));
    if (t) return { type: 'text', text: `⚡ *${cmd}*\n\n${t}` };
  }
  return {
    type: 'text',
    text: `❓ *.${cmd}*\n${q ? 'Input: ' + q + '\n' : ''}\nCommand available nahi hai ya API down hai.\nTry: .menu .ai .play .sticker .eliteai`
  };
}

async function sendResult(sock, chatId, message, result) {
  if (!result) return;
  let quoted = message;
  try {
    const { fakevCard } = require('./fakevCard');
    if (fakevCard) quoted = fakevCard;
  } catch (_) {}
  if (result.type === 'audio' && result.url) {
    return sock.sendMessage(chatId, {
      audio: { url: result.url },
      mimetype: 'audio/mpeg',
      fileName: (result.title || 'audio') + '.mp3'
    }, { quoted: quoted });
  }
  if (result.type === 'video' && result.url) {
    return sock.sendMessage(chatId, { video: { url: result.url }, caption: result.caption || '' }, { quoted: quoted });
  }
  if (result.type === 'image' && result.url) {
    return sock.sendMessage(chatId, { image: { url: result.url }, caption: result.caption || '' }, { quoted: quoted });
  }
  return sock.sendMessage(chatId, { text: safeReplyText(result.text, 'OK') }, { quoted: quoted });
}

module.exports = { smartRun, sendResult, tryAi, tryDownload, tryElite };
