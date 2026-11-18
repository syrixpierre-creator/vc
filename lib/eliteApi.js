const { isBadPayload, cleanText } = require('./safeResponse');
/**
 * EliteProTech API client — https://eliteprotech-apis.zone.id
 * VERIFIED 2026-11-14 against the live dashboard catalog
 * (https://eliteprotech-apis.zone.id/endpoint) + live probe of all 61
 * endpoints. Only endpoints that returned real data are listed here.
 * Working: 28 (AI text, image gen, TTS, screenshot, OCR, QR scan,
 * webcopier, Shazam, YTMP3/YTMP4, YT search, lyrics, currency,
 * GitHub/TikTok stalk, font, firelogo, image search).
 * Dead (404/500/timeout on probe, NOT in this map): asyntai, imagine,
 * toprompt, flux, ephoto, qr, getpp, fetchpage, apk, wallpaper, fdriod,
 * tempemail, ytdown, x, aio3, spotify, facebook, mediafire, instagram,
 * tiktok, threads, sps, applemusic, igsearch, gsmarena, soundcloud,
 * bible, transcript, countries, vocalremove, insult (Cloudflare block).
 * NSFW endpoints from the catalog are deliberately excluded.
 */
const https = require('https');
const http = require('http');

let BASE = process.env.ELITE_API_BASE || 'https://eliteprotech-apis.zone.id';
let ELITE_KEY = process.env.ELITE_API_KEY || '';
try {
  const cfg = require('../config');
  if (cfg.ELITE_API_BASE) BASE = cfg.ELITE_API_BASE;
  if (cfg.ELITE_API_KEY) ELITE_KEY = cfg.ELITE_API_KEY;
} catch (_) {}

/** Verified endpoints — path + accepted params. binary: returns image/audio. */
const ENDPOINTS = {
  // AI (text) — all verified live
  gemini: { path: 'ai/notegpt', params: ['prompt', 'text', 'q'], cat: 'ai' },
  chatgpt: { path: 'ai/chatgpt', params: ['prompt', 'text', 'q'], cat: 'ai' },
  gpt: { path: 'ai/chatgpt', params: ['prompt', 'text', 'q'], cat: 'ai' },
  llama: { path: 'ai/deepseekai', params: ['prompt', 'text', 'q'], cat: 'ai' },
  blackbox: { path: 'ai/deepseekai', params: ['prompt', 'text', 'q'], cat: 'ai' },
  ai: { path: 'ai/talkai', params: ['q', 'text', 'prompt'], cat: 'ai' },
  bard: { path: 'ai/talkai', params: ['q', 'text', 'prompt'], cat: 'ai' },
  claude: { path: 'ai/deepseekai', params: ['prompt', 'text', 'q'], cat: 'ai' },
  talkai: { path: 'ai/talkai', params: ['q', 'text', 'prompt'], cat: 'ai' },
  notegpt: { path: 'ai/notegpt', params: ['prompt', 'text', 'q'], cat: 'ai' },
  deepseekai: { path: 'ai/deepseekai', params: ['prompt', 'text', 'q'], cat: 'ai' },
  story: { path: 'ai/story', params: ['text', 'prompt', 'q'], cat: 'ai' },
  mathgpt: { path: 'ai/mathgpt', params: ['q', 'text'], cat: 'ai' },
  airmore: { path: 'ai/airmore', params: ['text', 'voice'], cat: 'ai' },
  // Image (binary)
  imagine: { path: 'ai/zonerai', params: ['prompt', 'text'], cat: 'image', binary: true },
  zonerai: { path: 'ai/zonerai', params: ['prompt', 'text'], cat: 'image', binary: true },
  pollinationai: { path: 'ai/pollinationai', params: ['prompt', 'text'], cat: 'image', binary: true },
  flux: { path: 'ai/pollinationai', params: ['prompt', 'text'], cat: 'image', binary: true },
  imagesearch: { path: 'image/image', params: ['q', 'text'], cat: 'image' },
  firelogo: { path: 'image/firelogo', params: ['text'], cat: 'image' },
  // Tools
  ssweb: { path: 'tools/ssweb', params: ['url'], cat: 'tools', binary: true },
  qrscan: { path: 'tools/qrscan', params: ['url'], cat: 'tools' },
  ocr: { path: 'tools/ocr', params: ['url'], cat: 'tools' },
  webcopier: { path: 'tools/webcopier', params: ['url'], cat: 'tools' },
  shazam: { path: 'tools/shazam', params: ['url'], cat: 'tools' },
  // Fun
  font: { path: 'fun/font', params: ['text'], cat: 'tools' },
  // Download
  ytmp3: { path: 'download/ytmp3', params: ['url'], cat: 'download' },
  ytmp4: { path: 'download/ytmp4', params: ['url'], cat: 'download' },
  ytdl: { path: 'download/ytmp4', params: ['url'], cat: 'download' },
  youtube: { path: 'download/ytmp4', params: ['url'], cat: 'download' },
  // Search
  ytsearch: { path: 'search/ytsearch', params: ['q', 'text'], cat: 'search' },
  lyrics: { path: 'search/lyrics', params: ['query', 'q', 'text'], cat: 'search' },
  currency: { path: 'search/currency', params: ['amount', 'from', 'to'], cat: 'search' },
  currencylist: { path: 'search/currency?currencies=true', params: [], cat: 'search' },
  githubstalk: { path: 'search/githubstalk', params: ['user', 'username', 'q'], cat: 'search' },
  ghstalk: { path: 'search/githubstalk', params: ['user', 'username', 'q'], cat: 'search' },
  tiktokstalk: { path: 'search/tiktokstalk', params: ['username', 'user', 'q'], cat: 'search' },
  ttstalk: { path: 'search/tiktokstalk', params: ['username', 'user', 'q'], cat: 'search' },
};

function buildUrl(name, userInput = {}) {
  const ep = ENDPOINTS[name];
  if (!ep) throw new Error('Unknown endpoint: ' + name);
  const u = new URL(BASE.replace(/\/$/, '') + '/' + ep.path.replace(/^\//, ''));
  const input = typeof userInput === 'string' ? { text: userInput, q: userInput, prompt: userInput, url: userInput, query: userInput } : { ...userInput };
  for (const p of ep.params) {
    if (input[p] !== undefined && input[p] !== '') u.searchParams.set(p, String(input[p]));
  }
  if (input.text && !u.searchParams.has('text')) u.searchParams.set('text', input.text);
  if (input.q && !u.searchParams.has('q')) u.searchParams.set('q', input.q);
  if (input.url && !u.searchParams.has('url')) u.searchParams.set('url', input.url);
  if (ELITE_KEY) {
    u.searchParams.set('apikey', ELITE_KEY);
    u.searchParams.set('key', ELITE_KEY);
    u.searchParams.set('apiKey', ELITE_KEY);
  }
  return u.toString();
}

function get(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
        try {
          if (data.includes('<!DOCTYPE') || data.includes('<html') || data.includes('window.location')) {
            reject(new Error('API returned HTML (endpoint down or wrong path)'));
            return;
          }
          resolve(JSON.parse(data));
        } catch {
          if (data.includes('<!DOCTYPE') || data.includes('<html') || data.includes('window.location')) {
            reject(new Error('API returned HTML (endpoint down or wrong path)'));
          } else resolve({ result: data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function getBuffer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.2' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      const ct = String(res.headers['content-type'] || '');
      if (ct.includes('text/html')) return reject(new Error('API returned HTML (endpoint down)'));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function call(name, userInput = {}) {
  const data = await get(buildUrl(name, userInput));
  if (data && typeof data === 'object') {
    for (const k of ['result', 'response', 'message', 'data', 'text']) {
      if (data[k] != null) {
        const c = cleanText(data[k]);
        if (!c) delete data[k];
        else data[k] = c;
      }
    }
  } else if (typeof data === 'string' && isBadPayload(data)) {
    throw new Error('Bad API payload');
  }
  return data;
}

/** Raw JSON (no sanitizing) — for structured responses (downloads, search, stalk). */
async function callRaw(name, userInput = {}) {
  // v2.4.0 speed: currency rates slow-changing hote hain — 30min cache
  if (name === 'currency' || name === 'currencylist') {
    const cache = require('./fastCache');
    const key = 'elite:' + name + ':' + JSON.stringify(userInput);
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const data = await get(buildUrl(name, userInput));
    cache.set(key, data, 30 * 60 * 1000);
    return data;
  }
  return get(buildUrl(name, userInput));
}

/** Binary (image/audio) endpoints — returns a Buffer. */
async function callBuffer(name, userInput = {}) {
  return getBuffer(buildUrl(name, userInput));
}

/** AirMore TTS — returns the mp3 audio URL (signed, ~1h valid) or null. */
async function tts(text, voice) {
  const d = await callRaw('airmore', { text, voice: voice || 'ChristopherMultilingual' });
  return (d && d.result && d.result.audio_url) || null;
}

function listByCategory() {
  const cats = {};
  for (const [name, ep] of Object.entries(ENDPOINTS)) {
    if (!cats[ep.cat]) cats[ep.cat] = [];
    cats[ep.cat].push(name);
  }
  return cats;
}

module.exports = { BASE, ENDPOINTS, call, callRaw, callBuffer, get, getBuffer, tts, listByCategory };
