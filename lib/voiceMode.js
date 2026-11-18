/**
 * QUEEN AKUMA v3.0.0 — Voice Mode
 * Bolo -> bot sunega (STT) -> command chalega -> jawab voice me (TTS).
 *
 * STT (speech-to-text), priority order:
 *   1. Groq Whisper  (GROQ_API_KEY env — free key: console.groq.com)
 *   2. Wit.ai        (WIT_AI_TOKEN env — free token: wit.ai)
 * TTS (text-to-speech):
 *   1. gTTS (Google TTS, no key) -> opus voice note
 *   2. EliteProTech AirMore TTS (fallback)
 * Dono keys free hain, koi payment nahi. Key set nahi hai to bot setup
 * steps bhejta hai, crash nahi karta.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const axios = require('axios');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'voiceMode.json');
const DEFAULTS = { enabled: false, lang: 'hi', replyVoice: true }; // v3.5.0: default OFF (opt-in) — bina on kiye kisi bhi voice note pe reply nahi aayega
const MAX_VOICE_SECONDS = 120;
const MAX_SPEAK_CHARS = 600;

function getConfig() {
  try {
    const d = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return { ...DEFAULTS, ...d };
  } catch (_) { return { ...DEFAULTS }; }
}
function saveConfig(patch) {
  const cfg = { ...getConfig(), ...patch };
  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (_) {}
  return cfg;
}
function isEnabled() { return getConfig().enabled !== false; }
function replyVoice() { return getConfig().replyVoice !== false; }
function getLang() { return getConfig().lang || 'hi'; }

function groqKey() { return (process.env.GROQ_API_KEY || '').trim(); }
function witKey() { return (process.env.WIT_AI_TOKEN || '').trim(); }

const SETUP_HINT = '🎙️ *Voice Mode ke liye free STT key chahiye:*\n\n'
  + '1️⃣ Groq (best): console.groq.com -> free API key banao\n'
  + '2️⃣ Env me daalo: `GROQ_API_KEY=gsk_...`\n'
  + '3️⃣ Bot restart karo, phir voice note bhejo\n\n'
  + 'Ya Wit.ai: wit.ai -> app banao -> Server Access Token -> `WIT_AI_TOKEN=...`\n'
  + 'Voice note se `.voicemode` commands bhi chalenge.';

/** Voice note (opus/ogg) -> 16kHz mono WAV (Whisper/Wit ko ye format chahiye). */
function toWav16k(buffer) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', '-ar', '16000', '-ac', '1', '-f', 'wav', 'pipe:1']);
    const chunks = [];
    let err = '';
    const timer = setTimeout(() => { try { ff.kill('SIGKILL'); } catch (_) {} reject(new Error('ffmpeg timeout')); }, 20000);
    ff.stdout.on('data', (c) => chunks.push(c));
    ff.stderr.on('data', (c) => { err += c.toString(); });
    ff.on('error', (e) => { clearTimeout(timer); reject(e); });
    ff.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 || !chunks.length) return reject(new Error('ffmpeg fail: ' + (err || code)));
      resolve(Buffer.concat(chunks));
    });
    ff.stdin.on('error', () => {});
    ff.stdin.end(buffer);
  });
}

function multipart(fields, fileBuf, fileName, fileType) {
  const boundary = '----queenakuma' + Date.now().toString(16);
  const parts = [];
  for (const [k, v] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
  }
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${fileType}\r\n\r\n`));
  parts.push(fileBuf);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}

async function transcribeGroq(wav, lang) {
  const { body, contentType } = multipart(
    { model: 'whisper-large-v3', language: lang === 'hi' ? 'hi' : 'en', response_format: 'json' },
    wav, 'audio.wav', 'audio/wav');
  const r = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', body, {
    headers: { Authorization: 'Bearer ' + groqKey(), 'Content-Type': contentType },
    timeout: 60000, maxBodyLength: Infinity
  });
  const text = (r.data && r.data.text || '').trim();
  return text ? { ok: true, text, provider: 'groq' } : { ok: false, error: 'empty transcript' };
}

async function transcribeWit(wav, lang) {
  const r = await axios.post('https://api.wit.ai/speech?v=20230215', wav, {
    headers: { Authorization: 'Bearer ' + witKey(), 'Content-Type': 'audio/wav', 'Accept': 'application/json' },
    timeout: 60000, maxBodyLength: Infinity
  });
  // Wit kabhi-kabhi newline-separated JSON objects bhejta hai — aakhri
  // object jisme `text` ho, wahi final transcript hai.
  let text = '';
  const raw = typeof r.data === 'string' ? r.data : JSON.stringify(r.data);
  for (const line of raw.split('\n')) {
    try { const o = JSON.parse(line); if (o && o.text) text = String(o.text).trim(); } catch (_) {}
  }
  if (!text && r.data && r.data.text) text = String(r.data.text).trim();
  return text ? { ok: true, text, provider: 'wit' } : { ok: false, error: 'empty transcript' };
}

/** Audio buffer -> text. {ok, text, provider} | {ok:false, error, setupNeeded}. */
async function transcribe(buffer, lang) {
  lang = (lang || getLang() || 'hi').toLowerCase().startsWith('hi') ? 'hi' : 'en';
  if (!groqKey() && !witKey()) return { ok: false, error: 'no key', setupNeeded: true };
  let wav;
  try { wav = await toWav16k(buffer); }
  catch (e) { return { ok: false, error: 'audio convert fail: ' + e.message }; }
  if (groqKey()) {
    try { return await transcribeGroq(wav, lang); } catch (e) { /* fallback */ }
  }
  if (witKey()) {
    try { return await transcribeWit(wav, lang); } catch (e) { return { ok: false, error: 'wit fail: ' + (e.response?.status || e.message) }; }
  }
  return { ok: false, error: 'groq fail' };
}

/** TTS ke liye markdown/emoji/URL hatao, 600 chars tak rakho. */
function cleanForSpeech(text) {
  let t = String(text || '')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[*_`~#>]/g, ' ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > MAX_SPEAK_CHARS) {
    t = t.slice(0, MAX_SPEAK_CHARS);
    const cut = Math.max(t.lastIndexOf('. '), t.lastIndexOf(', '));
    if (cut > 200) t = t.slice(0, cut + 1);
  }
  return t;
}

/** Text -> opus voice-note buffer. {ok, buffer} | {ok:false, error}. */
async function speak(text, lang) {
  const clean = cleanForSpeech(text);
  if (!clean) return { ok: false, error: 'empty text' };
  lang = (lang || getLang() || 'hi').toLowerCase().startsWith('hi') ? 'hi' : 'en';
  const converter = require('../data/converter');
  // 1) gTTS (free, no key)
  try {
    const gtts = require('gtts');
    const tmp = path.join(os.tmpdir(), `demon-tts-${Date.now()}.mp3`);
    await new Promise((res, rej) => { new gtts(clean, lang).save(tmp, (e) => (e ? rej(e) : res())); });
    const mp3 = fs.readFileSync(tmp);
    try { fs.unlinkSync(tmp); } catch (_) {}
    const opus = await converter.toPTT(mp3, 'mp3');
    return { ok: true, buffer: opus, provider: 'gtts' };
  } catch (e) { /* fallback */ }
  // 2) EliteProTech AirMore TTS
  try {
    const { tts } = require('./eliteApi');
    const url = await tts(clean);
    if (!url) throw new Error('no url');
    const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
    const opus = await converter.toPTT(Buffer.from(r.data), 'mp3');
    return { ok: true, buffer: opus, provider: 'elite' };
  } catch (e) {
    return { ok: false, error: 'tts fail: ' + e.message };
  }
}

/**
 * Voice note message ko handle karo: download -> transcribe.
 * Returns {text} | {setupNeeded} | {failed} | null (voice note nahi / mode off).
 */
async function handleVoiceNote(sock, message, opts = {}) {
  if (!isEnabled()) return null;
  const audio = message.message?.audioMessage;
  if (!audio || audio.ptt !== true) return null;
  if (audio.seconds && audio.seconds > MAX_VOICE_SECONDS) {
    return { failed: true, error: 'Voice note 2 minute se lamba hai, chhota bhejo.' };
  }
  let buf;
  try {
    const { downloadMediaMessage } = require('@whiskeysockets/baileys');
    buf = await downloadMediaMessage(message, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
  } catch (e) {
    return { failed: true, error: 'download fail: ' + e.message };
  }
  if (!buf || !buf.length) return { failed: true, error: 'empty audio' };
  const res = await transcribe(buf, opts.lang || getLang());
  if (res.ok) return { text: res.text, provider: res.provider };
  if (res.setupNeeded) return { setupNeeded: SETUP_HINT };
  return { failed: true, error: res.error || 'transcribe fail' };
}

module.exports = {
  getConfig, saveConfig, isEnabled, replyVoice, getLang,
  transcribe, speak, cleanForSpeech, handleVoiceNote, toWav16k,
  SETUP_HINT, MAX_VOICE_SECONDS
};
