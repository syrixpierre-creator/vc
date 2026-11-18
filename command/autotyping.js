/*****************************************************************************
 * QUEEN AKUMA — Autotyping (FAST)
 * Old version waited 3–10s before every command. Now ~150–300ms max.
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');

const configPath = path.join(__dirname, '../data/autotyping.json');
const HAS_DB = !!(process.env.MONGO_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL || process.env.DB_URL);

// In-memory cache — no disk hit every message
let cache = { enabled: false };
let cacheAt = 0;
const CACHE_TTL = 15000; // 15s

async function initConfig() {
  const now = Date.now();
  if (now - cacheAt < CACHE_TTL) return cache;
  try {
    if (HAS_DB) {
      const c = await store.getSetting('global', 'autotyping');
      cache = c || { enabled: false };
    } else {
      if (!fs.existsSync(configPath)) {
        cache = { enabled: false };
      } else {
        cache = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    }
  } catch {
    cache = { enabled: false };
  }
  cacheAt = now;
  return cache;
}

async function saveConfig(config) {
  cache = config;
  cacheAt = Date.now();
  try {
    if (HAS_DB) {
      await store.saveSetting('global', 'autotyping', config);
    } else {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  } catch (e) {
    console.error('[autotyping] save:', e.message);
  }
}

async function isAutotypingEnabled() {
  const c = await initConfig();
  return !!c.enabled;
}

let ghostCache = { val: false, at: 0 };
async function isGhostModeActive() {
  if (Date.now() - ghostCache.at < 10000) return ghostCache.val;
  try {
    const g = await store.getSetting('global', 'stealthMode');
    ghostCache = { val: !!(g && g.enabled), at: Date.now() };
  } catch {
    ghostCache = { val: false, at: Date.now() };
  }
  return ghostCache.val;
}

/** BEFORE command — keep VERY short so response is not delayed */
async function handleAutotypingForMessage(sock, chatId, userMessage) {
  try {
    if (await isGhostModeActive()) return false;
    // v3.5.0 .presence — typing/recording per scope (autotyping toggle ko override karta hai)
    try {
      const pres = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/presence.json'), 'utf8'));
      if (pres && pres.mode && pres.mode !== 'off') {
        const isGroup = chatId.endsWith('@g.us');
        const scopeOk = pres.scope === 'all' || (pres.scope === 'group' && isGroup) || (pres.scope === 'dm' && !isGroup);
        if (scopeOk) {
          sock.presenceSubscribe(chatId).catch(() => {});
          sock.sendPresenceUpdate(pres.mode === 'recording' ? 'recording' : 'composing', chatId).catch(() => {});
          await new Promise(r => setTimeout(r, 180));
          return true;
        }
      }
    } catch (_) {}
    if (!(await isAutotypingEnabled())) return false;
    // Fire-and-forget presence — do NOT wait long
    sock.presenceSubscribe(chatId).catch(() => {});
    sock.sendPresenceUpdate('composing', chatId).catch(() => {});
    // max 180ms so command starts almost immediately
    await new Promise(r => setTimeout(r, 180));
    return true;
  } catch {
    return false;
  }
}

/** AFTER command — brief pause indicator */
async function showTypingAfterCommand(sock, chatId) {
  try {
    if (await isGhostModeActive()) return false;
    if (!(await isAutotypingEnabled())) return false;
    sock.sendPresenceUpdate('composing', chatId).catch(() => {});
    await new Promise(r => setTimeout(r, 120));
    sock.sendPresenceUpdate('paused', chatId).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  command: 'autotyping',
  aliases: ['typing', 'autotype'],
  category: 'owner',
  description: 'Toggle auto-typing (fast mode — does not delay commands)',
  usage: '.autotyping <on|off>',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = (args[0] || '').toLowerCase();
    const cfg = await initConfig();

    if (!action) {
      return sock.sendMessage(chatId, {
        text: `*⌨️ Autotyping:* ${cfg.enabled ? '✅ ON' : '❌ OFF'}\n\n\`.autotyping on|off\``
      }, { quoted: message });
    }
    if (action === 'on') {
      await saveConfig({ enabled: true });
      return sock.sendMessage(chatId, { text: '✅ Autotyping ON (fast — no long delay)' }, { quoted: message });
    }
    if (action === 'off') {
      await saveConfig({ enabled: false });
      return sock.sendMessage(chatId, { text: '❌ Autotyping OFF' }, { quoted: message });
    }
    return sock.sendMessage(chatId, { text: 'Usage: `.autotyping on` / `.autotyping off`' }, { quoted: message });
  },

  handleAutotypingForMessage,
  showTypingAfterCommand,
  isAutotypingEnabled
};
