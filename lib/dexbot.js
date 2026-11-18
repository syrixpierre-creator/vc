const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(process.cwd(), 'data', 'dexbot.json');

function defaults() {
  try {
    const c = require('../config');
    return {
      enabled: false,
      dm: true,
      group: false,
      ownerName: (c.DEXBOT && c.DEXBOT.ownerName) || 'INCONNU BOY SENSEI',
      developerName: (c.DEXBOT && c.DEXBOT.developerName) || 'INCONNU BOY SENSEI',
      botName: (c.DEXBOT && c.DEXBOT.botName) || 'QUEEN AKUMA',
      helloMessage:
        (c.DEXBOT && c.DEXBOT.helloMessage) ||
        '👋 Hello! Main QUEEN AKUMA AI assistant hoon. Kuch poochho ya *.menu* dekho.',
      systemPrompt:
        (c.DEXBOT && c.DEXBOT.systemPrompt) ||
        'You are QUEEN AKUMA WhatsApp assistant. Reply short, friendly, same language as user (Hi/En/Hinglish).'
    };
  } catch {
    return {
      enabled: false,
      dm: true,
      group: false,
      ownerName: 'INCONNU BOY SENSEI',
      developerName: 'INCONNU BOY SENSEI',
      botName: 'QUEEN AKUMA',
      helloMessage: '👋 Hello! Main QUEEN AKUMA AI assistant hoon.',
      systemPrompt: 'You are QUEEN AKUMA assistant. Be short and helpful.'
    };
  }
}

function load() {
  const base = defaults();
  try {
    if (!fs.existsSync(DB_PATH)) return { ...base };
    const j = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return { ...base, ...j };
  } catch {
    return { ...base };
  }
}

function save(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  return data;
}

function set(key, value) {
  const d = load();
  d[key] = value;
  return save(d);
}

function getGeminiKey() {
  try {
    const c = require('../config');
    return process.env.GEMINI_API_KEY || c.GEMINI_API_KEY || global.GEMINI_API_KEY || '';
  } catch {
    return process.env.GEMINI_API_KEY || '';
  }
}

function getModel() {
  try {
    const c = require('../config');
    return process.env.GEMINI_MODEL || c.GEMINI_MODEL || 'gemini-2.0-flash';
  } catch {
    return 'gemini-2.0-flash';
  }
}

function shouldReply(chatId, isGroup) {
  const d = load();
  if (!d.enabled) return false;
  if (isGroup) return !!d.group;
  return !!d.dm;
}

function isGreeting(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t || t.length > 40) return false;
  return /^(hi+|hello+|hey+|hii+|helo+|hola|yo|sup|good\s*(morning|night|evening)|namaste|namaskar|salam)\b/.test(t);
}

function isOwnerQuestion(text) {
  const t = String(text || '').toLowerCase();
  return /(who\s*(is\s*)?(your\s*)?(owner|developer|creator|banaya|banaye)|owner\s*(kaun|kon)|developer\s*(kaun|kon)|kisne\s*banaya|creator)/i.test(t);
}

async function askElite(userText) {
  const d = load();
  const system =
    (d.systemPrompt || '') +
    ` Bot name: ${d.botName}. Owner: ${d.ownerName}. Developer: ${d.developerName}. Keep answers short.`;
  const prompt = `${system}\n\nUser: ${String(userText || '').slice(0, 2000)}`;
  // 1) EliteProTech API
  try {
    const elite = require('./eliteApi');
    const data = await elite.call('gemini', { text: prompt, q: prompt, prompt });
    let text = data && (data.result ?? data.response ?? data.message ?? data.data ?? data.text);
    if (text && typeof text === 'object') text = JSON.stringify(text);
    if (text && String(text).trim()) return { ok: true, text: String(text).trim(), via: 'elite' };
  } catch (e) {
    /* fall through */
  }
  // 2) Multi-API switch
  try {
    const { ai } = require('./apiSwitch');
    const text = await ai(prompt);
    if (text && String(text).trim()) return { ok: true, text: String(text).trim(), via: 'apiswitch' };
  } catch (e) {
    /* fall through */
  }
  return { ok: false, error: 'Elite API unavailable' };
}

async function askGemini(userText) {
  const d = load();
  const model = getModel();
  const system =
    d.systemPrompt +
    `\nBot name: ${d.botName}. Owner: ${d.ownerName}. Developer: ${d.developerName}. Keep answers under 400 chars when possible.`;

  // Prefer EliteProTech first (no Google key needed)
  const eliteTry = await askElite(userText);
  if (eliteTry.ok) return eliteTry;

  const key = getGeminiKey();
  if (!key) {
    return {
      ok: false,
      error:
        'Elite API down + GEMINI_API_KEY missing. Set key in config/.env ya Elite online hone ka wait karo.'
    };
  }

  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: String(userText || '').slice(0, 2000) }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
  });

  const urlPath = `/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(body);
            if (j.error) {
              resolve({ ok: false, error: j.error.message || JSON.stringify(j.error) });
              return;
            }
            const text =
              j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
              j.candidates?.[0]?.content?.parts?.[0]?.text ||
              '';
            if (!text) {
              resolve({ ok: false, error: 'Empty Gemini response' });
              return;
            }
            resolve({ ok: true, text: text.trim(), via: 'gemini' });
          } catch (e) {
            resolve({ ok: false, error: e.message + ' | ' + body.slice(0, 120) });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Gemini timeout' });
    });
    req.write(payload);
    req.end();
  });
}

/**
 * Handle non-command chat for dexbot
 * returns true if handled
 */
async function handleDexbotMessage(sock, message, text, chatId, isGroup) {
  if (!shouldReply(chatId, isGroup)) return false;
  const raw = String(text || '').trim();
  if (!raw) return false;
  // ignore commands
  if (/^[.#!\/]/.test(raw)) return false;

  const d = load();

  if (isGreeting(raw)) {
    await sock.sendMessage(chatId, { text: d.helloMessage }, { quoted: message });
    return true;
  }

  if (isOwnerQuestion(raw)) {
    await sock.sendMessage(
      chatId,
      {
        text:
          `👤 *${d.botName}*\n` +
          `👑 Owner: *${d.ownerName}*\n` +
          `🛠️ Developer: *${d.developerName}*\n\n` +
          `_Customise: .dexbot set owner|developer|hello|botname_`
      },
      { quoted: message }
    );
    return true;
  }

  const ai = await askGemini(raw);
  if (!ai.ok) {
    await sock.sendMessage(
      chatId,
      { text: `⚠️ AI: ${ai.error}` },
      { quoted: message }
    );
    return true;
  }
  await sock.sendMessage(chatId, { text: ai.text }, { quoted: message });
  return true;
}

module.exports = {
  load,
  save,
  set,
  shouldReply,
  askGemini,
  handleDexbotMessage,
  getGeminiKey
};
