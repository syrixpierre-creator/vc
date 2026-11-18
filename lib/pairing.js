/**
 * QUEEN AKUMA — Custom Pairing (v2.9.0)
 * Ek hi pairing engine, 3 jagah se use hota hai:
 *   1. KataBump / terminal — index.js startup flow (PAIRING_NUMBER)
 *   2. Telegram — /pair <number> (lib/telegramBot.js, owner-only)
 *   3. Website — GET /code?number=... (lib/server.js + app/pair.html)
 *
 * "Custom pairing code" matlab: bot khud number validate karke
 * WhatsApp se 8-digit code mangta hai aur XXXX-XXXX format me deta hai.
 * Code khud WhatsApp generate karta hai — digits choose nahi kiye ja sakte.
 *
 * Security: website se by default SIRF owner ka number pair ho sakta hai
 * (PAIRING_NUMBER / owner 554488138425). Koi bhi random banda apna number
 * pair karke bot hijack na kar le. Kholna ho to env: ALLOW_ANY_PAIR=true
 */
'use strict';

let sock = null;

function setSocket(s) { sock = s || null; }
function getSocket() { return sock; }

function isRegistered() {
  try { return !!(sock && sock.authState && sock.authState.creds && sock.authState.creds.registered); }
  catch (_) { return false; }
}

function ownerNumber() {
  const n = String(process.env.PAIRING_NUMBER || global.PAIRING_NUMBER || '554488138425').replace(/[^0-9]/g, '');
  return n;
}

function allowAnyPair() {
  return String(process.env.ALLOW_ANY_PAIR || '').toLowerCase() === 'true';
}

function cleanNumber(raw) {
  return String(raw || '').replace(/[^0-9]/g, '');
}

function validateNumber(raw) {
  const num = cleanNumber(raw);
  if (!num) return { ok: false, error: 'Number likho — jaise 554488138425 (country code ke saath, bina + ke).' };
  if (num.length < 10 || num.length > 15) return { ok: false, error: 'Galat number — 10 se 15 digit hona chahiye (country code ke saath).' };
  try {
    const pn = require('awesome-phonenumber');
    if (!pn('+' + num).isValid()) return { ok: false, error: 'Galat number format — sahi WhatsApp number likho.' };
  } catch (_) { /* awesome-phonenumber na ho to length check hi kaafi hai */ }
  return { ok: true, number: num };
}

function formatCode(code) {
  const c = String(code || '').replace(/[^0-9A-Za-z]/g, '');
  return c.length === 8 ? c.slice(0, 4) + '-' + c.slice(4) : c;
}

/**
 * Pairing code mangao. Returns { ok, code, number } ya { ok:false, error }.
 * opts: { allowAny: boolean } — website se call karte waqt owner-check lagta hai.
 */
async function requestPairCode(rawNumber, opts = {}) {
  const v = validateNumber(rawNumber);
  if (!v.ok) return { ok: false, error: v.error };
  const num = v.number;

  if (!sock || typeof sock.requestPairingCode !== 'function') {
    return { ok: false, error: 'Bot abhi start ho raha hai — 10 second baad dobara try karo.' };
  }
  if (isRegistered()) {
    return { ok: false, error: 'Bot pehle se connected hai — pairing ki zaroorat nahi.' };
  }

  // Website safety: owner ka number hi pair ho (Telegram /pair owner-only hai hi).
  const any = opts.allowAny === true || allowAnyPair();
  if (!any && opts.from !== 'telegram' && num !== ownerNumber()) {
    return { ok: false, error: 'Website se sirf owner ka number pair hota hai. Apna number pair karna ho to Telegram par /pair use karo ya ALLOW_ANY_PAIR=true set karo.' };
  }

  // Number WhatsApp par hai ya nahi — check karo (fail ho to bhi aage badho).
  try {
    if (typeof sock.onWhatsApp === 'function') {
      const res = await sock.onWhatsApp(num + '@s.whatsapp.net');
      if (!res || !res.length || !res[0].exists) {
        return { ok: false, error: 'Ye number WhatsApp par registered nahi hai.' };
      }
    }
  } catch (_) { /* check fail ho to bhi code mangao */ }

  try {
    const code = await sock.requestPairingCode(num);
    const pretty = formatCode(code);
    return { ok: true, code: pretty, raw: String(code || ''), number: num };
  } catch (e) {
    return { ok: false, error: 'Pairing code nahi mila: ' + (e && e.message ? e.message : 'try again') };
  }
}

function getStatus() {
  return {
    registered: isRegistered(),
    connected: !!sock,
    owner: ownerNumber(),
  };
}

module.exports = {
  setSocket, getSocket, isRegistered,
  ownerNumber, allowAnyPair, cleanNumber, validateNumber, formatCode,
  requestPairCode, getStatus,
};
