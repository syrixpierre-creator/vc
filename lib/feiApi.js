/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: no-key public API clients
 * LIVE-PROBED 2026-11-15 (is VM se):
 *  WORKING: Rebix (claude-haiku/gemini/gptlogic), OmegaTech Qwen,
 *    OmegaTech TTS (clideo, Gemini-tts, text2speech-v3, text-to-speech2),
 *    OmegaTech lyrics, Xrina canvas (windows/quotes), nekos.best,
 *    trace.moe, animechan, NASA APOD (public DEMO_KEY), BBC/Al Jazeera/
 *    Guardian RSS, dadjoke/chuck/advice/fox/uselessfacts, Elite mathgpt.
 *  VM-AMBIGUOUS (is VM se block, host par chal sakta hai): AniList
 *    GraphQL (403 Cloudflare), CNN RSS (conn fail). Fail gracefully
 *    hota hai - clear error, crash nahi.
 *  REAL DEAD (wire nahi kiya): OmegaTech Secret (500 billing),
 *    OmegaTech Deepseek (500 cookie / khaali answer), OmegaTech
 *    polination (500, Pollinations 402), OmegaTech Multi-TTS (500),
 *    ikyyxd ytplayv2 (402), NabeesTech AIO (401 - key chahiye),
 *    Rebix ytv (400 - no qualities).
 * FEI ki branding (Benfei Tech footer) hatakar QUEEN AKUMA branding hai.
 * Koi API key copy nahi ki gayi - sab no-key public endpoints hain.
 */
const axios = require('axios');

const UA = 'QUEEN-AKUMA/2.8.0 (+https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA)';
const REBIX = 'https://api-rebix.vercel.app/api';
const OMEGA = 'https://api.omegatech.app/api';
const XRINA = 'https://apiii-xrina.my.id';
const ANILIST = 'https://graphql.anilist.co';
const NEKOS = 'https://nekos.best/api/v2';
const ELITE = 'https://eliteprotech-apis.zone.id';

function cleanText(s, limit) {
  let t = String(s == null ? '' : s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (limit && t.length > limit) t = t.slice(0, limit - 1).trimEnd() + '…';
  return t;
}

function extractText(payload) {
  const cands = [
    payload && payload.response, payload && payload.text, payload && payload.answer,
    payload && payload.reply, payload && payload.message, payload && payload.result,
    payload && payload.data && payload.data.response, payload && payload.data && payload.data.text,
    payload && payload.data && payload.data.answer, payload && payload.data && payload.data.reply,
    payload && payload.data && payload.data.result, payload && payload.data && payload.data.message
  ];
  const hit = cands.find(v => typeof v === 'string' && v.trim());
  return hit ? hit.trim() : '';
}

function extractImageUrl(payload) {
  const urls = [];
  (function visit(v, d) {
    if (v == null || d > 7) return;
    if (typeof v === 'string') {
      const c = v.trim();
      if (/^https:\/\//i.test(c) && urls.indexOf(c) === -1) urls.push(c);
      return;
    }
    if (Array.isArray(v)) { v.forEach(x => visit(x, d + 1)); return; }
    if (typeof v === 'object') Object.keys(v).forEach(k => visit(v[k], d + 1));
  })(payload, 0);
  return urls[0] || '';
}

async function getJson(url, params, timeoutMs, extraHeaders) {
  const r = await axios.get(url, {
    params: params || undefined,
    timeout: timeoutMs || 20000,
    headers: Object.assign({ 'User-Agent': UA, Accept: 'application/json' }, extraHeaders || {}),
    validateStatus: s => s < 500
  });
  if (r.status >= 400) throw new Error('API HTTP ' + r.status);
  return r.data;
}

// --- Rebix (FEI API): claude-haiku / gemini / gptlogic ---
async function rebixText(endpoint, params) {
  const data = await getJson(REBIX + '/' + String(endpoint).replace(/^\/+/, ''), params, 30000);
  if (data && (data.status === false || data.success === false)) {
    throw new Error('Rebix: ' + (data.message || data.error || 'request failed'));
  }
  const text = extractText(data);
  if (!text) throw new Error('Rebix ne jawab nahi diya.');
  return text;
}

// --- OmegaTech ---
async function omegaJson(path, params, timeoutMs) {
  const data = await getJson(OMEGA + path, params, timeoutMs || 30000);
  if (data && data.success === false) {
    throw new Error('OmegaTech: ' + (data.error || data.message || 'request failed'));
  }
  return data;
}

async function omegaText(path, params) {
  const data = await omegaJson(path, params);
  const text = extractText(data);
  if (!text) throw new Error('OmegaTech ne jawab nahi diya.');
  return text;
}

// --- Elite MathGPT (verified 2026-11-15: step-by-step answer) ---
async function eliteMathgpt(q) {
  const data = await getJson(ELITE + '/ai/mathgpt', { q }, 30000);
  const text = extractText(data);
  if (!text) throw new Error('Elite MathGPT ne jawab nahi diya.');
  return text;
}

// --- Xrina canvas (windows / quotes) -> image Buffer ---
async function xrinaImage(route, params) {
  const url = XRINA + '/' + String(route).replace(/^\/+/, '');
  const r = await axios.get(url, {
    params, timeout: 45000, responseType: 'arraybuffer',
    headers: { 'User-Agent': UA, Accept: 'image/*, application/json' },
    validateStatus: s => s < 500
  });
  if (r.status >= 400) throw new Error('Xrina HTTP ' + r.status);
  const ct = String(r.headers['content-type'] || '').toLowerCase();
  if (ct.indexOf('image/') === 0) {
    const buf = Buffer.from(r.data);
    if (!buf.length || buf.length > 12 * 1024 * 1024) throw new Error('Xrina image khaali ya bahut badi hai.');
    return buf;
  }
  let payload = null;
  try { payload = JSON.parse(Buffer.from(r.data).toString('utf8')); } catch (_) {}
  if (payload && (payload.status === false || payload.success === false)) {
    throw new Error('Xrina: ' + (payload.message || payload.error || 'request failed'));
  }
  const imgUrl = payload ? extractImageUrl(payload) : '';
  if (!imgUrl) throw new Error('Xrina ne image nahi di.');
  const r2 = await axios.get(imgUrl, {
    timeout: 30000, responseType: 'arraybuffer',
    headers: { 'User-Agent': UA }, validateStatus: s => s < 500
  });
  if (r2.status >= 400) throw new Error('Xrina image download HTTP ' + r2.status);
  return Buffer.from(r2.data);
}

// --- AniList GraphQL (VM se 403 - host par chal sakta hai) ---
async function anilistQuery(query, variables) {
  let r;
  try {
    r = await axios.post(ANILIST, { query, variables: variables || {} }, {
      timeout: 20000,
      headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
      validateStatus: s => s < 500
    });
  } catch (e) {
    throw new Error('AniList se connect nahi ho paya. Apne host par try karo.');
  }
  const payload = r.data || {};
  if (payload.errors && payload.errors.length) {
    const first = payload.errors[0] || {};
    const msg = String(first.message || 'AniList request failed.');
    if (first.status === 429) throw new Error('AniList rate limit. Thodi der baad try karo.');
    if (first.status === 404 || /not found/i.test(msg)) throw new Error('Us naam se kuch nahi mila.');
    throw new Error('AniList: ' + msg.slice(0, 180));
  }
  if (r.status >= 400) throw new Error('AniList HTTP ' + r.status + ' (is VM se block hai, host par try karo).');
  if (!payload.data) throw new Error('AniList ne data nahi diya.');
  return payload.data;
}

// --- nekos.best ---
async function nekos(category) {
  const data = await getJson(NEKOS + '/' + encodeURIComponent(category), null, 20000);
  const item = data && Array.isArray(data.results) ? data.results[0] : null;
  if (!item || !item.url) throw new Error('Nekos se image nahi mili.');
  return item;
}

// --- trace.moe (screenshot -> anime) ---
async function traceMoe(imageUrl) {
  const data = await getJson('https://api.trace.moe/search', { anilistInfo: 1, url: imageUrl }, 40000);
  if (data && data.error) throw new Error(String(data.error).slice(0, 180));
  const match = data && Array.isArray(data.result) ? data.result[0] : null;
  if (!match) throw new Error('Screenshot se anime match nahi hua.');
  return match;
}

// --- animechan quote ---
async function animechanQuote() {
  const data = await getJson('https://api.animechan.io/v1/quotes/random', null, 20000);
  const q = data && data.data;
  if (!q || !q.content) throw new Error('Anime quote nahi mili.');
  return q;
}

// --- NASA APOD (public DEMO_KEY - NASA ka documented demo key) ---
async function nasaApod() {
  return getJson('https://api.nasa.gov/planetary/apod', { api_key: 'DEMO_KEY' }, 20000);
}

// --- generic fun JSON ---
async function funJson(url, headers) {
  const r = await axios.get(url, {
    timeout: 15000,
    headers: Object.assign({ 'User-Agent': UA, Accept: 'application/json' }, headers || {}),
    validateStatus: s => s < 500
  });
  if (r.status >= 400) throw new Error('API HTTP ' + r.status);
  return r.data;
}

// --- RSS news (FEI news.js parser, CJS port) ---
function decodeEntities(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) => {
      const code = Number.parseInt(digits, 16);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    })
    .replace(/&#(\d+);/g, (_, digits) => {
      const code = Number.parseInt(digits, 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    })
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function cleanNewsText(value, limit) {
  let text = decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const lim = limit || 260;
  if (text.length > lim) text = text.slice(0, Math.max(0, lim - 1)).trimEnd() + '…';
  return text;
}

function tagContent(block, name) {
  const pattern = new RegExp(
    '<(?:[\\w.-]+:)?' + name + '\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?' + name + '\\s*>',
    'i'
  );
  return String(block || '').match(pattern) ? String(block || '').match(pattern)[1] : '';
}

function getTagText(block, names, limit) {
  for (const name of names) {
    const value = cleanNewsText(tagContent(block, name), limit);
    if (value) return value;
  }
  return '';
}

function articleLink(block, baseUrl) {
  const rssText = getTagText(block, ['link'], 1000);
  if (rssText) {
    try {
      const url = new URL(decodeEntities(rssText), baseUrl);
      if (['https:', 'http:'].indexOf(url.protocol) !== -1) return url.href;
    } catch (_) {}
  }
  const atom = String(block || '').match(/<(?:[\w.-]+:)?link\b([^>]*?)\/?\s*>/i);
  const href = atom && atom[1] ? atom[1].match(/\bhref\s*=\s*(["'])(.*?)\1/i) : null;
  if (!href) return '';
  try {
    const url = new URL(decodeEntities(href[2]), baseUrl);
    return ['https:', 'http:'].indexOf(url.protocol) !== -1 ? url.href : '';
  } catch (_) { return ''; }
}

function parseNewsFeed(content, baseUrl, limit) {
  const xml = String(content || '');
  const entries = xml.match(/<(?:[\w.-]+:)?(?:item|entry)\b[^>]*>[\s\S]*?<\/(?:[\w.-]+:)?(?:item|entry)\s*>/gi) || [];
  const articles = [];
  const seen = new Set();
  const lim = limit || 5;
  for (const entry of entries) {
    const title = getTagText(entry, ['title'], 200);
    if (!title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    articles.push({
      title,
      summary: getTagText(entry, ['description', 'summary', 'encoded', 'content'], 260),
      date: getTagText(entry, ['pubDate', 'published', 'updated', 'date'], 80),
      link: articleLink(entry, baseUrl)
    });
    if (articles.length >= lim) break;
  }
  return articles;
}

async function fetchNews(source, count) {
  const r = await axios.get(source.feedUrl, {
    timeout: 15000, responseType: 'text',
    headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'User-Agent': UA },
    validateStatus: s => s < 500
  });
  if (r.status >= 400) throw new Error('News feed HTTP ' + r.status);
  const xml = String(r.data || '');
  if (xml.length > 2 * 1024 * 1024) throw new Error('News feed bahut bada hai.');
  const articles = parseNewsFeed(xml, source.feedUrl, count || 5);
  if (!articles.length) throw new Error('Headlines nahi mile.');
  return articles;
}

// --- unicode box (QUEEN AKUMA style) ---
function box(title, body) {
  const lines = String(body || '').trim().split(/\r?\n/);
  const framed = lines.map(l => l ? '┃ ✧ ' + l : '┃');
  return ['╭━━〔 ' + String(title || 'QUEEN AKUMA') + ' 〕━━┈⊷', '┃', ...framed, '┃', '╰━━━━━━━━━━━━┈⊷'].join('\n');
}

module.exports = {
  rebixText, omegaJson, omegaText, eliteMathgpt, xrinaImage, anilistQuery,
  nekos, traceMoe, animechanQuote, nasaApod, funJson, fetchNews,
  parseNewsFeed, cleanNewsText, box, cleanText, extractText
};
