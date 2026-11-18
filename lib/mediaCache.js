/**
 * QUEEN AKUMA • mediaCache — in-memory cache for remote menu media (v2.4.0, speed)
 * Problem: har .menu call pe bot Catbox se 2.6MB photo / 12MB video dobara
 * download karta tha (Baileys ko bytes chahiye hote hain) + _menu.js har baar
 * photo download karke sharp se 300px thumbnail banata tha. Isse .menu 2-5s
 * slow ho jata tha. Ab pehli baar download karke Buffer memory me rakhte
 * hain (6h TTL) — agle .menu calls instant hote hain.
 * .customize menuimage / .setbot se URL badle to clearMediaCache() call karo.
 */
const https = require('https');
const http = require('http');
const { isUrl, resolveMedia } = require('./mediaSource');

const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cache = new Map(); // url -> { buf, t }
const thumbCache = new Map(); // url -> { buf, t }
const pending = new Map(); // url -> Promise (ek hi download ek saath)

function get(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.4' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/** Remote URL ka Buffer — pehli baar download, phir memory se (6h TTL). */
async function getMediaBuffer(url) {
  if (!url) return null;
  if (!isUrl(url)) { const b = resolveMedia(url); return Buffer.isBuffer(b) ? b : null; } // fichier local
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < TTL_MS && hit.buf && hit.buf.length > 500) return hit.buf;
  if (pending.has(url)) { try { return await pending.get(url); } catch { return null; } }
  const p = get(url).then((buf) => {
    if (buf && buf.length > 500) cache.set(url, { buf, t: Date.now() });
    pending.delete(url);
    return buf && buf.length > 500 ? buf : null;
  }).catch(() => { pending.delete(url); return null; });
  pending.set(url, p);
  return p;
}

/** Menu location thumbnail (300px JPEG) — download + resize ek baar, phir cached. */
async function getMenuThumb(url) {
  if (!url) return null;
  if (!isUrl(url)) { const b = resolveMedia(url); if (!Buffer.isBuffer(b)) return null; try { return await require('sharp')(b).resize({ width: 300 }).jpeg({ quality: 80 }).toBuffer(); } catch { return b; } }
  const hit = thumbCache.get(url);
  if (hit && Date.now() - hit.t < TTL_MS && hit.buf && hit.buf.length > 100) return hit.buf;
  const buf = await getMediaBuffer(url);
  if (!buf) return null;
  try {
    const sharp = require('sharp');
    const thumb = await sharp(buf).resize({ width: 300 }).jpeg({ quality: 80 }).toBuffer();
    thumbCache.set(url, { buf: thumb, t: Date.now() });
    return thumb;
  } catch {
    return buf; // sharp fail ho to raw buffer hi de do
  }
}

/**
 * resolveMedia ka fast version (async):
 * URL -> cached Buffer (pehli baar download, phir instant); download fail ho
 * to { url } fallback (pehle jaisa behaviour). Local file -> Buffer (sync).
 */
async function resolveMediaFast(value) {
  if (!value || typeof value !== 'string') return null;
  if (!isUrl(value)) return resolveMedia(value);
  const buf = await getMediaBuffer(value);
  return buf || { url: value };
}

/**
 * v3.6.1 — URL reachable hai ya nahi, chhota HEAD probe (default 3s).
 * Catbox jaise host down/blackhole ho to Baileys ka URL send bina timeout
 * ke atak jata hai (.menu ka jawab hi nahi aata) — isliye bhejne se PEHLE
 * probe karo. 405 bhi "host up" mana (kuch CDN HEAD allow nahi karte).
 * Koi throw nahi — fail = false.
 */
function probeUrl(url, ms = 3000) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    if (!isUrl(url)) return resolve(Buffer.isBuffer(resolveMedia(url))); // fichier local
    const lib = url.startsWith('https') ? https : http;
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    let req = null;
    try {
      req = lib.request(url, { method: 'HEAD', timeout: ms, headers: { 'User-Agent': 'QUEEN-AKUMA/2.4' } }, (res) => {
        try { res.resume(); } catch (_) {}
        finish(res.statusCode < 400 || res.statusCode === 405);
      });
    } catch (_) { return finish(false); }
    req.on('error', () => finish(false));
    req.on('timeout', () => { try { req.destroy(); } catch (_) {} finish(false); });
    try { req.end(); } catch (_) { return finish(false); }
    setTimeout(() => { try { req.destroy(); } catch (_) {} finish(false); }, ms + 500);
  });
}

/** Bot connect hote hi background me menu media download kar lo — pehla .menu bhi fast. */
function warmMediaCache() {
  try {
    const settings = require('../settings');
    // v2.8.2: sirf photo warm karo — video ab URL se bheja jata hai (.menu),
    // 12MB video background me download karna weak host (KataBump 308MB) par
    // bandwidth/RAM khata tha aur .menu ko atakata tha.
    const urls = [settings.menuImage].filter((u) => isUrl(u));
    for (const u of urls) getMediaBuffer(u).catch(() => {});
    // menu sound (jsdelivr) bhi warm kar lo
    getMediaBuffer('https://cdn.jsdelivr.net/gh/mauricegift/ghbcdn@main/audio/fC_audio.mp3').catch(() => {});
  } catch {}
}

function clearMediaCache(url) {
  if (url) { cache.delete(url); thumbCache.delete(url); }
  else { cache.clear(); thumbCache.clear(); }
}

module.exports = { getMediaBuffer, getMenuThumb, resolveMediaFast, warmMediaCache, clearMediaCache, probeUrl };
