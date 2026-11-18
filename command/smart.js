/**
 * QUEEN AKUMA • .smart — smart command: input dekh kar khud samajhta hai.
 * • Link ho to uska title + domain info deta hai
 * • IP ho to IP info, phone number ho to phone info
 * • Domain ho to whois, "weather <city>" ho to weather
 * • Baaki sab sawal ka AI jawab deta hai
 * Usage: .smart <kuch bhi>  (jaise .smart 8.8.8.8, .smart google.com, .smart Delhi ka mausam)
 */
const T = require('../lib/smartTools');
const https = require('https');

function fetchTitle(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout, headers: { 'User-Agent': 'QUEEN-AKUMA/2.1' } }, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; if (d.length > 200000) req.destroy(); });
      res.on('end', () => {
        const m = d.match(/<title[^>]*>([^<]*)<\/title>/i);
        resolve(m ? m[1].trim().slice(0, 200) : null);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function aiAnswer(q) {
  const key = process.env.GEMINI_API_KEY || '';
  if (key) {
    const body = JSON.stringify({ contents: [{ parts: [{ text: q }] }] });
    const res = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: '/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key),
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 25000,
      }, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => resolve(d)); });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.write(body); req.end();
    });
    const j = JSON.parse(res);
    const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
    if (text) return text;
    throw new Error('AI se jawab nahi mila');
  }
  let ans = null;
  try { const { ai } = require('../lib/apiSwitch'); ans = await ai(q); } catch {}
  if (!ans) {
    try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', q); ans = d.result || d.response || d; } catch {}
  }
  if (!ans) throw new Error('AI busy hai. GEMINI_API_KEY set karke .inconnuai try karo.');
  return String(ans);
}

module.exports = {
  command: 'smart',
  aliases: ['sm', 'smartai'],
  category: 'ai',
  description: 'Smart command — link/IP/number/domain/weather/AI sab samajhta hai',
  usage: '.smart <kuch bhi>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const input = (args || []).join(' ').trim();
    if (!input) {
      return reply('🧠 *Smart Command*\n\nUsage: .smart <kuch bhi>\n\n• .smart 8.8.8.8 — IP info\n• .smart 919876543210 — phone info\n• .smart google.com — domain whois\n• .smart https://example.com — link title\n• .smart weather Delhi — weather\n• .smart Bharat ki rajdhani? — AI jawab');
    }
    try {
      // weather intent
      const wm = input.match(/^(?:weather|mausam)\s+(.+)$/i);
      if (wm) {
        const w = await T.getWeather(wm[1].trim());
        return reply(T.formatWeather(w));
      }
      // URL
      if (/^https?:\/\//i.test(input)) {
        const u = new URL(input);
        let title = null;
        try { title = await fetchTitle(input); } catch {}
        let dom = '';
        try { dom = T.formatDomain(await T.domainInfo(u.hostname)); } catch {}
        return reply(`🔗 *Smart Link*\n\n🌐 Domain: ${u.hostname}\n📰 Title: ${title || 'nahi mila'}${dom ? '\n\n' + dom : ''}`);
      }
      // IP
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(input)) {
        return reply(T.formatIp(await T.ipInfo(input)));
      }
      // phone number (10-15 digits, optional +)
      if (/^\+?\d{10,15}$/.test(input.replace(/[\s-]/g, ''))) {
        return reply(T.formatPhone(T.phoneInfo(input)));
      }
      // domain
      if (/^[a-z0-9-]+\.[a-z]{2,}$/i.test(input) && !/\s/.test(input)) {
        return reply(T.formatDomain(await T.domainInfo(input)));
      }
      // default: AI
      const ans = await aiAnswer(input);
      return reply('🧠 *Smart AI*\n\n' + String(ans).slice(0, 3500));
    } catch (e) {
      return reply('❌ Smart error: ' + String((e && e.message) || e).slice(0, 300));
    }
  }
};
