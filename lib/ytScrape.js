'use strict';
/**
 * QUEEN AKUMA — YouTube by scraping (no third-party API).
 *
 *  search : yt-search (scrapes youtube.com)
 *  download: yt-dlp (downloaded automatically into ./bin on first use), and if
 *            yt-dlp fails, @distube/ytdl-core. Everything runs on the VPS itself.
 *
 * If YouTube asks your VPS to "sign in", put a cookies.txt (Netscape format,
 * exported from a logged-in browser) in the bot folder: it is used automatically.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BIN_DIR = path.join(ROOT, 'bin');
const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const MAX_MB = parseInt(process.env.YT_MAX_MB || '100', 10);

function ffmpegPath() {
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch (_) {
    try { return require('ffmpeg-static'); } catch (_) { return 'ffmpeg'; }
  }
}
const tmp = (ext) => path.join(os.tmpdir(), 'akuma-yt-' + crypto.randomBytes(6).toString('hex') + (ext ? '.' + ext : ''));
const cookies = () => ['cookies.txt', 'youtube-cookies.txt'].map((f) => path.join(ROOT, f)).find((f) => fs.existsSync(f));

function isUrl(s) { return /(?:youtube\.com|youtu\.be)\//i.test(String(s || '')); }
function videoId(s) {
  const m = String(s || '').match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(String(s || '')) ? String(s) : null);
}

/** Find a video: URL / id / words. Returns { id, url, title, author, duration, views, thumbnail } */
async function search(query) {
  const yts = require('yt-search');
  const id = videoId(query);
  let v = null;
  if (id) {
    try { v = await yts({ videoId: id }); } catch (_) {}
    if (!v) v = { videoId: id, url: 'https://www.youtube.com/watch?v=' + id, title: 'YouTube video' };
  } else {
    const r = await yts(String(query));
    v = (r && r.videos && r.videos.find((x) => x.seconds && x.seconds < 3 * 3600)) || (r && r.videos && r.videos[0]);
  }
  if (!v) return null;
  const vid = v.videoId || id;
  return {
    id: vid,
    url: 'https://www.youtube.com/watch?v=' + vid,
    title: v.title || 'YouTube video',
    author: (v.author && v.author.name) || '',
    duration: v.timestamp || (v.duration && v.duration.timestamp) || '',
    seconds: v.seconds || (v.duration && v.duration.seconds) || 0,
    views: v.views || 0,
    thumbnail: v.thumbnail || v.image || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
  };
}

// ---------- yt-dlp ----------
let ytdlpReady = null;
function which(bin) {
  return new Promise((res) => execFile('sh', ['-c', `command -v ${bin}`], (e, out) => res(e ? null : String(out).trim() || null)));
}
async function downloadFile(url, dest) {
  const axios = require('axios');
  const r = await axios.get(url, { responseType: 'arraybuffer', maxRedirects: 10, timeout: 120000 });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(r.data));
  fs.chmodSync(dest, 0o755);
}
function getYtdlp() {
  if (!ytdlpReady) {
    ytdlpReady = (async () => {
      if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) return process.env.YTDLP_PATH;
      const local = path.join(BIN_DIR, 'yt-dlp');
      if (fs.existsSync(local)) return local;
      const sys = await which('yt-dlp');
      if (sys) return sys;
      await downloadFile(YTDLP_URL, local); // standalone binary, needs python3 (present on Ubuntu)
      return local;
    })().catch((e) => { ytdlpReady = null; throw e; });
  }
  return ytdlpReady;
}
function run(bin, args, timeout) {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { timeout, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(String(stderr || err.message).trim().split('\n').slice(-2).join(' ').slice(0, 300)));
      resolve(String(stdout || ''));
    });
  });
}
let lastUpdate = 0;
async function ytdlpOnce(url, type, client) {
  const bin = await getYtdlp();
  // keep yt-dlp fresh (YouTube changes often) — at most once a day
  if (bin.startsWith(BIN_DIR) && Date.now() - lastUpdate > 864e5) { lastUpdate = Date.now(); run(bin, ['-U'], 60000).catch(() => {}); }
  const base = tmp('');
  const args = ['--no-playlist', '--no-warnings', '--no-progress', '--ffmpeg-location', ffmpegPath(),
    '--max-filesize', MAX_MB + 'M', '-o', base + '.%(ext)s'];
  const ck = cookies(); if (ck) args.push('--cookies', ck);
  if (client) args.push('--extractor-args', 'youtube:player_client=' + client);
  if (type === 'audio') args.push('-f', 'bestaudio[ext=m4a]/bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '5');
  else args.push('-f', 'bv*[height<=480][ext=mp4]+ba[ext=m4a]/b[height<=480][ext=mp4]/bv*[height<=480]+ba/b[height<=480]/b', '--merge-output-format', 'mp4');
  args.push(url);
  await run(bin, args, 5 * 60 * 1000);
  const dir = path.dirname(base), stem = path.basename(base);
  const file = fs.readdirSync(dir).map((f) => path.join(dir, f)).find((f) => path.basename(f).startsWith(stem + '.') && !/\.part$|\.ytdl$/.test(f));
  if (!file) throw new Error('yt-dlp: no file');
  return file;
}

// YouTube blocks some VPS IPs for the default web client: try other clients.
const CLIENTS = (process.env.YT_CLIENTS || ',tv_simply,web_embedded,android_vr,mweb,ios').split(',');
async function ytdlp(url, type) {
  let last;
  for (const c of CLIENTS) {
    try { return await ytdlpOnce(url, type, c.trim()); } catch (e) { last = e; if (/too big|max-filesize/i.test(e.message)) throw e; }
  }
  throw last || new Error('yt-dlp failed');
}

// ---------- @vreden/youtube_scraper (converter site, not the VPS IP) ----------
async function fetchToFile(link, type) {
  const axios = require('axios');
  const res = await axios.get(link, { responseType: 'arraybuffer', timeout: 180000, maxContentLength: MAX_MB * 1048576, headers: { 'User-Agent': 'Mozilla/5.0' } });
  const raw = tmp(type === 'audio' ? 'bin' : 'mp4');
  fs.writeFileSync(raw, Buffer.from(res.data));
  if (fs.statSync(raw).size < 1000) throw new Error('empty file');
  if (type !== 'audio') return raw;
  const mp3 = tmp('mp3');
  await run(ffmpegPath(), ['-y', '-i', raw, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', mp3], 180000);
  try { fs.unlinkSync(raw); } catch (_) {}
  return mp3;
}
async function vreden(url, type) {
  const v = require('@vreden/youtube_scraper');
  const fn = type === 'audio' ? (v.ytmp3 || v.youtubeMp3) : (v.ytmp4 || v.youtubeMp4);
  if (typeof fn !== 'function') throw new Error('vreden: no ' + type);
  const r = type === 'audio' ? await fn(url, 128) : await fn(url, 360);
  if (r && r.status === false) throw new Error('vreden: ' + (r.result || r.message || 'failed'));
  const link = findUrl(r, ['download', 'url', 'link', 'dl', type === 'audio' ? 'audio' : 'video']);
  if (!link) throw new Error('vreden: no link');
  return fetchToFile(link, type);
}

// ---------- ruhend-scraper (scrapes public converter sites) ----------
function findUrl(o, keys) {
  if (!o || typeof o !== 'object') return null;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
    if (v && typeof v === 'object') { const u = findUrl(v, ['url', 'link', 'download', ...keys]); if (u) return u; }
  }
  for (const k of ['result', 'data']) if (o[k] && typeof o[k] === 'object') { const u = findUrl(o[k], keys); if (u) return u; }
  return null;
}
async function ruhend(url, type) {
  const rs = require('ruhend-scraper');
  const fn = type === 'audio' ? rs.ytmp3 : rs.ytmp4;
  if (typeof fn !== 'function') throw new Error('ruhend: no ' + type);
  const r = await fn(url);
  const link = findUrl(r, type === 'audio' ? ['audio', 'mp3', 'download', 'dl', 'url', 'link'] : ['video', 'mp4', 'download', 'dl', 'url', 'link']);
  if (!link) throw new Error('ruhend: no link');
  const axios = require('axios');
  const res = await axios.get(link, { responseType: 'arraybuffer', timeout: 180000, maxContentLength: MAX_MB * 1048576, headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buf = Buffer.from(res.data);
  const raw = tmp(type === 'audio' ? 'bin' : 'mp4');
  fs.writeFileSync(raw, buf);
  if (type !== 'audio') return raw;
  const mp3 = tmp('mp3');
  await run(ffmpegPath(), ['-y', '-i', raw, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', mp3], 180000);
  try { fs.unlinkSync(raw); } catch (_) {}
  return mp3;
}

// ---------- @distube/ytdl-core (fallback) ----------
async function ytdlCore(url, type) {
  let ytdl;
  try { ytdl = require('@distube/ytdl-core'); } catch (_) { ytdl = require('ytdl-core'); }
  const out = tmp(type === 'audio' ? 'm4a' : 'mp4');
  const opts = type === 'audio' ? { filter: 'audioonly', quality: 'highestaudio' } : { filter: (f) => f.hasAudio && f.hasVideo && f.container === 'mp4', quality: 'highest' };
  await new Promise((resolve, reject) => {
    const s = ytdl(url, opts);
    const w = fs.createWriteStream(out);
    let size = 0;
    s.on('data', (c) => { size += c.length; if (size > MAX_MB * 1048576) s.destroy(new Error('file too big')); });
    s.on('error', reject); w.on('error', reject); w.on('finish', resolve);
    s.pipe(w);
  });
  if (type !== 'audio') return out;
  const mp3 = tmp('mp3');
  await run(ffmpegPath(), ['-y', '-i', out, '-vn', '-c:a', 'libmp3lame', '-b:a', '128k', mp3], 180000);
  try { fs.unlinkSync(out); } catch (_) {}
  return mp3;
}

/** Download as 'audio' (mp3) or 'video' (mp4). Returns a file path (delete it after use). */
async function download(url, type = 'audio') {
  const errors = [];
  for (const fn of [vreden, ytdlp, ruhend, ytdlCore]) {
    try {
      const f = await fn(url, type);
      if (f && fs.existsSync(f) && fs.statSync(f).size > 1000) return f;
    } catch (e) { errors.push((fn.name || '?') + ': ' + e.message); }
  }
  console.error('[yt] all methods failed:', errors.join(' | ').slice(0, 900));
  const msg = errors.join(' | ');
  const err = new Error(/sign in|bot|cookies/i.test(msg) ? 'blocked' : /too big|max-filesize|larger than/i.test(msg) ? 'too-big' : 'failed');
  err.detail = msg;
  throw err;
}

module.exports = { search, download, isUrl, videoId };
