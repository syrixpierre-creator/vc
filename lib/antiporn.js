/**
 * QUEEN AKUMA — Anti-Porn (link-based, no API key needed)
 *
 * v3.6.3: legacy anti-porn.js Sightengine (paid API) par tha aur cmd() system
 * par chalta tha jo is bot me hai hi nahi — wrapper "cmd is not a function"
 * error deta tha. Ye version bina key ke kaam karta hai: adult-domain links
 * ko group me delete karta hai. Image/video classification ke liye
 * Sightengine keys (SIGHTENGINE_USER / SIGHTENGINE_SECRET) chahiye — wo is
 * version me supported nahi hai, status me saaf likha hai.
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '../data/antiporn.json');

// Well-known adult domains + adult TLDs. Subdomains bhi match hote hain.
const ADULT_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com',
  'youporn.com', 'brazzers.com', 'onlyfans.com', 'chaturbate.com',
  'stripchat.com', 'livejasmin.com', 'cam4.com', 'bongacams.com',
  'myfreecams.com', 'porn.com', 'tube8.com', 'spankbang.com',
  'eporner.com', 'xhamsterlive.com', 'camwhores.tv', 'sex.com',
  'adultfriendfinder.com', 'flirt4free.com', 'imlive.com', 'camsoda.com',
  'manyvids.com', 'clips4sale.com', 'erome.com', 'motherless.com',
];
const ADULT_TLDS = ['xxx', 'porn', 'adult', 'sex', 'cam', 'tube'];

function load() {
  try { if (fs.existsSync(DATA)) return JSON.parse(fs.readFileSync(DATA, 'utf8')); } catch (_) {}
  return { groups: {} };
}
function save(db) {
  try {
    const dir = path.dirname(DATA);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA, JSON.stringify(db, null, 2));
  } catch (e) { console.error('[antiporn] save', e.message); }
}
function isOn(jid) { const db = load(); return db.groups[jid] === true; }
function setOn(jid, v) { const db = load(); db.groups[jid] = !!v; save(db); return !!v; }

// text me se host nikalo aur adult domain/TLD se match karo; match ho to host return karo
function findAdultLink(text) {
  if (!text) return null;
  const re = /(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)(?:[\/\s?#]|$)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const host = m[1].toLowerCase();
    const tld = host.split('.').pop();
    if (ADULT_TLDS.includes(tld)) return host;
    for (const d of ADULT_DOMAINS) {
      if (host === d || host.endsWith('.' + d)) return host;
    }
  }
  return null;
}

function getText(message) {
  const m = message.message || {};
  return (m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || m.documentMessage?.caption || '').trim();
}

// runHooks se chalta hai (groupAnti ke baad) — antilink ON ho to wahi pehle
// delete kar deta hai; antilink OFF (default) ho to antiporn porn links pakadta hai.
async function onMessage(sock, message, ctx = {}) {
  try {
    const chatId = ctx.chatId || message.key.remoteJid;
    if (!chatId || !chatId.endsWith('@g.us')) return;
    if (message.key.fromMe) return;
    if (!isOn(chatId)) return;
    const host = findAdultLink(getText(message));
    if (!host) return;
    const sender = message.key.participant || message.key.remoteJid;
    // group admin ko skip karo
    try {
      const st = await require('./isAdmin')(sock, chatId, sender);
      if (st && st.isSenderAdmin) return;
    } catch (_) {}
    await sock.sendMessage(chatId, { delete: message.key }).catch(() => {});
    await sock.sendMessage(chatId, {
      text: `🔞 *antiporn*\n@${sender.split('@')[0]} — Adult link not allowed (${host})`,
      mentions: [sender],
    }).catch(() => {});
  } catch (e) { console.error('[antiporn]', e.message); }
}

module.exports = { load, save, isOn, setOn, findAdultLink, onMessage };
