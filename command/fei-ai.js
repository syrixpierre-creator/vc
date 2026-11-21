/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: AI + TTS commands
 * Live-probed 2026-11-15/16. Backends:
 *  .mathgpt   - Elite MathGPT (step-by-step maths, verified 200 live)
 *  .summarize - Rebix gptlogic (verified 200 live) -> geminiText fallback
 *  .qwen      - geminiText (Pollinations free fallback, no key)
 *               [pehle OmegaTech Qwen tha — DEAD, probe me 500]
 *  .tts3/.tts4 - gTTS local (free, no key) — Omega TTS DEAD (500).
 *               Free gTTS me voice selection nahi hota, sirf language.
 * SKIP (dead, probe me fail): .fable5 (Omega Secret 500 billing),
 *  .deepseek2 (Omega Deepseek 500 / khaali answer), .pollination
 *  (Omega polination 500, Pollinations 402), .tts5 (Omega Multi-TTS 500).
 * 'summary' alias nahi liya - QUEEN AKUMA me pehle se hai.
 */
const fei = require('../lib/feiApi');
const { geminiText } = require('../lib/aiTools');
const fs = require('fs');
const os = require('os');
const path = require('path');

const LANGS = {
  english: 'en', en: 'en', hindi: 'hi', hi: 'hi', hinglish: 'hi', urdu: 'ur', ur: 'ur',
  arabic: 'ar', ar: 'ar', indonesian: 'id', id: 'id', spanish: 'es', es: 'es',
  french: 'fr', fr: 'fr', bengali: 'bn', bn: 'bn', tamil: 'ta', ta: 'ta',
  telugu: 'te', te: 'te', marathi: 'mr', mr: 'mr', punjabi: 'pa', pa: 'pa',
  gujarati: 'gu', gu: 'gu', malayalam: 'ml', ml: 'ml', kannada: 'kn', kn: 'kn',
  german: 'de', de: 'de', portuguese: 'pt', pt: 'pt', russian: 'ru', ru: 'ru',
  turkish: 'tr', tr: 'tr', japanese: 'ja', ja: 'ja', korean: 'ko', ko: 'ko',
  chinese: 'zh-CN', 'zh-cn': 'zh-CN'
};

function ttsSave(text, lang) {
  return new Promise((resolve, reject) => {
    const gtts = require('gtts');
    const out = path.join(os.tmpdir(), 'demon-feitts-' + Date.now() + '.mp3');
    try {
      const t = new gtts(text, lang || 'en');
      t.save(out, (err) => { if (err) return reject(err); resolve(out); });
    } catch (e) { reject(e); }
  });
}

const FAIL = '❌ *API is not responding. Try again later.*';

function make(cmd, aliases, desc, usage, run) {
  return {
    command: cmd, aliases, category: 'fei-ai', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const input = (args || []).join(' ').trim();
      if (!input && !usage.includes('[optional]')) return reply(`❌ Usage: ${usage}`);
      try { await run(sock, chatId, message, input, args, reply); }
      catch (e) { await reply('❌ Error: ' + String((e && e.message) || e).slice(0, 200)); }
    },
  };
}

const AUDIO_HOSTS = ['clideo.com', 'catbox.moe', 'replicate.delivery', 'malvryx.dev', 'googleapis.com'];

function safeAudioUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    const host = u.hostname.toLowerCase();
    if (u.protocol !== 'https:' || u.username || u.password) return '';
    if (!AUDIO_HOSTS.some(s => host === s || host.endsWith('.' + s))) return '';
    return u.toString();
  } catch (_) { return ''; }
}

function valueAt(payload, paths) {
  for (const p of paths) {
    let v = payload;
    for (const k of p.split('.')) v = v && v[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function sendAnswer(reply, title, answer) {
  const body = String(answer || '').trim();
  if (!body) throw new Error('The AI did not answer.');
  return reply(fei.box(title, body.slice(0, 3300)));
}

module.exports = {
  commands: [
    make('mathgpt', [], 'Maths step-by-step solve karo (Elite AI)', '.mathgpt <sawal>', async (sock, chatId, message, input, args, reply) => {
      await sock.sendMessage(chatId, { text: '➗ Thinking…' }, { quoted: message }).catch(() => {});
      const ans = await fei.eliteMathgpt(input);
      await sendAnswer(reply, '➗ MATHGPT', ans);
    }),
    make('summarize', [], 'Lamba text chhota karke summary do (Rebix AI)', '.summarize <text>', async (sock, chatId, message, input, args, reply) => {
      const style = 'Summarize clearly in about 180–300 words. Do not invent details. Use concise bullets and moderate spacing. Use single asterisks for WhatsApp bold.';
      let ans = null;
      try { ans = await fei.rebixText('gptlogic', { q: input, prompt: style }); }
      catch (_) {
        const r = await geminiText('Summarize clearly in about 180-300 words. Do not invent details. Use concise bullets:\n\n' + input, { maxTokens: 800, temperature: 0.3 });
        ans = r.ok ? r.text : null;
      }
      if (!ans) return reply(FAIL);
      await sendAnswer(reply, '📚 SUMMARY', ans);
    }),
    make('qwen', [], 'Qwen-style AI se sawal pucho (Pollinations, no key)', '.qwen <sawal>', async (sock, chatId, message, input, args, reply) => {
      const r = await geminiText(input, { maxTokens: 1500, temperature: 0.7 });
      if (!r.ok) return reply(r.error || FAIL);
      await sendAnswer(reply, '🧠 QWEN', r.text);
    }),
    make('tts3', [], 'Text ko voice me badlo v3 (gTTS local) [voice] | [language]', '.tts3 <text> | [voice] | [language]', async (sock, chatId, message, input, args, reply) => {
      const parts = input.split('|');
      const text = String(parts[0] || '').trim();
      if (!text) return reply('❌ Usage: .tts3 <text> | [voice] | [language]\nExample: .tts3 hello world | woman1 | English');
      if (text.length > 1800) return reply('❌ Text 1800 characters se kam rakho.');
      const language = String(parts[2] || 'English').trim();
      const lang = LANGS[language.toLowerCase()] || 'en';
      let out = null;
      try {
        out = await ttsSave(text, lang);
        const buf = fs.readFileSync(out);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
        await reply(fei.box('🔊 TEXT TO SPEECH V3', 'Text: ' + text.slice(0, 500) + '\nLanguage: ' + language + ' (' + lang + ')'));
      } catch (e) {
        await reply('❌ Voice nahi ban paya: ' + String(e.message || e).slice(0, 120));
      } finally {
        try { if (out && fs.existsSync(out)) fs.unlinkSync(out); } catch (e) {}
      }
    }),
    make('tts4', [], 'Text ko voice me badlo v2 (gTTS local) [voice]', '.tts4 <text> | [voice]', async (sock, chatId, message, input, args, reply) => {
      const parts = input.split('|');
      const text = String(parts[0] || '').trim();
      if (!text) return reply('❌ Usage: .tts4 <text> | [voice]\nExample: .tts4 hello world | NORMAL MALE');
      if (text.length > 1800) return reply('❌ Text 1800 characters se kam rakho.');
      let out = null;
      try {
        out = await ttsSave(text, 'en');
        const buf = fs.readFileSync(out);
        await sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
        await reply(fei.box('🔊 TEXT TO SPEECH V2', 'Text: ' + text.slice(0, 500) + ''));
      } catch (e) {
        await reply('❌ Voice nahi ban paya: ' + String(e.message || e).slice(0, 120));
      } finally {
        try { if (out && fs.existsSync(out)) fs.unlinkSync(out); } catch (e) {}
      }
    }),
  ],
};
