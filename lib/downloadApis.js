/**
 * QUEEN AKUMA v2.6.1 - download APIs (rewritten v2.6.0, extended v2.6.1)
 * LIVE-PROBED 2026-11-14 from this VM (36 providers + Elite + new candidates):
 *  - qasimdev base (api.qasimdev.dpdns.org) DEAD: spotify 401, youtube mp3/mp4
 *    routes 404, /api/<platform>/download 500. It stays ONLY as last resort.
 *  - WORKING now: EliteProTech YT mp3/mp4/search, tikwm (TikTok),
 *    noobs-alldl-top (TikTok + Facebook, latency flaky).
 *  - v2.6.2 (GitHub hunt, live 2026-11-14): David Cyril ytmp4/tiktok,
 *    Cobalt community instance (cjs.nz) LAST-resort only - Cobalt docs
 *    say hosted instances are not for use in other projects without
 *    permission, so it is never primary.
 *  - v2.6.1: izumi/yupra (VM-ambiguous, Elite ke baad fallback), siputzx
 *    ytmp3/tiktok last-resort, tiktok-downbloder TikTok 3rd fallback.
 *    siputzx igdl 404 DEAD - chain se hataya.
 *  - NO working no-key API found for: Instagram, Twitter/X, Pinterest,
 *    Threads, Spotify full-track. Those commands fail gracefully and say so
 *    (user can add their own provider with .addapi - see lib/mediaDownloader).
 * Chain order: verified-first, dead-last. Every function normalizes to
 * { download, url, link, audio, mp3, title, thumbnail } so ALL callers work
 * (100+ generic handlers call .ytmp / .song which never existed before v2.6.0).
 */
const axios = require('axios');

let apiReg;
try { apiReg = require('./apiRegistry'); } catch (_) { apiReg = null; }

function runtime() {
  if (apiReg && apiReg.getRuntimeConfig) return apiReg.getRuntimeConfig();
  return {
    base: process.env.DEMON_API_BASE || 'https://api.qasimdev.dpdns.org',
    key: process.env.DEMON_API_KEY || 'qasim-dev'
  };
}

const http = axios.create({
  timeout: 45000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/json, text/plain, */*'
  },
  validateStatus: (s) => s < 500
});

async function tryGet(url) {
  try {
    const r = await http.get(url);
    if (r.status >= 400) return null;
    return r.data;
  } catch {
    return null;
  }
}

function pickUrl(obj, keys = []) {
  if (!obj) return null;
  if (typeof obj === 'string' && /^https?:\/\//i.test(obj)) return obj;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
    if (Array.isArray(v) && v[0]) {
      const u = pickUrl(v[0], keys);
      if (u) return u;
    }
    if (v && typeof v === 'object') {
      const u = pickUrl(v, keys);
      if (u) return u;
    }
  }
  return null;
}

/** Normalize any audio/video result so every caller shape works. */
function norm(mediaUrl, extra = {}) {
  if (!mediaUrl) return null;
  const out = {
    download: mediaUrl,
    url: mediaUrl,
    link: mediaUrl,
    audio: mediaUrl,
    mp3: mediaUrl,
    mediaUrl,
    title: extra.title || 'Media',
    thumbnail: extra.thumbnail || extra.cover || '',
    source: extra.source || 'api'
  };
  if (extra.artist) out.artist = extra.artist;
  if (extra.cover) out.cover = extra.cover;
  // v2.8.9 rich card metadata (YouTube search / ytmp3 se aata hai)
  if (extra.views != null) out.views = extra.views;
  if (extra.channel) out.channel = extra.channel;
  if (extra.author) out.author = extra.author;
  if (extra.authorUrl) out.authorUrl = extra.authorUrl;
  if (extra.duration) out.duration = extra.duration;
  if (extra.uploaded) out.uploaded = extra.uploaded;
  if (extra.videoId) out.videoId = extra.videoId;
  if (extra.album) out.album = extra.album;
  return out;
}

/** Views ko Indian style me format karo: 512415019 -> "51.24 Cr". */
function formatViews(n) {
  const v = Number(n);
  if (!v || v <= 0) return '';
  if (v >= 1e7) return (v / 1e7).toFixed(2).replace(/\.00$/, '') + ' Cr';
  if (v >= 1e5) return (v / 1e5).toFixed(1).replace(/\.0$/, '') + ' Lakh';
  if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(v);
}

/** Video ID nikalo (youtube.com/watch?v= / youtu.be/ / raw id). */
function extractVideoId(input) {
  if (!input) return '';
  const m = String(input).match(/(?:v=|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(String(input).trim())) return String(input).trim();
  return '';
}

/**
 * Rich song/video card caption (v2.8.9) — .play / .song / .ytmp3 / .ytmp4 sab
 * yahi format use karte hain: title + singer + channel + views + duration.
 * Jo field available nahi hai wo line skip ho jati hai (koi fake data nahi).
 */
function songCaption(meta = {}) {
  const lines = [];
  lines.push(`🎵 *${meta.title || 'Song'}*`);
  if (meta.artist) lines.push(`👤 Singer: ${meta.artist}`);
  if (meta.channel) lines.push(`📺 Channel: ${meta.channel}`);
  else if (meta.author) lines.push(`📺 Channel: ${meta.author}`);
  if (meta.views != null && Number(meta.views) > 0) lines.push(`👁️ Views: ${formatViews(meta.views)}`);
  if (meta.duration) lines.push(`⏱️ Duration: ${meta.duration}`);
  if (meta.uploaded) lines.push(`📅 Uploaded: ${meta.uploaded}`);
  if (meta.album) lines.push(`💿 Album: ${meta.album}`);
  if (meta.source) lines.push(`✅ Source: ${meta.source}`);
  return lines.join('\n');
}

function fromRegistry(name, vars) {
  if (apiReg && apiReg.resolveUrl) {
    const u = apiReg.resolveUrl(name, vars);
    if (u) return u;
  }
  return null;
}

/* ---------- EliteProTech (verified live 2026-11-14) ---------- */
function elite() {
  try { return require('./eliteApi'); } catch (_) { return null; }
}

async function eliteYtmp3(url) {
  const e = elite();
  if (!e) return null;
  try {
    const d = await e.callRaw('ytmp3', { url });
    const dl = d && d.download;
    const link = dl && (dl.downloadUrl || dl.url);
    if (!link) return null;
    return norm(link, {
      title: dl.title,
      thumbnail: dl.thumbnail,
      duration: dl.duration || '',
      videoId: extractVideoId(url),
      source: 'elite-ytmp3'
    });
  } catch (_) { return null; }
}

async function eliteYtmp4(url) {
  const e = elite();
  if (!e) return null;
  try {
    const d = await e.callRaw('ytmp4', { url });
    const link = (d && d.result && (d.result.url || d.result.downloadUrl)) || (d && d.url);
    if (!link) return null;
    const r = (d && d.result) || {};
    return norm(link, {
      title: r.title || 'YouTube',
      thumbnail: r.thumbnail || r.thumb || '',
      duration: r.duration || '',
      videoId: extractVideoId(url),
      source: 'elite-ytmp4'
    });
  } catch (_) { return null; }
}

function ytMetaOf(v) {
  if (!v || !v.url) return null;
  const author = v.author || {};
  return {
    url: v.url,
    title: v.title,
    thumbnail: v.thumbnail,
    videoId: v.id || extractVideoId(v.url),
    duration: v.duration || '',
    views: v.views != null ? Number(v.views) : null,
    uploaded: v.uploaded || '',
    channel: author.name || v.channel || '',
    author: author.name || '',
    authorUrl: author.url || ''
  };
}

async function eliteYtSearch(query) {
  const e = elite();
  if (!e) return null;
  try {
    const d = await e.callRaw('ytsearch', { q: query });
    const vids = (d && d.results && d.results.videos) || (d && d.videos) || [];
    const first = Array.isArray(vids) ? vids[0] : null;
    if (!first || !first.url) return null;
    // v2.8.9: full metadata — views, channel (author), duration, uploaded
    return ytMetaOf(first);
  } catch (_) { return null; }
}

/** v2.8.9: ytsearch ke top results (metadata ke saath) — enrich ke liye. */
async function eliteYtSearchAll(query, limit = 8) {
  const e = elite();
  if (!e) return [];
  try {
    const d = await e.callRaw('ytsearch', { q: query });
    const vids = (d && d.results && d.results.videos) || (d && d.videos) || [];
    if (!Array.isArray(vids)) return [];
    return vids.slice(0, limit).map(ytMetaOf).filter(Boolean);
  } catch (_) { return []; }
}

/**
 * v2.8.9: ek YT result ko ytsearch se enrich karo — views/channel/duration/
 * uploaded add karo (ytmp3/ytmp4 response me ye fields nahi hote).
 * Best-effort: fail ho to original result hi return karta hai (koi error nahi).
 * VideoId se match dhoondhta hai (top 8 results scan) — title search ka top
 * result aksar alag video hota hai, isliye sirf top-1 lena galat hoga.
 */
async function enrichYtMeta(result) {
  if (!result) return result;
  if (result.views != null && result.channel) return result;
  try {
    const rid = result.videoId || extractVideoId(result.url) || '';
    const q = result.title || '';
    if (!q && !rid) return result;
    // 1) videoId se search (exact match milne ki sabse zyada chance)
    let found = null;
    if (rid) {
      const byId = await eliteYtSearchAll(rid, 5);
      found = byId.find((v) => v.videoId === rid) || null;
    }
    // 2) title se search, top results me videoId dhoondho
    if (!found && q) {
      const byTitle = await eliteYtSearchAll(q, 8);
      found = byTitle.find((v) => rid && v.videoId === rid)
        || (rid ? null : byTitle[0] || null);
    }
    if (!found) return result;
    const merged = { ...found, ...result };
    if (found.views != null) merged.views = found.views;
    if (found.channel) merged.channel = found.channel;
    if (found.author) merged.author = found.author;
    if (found.authorUrl) merged.authorUrl = found.authorUrl;
    if (found.duration) merged.duration = found.duration;
    if (found.uploaded) merged.uploaded = found.uploaded;
    if (!merged.thumbnail && found.thumbnail) merged.thumbnail = found.thumbnail;
    if (!merged.title || merged.title === 'Media') merged.title = found.title;
    return merged;
  } catch (_) {
    return result;
  }
}

/* ---------- v2.6.1 fallbacks (VM-ambiguous: conn closed is VM se, host pe chal sakte hain) ---------- */
async function izumiYtmp3(url) {
  try {
    const d = await tryGet(`https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`);
    const link = d && d.result && d.result.download;
    if (!link) return null;
    return norm(link, { title: (d.result && d.result.title) || 'Audio', thumbnail: d.result && d.result.thumbnail, source: 'izumi' });
  } catch (_) { return null; }
}
async function izumiSong(query) {
  try {
    const d = await tryGet(`https://izumiiiiiiii.dpdns.org/downloader/youtube-play?query=${encodeURIComponent(query)}`);
    const link = d && d.result && d.result.download;
    if (!link) return null;
    return norm(link, { title: (d.result && d.result.title) || query, thumbnail: d.result && d.result.thumbnail, source: 'izumi-play' });
  } catch (_) { return null; }
}
async function yupraYtmp3(url) {
  try {
    const d = await tryGet(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`);
    if (!d || !d.success || !d.data || !d.data.download_url) return null;
    return norm(d.data.download_url, { title: d.data.title, thumbnail: d.data.thumbnail, source: 'yupra' });
  } catch (_) { return null; }
}
async function yupraYtmp4(url) {
  try {
    const d = await tryGet(`https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`);
    if (!d || !d.success || !d.data || !d.data.download_url) return null;
    return norm(d.data.download_url, { title: d.data.title, thumbnail: d.data.thumbnail, source: 'yupra-mp4' });
  } catch (_) { return null; }
}
async function siputzxYtmp3(url) {
  try {
    const d = await tryGet(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`);
    if (!d) return null;
    const link = pickUrl(d, ['download', 'url', 'link', 'audio', 'mp3']);
    if (!link) return null;
    return norm(link, { title: (d.data && d.data.title) || d.title || 'Audio', source: 'siputzx' });
  } catch (_) { return null; }
}
async function tiktokDownbloder(url) {
  try {
    const d = await tryGet(`https://tiktok-downbloder.vercel.app/?url=${encodeURIComponent(url)}`);
    if (!d) return null;
    const video = pickUrl(d, ['video', 'play', 'download', 'url']);
    const music = pickUrl(d, ['music', 'audio']);
    if (!video && !music) return null;
    return { title: 'TikTok', thumbnail: '', mediaUrl: video || '', audioUrl: music || '', source: 'tiktok-downbloder' };
  } catch (_) { return null; }
}

/* ---------- v2.6.2 (GitHub hunt, live 2026-11-14) ---------- */
async function dcYtmp4(url) {
  try {
    const d = await tryGet(`https://apis.davidcyril.name.ng/download/ytmp4?url=${encodeURIComponent(url)}`);
    const r = d && d.result;
    const link = r && (r.download_url || r.downloadUrl || r.url);
    if (!link) return null;
    return norm(link, { title: r.title, thumbnail: r.thumbnail, source: 'dc-ytmp4' });
  } catch (_) { return null; }
}
async function dcTiktok(url) {
  try {
    const d = await tryGet(`https://apis.davidcyril.name.ng/download/tiktok?url=${encodeURIComponent(url)}`);
    const r = d && d.result;
    if (!r || !r.video) return null;
    const author = (r.author && (r.author.nickname || r.author.unique_id)) || '';
    return { title: author ? 'TikTok - ' + author : 'TikTok', thumbnail: (r.cover || ''), mediaUrl: r.video, audioUrl: r.music || '', source: 'dc-tiktok' };
  } catch (_) { return null; }
}
/**
 * Cobalt community instance - LAST RESORT ONLY.
 * Cobalt docs: hosted instances are not meant for use in other projects
 * without permission, so this is never tried before the verified providers.
 * POST {"url","downloadMode":"auto"} -> {status:"tunnel"|"redirect", url, filename}
 * YT is slow here (~15s), TT/X fast (~1.5s).
 */
async function cobaltDownload(url) {
  try {
    const r = await http.post('https://cobaltapi.cjs.nz/', { url, downloadMode: 'auto' }, { timeout: 30000, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, validateStatus: (st) => st < 500 });
    const d = r && r.data;
    if (!d || (d.status !== 'tunnel' && d.status !== 'redirect') || !d.url) return null;
    return { title: d.filename || 'Media', thumbnail: '', mediaUrl: d.url, audioUrl: '', source: 'cobalt-cjs' };
  } catch (_) { return null; }
}

/* ---------- YouTube audio: URL or plain song name ---------- */
async function youtubeAudio(queryOrUrl) {
  const { base, key } = runtime();
  const isUrl = /^https?:\/\//i.test(queryOrUrl);
  if (isUrl) {
    // 1) Elite ytmp3 (verified live) + views/channel enrich (best-effort)
    const e = await eliteYtmp3(queryOrUrl);
    if (e) return await enrichYtMeta(e);
    // 2) v2.6.1 fallbacks (VM-ambiguous, host pe chal sakte hain)
    const iz = await izumiYtmp3(queryOrUrl);
    if (iz) return iz;
    const yu = await yupraYtmp3(queryOrUrl);
    if (yu) return yu;
    const sx = await siputzxYtmp3(queryOrUrl);
    if (sx) return sx;
    // 3) registry / legacy qasimdev (dead as of 2026-11-14, kept as last resort)
    const reg = fromRegistry('ytmp3', { url: queryOrUrl }) ||
      `${base}/api/youtube/mp3?apiKey=${encodeURIComponent(key)}&url=${encodeURIComponent(queryOrUrl)}`;
    const data = await tryGet(reg);
    if (data) {
      const d = data.data || data;
      const link = pickUrl(d, ['download', 'url', 'link', 'audio', 'music', 'dl']);
      if (link) return norm(link, { title: d.title, thumbnail: d.thumbnail, source: 'qasim' });
    }
    return null;
  }
  // plain song name: search YouTube first, then convert
  const found = await eliteYtSearch(queryOrUrl);
  if (found) {
    const e = await eliteYtmp3(found.url);
    if (e) {
      // v2.8.9: search ka full metadata (views/channel/duration/uploaded)
      // convert result me merge karo — .play ko rich card ke liye chahiye.
      e.title = e.title && e.title !== 'Media' ? e.title : found.title;
      if (!e.thumbnail && found.thumbnail) e.thumbnail = found.thumbnail;
      if (found.views != null) e.views = found.views;
      if (found.channel) e.channel = found.channel;
      if (found.author) e.author = found.author;
      if (found.authorUrl) e.authorUrl = found.authorUrl;
      if (found.duration) e.duration = found.duration;
      if (found.uploaded) e.uploaded = found.uploaded;
      if (found.videoId) e.videoId = found.videoId;
      return e;
    }
    const iz2 = await izumiYtmp3(found.url);
    if (iz2) return iz2;
    const yu2 = await yupraYtmp3(found.url);
    if (yu2) return yu2;
  }
  const izq = await izumiSong(queryOrUrl);
  if (izq) return izq;
  const reg = fromRegistry('song', { query: queryOrUrl }) ||
    `${base}/api/youtube/mp3?apiKey=${encodeURIComponent(key)}&query=${encodeURIComponent(queryOrUrl)}`;
  const data = await tryGet(reg);
  if (data) {
    const d = data.data || data;
    const link = pickUrl(d, ['download', 'url', 'link', 'audio', 'music', 'dl']);
    if (link) return norm(link, { title: d.title, thumbnail: d.thumbnail, source: 'qasim' });
  }
  return null;
}

/* ---------- YouTube video ---------- */
async function youtubeVideo(url) {
  const e = await eliteYtmp4(url);
  if (e) return await enrichYtMeta(e);
  const yu = await yupraYtmp4(url);
  if (yu) return yu;
  const dc = await dcYtmp4(url);
  if (dc) return dc;
  const any = await downloadAny(url);
  if (any && any.mediaUrl) return norm(any.mediaUrl, { title: any.title, thumbnail: any.thumbnail, source: any.source || 'downloadAny' });
  return null;
}

/* Aliases so the 100+ generic handlers calling .ytmp/.song finally work. */
const ytmp = youtubeAudio;
const ytmp3 = youtubeAudio;
const song = youtubeAudio;
const ytmp4 = youtubeVideo;

async function spotifySearch(query) {
  const { base, key } = runtime();
  const reg =
    fromRegistry('play', { query }) ||
    fromRegistry('spotify', { query }) ||
    `${base}/api/spotify/search?apiKey=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}`;
  const data = await tryGet(reg);
  if (!data || data.success === false) return null;
  return data.data || data;
}

async function spotifyDownload(trackUrl) {
  const { base, key } = runtime();
  const reg =
    fromRegistry('spotify', { url: trackUrl }) ||
    `${base}/api/spotify/download?apiKey=${encodeURIComponent(key)}&url=${encodeURIComponent(trackUrl)}`;
  const data = await tryGet(reg);
  if (!data || data.success === false) return null;
  const d = data.data || data;
  return {
    title: d.title || d.name || 'Audio',
    artist: d.artist || d.author || '',
    cover: d.cover || d.thumbnail || d.image,
    download: pickUrl(d, ['download', 'url', 'link', 'audio', 'music', 'dl'])
  };
}

/**
 * Generic link download - verified providers first, then the old chain.
 * Platform sniffing decides the order; every candidate is tried in turn.
 */
async function downloadAny(url) {
  const { base, key } = runtime();
  const isYT = /youtube\.com|youtu\.be/i.test(url);
  const isTT = /tiktok\.com|vt\.tiktok|vm\.tiktok/i.test(url);
  const isFB = /facebook\.com|fb\.watch|fb\.com/i.test(url);
  const enc = encodeURIComponent(url);

  // ---- verified-first shortcuts (live 2026-11-14) ----
  if (isYT) {
    const v = await eliteYtmp4(url);
    if (v) return { title: v.title, thumbnail: v.thumbnail, mediaUrl: v.download, audioUrl: '', source: 'elite-ytmp4' };
    const a = await eliteYtmp3(url);
    if (a) return { title: a.title, thumbnail: a.thumbnail, mediaUrl: '', audioUrl: a.download, source: 'elite-ytmp3' };
    const dc = await dcYtmp4(url);
    if (dc) return { title: dc.title, thumbnail: dc.thumbnail, mediaUrl: dc.download, audioUrl: '', source: 'dc-ytmp4' };
  }
  if (isTT || isFB) {
    // noobs-alldl-top: TikTok + Facebook verified live (result = video URL)
    const noobs = await tryGet(`https://noobs-api.top/dipto/alldl?url=${enc}`);
    if (noobs) {
      const media = pickUrl(noobs, ['result', 'url', 'download', 'video', 'link']);
      const audio = noobs.mp3DownloadLink || pickUrl(noobs, ['mp3DownloadLink']);
      if (media || audio) {
        return { title: noobs.title || 'Media', thumbnail: noobs.thumbnail || '', mediaUrl: media || '', audioUrl: audio || '', source: 'noobs-alldl' };
      }
    }
  }
  if (isTT) {
    const tk = await tryGet(`https://www.tikwm.com/api/?url=${enc}&hd=1`);
    if (tk && tk.data && (tk.data.play || tk.data.hdplay || tk.data.wmplay)) {
      const d = tk.data;
      return { title: d.title || 'TikTok', thumbnail: d.cover || d.origin_cover, mediaUrl: d.hdplay || d.play || d.wmplay, audioUrl: d.music, source: 'tikwm' };
    }
    const db = await tiktokDownbloder(url);
    if (db) return db;
    const dc = await dcTiktok(url);
    if (dc) return dc;
  }

  // ---- old chain (registry first, then hardcoded fallbacks) ----
  const names = ['ytmp4', 'youtube', 'tiktok', 'instagram', 'facebook', 'twitter', 'download', 'tikwm'];
  const endpoints = [];
  for (const n of names) {
    const u = fromRegistry(n, { url, query: url });
    if (u) endpoints.push(u);
  }
  endpoints.push(
    `${base}/api/tiktok/download?apiKey=${key}&url=${enc}`,
    `${base}/api/instagram/download?apiKey=${key}&url=${enc}`,
    `${base}/api/facebook/download?apiKey=${key}&url=${enc}`,
    `${base}/api/twitter/download?apiKey=${key}&url=${enc}`,
    `${base}/api/youtube/mp4?apiKey=${key}&url=${enc}`,
    `${base}/api/loaderto/download?apiKey=${key}&url=${enc}`,
    `https://api.siputzx.my.id/api/d/tiktok?url=${enc}`,
    `https://www.tikwm.com/api/?url=${enc}`
  );

  const seen = new Set();
  for (const ep of endpoints) {
    if (!ep || seen.has(ep)) continue;
    seen.add(ep);
    const data = await tryGet(ep);
    if (!data) continue;
    if (data.data && (data.data.play || data.data.wmplay || data.data.music)) {
      const d = data.data;
      return {
        title: d.title || 'Media',
        thumbnail: d.cover || d.origin_cover,
        mediaUrl: d.play || d.wmplay,
        audioUrl: d.music,
        source: 'tikwm'
      };
    }
    const mediaUrl = pickUrl(data, ['url', 'download', 'video', 'media', 'link', 'result', 'data']);
    if (mediaUrl) {
      return {
        title: data.title || data.data?.title || 'Media',
        thumbnail: data.thumbnail || data.data?.thumbnail,
        mediaUrl,
        source: 'api'
      };
    }
  }
  // ---- LAST RESORT: Cobalt community instance (never primary, see note above) ----
  const cb = await cobaltDownload(url);
  if (cb) return cb;
  return null;
}

module.exports = {
  spotifySearch,
  spotifyDownload,
  youtubeAudio,
  youtubeVideo,
  ytmp,
  ytmp3,
  ytmp4,
  song,
  downloadAny,
  eliteYtmp3,
  eliteYtmp4,
  eliteYtSearch,
  enrichYtMeta,
  eliteYtSearchAll,
  songCaption,
  formatViews,
  extractVideoId,
  izumiYtmp3,
  izumiSong,
  yupraYtmp3,
  yupraYtmp4,
  siputzxYtmp3,
  tiktokDownbloder,
  dcYtmp4,
  dcTiktok,
  cobaltDownload,
  tryGet,
  pickUrl,
  runtime,
  fromRegistry
};
