/**
 * QUEEN AKUMA • Smart tools — free, no-key public APIs.
 * Used by .weather, .ipinfo/.domain/.phoneinfo/.bin/.username (osint.js),
 * .smart (intent router) and .botintro. Every helper fails gracefully
 * with a clear Error — never crashes the bot.
 */
const https = require('https');
const http = require('http');

function getJson(url, timeout = 12000, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.1', ...headers } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error('Bad JSON from ' + url)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function getText(url, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.1' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

// WMO weather codes -> description + emoji
const WMO = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'], 45: ['Foggy', '🌫️'], 48: ['Icy fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '⛈️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Light showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm + hail', '⛈️'], 99: ['Thunderstorm + hail', '⛈️'],
};

async function getWeather(city) {
  // v2.4.0 speed: weather 10min cache — repeat queries instant
  const cache = require('./fastCache');
  const key = 'weather:' + String(city).toLowerCase().trim();
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const geo = await getJson('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=en&format=json');
  if (!geo.results || !geo.results.length) throw new Error('City nahi mili: ' + city);
  const g = geo.results[0];
  const w = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`);
  const c = w.current;
  const [desc, emoji] = WMO[c.weather_code] || ['Unknown', '🌡️'];
  const out = {
    place: [g.name, g.admin1, g.country].filter(Boolean).join(', '),
    temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m, windDir: c.wind_direction_10m, pressure: c.pressure_msl,
    desc, emoji, max: w.daily.temperature_2m_max[0], min: w.daily.temperature_2m_min[0],
    rain: w.daily.precipitation_probability_max ? w.daily.precipitation_probability_max[0] : null,
    time: c.time,
  };
  cache.set(key, out, 10 * 60 * 1000);
  return out;
}

function formatWeather(w) {
  return `🌤️ *Weather — ${w.place}*\n\n${w.emoji} *${w.desc}*\n🌡️ Temperature: *${w.temp}°C* (feels like ${w.feels}°C)\n🔺 Max: ${w.max}°C  •  🔻 Min: ${w.min}°C\n💧 Humidity: ${w.humidity}%\n💨 Wind: ${w.wind} km/h (${w.windDir}°)\n🧭 Pressure: ${w.pressure} hPa${w.rain !== null && w.rain !== undefined ? `\n🌧️ Rain chance: ${w.rain}%` : ''}\n\n🕐 ${w.time}\n_Sourse: Open-Meteo (free, no key)_`;
}

async function ipInfo(ip) {
  const d = await getJson('http://ip-api.com/json/' + encodeURIComponent(ip) + '?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query');
  if (d.status !== 'success') throw new Error(d.message || 'IP lookup failed');
  return d;
}

function formatIp(d) {
  return `🌐 *IP Info — ${d.query}*\n\n📍 Location: ${d.city || '-'}, ${d.regionName || '-'}, ${d.country || '-'} (${d.countryCode || ''})\n📮 ZIP: ${d.zip || '-'}\n🗺️ Coords: ${d.lat}, ${d.lon}\n🕐 Timezone: ${d.timezone || '-'}\n🏢 ISP: ${d.isp || '-'}\n🏛️ Org: ${d.org || '-'}\n🔌 AS: ${d.as || '-'}\n📱 Mobile: ${d.mobile ? 'Yes' : 'No'}  •  🛡️ Proxy: ${d.proxy ? 'Yes' : 'No'}  •  Hosting: ${d.hosting ? 'Yes' : 'No'}`;
}

async function domainInfo(domain) {
  const tld = String(domain).split('.').pop().toLowerCase();
  const urls = [];
  if (tld === 'com' || tld === 'net') urls.push('https://rdap.verisign.com/' + tld + '/v1/domain/' + encodeURIComponent(domain));
  urls.push('https://rdap.org/domain/' + encodeURIComponent(domain));
  let lastErr = null;
  for (const u of urls) {
    try {
      const d = await getJson(u, 12000, { Accept: 'application/json' });
      const ent = (d.entities || []).find((e) => (e.roles || []).includes('registrant')) || (d.entities || [])[0] || {};
      const vcard = (ent.vcardArray && ent.vcardArray[1]) || [];
      const getV = (k) => { const f = vcard.find((x) => x[0] === k); return f ? f[3] : null; };
      const events = {};
      for (const ev of (d.events || [])) events[ev.eventAction] = ev.eventDate;
      return {
        domain: d.ldhName || domain, status: (d.status || []).join(', ') || '-',
        created: events.registration || '-', expires: events.expiration || '-', updated: events['last changed'] || '-',
        registrar: getV('fn') || '-', nameservers: (d.nameservers || []).map((n) => n.ldhName).filter(Boolean),
      };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('RDAP lookup failed');
}

function formatDomain(d) {
  return `🔍 *Domain — ${d.domain}*\n\n📌 Status: ${d.status}\n🏢 Registrar: ${d.registrar}\n📅 Created: ${String(d.created).slice(0, 10)}\n📅 Expires: ${String(d.expires).slice(0, 10)}\n🔄 Updated: ${String(d.updated).slice(0, 10)}${d.nameservers.length ? `\n🌐 Nameservers:\n${d.nameservers.map((n) => '• ' + n).join('\n')}` : ''}`;
}

function phoneInfo(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) throw new Error('Sahi phone number do (country code ke saath, jaise 919876543210).');
  let parsed = null;
  try {
    const { parsePhoneNumber } = require('libphonenumber-js');
    parsed = parsePhoneNumber('+' + digits);
  } catch {}
  if (!parsed) {
    try {
      const PhoneNumber = require('awesome-phonenumber');
      const pn = new PhoneNumber('+' + digits);
      if (pn.isValid()) parsed = { country: pn.getRegionCode(), isValid: () => true, getType: () => 'unknown', formatInternational: () => pn.getNumber('international'), formatNational: () => pn.getNumber('national'), format: () => pn.getNumber('e164') };
    } catch {}
  }
  if (!parsed) throw new Error('Number parse nahi hua. Country code ke saath bhejo.');
  return {
    number: parsed.format ? parsed.format('E.164') : '+' + digits,
    international: parsed.formatInternational ? parsed.formatInternational() : '+' + digits,
    national: parsed.formatNational ? parsed.formatNational() : digits,
    country: parsed.country || '-', valid: parsed.isValid ? parsed.isValid() : true,
    type: parsed.getType ? parsed.getType() : 'unknown',
  };
}

function formatPhone(p) {
  return `📱 *Phone Info*\n\n🔢 Number: ${p.number}\n🌍 International: ${p.international}\n🏠 National: ${p.national}\n🗺️ Country: ${p.country}\n✅ Valid: ${p.valid ? 'Yes' : 'No'}\n📞 Type: ${p.type}`;
}

async function binInfo(bin) {
  const d = await getJson('https://lookup.binlist.net/' + encodeURIComponent(bin), 12000, { 'Accept-Version': '3' });
  return d;
}

function formatBin(d, bin) {
  return `💳 *BIN Info — ${bin}*\n\n🏦 Bank: ${(d.bank && d.bank.name) || '-'}\n🌐 Scheme: ${d.scheme || '-'}  •  Type: ${d.type || '-'}\n🏷️ Brand: ${d.brand || '-'}\n🗺️ Country: ${d.country ? `${d.country.name || ''} (${d.country.alpha2 || ''})` : '-'}\n💱 Currency: ${d.country ? d.country.currency || '-' : '-'}\n💳 Prepaid: ${d.prepaid === true ? 'Yes' : d.prepaid === false ? 'No' : '-'}`;
}

async function githubUser(name) {
  const d = await getJson('https://api.github.com/users/' + encodeURIComponent(name));
  if (d.message === 'Not Found') throw new Error('GitHub user nahi mila: ' + name);
  return d;
}

function formatGithub(d) {
  return `🐙 *GitHub — ${d.login}*\n\n👤 Name: ${d.name || '-'}\n📝 Bio: ${d.bio ? String(d.bio).slice(0, 200) : '-'}\n🏢 Company: ${d.company || '-'}\n📍 Location: ${d.location || '-'}\n📦 Public repos: ${d.public_repos}  •  👥 Followers: ${d.followers}  •  Following: ${d.following}\n📅 Joined: ${String(d.created_at || '').slice(0, 10)}\n🔗 ${d.html_url}`;
}

module.exports = { getJson, getText, getWeather, formatWeather, ipInfo, formatIp, domainInfo, formatDomain, phoneInfo, formatPhone, binInfo, formatBin, githubUser, formatGithub };
