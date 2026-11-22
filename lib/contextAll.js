'use strict';
/**
 * QUEEN AKUMA — channel contextInfo on EVERY message the bot sends (commands,
 * welcome, goodbye, events…) + real user numbers in mentions.
 *
 * WhatsApp now gives group users a hidden id (…@lid). Shown in a text it looks like
 * "@121264710619221" instead of the user's number. Here:
 *  - every LID is turned into the real number (Baileys LID map, or the number seen on
 *    the user's own messages), in the mention list AND in the text ("@lid" -> "@number");
 *  - `mentions` is merged into contextInfo.mentionedJid (Baileys drops `mentions` when a
 *    message also has a contextInfo — that is why tags broke once contextInfo was added).
 */
const { channelInfo } = require('./messageConfig');

const lidToPn = new Map(); // '1212…@lid' -> '5544…@s.whatsapp.net'
const clean = (j) => String(j || '').replace(/:\d+(?=@)/, '');

function remember(lid, pn) {
  lid = clean(lid); pn = clean(pn);
  if (/@lid$/.test(lid) && /@s\.whatsapp\.net$/.test(pn)) lidToPn.set(lid, pn);
}

async function toPn(sock, jid) {
  jid = clean(jid);
  if (!/@lid$/.test(jid)) return jid;
  if (lidToPn.has(jid)) return lidToPn.get(jid);
  try {
    const m = sock.signalRepository && sock.signalRepository.lidMapping;
    const pn = m && typeof m.getPNForLID === 'function' ? await m.getPNForLID(jid) : null;
    if (pn) { remember(jid, pn); return clean(pn); }
  } catch (_) {}
  return jid;
}

const SKIP_KEYS = ['react', 'delete', 'edit', 'pin', 'keep', 'protocolMessage', 'disappearingMessagesInChat', 'forward'];

async function prepare(sock, jid, content) {
  if (!content || typeof content !== 'object' || Buffer.isBuffer(content)) return content;
  if (SKIP_KEYS.some((k) => content[k] !== undefined)) return content;
  if (/@newsletter$|^status@broadcast$/.test(String(jid))) return content;

  const prev = content.contextInfo && typeof content.contextInfo === 'object' ? content.contextInfo : {};
  const raw = [...(content.mentions || []), ...(prev.mentionedJid || []), ...(prev.mentions || [])].filter(Boolean).map(String);
  const out = { ...content };
  const ctx = { ...((channelInfo && channelInfo.contextInfo) || {}), ...prev };
  delete ctx.mentions;

  if (raw.length) {
    const mapped = [];
    for (const j of raw) {
      const pn = await toPn(sock, j);
      mapped.push(pn);
      const from = clean(j).split('@')[0], to = pn.split('@')[0];
      if (from !== to) {
        const re = new RegExp('@' + from + '\\b', 'g');
        if (typeof out.text === 'string') out.text = out.text.replace(re, '@' + to);
        if (typeof out.caption === 'string') out.caption = out.caption.replace(re, '@' + to);
      }
    }
    ctx.mentionedJid = [...new Set(mapped)];
    out.mentions = ctx.mentionedJid;
  }
  out.contextInfo = ctx;
  return out;
}

/**
 * Old-style buttons ({ buttonId, buttonText }) are not shown by WhatsApp with the
 * official Baileys. They are sent as native "quick_reply" buttons instead (gifted-btns);
 * a tap sends the button id back as a normal command (".play audio …", ".menu" …).
 */
const SITE_URL = process.env.SITE_URL || 'https://akuma.skyhost.tech';
const SITE_BUTTON = { url: SITE_URL, buttonText: { displayText: '🌐 Website' } };
function isLegacyButtons(c) {
  return c && Array.isArray(c.buttons) && c.buttons.length && c.buttons.every((b) => b && (b.buttonId || b.url));
}
const label = (b) => (b.buttonText && b.buttonText.displayText) || b.buttonId || 'Open';
function nativeButton(b) {
  if (b.url) return { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: label(b), url: b.url, merchant_url: b.url }) };
  return { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: label(b), id: b.buttonId }) };
}
// gifted-btns reads images from a URL/path; a Buffer is written to a temp file first.
function imageInput(img) {
  if (!img) return null;
  if (Buffer.isBuffer(img)) {
    const f = require('path').join(require('os').tmpdir(), 'akuma-btn-' + Date.now() + Math.random().toString(36).slice(2, 6) + '.jpg');
    require('fs').writeFileSync(f, img);
    setTimeout(() => { try { require('fs').unlinkSync(f); } catch (_) {} }, 120000).unref();
    return { url: f };
  }
  return img;
}
async function sendNativeButtons(sock, jid, c, options) {
  let btns;
  try { btns = require('gifted-btns'); } catch (_) { return null; }
  const interactiveButtons = c.buttons.slice(0, 10).map(nativeButton);
  const text = c.caption || c.text || '';
  const image = imageInput(c.image);
  try {
    if (typeof btns.sendInteractiveMessage === 'function') {
      const content = { text, footer: c.footer || 'QUEEN AKUMA', interactiveButtons, contextInfo: c.contextInfo };
      if (image) content.image = image;
      return await btns.sendInteractiveMessage(sock, jid, content, options && options.quoted ? { quoted: options.quoted } : {});
    }
  } catch (e) { /* try the simple form */ }
  try {
    return await btns.sendButtons(sock, jid, {
      text, footer: c.footer || 'QUEEN AKUMA', ...(image ? { image } : {}),
      buttons: c.buttons.slice(0, 10).map((b) => (b.url ? nativeButton(b) : { id: b.buttonId, text: label(b) })),
    });
  } catch (e) { return null; }
}

/** Wrap the socket once. */
function install(sock) {
  if (!sock || sock.__ctxAll) return sock;
  const original = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    let c = content;
    try { c = await prepare(sock, jid, content); } catch (_) {}
    if (c && c.__site) {
      c = { ...c };
      delete c.__site;
      if (!/@newsletter$|^status@broadcast$/.test(String(jid))) c.buttons = [...(Array.isArray(c.buttons) ? c.buttons : []), SITE_BUTTON];
    }
    if (isLegacyButtons(c)) {
      const sent = await sendNativeButtons(sock, jid, c, options);
      if (sent) return sent;
      c = { ...c, buttons: c.buttons.filter((b) => b.buttonId) };
      if (!c.buttons.length) { delete c.buttons; delete c.headerType; delete c.footer; }
    }
    return original(jid, c, options);
  };
  // learn LID -> number from incoming messages (Baileys 7 gives both ids)
  try {
    sock.ev.on('messages.upsert', ({ messages }) => {
      for (const m of messages || []) {
        const k = (m && m.key) || {};
        if (k.participant && k.participantAlt) { remember(k.participant, k.participantAlt); remember(k.participantAlt, k.participant); }
        if (k.remoteJid && k.remoteJidAlt) { remember(k.remoteJid, k.remoteJidAlt); remember(k.remoteJidAlt, k.remoteJid); }
      }
    });
  } catch (_) {}
  sock.__ctxAll = true;
  return sock;
}

module.exports = { install, toPn, remember, prepare };
