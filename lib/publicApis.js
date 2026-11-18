/**
 * QUEEN AKUMA v2.6.1 - public no-key APIs (hunted + user-pasted code se)
 * LIVE-PROBED 2026-11-14 (is VM se):
 *  WORKING: Pollinations image+text, MyMemory translate, meme-api, tinyurl,
 *    Wikipedia REST, Popcat joke (+some-random-api fallback), Spotify oEmbed
 *    (metadata only - audio nahi), quotable (VM-ambiguous).
 *  VM-AMBIGUOUS (conn closed - is VM ki egress filtering ho sakti hai,
 *    host pe chal sakte hain): quotable, laurine TTS, shizo GPT.
 *  REAL DEAD (yahan nahi hain): okatsu 402, elite /ytdown 404, siputzx
 *    igdl/sd/weather 404, official-joke-api 503, vxtwitter 403, cobalt JWT.
 *  v2.6.2 (GitHub hunt, live 2026-11-14): David Cyril tools (translate/
 *    weather/shorten/fact/anime/qrcode), ch.at AI chat (POST), jokeapi.dev,
 *    zenquotes, uselessfacts, opentdb trivia, datamuse, wttr.in, qrserver,
 *    frankfurter, coingecko, imgflip, ip-api, thecolorapi, countriesnow,
 *    worldbank, v.gd, ESPN soccer.
 *  REAL DEAD v2.6.2: DC ytmp3 404, DC gpt-5 500, DC spotdown 500,
 *    DC instagram 500, Invidious 403/401/530, mp4yt extract 404,
 *    cobalt kittycat JWT, ESPN cricket path 404.
 * Har function fail hone par null deta hai - throw nahi karta, taaki
 * fallback chain aage badh sake.
 */
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const enc = encodeURIComponent;

function client(timeout = 25000) {
  return axios.create({ timeout, headers: { 'User-Agent': UA, Accept: 'application/json, text/plain, */*' }, validateStatus: (s) => s < 500 });
}

/** AI image (no key) -> JPEG/PNG Buffer ya null. */
async function pollinationsImage(prompt) {
  try {
    const url = `https://image.pollinations.ai/prompt/${enc(prompt)}?width=512&height=512&model=flux`;
    const r = await axios.get(url, { timeout: 60000, responseType: 'arraybuffer', headers: { 'User-Agent': UA }, validateStatus: (s) => s < 500 });
    if (r.status >= 400) return null;
    const ct = String((r.headers && r.headers['content-type']) || '');
    if (!ct.includes('image')) return null;
    const buf = Buffer.from(r.data);
    if (buf.length < 2000) return null;
    return buf;
  } catch (_) { return null; }
}

/** AI text (no key) -> plain string ya null. */
async function pollinationsText(prompt) {
  try {
    const r = await client(30000).get(`https://text.pollinations.ai/${enc(prompt)}`);
    if (r.status >= 400) return null;
    const t = typeof r.data === 'string' ? r.data : (r.data && (r.data.text || r.data.response || r.data.result)) || '';
    const s = String(t || '').trim();
    return s || null;
  } catch (_) { return null; }
}

/** Translate via MyMemory (no key). langpair 'en|hi' jaisa bhi chalega. */
async function translateMyMemory(text, to = 'hi') {
  try {
    const pair = String(to || 'hi').includes('|') ? String(to) : `en|${to}`;
    const r = await client(20000).get('https://api.mymemory.translated.net/get', { params: { q: text, langpair: pair } });
    if (r.status >= 400 || !r.data) return null;
    const t = r.data.responseData && r.data.responseData.translatedText;
    if (!t || /QUERY LENGTH LIMIT|INVALID|NO QUERY SPECIFIED/i.test(t)) return null;
    return String(t).trim() || null;
  } catch (_) { return null; }
}

/** Random meme -> { url, title } ya null (NSFW skip). */
async function getMeme() {
  try {
    for (let i = 0; i < 2; i++) {
      const r = await client(20000).get('https://meme-api.com/gimme');
      if (r.status >= 400 || !r.data || !r.data.url) continue;
      if (r.data.nsfw) continue;
      return { url: r.data.url, title: r.data.title || 'Meme' };
    }
    return null;
  } catch (_) { return null; }
}

/** TinyURL shortener -> short link ya null.
 * NOTE: tinyurl api-create.php shared JSON Accept header pe HTTP 400 'Error'
 * deta hai (live 2026-11-14) - isliye yahan plain text Accept header use hota hai. */
async function shortUrl(url) {
  try {
    // Inline query string: axios `params` re-decodes %3A back to ':' and
    // tinyurl 400s on that form - live-verified 2026-11-14.
    const r = await axios.get('https://tinyurl.com/api-create.php?url=' + enc(url), {
      timeout: 20000,
      headers: { 'User-Agent': UA, Accept: 'text/plain, */*' },
      validateStatus: (st) => st < 500
    });
    if (r.status >= 400) return null;
    const s = String(r.data || '').trim();
    return /^https?:\/\//i.test(s) ? s : null;
  } catch (_) { return null; }
}

/** Wikipedia summary -> { extract, thumbnail, title } ya null. */
async function wikiSummary(query) {
  try {
    const r = await client(20000).get(`https://en.wikipedia.org/api/rest_v1/page/summary/${enc(query)}`, { headers: { 'User-Agent': 'QUEEN-AKUMA/2.6.1 (contact: owner)' } });
    if (r.status >= 400 || !r.data || r.data.type === 'disambiguation') {
      if (r.data && r.data.type === 'disambiguation' && r.data.extract) return { extract: r.data.extract, thumbnail: null, title: r.data.title || query };
      return null;
    }
    const d = r.data;
    return {
      extract: d.extract || '',
      thumbnail: (d.thumbnail && d.thumbnail.source) || (d.originalimage && d.originalimage.source) || null,
      title: d.title || query
    };
  } catch (_) { return null; }
}

/** Random quote -> { content, author } ya null. */
async function getQuote() {
  try {
    const r = await client(20000).get('https://api.quotable.io/random');
    if (r.status >= 400 || !r.data || !r.data.content) return null;
    return { content: r.data.content, author: r.data.author || 'Unknown' };
  } catch (_) { return null; }
}

/**
 * Random joke -> string ya null.
 * NOTE: official-joke-api 503 DEAD hai (probed 2026-11-14) - isliye Popcat
 * (v2.5.0 me verified) primary hai, some-random-api fallback hai.
 */
async function getJoke() {
  try {
    const r = await client(20000).get('https://api.popcat.xyz/joke');
    if (r.status < 400 && r.data && r.data.joke) return String(r.data.joke).trim();
  } catch (_) {}
  try {
    const r = await client(20000).get('https://api.some-random-api.com/joke');
    if (r.status < 400 && r.data && r.data.joke) return String(r.data.joke).trim();
  } catch (_) {}
  return null;
}

/** Laurine TTS -> mp3 audio URL ya null (VM-ambiguous, host pe try hota hai). */
async function laurineTts(text) {
  try {
    const r = await client(30000).get('https://www.laurine.site/api/tts/tts-nova', { params: { text } });
    if (r.status >= 400 || !r.data) return null;
    const d = r.data;
    if (typeof d === 'string' && /^https?:\/\//i.test(d)) return d;
    const inner = d.data || d;
    if (inner.URL) return inner.URL;
    if (inner.url) return inner.url;
    if (inner.MP3) return `https://ttsmp3.com/created_mp3_ai/${inner.MP3}`;
    if (inner.mp3) return `https://ttsmp3.com/created_mp3_ai/${inner.mp3}`;
    if (d.URL) return d.URL;
    if (d.url) return d.url;
    if (d.MP3) return `https://ttsmp3.com/created_mp3_ai/${d.MP3}`;
    if (d.mp3) return `https://ttsmp3.com/created_mp3_ai/${d.mp3}`;
    return null;
  } catch (_) { return null; }
}

/**
 * Shizo GPT chat -> string ya null (fallback AI only).
 * Key user ke pasted code ka public demo key hai - sirf request me use hota
 * hai, kabhi log/print nahi karna.
 */
async function shizoChat(text) {
  try {
    const r = await client(25000).get('https://api.shizo.top/ai/gpt', { params: { apikey: 'shizo', query: text } });
    if (r.status >= 400 || !r.data) return null;
    const d = r.data;
    const s = (d.msg || d.response || d.text || d.result || (typeof d === 'string' ? d : '')) || '';
    return String(s).trim() || null;
  } catch (_) { return null; }
}

/** Spotify oEmbed -> { title, author, thumbnail } ya null (METADATA ONLY). */
async function spotifyOembed(url) {
  try {
    const r = await client(20000).get('https://open.spotify.com/oembed', { params: { url } });
    if (r.status >= 400 || !r.data || !r.data.title) return null;
    return { title: r.data.title, author: r.data.author_name || '', thumbnail: r.data.thumbnail_url || null };
  } catch (_) { return null; }
}


/* ================= v2.6.2 - GitHub hunt additions (live 2026-11-14) ================= */

/** ch.at AI chat (no key, POST only - GET ?q= sirf HTML deta hai). */
async function chatAt(text) {
  try {
    const r = await axios.post('https://ch.at/v1/chat/completions',
      { model: 'ch.at', messages: [{ role: 'user', content: text }] },
      { timeout: 30000, headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' }, validateStatus: (st) => st < 500 });
    if (r.status >= 400 || !r.data) return null;
    const c = r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content;
    return (c && String(c).trim()) || null;
  } catch (_) { return null; }
}

/** JokeAPI.dev (safe-mode, single) -> string ya null. */
async function jokeApiDev() {
  try {
    const r = await client(20000).get('https://v2.jokeapi.dev/joke/Any', { params: { 'safe-mode': '', type: 'single' } });
    if (r.status >= 400 || !r.data) return null;
    if (r.data.type === 'single' && r.data.joke) return String(r.data.joke).trim();
    if (r.data.setup && r.data.delivery) return String(r.data.setup).trim() + '\n' + String(r.data.delivery).trim();
    return null;
  } catch (_) { return null; }
}

/** ZenQuotes random -> { content, author } ya null. */
async function zenQuote() {
  try {
    const r = await client(20000).get('https://zenquotes.io/api/random');
    if (r.status >= 400 || !Array.isArray(r.data) || !r.data[0]) return null;
    return { content: r.data[0].q || '', author: r.data[0].a || 'Unknown' };
  } catch (_) { return null; }
}

/** UselessFacts random -> string ya null. */
async function uselessFact() {
  try {
    const r = await client(20000).get('https://uselessfacts.jsph.pl/api/v2/facts/random');
    if (r.status >= 400 || !r.data || !r.data.text) return null;
    return String(r.data.text).trim();
  } catch (_) { return null; }
}

function decodeEntities(str) {
  return String(str || '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&eacute;/g, 'e').replace(/&ouml;/g, 'o').replace(/&uuml;/g, 'u');
}

/** OpenTDB trivia -> { question, options[4 shuffled], answer } ya null. */
async function triviaQuestion() {
  try {
    const r = await client(20000).get('https://opentdb.com/api.php', { params: { amount: 1 } });
    if (r.status >= 400 || !r.data || !Array.isArray(r.data.results) || !r.data.results[0]) return null;
    const q = r.data.results[0];
    const answer = decodeEntities(q.correct_answer);
    const options = [...(q.incorrect_answers || []).map(decodeEntities), answer];
    for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
    return { question: decodeEntities(q.question), options, answer, category: decodeEntities(q.category || '') };
  } catch (_) { return null; }
}

/** Datamuse synonyms/related words -> [words] ya null. */
async function datamuseSyn(word) {
  try {
    const r = await client(20000).get('https://api.datamuse.com/words', { params: { ml: word, max: 5 } });
    if (r.status >= 400 || !Array.isArray(r.data)) return null;
    const words = r.data.map((w) => w.word).filter(Boolean);
    return words.length ? words : null;
  } catch (_) { return null; }
}

/** wttr.in weather -> { temp, desc, humidity, wind, city } ya null. */
async function wttrWeather(city) {
  try {
    const r = await client(20000).get(`https://wttr.in/${enc(city)}`, { params: { format: 'j1' } });
    if (r.status >= 400 || !r.data || !r.data.current_condition || !r.data.current_condition[0]) return null;
    const c = r.data.current_condition[0];
    const area = (r.data.nearest_area && r.data.nearest_area[0] && r.data.nearest_area[0].areaName && r.data.nearest_area[0].areaName[0] && r.data.nearest_area[0].areaName[0].value) || city;
    return {
      temp: c.temp_C, feels: c.FeelsLikeC,
      desc: (c.weatherDesc && c.weatherDesc[0] && c.weatherDesc[0].value) || '',
      humidity: c.humidity, wind: c.windspeedKmph, city: area
    };
  } catch (_) { return null; }
}

/** QR code image (qrserver) -> PNG Buffer ya null. */
async function qrBuffer(text) {
  try {
    const r = await axios.get('https://api.qrserver.com/v1/create-qr-code/', {
      params: { size: '300x300', data: text }, timeout: 25000, responseType: 'arraybuffer',
      headers: { 'User-Agent': UA }, validateStatus: (st) => st < 500
    });
    if (r.status >= 400) return null;
    const ct = String((r.headers && r.headers['content-type']) || '');
    if (!ct.includes('image')) return null;
    const buf = Buffer.from(r.data);
    return buf.length > 100 ? buf : null;
  } catch (_) { return null; }
}

/** Frankfurter currency -> { rate, converted, from, to } ya null. */
async function frankfurterRate(amount, from, to) {
  try {
    const r = await client(20000).get('https://api.frankfurter.dev/v1/latest', { params: { base: from, symbols: to } });
    if (r.status >= 400 || !r.data || !r.data.rates || r.data.rates[to] == null) return null;
    const rate = Number(r.data.rates[to]);
    return { rate, converted: rate * amount, from, to, amount };
  } catch (_) { return null; }
}

/** CoinGecko simple price -> { usd, inr } ya null. */
async function cryptoPrice(id) {
  try {
    const r = await client(20000).get('https://api.coingecko.com/api/v3/simple/price', { params: { ids: id, vs_currencies: 'usd,inr' } });
    if (r.status >= 400 || !r.data || !r.data[id]) return null;
    return { usd: r.data[id].usd, inr: r.data[id].inr, id };
  } catch (_) { return null; }
}

/** Imgflip memes -> [{ name, url }] (top 10) ya null. */
async function imgflipMemes() {
  try {
    const r = await client(20000).get('https://api.imgflip.com/get_memes');
    if (r.status >= 400 || !r.data || !r.data.success || !r.data.data || !Array.isArray(r.data.data.memes)) return null;
    return r.data.data.memes.slice(0, 10).map((m) => ({ name: m.name, url: m.url }));
  } catch (_) { return null; }
}

/** ip-api lookup -> { country, city, isp, query } ya null. */
async function ipLookup(ip) {
  try {
    const r = await axios.get(`http://ip-api.com/json/${enc(ip || '')}`, { timeout: 20000, headers: { 'User-Agent': UA }, validateStatus: (st) => st < 500 });
    if (r.status >= 400 || !r.data || r.data.status !== 'success') return null;
    return { country: r.data.country, city: r.data.city, region: r.data.regionName, isp: r.data.isp, query: r.data.query };
  } catch (_) { return null; }
}

/** TheColorAPI -> { name, hex, rgb } ya null. */
async function colorInfo(hex) {
  try {
    const h = String(hex || '').replace(/^#/, '');
    const r = await client(20000).get('https://www.thecolorapi.com/id', { params: { hex: h } });
    if (r.status >= 400 || !r.data || !r.data.name) return null;
    return { name: r.data.name.value, hex: (r.data.hex && r.data.hex.value) || ('#' + h), rgb: (r.data.rgb && r.data.rgb.value) || '' };
  } catch (_) { return null; }
}

/** CountriesNow capital -> capital string ya null. */
async function countryCapital(country) {
  try {
    const r = await client(20000).get('https://countriesnow.space/api/v0.1/countries/capital');
    if (r.status >= 400 || !r.data || !Array.isArray(r.data.data)) return null;
    const hit = r.data.data.find((c) => String(c.name || '').toLowerCase() === String(country).toLowerCase());
    return hit ? String(hit.capital || '') : null;
  } catch (_) { return null; }
}

/** WorldBank country -> { name, capital, region, income } ya null. */
async function worldbankCountry(code) {
  try {
    const r = await client(20000).get(`https://api.worldbank.org/v2/country/${enc(code)}`, { params: { format: 'json' } });
    if (r.status >= 400 || !Array.isArray(r.data) || !r.data[1] || !r.data[1][0]) return null;
    const c = r.data[1][0];
    return {
      name: c.name, capital: c.capitalCity || '', region: (c.region && c.region.value) || '',
      income: (c.incomeLevel && c.incomeLevel.value) || '', iso: c.iso2Code || code
    };
  } catch (_) { return null; }
}

/** v.gd shortener -> short URL ya null. */
async function vgdShort(url) {
  try {
    const r = await client(20000).get('https://v.gd/create.php', { params: { format: 'json', url } });
    if (r.status >= 400 || !r.data || !r.data.shorturl) return null;
    return String(r.data.shorturl).trim();
  } catch (_) { return null; }
}

/** ESPN soccer scoreboard (England Premier League) -> [matches] ya null. */
async function espnSoccer() {
  try {
    const r = await client(25000).get('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard');
    if (r.status >= 400 || !r.data || !Array.isArray(r.data.events)) return null;
    return r.data.events.slice(0, 6).map((ev) => {
      const comps = (ev.competitions && ev.competitions[0] && ev.competitions[0].competitors) || [];
      const home = comps.find((c) => c.homeAway === 'home') || comps[0] || {};
      const away = comps.find((c) => c.homeAway === 'away') || comps[1] || {};
      const nm = (c) => (c.team && (c.team.shortDisplayName || c.team.displayName)) || '?';
      const sc = (c) => (c.score != null ? c.score : '-');
      return { home: nm(home), away: nm(away), score: sc(home) + ' - ' + sc(away), status: (ev.status && ev.status.type && ev.status.type.shortDetail) || '' };
    });
  } catch (_) { return null; }
}

/* ---- David Cyril tools (live 2026-11-14) ---- */
async function dcTranslate(text, to = 'hi') {
  try {
    const r = await client(20000).get('https://apis.davidcyril.name.ng/tools/translate', { params: { text, to } });
    if (r.status >= 400 || !r.data) return null;
    const t = r.data.translated_text || r.data.translatedText || (r.data.result && r.data.result.translated_text);
    return (t && String(t).trim()) || null;
  } catch (_) { return null; }
}
async function dcWeather(city) {
  try {
    const r = await client(20000).get('https://apis.davidcyril.name.ng/tools/weather', { params: { city } });
    if (r.status >= 400 || !r.data) return null;
    const d = r.data.data || r.data;
    const loc = (d.location && (d.location.name || d.location.city)) || d.city || city;
    const fc = d.forecastData || d.forecast || d;
    const temp = fc.temperature || fc.temp || (fc.current && fc.current.temperature) || '';
    const cond = fc.condition || fc.description || (fc.current && fc.current.condition) || '';
    if (!temp && !cond && !loc) return null;
    return { city: loc, temp: temp ? String(temp) : '', cond: cond ? String(cond) : '', raw: d };
  } catch (_) { return null; }
}
async function dcShorten(url) {
  try {
    const r = await client(20000).get('https://apis.davidcyril.name.ng/shortenUrl', { params: { url } });
    if (r.status >= 400 || !r.data) return null;
    const s = r.data.shortened_url || r.data.short_url || r.data.shortenedUrl;
    return (s && String(s).trim()) || null;
  } catch (_) { return null; }
}
async function dcFact() {
  try {
    const r = await client(20000).get('https://apis.davidcyril.name.ng/fact');
    if (r.status >= 400 || !r.data) return null;
    const f = r.data.fact || (r.data.result && r.data.result.fact) || r.data.text;
    return (f && String(f).trim()) || null;
  } catch (_) { return null; }
}
async function dcAnime(query) {
  try {
    const r = await client(25000).get('https://apis.davidcyril.name.ng/anime/search', { params: { q: query } });
    if (r.status >= 400 || !r.data) return null;
    const list = (r.data.result && r.data.result.results) || r.data.results || r.data.data || [];
    if (!Array.isArray(list) || !list.length) return null;
    return list.slice(0, 5).map((a) => ({ title: a.title || a.name || '', type: a.type || '', score: a.score || '' })).filter((a) => a.title);
  } catch (_) { return null; }
}
async function dcQr(text) {
  try {
    const r = await axios.get('https://apis.davidcyril.name.ng/tools/qrcode', {
      params: { text }, timeout: 25000, responseType: 'arraybuffer',
      headers: { 'User-Agent': UA }, validateStatus: (st) => st < 500
    });
    if (r.status >= 400) return null;
    const ct = String((r.headers && r.headers['content-type']) || '');
    if (!ct.includes('image')) return null;
    const buf = Buffer.from(r.data);
    return buf.length > 100 ? buf : null;
  } catch (_) { return null; }
}

module.exports = {
  pollinationsImage,
  pollinationsText,
  translateMyMemory,
  getMeme,
  shortUrl,
  wikiSummary,
  getQuote,
  getJoke,
  laurineTts,
  shizoChat,
  spotifyOembed,
  chatAt,
  jokeApiDev,
  zenQuote,
  uselessFact,
  triviaQuestion,
  datamuseSyn,
  wttrWeather,
  qrBuffer,
  frankfurterRate,
  cryptoPrice,
  imgflipMemes,
  ipLookup,
  colorInfo,
  countryCapital,
  worldbankCountry,
  vgdShort,
  espnSoccer,
  dcTranslate,
  dcWeather,
  dcShorten,
  dcFact,
  dcAnime,
  dcQr
};
