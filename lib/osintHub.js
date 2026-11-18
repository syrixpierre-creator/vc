/**
 * QUEEN AKUMA — OSINT APIs Hub (live paths from osint-apis-hub.onrender.com)
 * Auth query: key=YOUR_KEY
 */
const API_BASE = process.env.OSINT_API_BASE || 'https://osint-apis-hub.onrender.com/api';
const API_KEY = process.env.OSINT_API_KEY || '1MonthFree';

const COMMANDS = {
  ipv1: { cat: 'network', path: 'ip-v1', param: 'query', desc: 'IP Info V1', ex: '8.8.8.8', aliases: ['ip'] },
  ipv2: { cat: 'network', path: 'ip-v2', param: 'ip', desc: 'IP Info V2', ex: '8.8.8.8' },
  ipv3: { cat: 'network', path: 'ip-v3', param: 'ip', desc: 'IP Info V3', ex: '8.8.8.8' },
  country: { cat: 'network', path: 'country', param: 'name', desc: 'Country Info', ex: 'india' },
  pincode: { cat: 'network', path: 'pincode', param: 'pincode', desc: 'India Pincode', ex: '110001' },
  ifsc: { cat: 'network', path: 'ifsc', param: 'ifsc', desc: 'Bank IFSC Info', ex: 'SBIN0000001' },
  leak: { cat: 'identity', path: 'leak', param: 'q', desc: 'Leak OSINT (phone)', ex: '919876543210' },
  num: { cat: 'identity', path: 'num-info', param: 'q', desc: 'Number Info', ex: '919876543210', aliases: ['numberinfo', 'numinfo'] },
  family: { cat: 'identity', path: 'family-info', param: 'aadhaar', desc: 'Family info (Aadhaar)', ex: '707080848494' },
  ration: { cat: 'identity', path: 'ration-info', param: 'rc', desc: 'Ration card info', ex: '218740640864' },
  gas: { cat: 'identity', path: 'indian-gas', param: 'num', desc: 'Indian Gas', ex: '9876543210' },
  pan: { cat: 'identity', path: 'pan-info', param: 'pan', desc: 'PAN Info', ex: 'AAYFK4129N' },
  pan2gst: { cat: 'identity', path: 'pan-to-gst', param: 'pan', desc: 'PAN → GST', ex: 'BOKPS7056D' },
  pan2gst2: { cat: 'identity', path: 'pan-to-gst-v2', param: 'pan', desc: 'PAN → GST V2', ex: 'BOKPS7056D' },
  pan2gst3: { cat: 'identity', path: 'pan-to-gst-v3', param: 'pan', desc: 'PAN → GST V3', ex: 'AACCL5754F' },
  pan2gst4: { cat: 'identity', path: 'pan-to-gst-v4', param: 'pan', desc: 'PAN → GST V4', ex: 'AAYFK4129N' },
  gst: { cat: 'identity', path: 'gst-search', param: 'gstin', desc: 'GST Search', ex: '19BOKPS7056D1ZI' },
  gstd: { cat: 'identity', path: 'gst-direct', param: 'gstin', desc: 'GST Direct', ex: '19BOKPS7056D1ZI' },
  gstinfo: { cat: 'identity', path: 'gst-info', param: 'gst', desc: 'GST Info', ex: '19BOKPS7056D1ZI' },
  pakinfo: { cat: 'identity', path: 'pak-info', param: 'pak_num', desc: 'Pakistan number info', ex: '3001234567' },
  vehicle: { cat: 'vehicle', path: 'vehicle-number', param: 'number', desc: 'Vehicle by number', ex: 'MH12AB1234', aliases: ['rc'] },
  vehicle2: { cat: 'vehicle', path: 'vehicle-info-v2', param: 'vehicle_number', desc: 'Vehicle Info V2', ex: 'MH12AB1234' },
  vehiclerc: { cat: 'vehicle', path: 'vehicle-rc', param: 'number', desc: 'Vehicle RC', ex: 'MH12AB1234' },
  vehiclev: { cat: 'vehicle', path: 'vehicle-v', param: 'rc', desc: 'Vehicle V', ex: 'MH12AB1234' },
  challan: { cat: 'vehicle', path: 'vehicle-challan', param: 'number', desc: 'Traffic challan', ex: 'MH12AB1234' },
  challan2: { cat: 'vehicle', path: 'vehicle-challan-v2', param: 'number', desc: 'Challan V2', ex: 'MH12AB1234' },
  challan4: { cat: 'vehicle', path: 'vehicle-challan-v4', param: 'number', desc: 'Challan V4', ex: 'MH12AB1234' },
  github: { cat: 'social', path: 'github', param: 'q', desc: 'GitHub profile', ex: 'torvalds', aliases: ['gh'] },
  igprofile: { cat: 'social', path: 'instagram-profile', param: 'username', desc: 'Instagram profile', ex: 'instagram', aliases: ['iguser'] },
  igposts: { cat: 'social', path: 'instagram-posts', param: 'username', desc: 'Instagram posts', ex: 'instagram' },
  twprofile: { cat: 'social', path: 'twitter-profile', param: 'url', desc: 'Twitter profile (URL)', ex: 'https://twitter.com/elonmusk', aliases: ['xprofile'] },
  twprofile2: { cat: 'social', path: 'twitter-profile-v2', param: 'username', desc: 'Twitter profile V2', ex: 'elonmusk' },
  twvideo: { cat: 'social', path: 'twitter-hd-video', param: 'url', desc: 'Twitter HD video', ex: 'https://twitter.com/x/status/1' },
  twimg: { cat: 'social', path: 'twitter-image', param: 'url', desc: 'Twitter image', ex: 'https://twitter.com/x/status/1' },
  ytinfo: { cat: 'media', path: 'youtube-info', param: 'url', desc: 'YouTube info', ex: 'https://youtu.be/dQw4w9WgXcQ' },
  ytid: { cat: 'media', path: 'youtube-info-id', param: 'id', desc: 'YouTube info by ID', ex: 'dQw4w9WgXcQ' },
  ytall: { cat: 'media', path: 'youtube-all', param: 'url', desc: 'YouTube all formats', ex: 'https://youtu.be/dQw4w9WgXcQ', aliases: ['yt', 'ytdl'] },
  terabox: { cat: 'media', path: 'terabox-file', param: 'url', desc: 'Terabox file', ex: 'https://terabox.com/s/xxx' },
  tbstream: { cat: 'media', path: 'terabox-stream', param: 'url', desc: 'Terabox stream', ex: 'https://terabox.com/s/xxx' },
  songos: { cat: 'media', path: 'song', param: 'song', desc: 'Song search (OSINT hub)', ex: 'despacito' },
  imei: { cat: 'tools', path: 'imei', param: 'imei_number', desc: 'IMEI check', ex: '123456789012345' },
  scrape: { cat: 'tools', path: 'website-scraper', param: 'url', desc: 'Website scraper', ex: 'https://example.com' },
  imgprompt: { cat: 'tools', path: 'image-to-prompt', param: 'url', desc: 'Image to prompt', ex: 'https://files.catbox.moe/mu6qp7.png' },
  aigf: { cat: 'tools', path: 'ai-gf', param: 'prompt', desc: 'AI GF chat', ex: 'hello' },
  bgmi: { cat: 'tools', path: 'bgmi', param: 'user', desc: 'BGMI user lookup', ex: 'player' }
};

const CATS = {
  network: { icon: '🌐', label: 'Network & IP' },
  identity: { icon: '🆔', label: 'Identity & Docs' },
  vehicle: { icon: '🚗', label: 'Vehicle' },
  social: { icon: '📱', label: 'Social Media' },
  media: { icon: '🎬', label: 'Media' },
  tools: { icon: '🛠️', label: 'Tools' }
};

function getHttp() {
  const axios = require('axios');
  return axios.create({
    timeout: 45000,
    headers: { 'User-Agent': 'QUEEN-AKUMA-OSINT/1.0', Accept: 'application/json' },
    validateStatus: (s) => s < 500
  });
}

function compact(o) {
  if (o === null || o === undefined || o === '') return undefined;
  if (typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(compact).filter((v) => v !== undefined);
  const r = {};
  for (const [k, v] of Object.entries(o)) {
    const c = compact(v);
    if (c !== undefined) r[k] = c;
  }
  return r;
}

function formatResult(data) {
  try { return JSON.stringify(compact(data), null, 2); }
  catch { return String(data); }
}

async function callApi(cmdKey, query) {
  const meta = COMMANDS[cmdKey];
  if (!meta) throw new Error('Unknown OSINT command: ' + cmdKey);
  const q = String(query || '').trim();
  if (!q) throw new Error('Usage: .' + cmdKey + ' <' + meta.param + '>\nExample: .' + cmdKey + ' ' + (meta.ex || ''));
  const url = API_BASE + '/' + meta.path;
  const params = { [meta.param]: q, key: API_KEY };
  const r = await getHttp().get(url, { params });
  if (r.status === 404) throw new Error('API endpoint not found (404)');
  if (r.status >= 400) {
    const msg = (r.data && (r.data.message || r.data.error)) || r.statusText || ('HTTP ' + r.status);
    throw new Error(String(msg));
  }
  return r.data;
}

function resolveAlias(name) {
  const n = String(name || '').toLowerCase().replace(/^\./, '');
  if (COMMANDS[n]) return n;
  for (const [k, c] of Object.entries(COMMANDS)) {
    if ((c.aliases || []).includes(n)) return k;
  }
  return null;
}

function menuText(filterCat) {
  if (!filterCat) {
    let m = '╭━━━〔 🔍 *OSINT HUB* 〕━━━╮\n\nAPI: osint-apis-hub\nCommands: *' + Object.keys(COMMANDS).length + '*\n\n*Categories:*\n';
    const counts = {};
    for (const c of Object.values(COMMANDS)) counts[c.cat] = (counts[c.cat] || 0) + 1;
    for (const [k, c] of Object.entries(CATS)) {
      if (counts[k]) m += c.icon + ' `.osintmenu ' + k + '` — ' + c.label + ' (' + counts[k] + ')\n';
    }
    m += '\n`.osint <cmd> <query>`\n`.osintsearch <kw>`\n`.detect <value>`\n_INCONNU BOY SENSEI · QUEEN AKUMA_\n╰━━━━━━━━━━━━━━━━━━━━╯';
    return m;
  }
  const cat = filterCat.toLowerCase();
  const meta = CATS[cat];
  if (!meta) return '❌ Unknown category. Try: ' + Object.keys(CATS).join(', ');
  const list = Object.entries(COMMANDS).filter(([, v]) => v.cat === cat);
  let m = '╭━━━〔 ' + meta.icon + ' *' + meta.label + '* 〕━━━╮\n\n';
  list.forEach(([n, c], i) => {
    m += '*' + String(i + 1).padStart(2, '0') + '.* `.' + n + '`\n     ↳ ' + c.desc + ' _(' + c.ex + ')_\n';
  });
  m += '\n╰━━━━━━━━━━━━━━━━━━━━╯';
  return m;
}

function searchCommands(kw) {
  const q = String(kw || '').toLowerCase();
  return Object.entries(COMMANDS).filter(
    ([n, c]) => n.includes(q) || c.desc.toLowerCase().includes(q) || c.cat.includes(q)
  );
}

function detectValue(s) {
  const hits = [];
  const t = String(s || '').trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(t)) hits.push('ipv1', 'ipv2', 'ipv3');
  if (/^\d{15}$/.test(t)) hits.push('imei');
  if (/^\d{6}$/.test(t)) hits.push('pincode');
  if (/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(t)) hits.push('ifsc');
  if (/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Zz][A-Z\d]$/.test(t)) hits.push('gst', 'gstd', 'gstinfo');
  if (/^[A-Z]{5}\d{4}[A-Z]$/i.test(t)) hits.push('pan', 'pan2gst');
  if (/^\d{12}$/.test(t)) hits.push('family');
  if (/^[A-Z]{2}[-\s]?\d{1,2}[-\s]?[A-Z]{1,3}[-\s]?\d{4}$/i.test(t)) hits.push('vehicle', 'challan');
  if (/^https?:\/\/(youtube\.com|youtu\.be)/i.test(t)) hits.push('ytinfo', 'ytall');
  if (/instagram\.com/i.test(t)) hits.push('igprofile', 'igposts');
  if (/twitter\.com|x\.com/i.test(t)) hits.push('twprofile', 'twvideo');
  if (/^\+?\d{10,15}$/.test(t)) hits.push('num', 'leak');
  if (/^https?:\/\//i.test(t)) hits.push('scrape');
  return [...new Set(hits)];
}

module.exports = {
  API_BASE, API_KEY, COMMANDS, CATS,
  callApi, formatResult, resolveAlias, menuText, searchCommands, detectValue
};
