/*****************************************************************************
 * QUEEN AKUMA — Auto-react (FAST)
 * .autoreact on|off|emoji|list|reset
 * aliases: setautoreact, areact
 *****************************************************************************/
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../data/autoreact.json');
const DEFAULT_EMOJIS = [
  '💘','💝','💖','💗','💓','💞','💕','💟','❣️','❤️',
  '🧡','💛','💚','💙','💜','🤎','🖤','🤍',
  '😘','🤗','🥰','😍','🤩','😊','🌸','🌹','⭐️','🌟'
];

let state = { enabled: false, emojis: [...DEFAULT_EMOJIS] };
let lastReactedTime = 0;
let listenerAttached = false;
const COOLDOWN_MS = 350; // was 1500 — much faster

function load() {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(CONFIG_PATH)) {
      const j = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      state.enabled = !!j.enabled;
      if (Array.isArray(j.emojis) && j.emojis.length) state.emojis = j.emojis;
    }
  } catch (_) {}
}

function save() {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[autoreact] save:', e.message);
  }
}

function randomEmoji() {
  const arr = state.emojis.length ? state.emojis : DEFAULT_EMOJIS;
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseEmojis(text) {
  if (!text || !String(text).trim()) return [];
  const re = /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*/gu;
  return [...new Set(String(text).match(re) || [])];
}

function attachListener(sock) {
  if (listenerAttached) return;
  listenerAttached = true;

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!state.enabled) return;
    if (type && type !== 'notify') return;
    for (const m of messages) {
      try {
        if (!m?.message || m.key.fromMe) continue;
        const jid = m.key.remoteJid || '';
        if (jid === 'status@broadcast') continue;

        // skip pure protocol / revoke
        if (m.message.protocolMessage) continue;

        const text =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          '';
        if (text && /^[.!#/$%]/.test(text.trim())) continue;

        const now = Date.now();
        if (now - lastReactedTime < COOLDOWN_MS) continue;
        lastReactedTime = now;

        // fire-and-forget for speed
        sock.sendMessage(jid, {
          react: { text: randomEmoji(), key: m.key }
        }).catch(() => {});
      } catch (_) {}
    }
  });
}

/**
 * v2.8.3: .autoreact sirf chat messages par react karta tha — status par
 * nahi (listener status@broadcast skip karta hai). User ko lagta hai
 * ".autoreact on" ke baad status par bhi reaction aayega (status seen to
 * hota hai, reaction nahi). Isliye .autoreact on/off ab status react ko
 * bhi saath me on/off karta hai (autostatus reactOn + view).
 */
async function setStatusReact(on) {
  try {
    const as = require('./autostatus');
    if (!as || typeof as.readConfig !== 'function' || typeof as.writeConfig !== 'function') return false;
    const cfg = await as.readConfig();
    cfg.reactOn = !!on;
    if (on) cfg.enabled = true; // view bhi ON (status events ke liye zaroori)
    await as.writeConfig(cfg);
    return true;
  } catch (_) { return false; }
}

async function getStatusReact() {
  try {
    const as = require('./autostatus');
    if (!as || typeof as.isStatusReactionEnabled !== 'function') return null;
    return await as.isStatusReactionEnabled();
  } catch (_) { return null; }
}

load();

module.exports = {
  attachListener,
  command: 'autoreact',
  aliases: ['areact', 'autoreaction', 'setautoreact', 'setreact'],
  category: 'owner',
  description: 'Fast auto-react + custom emojis',
  usage: '.autoreact on|off|emoji 🔥❤️|list',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sub = String(args[0] || '').toLowerCase();
    attachListener(sock);

    if (!sub || sub === 'status') {
      const sr = await getStatusReact();
      return sock.sendMessage(chatId, {
        text:
          `*⚡ AUTO-REACT (FAST)*\n\n` +
          `Chat messages: ${state.enabled ? '✅ ON' : '❌ OFF'}\n` +
          `Status react: ${sr === null ? '?' : (sr ? '✅ ON' : '❌ OFF')}\n` +
          `Cooldown: ${COOLDOWN_MS}ms\n` +
          `Emojis (${state.emojis.length}): ${state.emojis.slice(0, 16).join(' ')}\n\n` +
          `• \`.autoreact on\` — chat + status dono par react\n` +
          `• \`.autoreact off\` — dono band\n` +
          `• \`.autoreact emoji 🔥❤️💚\`\n` +
          `• \`.autoreact add 🚀\`\n` +
          `• \`.autoreact list\` / \`.autoreact reset\`\n` +
          `• Sirf status: \`.autostatusreact on/off\``
      }, { quoted: message });
    }
    if (sub === 'on') {
      state.enabled = true; save();
      await setStatusReact(true);
      return sock.sendMessage(chatId, { text: `✅ Auto-react ON (fast ${COOLDOWN_MS}ms)\nChat messages + Status dono par react hoga.` }, { quoted: message });
    }
    if (sub === 'off') {
      state.enabled = false; save();
      await setStatusReact(false);
      return sock.sendMessage(chatId, { text: '❌ Auto-react OFF\nChat messages + Status react dono band.' }, { quoted: message });
    }
    if (sub === 'list') {
      return sock.sendMessage(chatId, { text: `Emojis:\n${state.emojis.join(' ')}` }, { quoted: message });
    }
    if (sub === 'reset') {
      state.emojis = [...DEFAULT_EMOJIS]; save();
      return sock.sendMessage(chatId, { text: '♻️ Default emojis' }, { quoted: message });
    }
    if (sub === 'emoji' || sub === 'set' || sub === 'emojis') {
      const em = parseEmojis(args.slice(1).join(' '));
      if (!em.length) return sock.sendMessage(chatId, { text: '❌ Example: `.autoreact emoji 🔥❤️`' }, { quoted: message });
      state.emojis = em; save();
      return sock.sendMessage(chatId, { text: `✅ Set (${em.length}): ${em.join(' ')}` }, { quoted: message });
    }
    if (sub === 'add') {
      const em = parseEmojis(args.slice(1).join(' '));
      if (!em.length) return sock.sendMessage(chatId, { text: '❌ `.autoreact add 🎉`' }, { quoted: message });
      state.emojis = [...new Set([...state.emojis, ...em])]; save();
      return sock.sendMessage(chatId, { text: `✅ Added. Total ${state.emojis.length}` }, { quoted: message });
    }
    return sock.sendMessage(chatId, { text: 'Usage: `.autoreact on|off|emoji 🔥|list`' }, { quoted: message });
  }
};
