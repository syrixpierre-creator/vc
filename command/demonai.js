/**
 * QUEEN AKUMA • .demonai — direct Google Gemini AI (apni key se). Alias: .inconnuai.
 * Setup: .env me GEMINI_API_KEY=... daalo (https://aistudio.google.com/app/apikey
 * se free key milti hai), phir bot restart karo.
 * Key na ho to pehle bot ke existing AI (.ai) ko try karta hai.
 */
const https = require('https');

function geminiAsk(key, question, timeout = 25000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ contents: [{ parts: [{ text: question }] }] });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout,
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
          if (text) return resolve(text);
          reject(new Error((j && j.error && j.error.message) || 'Gemini se jawab nahi mila'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Gemini timeout')); });
    req.write(body);
    req.end();
  });
}

module.exports = {
  command: 'demonai',
  aliases: ['inconnuai', 'sai', 'inconnugpt'],
  category: 'ai',
  description: 'Ask QUEEN AKUMA AI (Google Gemini, direct)',
  usage: '.demonai <question>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) return reply('🤖 *QUEEN AKUMA AI*\n\nUsage: .demonai <question>\nExample: .demonai India ki rajdhani kya hai?');
    const senderJid = message.key.participant || message.key.remoteJid;
    // v3.3.0 AI Memory — user ke facts prompt me, aur naye facts yaad rakho
    let memCtx = '';
    try { memCtx = require('../lib/aiMemory').getForPrompt(senderJid); } catch (_) {}
    try {
      if (/(mera naam|my name is|mujhe .* pasand|i like |i love |main .* (hoon|hu)|i am )/i.test(q)) {
        require('../lib/aiMemory').remember(senderJid, q);
      }
    } catch (_) {}
    const q2 = memCtx ? q + '\n\n[Is user ke baare me yaad rakho: ' + memCtx + '. Jawab me iska istemal karo jahan relevant ho.]' : q;
    const key = process.env.GEMINI_API_KEY || '';
    try {
      if (key) {
        const ans = await geminiAsk(key, q2);
        return reply('🤖 *QUEEN AKUMA AI (Gemini)*\n\n' + String(ans).slice(0, 3500));
      }
      // No key: try bot's existing AI chain once
      let ans = null;
      try { const { ai } = require('../lib/apiSwitch'); ans = await ai(q); } catch {}
      if (!ans) {
        try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', q); ans = d.result || d.response || d; } catch {}
      }
      if (ans) return reply('🤖 *QUEEN AKUMA AI*\n\n' + String(ans).slice(0, 3500));
      return reply('❌ *QUEEN AKUMA AI setup nahi hai.*\n\n1. https://aistudio.google.com/app/apikey se FREE Gemini key lo\n2. `.env` me daalo: `GEMINI_API_KEY=...`\n3. Bot restart karo\n\nTab tak `.ai <sawal>` try karo.');
    } catch (e) {
      return reply('❌ QUEEN AKUMA AI error: ' + String((e && e.message) || e).slice(0, 300));
    }
  }
};
