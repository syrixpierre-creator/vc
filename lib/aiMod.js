/**
 * QUEEN AKUMA v3.2.0 — AI Auto-Admin
 * Gemini har group message padhta hai (Hinglish gali, jhagda, spam, promo,
 * scam) aur khud warn/delete/kick karta hai. Keyword antilink nahi — asli samajh.
 * Bot ko slow nahi karta: check background me chalta hai (fire-and-forget),
 * flood detect bina AI ke, per-user AI cooldown 10s, fail-open (API fail = kuch nahi).
 */
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'aimod.json');
const FLOOD_WINDOW_MS = 10000;
const FLOOD_WARN = 6;
const FLOOD_DELETE = 10;
const AI_COOLDOWN_MS = 10000;
const META_CACHE_MS = 60000;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const VALID_VERDICTS = new Set(['ok', 'warn', 'delete', 'kick']);

const metaCache = new Map(); // chatId -> {meta, at}
const floodMap = new Map();  // chatId -> Map(jid -> [ts])
const floodWarned = new Map(); // chatId:jid -> ts of last flood warn
const aiCooldown = new Map(); // chatId:jid -> ts
let noKeyWarnedAt = 0;

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (_) { return { groups: {}, strikes: {} }; }
}
function saveConfig(cfg) {
  try { fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true }); fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); } catch (_) {}
}
function getGroupCfg(chatId) {
  const cfg = loadConfig();
  return cfg.groups[chatId] || { enabled: false, warnLimit: 3, kickOn: true, deleteOn: true };
}
function isEnabled(chatId) { return !!getGroupCfg(chatId).enabled; }
function setEnabled(chatId, on) {
  const cfg = loadConfig();
  cfg.groups[chatId] = { ...getGroupCfg(chatId), enabled: !!on };
  saveConfig(cfg);
  return cfg.groups[chatId];
}
function setGroupCfg(chatId, patch) {
  const cfg = loadConfig();
  cfg.groups[chatId] = { ...getGroupCfg(chatId), ...patch };
  saveConfig(cfg);
  return cfg.groups[chatId];
}
function getStrikes(chatId, jid) {
  const cfg = loadConfig();
  const s = cfg.strikes[chatId] && cfg.strikes[chatId][jid];
  return s ? s.count : 0;
}
function addStrike(chatId, jid, reason) {
  const cfg = loadConfig();
  if (!cfg.strikes[chatId]) cfg.strikes[chatId] = {};
  const s = cfg.strikes[chatId][jid] || { count: 0, reasons: [] };
  s.count += 1;
  s.reasons.push(reason);
  if (s.reasons.length > 5) s.reasons = s.reasons.slice(-5);
  s.lastAt = Date.now();
  cfg.strikes[chatId][jid] = s;
  saveConfig(cfg);
  return s.count;
}
function clearStrikes(chatId, jid) {
  const cfg = loadConfig();
  if (cfg.strikes[chatId]) delete cfg.strikes[chatId][jid];
  saveConfig(cfg);
}
function topStrikers(chatId, n = 5) {
  const cfg = loadConfig();
  const list = Object.entries(cfg.strikes[chatId] || {}).map(([jid, s]) => ({ jid, count: s.count, lastReason: s.reasons[s.reasons.length - 1] || '' }));
  return list.sort((a, b) => b.count - a.count).slice(0, n);
}
function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }

async function getGroupMeta(sock, chatId) {
  const cached = metaCache.get(chatId);
  if (cached && Date.now() - cached.at < META_CACHE_MS) return cached.meta;
  try {
    const meta = await sock.groupMetadata(chatId);
    metaCache.set(chatId, { meta, at: Date.now() });
    return meta;
  } catch (_) { return null; }
}
function isGroupAdmin(meta, jid) {
  if (!meta || !Array.isArray(meta.participants)) return false;
  const p = meta.participants.find((x) => x.id === jid || String(x.id).split('@')[0] === num(jid));
  return !!p && (p.admin === 'admin' || p.admin === 'superadmin');
}
function isBotAdmin(meta, botJid) {
  if (!meta) return false;
  return isGroupAdmin(meta, botJid) || isGroupAdmin(meta, meta.owner || '');
}

const CLASSIFY_PROMPT = `You are a WhatsApp group moderator AI. Classify this message (it may be Hinglish, Hindi or English) and reply ONLY with one JSON object, no other text:
{"verdict":"ok|warn|delete|kick","category":"abuse|fight|spam|promo|scam|nsfw|hate|other","severity":1-5,"reason":"short Hinglish reason"}
Categories:
- abuse: gaali, slurs, personal insults (Hinglish gaali counts, e.g. bc/mc/chutiya etc.)
- fight: threats, dhamki, aggressive fight language
- spam: repeated/bulk text, flooding, excessive emojis or characters
- promo: unsolicited ads, "join my group", earn-money schemes
- scam: fake offers, free recharge, phishing links, "click to win"
- nsfw: sexual content
- hate: religion/caste/gender based hate
Rules: friendly teasing, jokes, song lyrics and normal chat = ok. Context matters, do not over-flag. severity 1-2 mild, 3 clear violation, 4 serious, 5 severe. verdict: ok for severity 1-2 or normal chat; warn for 3; delete for 4; kick for 5 or scam links.
Message: `;

async function classify(text, apiKey) {
  const failOpen = { verdict: 'ok', category: 'other', severity: 0, reason: '' };
  if (!apiKey) return { ...failOpen, noKey: true };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(GEMINI_URL + '?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: CLASSIFY_PROMPT + JSON.stringify(text) }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 200 } }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));
    if (!res.ok) return failOpen;
    const data = await res.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    raw = raw.replace(/```json|```/g, '').trim();
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return failOpen;
    const parsed = JSON.parse(m[0]);
    if (!VALID_VERDICTS.has(parsed.verdict)) return failOpen;
    return { verdict: parsed.verdict, category: parsed.category || 'other', severity: Number(parsed.severity) || 3, reason: String(parsed.reason || '').slice(0, 120) };
  } catch (_) { return failOpen; }
}

async function deleteMessage(sock, chatId, message) {
  try { await sock.sendMessage(chatId, { delete: message.key }); return true; } catch (_) { return false; }
}
async function warnUser(sock, chatId, senderJid, reason, count, limit) {
  const txt = `⚠️ *AI Auto-Admin Warning*\n\n@${num(senderJid)} — ${reason}\nStrike: *${count}/${limit}*${count >= limit ? '\n🚨 Agli baar kick!' : ''}`;
  try { await sock.sendMessage(chatId, { text: txt, mentions: [senderJid] }); } catch (_) {}
}
async function kickUser(sock, chatId, senderJid) {
  try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove'); return true; } catch (_) { return false; }
}

/** Main hook — messageHandler se fire-and-forget call hota hai. Kabhi throw nahi karta. */
async function checkMessage(sock, message, ctx = {}) {
  try {
    const chatId = ctx.chatId || message.key.remoteJid;
    const senderJid = ctx.senderId || message.key.participant || message.key.remoteJid;
    const text = (ctx.messageText || '').trim();
    if (!ctx.isGroup || !chatId || !chatId.endsWith('@g.us')) return;
    if (!isEnabled(chatId)) return;
    if (message.key.fromMe) return;
    if (!text || text.length < 2) return;
    if (/^(ludo_|aimod|\.|!|#|\/)/i.test(text)) return; // commands aur button taps skip
    const cfg = getGroupCfg(chatId);
    const botJid = sock.user?.id || sock.authState?.creds?.me?.id;

    // owner/sudo exempt
    try {
      const isOwner = require('./isOwner');
      if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(senderJid)) return;
      if (await isOwner(senderJid, sock, chatId)) return;
    } catch (_) {}

    // flood detect (AI ke bina, instant)
    const now = Date.now();
    if (!floodMap.has(chatId)) floodMap.set(chatId, new Map());
    const userMap = floodMap.get(chatId);
    const stamps = (userMap.get(senderJid) || []).filter((t) => now - t < FLOOD_WINDOW_MS);
    stamps.push(now);
    userMap.set(senderJid, stamps);
    if (stamps.length >= FLOOD_DELETE) {
      userMap.set(senderJid, []);
      floodWarned.delete(chatId + ':' + senderJid);
      await deleteMessage(sock, chatId, message);
      const c = addStrike(chatId, senderJid, 'flood/spam (10+ msgs in 10s)');
      await warnUser(sock, chatId, senderJid, 'Ek saath bahut saare messages bhej rahe ho (flood/spam).', c, cfg.warnLimit);
      if (c >= cfg.warnLimit) await enforceLimit(sock, chatId, senderJid, cfg);
      return;
    }
    if (stamps.length >= FLOOD_WARN) {
      const wk = chatId + ':' + senderJid;
      if (now - (floodWarned.get(wk) || 0) < FLOOD_WINDOW_MS) return; // is window me warn ho chuka — delete ki taraf gino
      floodWarned.set(wk, now);
      const c = addStrike(chatId, senderJid, 'flood/spam (6+ msgs in 10s)');
      await warnUser(sock, chatId, senderJid, 'Ek saath bahut saare messages mat bhejo (spam).', c, cfg.warnLimit);
      if (c >= cfg.warnLimit) await enforceLimit(sock, chatId, senderJid, cfg);
      return;
    }

    // per-user AI cooldown
    const ck = chatId + ':' + senderJid;
    if (now - (aiCooldown.get(ck) || 0) < AI_COOLDOWN_MS) return;
    aiCooldown.set(ck, now);

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      if (now - noKeyWarnedAt > 3600000) {
        noKeyWarnedAt = now;
        console.log('[aimod] GEMINI_API_KEY nahi hai — AI mod off jaisa hai. Key set karo.');
      }
      return;
    }

    // group admins exempt
    const meta = await getGroupMeta(sock, chatId);
    if (isGroupAdmin(meta, senderJid)) return;
    const botAdmin = meta ? isGroupAdmin(meta, botJid) : false;

    const verdict = await classify(text, apiKey);
    if (verdict.verdict === 'ok') return;
    const reason = verdict.reason || (verdict.category + ' detected');
    if (verdict.verdict === 'kick') {
      if (cfg.kickOn && botAdmin) {
        await deleteMessage(sock, chatId, message);
        const ok = await kickUser(sock, chatId, senderJid);
        if (ok) {
          try { await sock.sendMessage(chatId, { text: `🚫 *AI Auto-Admin:* @${num(senderJid)} ko kick kar diya — ${reason}`, mentions: [senderJid] }); } catch (_) {}
          clearStrikes(chatId, senderJid);
        } else {
          const c = addStrike(chatId, senderJid, reason);
          await warnUser(sock, chatId, senderJid, reason, c, cfg.warnLimit);
        }
      } else {
        if (cfg.deleteOn && botAdmin) await deleteMessage(sock, chatId, message);
        const c = addStrike(chatId, senderJid, reason);
        await warnUser(sock, chatId, senderJid, reason, c, cfg.warnLimit);
      }
      return;
    }
    // warn / delete
    if (verdict.verdict === 'delete' && cfg.deleteOn && botAdmin) await deleteMessage(sock, chatId, message);
    const c = addStrike(chatId, senderJid, reason);
    await warnUser(sock, chatId, senderJid, reason, c, cfg.warnLimit);
    if (c >= cfg.warnLimit) await enforceLimit(sock, chatId, senderJid, cfg);
  } catch (e) {
    console.error('[aimod]', e.message);
  }
}
async function enforceLimit(sock, chatId, senderJid, cfg) {
  if (!cfg.kickOn) return;
  const meta = await getGroupMeta(sock, chatId);
  const botJid = sock.user?.id || sock.authState?.creds?.me?.id;
  if (!meta || !isGroupAdmin(meta, botJid)) return;
  const ok = await kickUser(sock, chatId, senderJid);
  if (ok) {
    try { await sock.sendMessage(chatId, { text: `🚫 *AI Auto-Admin:* @${num(senderJid)} ko kick kar diya — ${cfg.warnLimit} strikes poore ho gaye.`, mentions: [senderJid] }); } catch (_) {}
    clearStrikes(chatId, senderJid);
  }
}
function getStatus(chatId) {
  const cfg = getGroupCfg(chatId);
  return { ...cfg, keySet: !!process.env.GEMINI_API_KEY, strikes: topStrikers(chatId, 5) };
}

module.exports = {
  loadConfig, saveConfig, getGroupCfg, isEnabled, setEnabled, setGroupCfg,
  getStrikes, addStrike, clearStrikes, topStrikers, classify, checkMessage,
  getGroupMeta, isGroupAdmin, deleteMessage, warnUser, kickUser, getStatus, num,
};
