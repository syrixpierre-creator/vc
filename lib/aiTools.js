/**
 * QUEEN AKUMA v3.3.0 — shared AI helpers
 * geminiText: Gemini 2.0 Flash se text (sab AI commands isi ko use karte hain).
 * pollinationsImage: free image gen (no key).
 * Group message tracker: .gsummary ke liye har group ke last 60 text messages
 * memory me rakhta hai (restart par clear — summary ke liye kaafi hai).
 */
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function geminiText(prompt, opts = {}) {
  const key = process.env.GEMINI_API_KEY || '';
  let geminiError = null;
  if (key) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), opts.timeoutMs || 25000);
      const res = await fetch(GEMINI_URL + '?key=' + encodeURIComponent(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: opts.temperature ?? 0.8, maxOutputTokens: opts.maxTokens || 1500 },
        }),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(t));
      if (!res.ok) {
        geminiError = `❌ Gemini error (HTTP ${res.status}). Key check karo ya thodi der baad try karo.`;
      } else {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
        if (text.trim()) return { ok: true, text: text.trim() };
        geminiError = '❌ Gemini ne khaali jawab diya. Dobara try karo.';
      }
    } catch (e) {
      geminiError = '❌ Gemini se connect nahi ho paya: ' + String(e.message || e).slice(0, 120);
    }
  } else {
    geminiError = '❌ *GEMINI_API_KEY nahi hai.*\n\n1. https://aistudio.google.com/app/apikey se FREE key lo\n2. `.env` me daalo: `GEMINI_API_KEY=<redacted>';
  }
  // v3.5.0 — Fallback: Pollinations (free, no key — GAAJU find). Gemini fail ho
  // ya key na ho to ye models (openai/mistral/deepseek race) jawab dete hain.
  try {
    const { pollinationsTextFast } = require('./pollinations');
    const text = await pollinationsTextFast(prompt, opts.timeoutMs || 25000);
    if (text && String(text).trim()) return { ok: true, text: String(text).trim(), via: 'pollinations' };
  } catch (e) {}
  return { ok: false, error: geminiError + '\n\n(Pollinations fallback bhi fail ho gaya — net check karo ya thodi der baad try karo.)' };
}

async function pollinationsImage(prompt, opts = {}) {
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt)
    + '?width=' + (opts.width || 512) + '&height=' + (opts.height || 512) + '&nologo=true&seed=' + Math.floor(Math.random() * 100000);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    const res = await fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    if (!res.ok) return { ok: false, error: `Image gen fail (HTTP ${res.status})` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return { ok: false, error: 'Image gen ne khaali image di.' };
    return { ok: true, buffer: buf };
  } catch (e) {
    return { ok: false, error: 'Image gen se connect nahi ho paya: ' + String(e.message || e).slice(0, 100) };
  }
}

// ---- group message tracker (gsummary) ----
const groupMsgs = new Map(); // chatId -> [{sender, text, at}]
function recordGroupMessage(chatId, senderJid, text) {
  if (!chatId || !chatId.endsWith('@g.us') || !text || text.length < 2) return;
  if (!groupMsgs.has(chatId)) groupMsgs.set(chatId, []);
  const arr = groupMsgs.get(chatId);
  arr.push({ sender: String(senderJid).split('@')[0].slice(-10), text: text.slice(0, 200), at: Date.now() });
  if (arr.length > 60) arr.splice(0, arr.length - 60);
}
function getGroupMessages(chatId) { return groupMsgs.get(chatId) || []; }

module.exports = { geminiText, pollinationsImage, recordGroupMessage, getGroupMessages };
