/**
 * QUEEN AKUMA • virtual-number (sms24) helper.
 * Was `module.exports = {}` so .vnum / .vnumget / .vnumotp crashed with
 * "fetchVnum is not a function". Now the commands load and fail gracefully
 * with a clear message if the upstream service is down.
 * Set SMS24_API_BASE in .env to point at your own sms24-compatible API.
 */
const SMS24_BASE = (process.env.SMS24_API_BASE || 'https://sms24.me/api').replace(/\/$/, '');

async function fetchJson(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': 'QUEEN-AKUMA/1.1.0' } });
    const txt = await r.text();
    if (!r.ok) throw new Error('sms24 HTTP ' + r.status);
    try { return JSON.parse(txt); } catch { throw new Error('sms24 returned a non-JSON response'); }
  } finally { clearTimeout(t); }
}

async function fetchVnum(kind, params = {}) {
  const q = new URLSearchParams();
  if (params.country) q.set('country', String(params.country).toLowerCase());
  if (params.number) q.set('number', String(params.number).replace(/\D/g, ''));
  const paths = {
    'sms24-countries': ['/countries', '/getCountries'],
    'sms24-numbers': ['/numbers?' + q.toString(), '/getNumbers?' + q.toString()],
    'sms24-messages': ['/messages?' + q.toString(), '/getMessages?' + q.toString()],
  }[kind];
  if (!paths) throw new Error('Unknown vnum request: ' + kind);
  let lastErr = null;
  for (const path of paths) {
    try { return await fetchJson(SMS24_BASE + path); } catch (e) { lastErr = e; }
  }
  throw new Error('sms24 service unavailable right now (' + (lastErr && lastErr.message) + '). Try again later or set SMS24_API_BASE in .env.');
}

function friendlyError(err) {
  const m = String((err && err.message) || err || 'Unknown error');
  return '\u26a0\ufe0f sms24 service is down right now.\n\n' + m.slice(0, 200) + '\n\nTry again in a few minutes.';
}

function extractList(json, paths) {
  for (const path of paths) {
    let cur = json;
    for (const key of String(path).split('.')) {
      if (cur && typeof cur === 'object') cur = cur[key]; else { cur = undefined; break; }
    }
    if (Array.isArray(cur)) return cur;
  }
  if (Array.isArray(json)) return json;
  return [];
}

function flagOf(code) {
  const c = String(code || '').toUpperCase();
  if (/^[A-Z]{2}$/.test(c)) {
    return String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt(0)));
  }
  return '';
}

function normalizeCountry(x) {
  if (typeof x === 'string') return { code: x.toLowerCase(), name: x.toUpperCase(), flag: flagOf(x) };
  const code = x.code || x.country_code || x.countryCode || x.iso || '';
  const name = x.name || x.country || x.country_name || String(code).toUpperCase();
  return { code: String(code).toLowerCase(), name, flag: x.flag || flagOf(code) };
}

function normalizeNumber(x) {
  if (typeof x === 'string') return { number: x };
  return { number: String(x.number || x.phone || x.msisdn || ''), country: x.country || x.code || '', available: x.available !== false };
}

function normalizeMessage(x) {
  if (typeof x === 'string') return { text: x, otp: extractOtp(x) };
  const text = String(x.text || x.body || x.message || x.sms || '');
  return { text, from: x.from || x.sender || '', time: x.time || x.date || x.timestamp || '', otp: x.otp || extractOtp(text) };
}

function extractOtp(text) {
  const m = String(text || '').match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

module.exports = { fetchVnum, friendlyError, extractList, normalizeCountry, normalizeNumber, normalizeMessage, extractOtp };
