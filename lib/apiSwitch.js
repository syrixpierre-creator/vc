const { cleanText, isBadPayload } = require('./safeResponse');
/**
 * QUEEN AKUMA — Multi-API auto switch (fastest first response)
 * Tries EliteProTech + Qasim + fallbacks in parallel race / sequential failover
 */
const axios = require('axios');

const BASES = [
  process.env.ELITE_API_BASE || 'https://eliteprotech-apis.zone.id',
  process.env.DEMON_API_BASE || 'https://api.qasimdev.dpdns.org',
  'https://api.agatz.xyz',
  'https://api.siputzx.my.id'
];

const http = axios.create({
  timeout: 12000,
  headers: {
    'User-Agent': 'QUEEN-AKUMA/1.0',
    Accept: 'application/json, text/plain, */*'
  },
  validateStatus: (s) => s >= 200 && s < 500
});

/**
 * Race multiple URLs — first successful JSON wins
 */
async function raceGet(paths, params = {}) {
  const urls = [];
  for (const base of BASES) {
    for (const p of (Array.isArray(paths) ? paths : [paths])) {
      const u = new URL(p.startsWith('http') ? p : `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
      });
      urls.push(u.toString());
    }
  }

  const controllers = urls.map(() => new AbortController());
  const tasks = urls.map((url, i) =>
    http.get(url, { signal: controllers[i].signal, timeout: 10000 })
      .then((r) => {
        if (!r || r.status >= 400) throw new Error('bad status');
        const d = r.data;
        if (d === null || d === undefined) throw new Error('empty');
        if (typeof d === 'string' && d.includes('<!DOCTYPE')) throw new Error('html');
        return { data: d, url, base: BASES.find((b) => url.startsWith(b)) || url };
      })
  );

  try {
    const winner = await Promise.any(tasks);
    controllers.forEach((c) => { try { c.abort(); } catch (_) {} });
    return winner;
  } catch {
    return null;
  }
}

/** Sequential failover (safer for rate limits) */
async function failoverGet(paths, params = {}) {
  for (const base of BASES) {
    for (const p of (Array.isArray(paths) ? paths : [paths])) {
      try {
        const u = new URL(p.startsWith('http') ? p : `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`);
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
        });
        const r = await http.get(u.toString());
        if (r.status >= 400) continue;
        const d = r.data;
        if (!d || (typeof d === 'string' && d.includes('<!DOCTYPE'))) continue;
        return { data: d, url: u.toString(), base };
      } catch (_) {}
    }
  }
  return null;
}

async function ai(text) {
  // Verified EliteProTech paths first (2026-11-14 probe), then common fallbacks
  const res = await raceGet(
    ['ai/chatgpt', 'ai/talkai', 'ai/notegpt', 'ai/deepseekai', 'gemini', 'ai', 'chatgpt', 'gpt', 'api/gemini', 'api/ai'],
    { text, q: text, prompt: text, message: text }
  );
  if (!res) return null;
  const d = res.data;
  return d.result || d.response || d.message || d.answer || d.data || d.text || (typeof d === 'string' ? d : JSON.stringify(d));
}

module.exports = {
  BASES,
  raceGet,
  failoverGet,
  ai,
  http
};
