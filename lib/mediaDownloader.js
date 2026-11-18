/**
 * QUEEN AKUMA media downloader engine
 *  - detects the platform from the link (facebook / instagram / tiktok / twitter / pinterest / threads / youtube ...)
 *  - asks several public APIs IN PARALLEL and uses the first valid answer
 *  - understands many response shapes (finds the media URL anywhere in the JSON)
 *  - remembers which APIs are alive (data/api-health.json) and tries healthy ones first
 *  - extra APIs can be added without code:  .addapi <platform|all> <url with {url}>   (data/providers.json)
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(process.cwd(), 'data');
const HEALTH_FILE = path.join(DATA, 'api-health.json');
const CUSTOM_FILE = path.join(DATA, 'providers.json');
const TIMEOUT = 25000; // v2.6.0: Elite ytmp4 took ~11s live
const PARALLEL = 4;
const UA = 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

const QBASE = process.env.DEMON_API_BASE || 'https://api.qasimdev.dpdns.org';
const QKEY = process.env.DEMON_API_KEY || 'qasim-dev';
const GKEY = process.env.GIFTED_API_KEY || 'gifted';

// ---------- platforms ----------
const PLATFORMS = [
  ['facebook', /(facebook\.com|fb\.watch|fb\.com|fb\.me)/i],
  ['instagram', /(instagram\.com|instagr\.am)/i],
  ['tiktok', /(tiktok\.com|vt\.tiktok|vm\.tiktok)/i],
  ['twitter', /(twitter\.com|x\.com|t\.co\/)/i],
  ['pinterest', /(pinterest\.|pin\.it)/i],
  ['threads', /threads\.(net|com)/i],
  ['youtube', /(youtube\.com|youtu\.be)/i],
  ['spotify', /spotify\.com/i],
  ['soundcloud', /soundcloud\.com/i],
  ['mediafire', /mediafire\.com/i],
  ['capcut', /capcut\.com/i]
];
function detectPlatform(url) {
  for (const [name, re] of PLATFORMS) if (re.test(url)) return name;
  return null;
}
const isUrl = (u) => /^https?:\/\/\S+/i.test(String(u || '').trim());

// ---------- built-in providers (best-effort list; dead ones are skipped automatically) ----------
// u(url) must return the full request URL.
const enc = encodeURIComponent;
const BUILTIN = [
  // v2.6.0 VERIFIED LIVE 2026-11-14 - tried FIRST (health system demotes dead ones)
  { id: 'elite-ytmp4', platforms: ['youtube'], u: (url) => `https://eliteprotech-apis.zone.id/download/ytmp4?url=${enc(url)}` },
  { id: 'elite-ytmp3', platforms: ['youtube'], u: (url) => `https://eliteprotech-apis.zone.id/download/ytmp3?url=${enc(url)}` },
  { id: 'noobs-tt', platforms: ['tiktok'], u: (url) => `https://noobs-api.top/dipto/alldl?url=${enc(url)}` },
  { id: 'noobs-fb', platforms: ['facebook'], u: (url) => `https://noobs-api.top/dipto/alldl?url=${enc(url)}` },
  // QUEEN AKUMA default API (needs DEMON_API_KEY if you have one)
  { id: 'qasim', platforms: ['facebook', 'instagram', 'tiktok', 'twitter', 'youtube'], u: (url, p) => `${QBASE}/api/${p}/download?apiKey=${QKEY}&url=${enc(url)}` },
  { id: 'qasim-loader', platforms: ['*'], u: (url) => `${QBASE}/api/loaderto/download?apiKey=${QKEY}&url=${enc(url)}` },
  // TikTok
  { id: 'tikwm', platforms: ['tiktok'], u: (url) => `https://www.tikwm.com/api/?url=${enc(url)}&hd=1` },
  { id: 'tt-downbloder', platforms: ['tiktok'], u: (url) => `https://tiktok-downbloder.vercel.app/?url=${enc(url)}` }, // v2.6.1: result.raw.result.video (tikcdn.io)
  { id: 'siputzx-tt', platforms: ['tiktok'], u: (url) => `https://api.siputzx.my.id/api/d/tiktok?url=${enc(url)}` },
  { id: 'siputzx-fb', platforms: ['facebook'], u: (url) => `https://api.siputzx.my.id/api/d/fb?url=${enc(url)}` },
  { id: 'siputzx-tw', platforms: ['twitter'], u: (url) => `https://api.siputzx.my.id/api/d/twitter?url=${enc(url)}` },
  // GiftedTech
  { id: 'gifted-fb', platforms: ['facebook'], u: (url) => `https://api.giftedtech.co.ke/api/download/facebook?apikey=${GKEY}&url=${enc(url)}` },
  { id: 'gifted-ig', platforms: ['instagram'], u: (url) => `https://api.giftedtech.co.ke/api/download/instadl?apikey=${GKEY}&url=${enc(url)}` },
  { id: 'gifted-tt', platforms: ['tiktok'], u: (url) => `https://api.giftedtech.co.ke/api/download/tiktok?apikey=${GKEY}&url=${enc(url)}` },
  { id: 'gifted-tw', platforms: ['twitter'], u: (url) => `https://api.giftedtech.co.ke/api/download/twitter?apikey=${GKEY}&url=${enc(url)}` },
  { id: 'gifted-pin', platforms: ['pinterest'], u: (url) => `https://api.giftedtech.co.ke/api/download/pinterestdl?apikey=${GKEY}&url=${enc(url)}` },
  // Keith
  // Vreden
  { id: 'vreden-fb', platforms: ['facebook'], u: (url) => `https://api.vreden.my.id/api/fbdl?url=${enc(url)}` },
  { id: 'vreden-ig', platforms: ['instagram'], u: (url) => `https://api.vreden.my.id/api/igdownload?url=${enc(url)}` },
  { id: 'vreden-tt', platforms: ['tiktok'], u: (url) => `https://api.vreden.my.id/api/tiktok?url=${enc(url)}` },
  { id: 'vreden-tw', platforms: ['twitter'], u: (url) => `https://api.vreden.my.id/api/twitter?url=${enc(url)}` },
  { id: 'vreden-pin', platforms: ['pinterest'], u: (url) => `https://api.vreden.my.id/api/pindl?url=${enc(url)}` },
  // Agatz
  // Ryzendesu
  // Others
  { id: 'tele-social', platforms: ['facebook', 'instagram', 'tiktok', 'twitter'], u: (url) => `https://tele-social.vercel.app/down?url=${enc(url)}` }
];

// ---------- storage ----------
function readJson(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return d; } }
function writeJson(f, v) { try { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 2)); } catch (_) {} }

function customProviders() {
  return readJson(CUSTOM_FILE, []).filter((c) => c && c.id && c.url && String(c.url).includes('{url}')).map((c) => ({
    id: c.id,
    platforms: c.platforms || ['*'],
    custom: true,
    u: (url) => String(c.url).replace(/\{url\}/g, enc(url)).replace(/\{rawurl\}/g, url).replace(/\{key\}/g, c.key || '')
  }));
}
function allProviders() { return [...customProviders(), ...BUILTIN]; }
function providersFor(platform) {
  return allProviders().filter((p) => p.platforms.includes('*') || p.platforms.includes(platform));
}

// health: { id: { ok, fail, streak(fail streak), last } }
function health() { return readJson(HEALTH_FILE, {}); }
function mark(id, ok) {
  const h = health();
  const e = h[id] || { ok: 0, fail: 0, streak: 0 };
  if (ok) { e.ok++; e.streak = 0; } else { e.fail++; e.streak++; }
  e.last = Date.now();
  h[id] = e;
  writeJson(HEALTH_FILE, h);
}
function score(id, h) {
  const e = h[id];
  if (!e) return 0; // unknown: neutral
  // recently failing providers (streak) sink; proven ones rise
  const recentlyBad = e.streak >= 3 && Date.now() - (e.last || 0) < 10 * 60 * 1000;
  return (recentlyBad ? 100 : 0) + e.streak * 5 - Math.min(e.ok, 20);
}

// ---------- http ----------
async function getJson(url, timeout = TIMEOUT) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json,text/plain,*/*', 'user-agent': UA } });
    const txt = await r.text();
    if (!r.ok) throw new Error('HTTP ' + r.status);
    if (/^\s*<(!doctype|html)/i.test(txt)) throw new Error('HTML page (API down/blocked)');
    try { return JSON.parse(txt); } catch (_) { throw new Error('not JSON'); }
  } finally { clearTimeout(t); }
}

// ---------- response parsing ----------
const VIDEO_RE = /\.(mp4|mov|webm|m4v)(\?|$)/i;
const AUDIO_RE = /\.(mp3|m4a|opus|ogg|wav)(\?|$)/i;
const IMAGE_RE = /\.(jpe?g|png|webp|gif)(\?|$)/i;
const GOOD_KEYS = ['hd', 'high', 'highest', 'nowm', 'no_watermark', 'play', 'video', 'videourl', 'video_url', 'download', 'downloadurl', 'download_url', 'url', 'link', 'sd', 'normal', 'media', 'mp4', 'src', 'source', 'result']; // v2.6.0: 'result' for noobs-alldl

// quality label (HD / 720p / SD / 360p ...) -> sort weight (bigger = better)
function qualityWeight(q) {
  const t = String(q || '').toLowerCase();
  if (!t) return 0;
  const n = parseInt((t.match(/(\d{3,4})\s*p?/) || [])[1], 10);
  if (n) return n;
  if (/hd|high|best|original/.test(t)) return 720;
  if (/sd|low|normal|medium/.test(t)) return 360;
  return 0;
}
function walk(node, out, key = '', depth = 0, q = '') {
  if (depth > 7 || node == null) return;
  if (typeof node === 'string') {
    if (/^https?:\/\//i.test(node)) out.push({ key: key.toLowerCase(), url: node, q });
    return;
  }
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out, key, depth + 1, q)); return; }
  if (typeof node === 'object') {
    const label = node.quality || node.resolution || node.label || node.format || node.type || node.res || '';
    const nq = typeof label === 'string' || typeof label === 'number' ? String(label) : q;
    for (const k of Object.keys(node)) walk(node[k], out, k, depth + 1, nq);
  }
}
function firstString(obj, keys) {
  for (const k of keys) {
    const v = obj && obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}
/** Find the best media in any JSON response */
function extract(json, inputUrl) {
  const found = [];
  walk(json, found);
  const clean = found.filter((f) => f.url !== inputUrl && !/tikwm\.com\/?$/.test(f.url));
  const rank = (f) => {
    const i = GOOD_KEYS.indexOf(f.key);
    return i === -1 ? 50 : i;
  };
  const isThumbKey = (k) => /thumb|cover|poster|preview|avatar|profile|icon|logo/.test(k);
  const videos = clean.filter((f) => !isThumbKey(f.key) && (VIDEO_RE.test(f.url) || /video|play|hd|sd|nowm|mp4/.test(f.key))).sort((a, b) => (qualityWeight(b.q) - qualityWeight(a.q)) || (rank(a) - rank(b)));
  const audios = clean.filter((f) => AUDIO_RE.test(f.url) || /music|audio|mp3/.test(f.key));
  const images = clean.filter((f) => !isThumbKey(f.key) && IMAGE_RE.test(f.url) && !videos.includes(f));
  const generic = clean.filter((f) => !isThumbKey(f.key) && GOOD_KEYS.includes(f.key) && !AUDIO_RE.test(f.url) && !IMAGE_RE.test(f.url));
  const root = json && typeof json === 'object' ? json : {};
  const inner = root.data && typeof root.data === 'object' && !Array.isArray(root.data) ? root.data : root.result && typeof root.result === 'object' && !Array.isArray(root.result) ? root.result : root;
  const title = firstString(inner, ['title', 'caption', 'desc', 'description', 'text']) || firstString(root, ['title']);
  const thumb = (clean.find((f) => isThumbKey(f.key) && IMAGE_RE.test(f.url)) || {}).url || '';
  const video = (videos[0] || generic[0] || {}).url || '';
  const res = { video, audio: (audios[0] || {}).url || '', images: images.slice(0, 10).map((i) => i.url), title, thumb };
  if (!res.video && !res.images.length && !res.audio) return null;
  return res;
}

// ---------- v2.6.1: FxTwitter (X/Twitter video) ----------
// api.fxtwitter.com/2/status/{id} -> status.media.videos[] (mp4, video.twimg.com)
// + status.media.photos[]. Probed live 2026-11-14: pehli baar 403 aata hai,
// retry pe 200 milta hai - isliye 1 retry built-in hai. vxtwitter 403 Cloudflare
// (dead) use nahi hota. Ye BUILTIN template nahi hai kyunki status-id nikalna
// aur best quality chunna padta hai.
function fxtwitterId(url) {
  const m = String(url || '').match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}
async function fxtwitter(url) {
  const id = fxtwitterId(url);
  if (!id) return null;
  let json = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      json = await getJson(`https://api.fxtwitter.com/2/status/${id}`);
      if (json) break;
    } catch (_) { json = null; }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
  }
  if (!json) return null;
  const st = json.status || json;
  const media = st.media || {};
  const videos = Array.isArray(media.videos) ? media.videos : [];
  const photos = Array.isArray(media.photos) ? media.photos : [];
  let best = null;
  for (const v of videos) {
    const u = v.url || v.src;
    if (!u || !/^https?:\/\//i.test(u)) continue;
    const score = (Number(v.width) || 0) * (Number(v.height) || 0);
    if (!best || score > best.score) best = { url: u, score };
  }
  const images = photos.map((ph) => ph.url || ph.src).filter((u) => u && /^https?:\/\//i.test(u));
  if (!best && !images.length) return null;
  return {
    video: best ? best.url : '',
    audio: '',
    images,
    title: String(st.text || st.full_text || '').slice(0, 200),
    thumb: images[0] || ''
  };
}

// ---------- main ----------
async function download(url, forcePlatform) {
  const platform = forcePlatform || detectPlatform(url);
  if (!platform) throw new Error('Unsupported link. Supported: facebook, instagram, tiktok, twitter/x, pinterest, threads, youtube');
  // v2.6.1: Twitter/X pe FxTwitter sabse pehle (pehla working X source)
  if (platform === 'twitter') {
    try {
      const fx = await fxtwitter(url);
      if (fx) { mark('fxtwitter', true); return { ...fx, provider: 'fxtwitter', platform }; }
      mark('fxtwitter', false);
    } catch (_) { mark('fxtwitter', false); }
  }
  const h = health();
  const list = providersFor(platform).sort((a, b) => score(a.id, h) - score(b.id, h));
  if (!list.length) throw new Error('No API configured for ' + platform);

  const errors = [];
  for (let i = 0; i < list.length; i += PARALLEL) {
    const batch = list.slice(i, i + PARALLEL);
    const winner = await new Promise((resolve) => {
      let pending = batch.length;
      let done = false;
      for (const p of batch) {
        (async () => {
          try {
            const json = await getJson(p.u(url, platform));
            const res = extract(json, url);
            if (!res) throw new Error('no media in response');
            mark(p.id, true);
            if (!done) { done = true; resolve({ ...res, provider: p.id, platform }); }
          } catch (e) {
            mark(p.id, false);
            errors.push(p.id + ': ' + String(e.message).slice(0, 40));
          } finally {
            if (--pending === 0 && !done) resolve(null);
          }
        })();
      }
    });
    if (winner) return winner;
  }
  const err = new Error('All ' + list.length + ' APIs failed for ' + platform + '. Run .apicheck, or add one with .addapi');
  err.details = errors;
  throw err;
}

// ---------- sending ----------
async function fetchBuffer(url, max = 80 * 1024 * 1024) {
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const len = Number(r.headers.get('content-length') || 0);
  if (len && len > max) throw new Error('file too large (' + Math.round(len / 1048576) + ' MB)');
  return Buffer.from(await r.arrayBuffer());
}

async function sendResult(sock, chatId, message, res, label) {
  const caption = `✅ *${label || res.platform}*${res.title ? '\n' + String(res.title).slice(0, 300) : ''}\n\n_via ${res.provider}_`;
  if (res.video) {
    try {
      return await sock.sendMessage(chatId, { video: { url: res.video }, mimetype: 'video/mp4', caption }, { quoted: message });
    } catch (_) {
      const buf = await fetchBuffer(res.video);
      return sock.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', caption }, { quoted: message });
    }
  }
  if (res.images && res.images.length) {
    for (let i = 0; i < res.images.length; i++) {
      await sock.sendMessage(chatId, { image: { url: res.images[i] }, caption: i === 0 ? caption : '' }, { quoted: message }).catch(() => {});
    }
    return;
  }
  if (res.audio) return sock.sendMessage(chatId, { audio: { url: res.audio }, mimetype: 'audio/mpeg' }, { quoted: message });
}

// ---------- health check ----------
const SAMPLES = {
  tiktok: 'https://www.tiktok.com/@khaby.lame/video/7137423965982592302',
  instagram: 'https://www.instagram.com/reel/C0xYqz1o9Ct/',
  facebook: 'https://www.facebook.com/watch?v=1033417477460322',
  twitter: 'https://x.com/NASA/status/1580000000000000000',
  pinterest: 'https://pin.it/4CVodSq',
  youtube: 'https://youtu.be/dQw4w9WgXcQ',
  threads: 'https://www.threads.net/@zuck/post/C0abc'
};
/** Check every provider once. ALIVE = server answered with JSON (HTTP 200); it does not prove the sample link works. */
async function checkAll() {
  const rows = [];
  const list = allProviders();
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const p = list[i++];
      const plat = p.platforms.includes('*') ? 'youtube' : p.platforms[0];
      const url = SAMPLES[plat] || SAMPLES.youtube;
      const t0 = Date.now();
      try {
        const json = await getJson(p.u(url, plat), 12000);
        const got = !!extract(json, url);
        rows.push({ id: p.id, platform: plat, state: got ? 'WORKING' : 'ALIVE', ms: Date.now() - t0 });
        mark(p.id, true);
      } catch (e) {
        rows.push({ id: p.id, platform: plat, state: 'DEAD', ms: Date.now() - t0, err: String(e.message).slice(0, 30) });
        mark(p.id, false);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

function addProvider(platform, template) {
  const list = readJson(CUSTOM_FILE, []);
  const id = 'custom' + (list.length + 1);
  list.push({ id, platforms: [platform], url: template });
  writeJson(CUSTOM_FILE, list);
  return id;
}
function removeProvider(id) {
  const list = readJson(CUSTOM_FILE, []);
  const n = list.filter((c) => c.id !== id);
  writeJson(CUSTOM_FILE, n);
  return n.length !== list.length;
}
function listCustom() { return readJson(CUSTOM_FILE, []); }

module.exports = { detectPlatform, isUrl, download, sendResult, checkAll, addProvider, removeProvider, listCustom, extract, allProviders, providersFor, PLATFORMS, fxtwitter };
