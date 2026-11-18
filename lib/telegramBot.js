/**
 * QUEEN AKUMA — Full Telegram bridge (v2.9.0)
 * Routes Telegram messages through the same commandHandler + plugins
 * Env: TELEGRAM_BOT_TOKEN  TELEGRAM_OWNER_ID
 * v2.9.0: /start par welcome photo + /pair <number> custom pairing code
 * (owner-only) — lib/pairing.js se code mangta hai.
 */
const settings = require('../settings');
const botProfile = require('./botProfile');

let bot = null;
let started = false;
let commandHandler = null;
// /pair bina number ke bheja ho to agla message number mana jata hai
const pendingPair = new Set();

function getHandler() {
  if (!commandHandler) {
    try {
      commandHandler = require('./commandHandler');
    } catch (e) {
      console.error('[Telegram] commandHandler load fail', e.message);
    }
  }
  return commandHandler;
}

function ownerIds() {
  let settingsOwner = '';
  try { settingsOwner = require('../settings').telegramOwnerId || ''; } catch (_) {}
  const raw = process.env.TELEGRAM_OWNER_ID || process.env.TELEGRAM_OWNERS || settingsOwner || '';
  return String(raw)
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isTgOwner(msg) {
  const ids = ownerIds();
  if (!ids.length) return false;
  return ids.includes(String(msg.from?.id || ''));
}

/** Minimal Baileys-like sock for plugins */
function createTgSock(tgBot, chatId, msg) {
  const sock = {
    user: {
      id: String(tgBot?.options?.username || 'telegram-bot') + '@s.whatsapp.net',
      name: botProfile.get().botName || settings.botName || 'QUEEN AKUMA'
    },
    platform: 'telegram',
    tg: tgBot,
    async sendMessage(jid, content, options = {}) {
      try {
        // Text
        if (content && content.text != null) {
          let text = String(content.text);
          // Telegram MarkdownV2 is picky — use plain / HTML-ish strip of WA stars partially
          text = text.replace(/\u200e/g, '');
          const opts = {};
          // Prefer plain text for reliability (WA *bold* often breaks TG markdown)
          return tgBot.sendMessage(chatId, text.slice(0, 4090), opts);
        }
        // Image
        if (content && content.image) {
          const img = content.image;
          const caption = content.caption || '';
          if (Buffer.isBuffer(img)) {
            return tgBot.sendPhoto(chatId, img, { caption: caption.slice(0, 1024) });
          }
          if (img.url) {
            return tgBot.sendPhoto(chatId, img.url, { caption: caption.slice(0, 1024) });
          }
        }
        // Video
        if (content && content.video) {
          const vid = content.video;
          const caption = content.caption || '';
          if (Buffer.isBuffer(vid)) {
            return tgBot.sendVideo(chatId, vid, { caption: caption.slice(0, 1024) });
          }
          if (vid.url) {
            return tgBot.sendVideo(chatId, vid.url, { caption: caption.slice(0, 1024) });
          }
        }
        // Audio / document
        if (content && content.audio) {
          const a = content.audio;
          if (a.url) return tgBot.sendAudio(chatId, a.url, { caption: content.caption || '' });
          if (Buffer.isBuffer(a)) return tgBot.sendAudio(chatId, a);
        }
        if (content && content.document) {
          const d = content.document;
          if (d.url) {
            return tgBot.sendDocument(chatId, d.url, {
              caption: content.caption || '',
              filename: content.fileName || 'file'
            });
          }
          if (Buffer.isBuffer(d)) {
            return tgBot.sendDocument(chatId, d, {
              caption: content.caption || '',
              filename: content.fileName || 'file.bin'
            });
          }
        }
        // Sticker
        if (content && content.sticker) {
          const s = content.sticker;
          if (Buffer.isBuffer(s)) return tgBot.sendSticker(chatId, s);
          if (s.url) return tgBot.sendSticker(chatId, s.url);
        }
        // React — ignore or send emoji text
        if (content && content.react) {
          return null;
        }
        // Fallback stringify
        if (content && typeof content === 'object') {
          return tgBot.sendMessage(chatId, JSON.stringify(content).slice(0, 500));
        }
      } catch (e) {
        console.error('[Telegram] sendMessage', e.message);
        try {
          await tgBot.sendMessage(chatId, '⚠️ Send error: ' + e.message);
        } catch (_) {}
      }
      return null;
    },
    async sendPresenceUpdate() {},
    async groupMetadata() {
      return { id: chatId, subject: msg.chat?.title || 'Telegram', participants: [] };
    },
    async groupParticipantsUpdate() {
      throw new Error('Group admin actions Telegram pe alag hote hain');
    },
    async updateProfileStatus() {},
    async readMessages() {},
    async query() { return null; }
  };
  return sock;
}

/** Synthetic WA message for plugins */
function createSyntheticMessage(msg, text) {
  const uid = String(msg.from?.id || '0');
  const chatId = String(msg.chat.id);
  const fromMe = isTgOwner(msg);
  return {
    key: {
      remoteJid: chatId + '@tg.us',
      fromMe,
      id: 'tg_' + (msg.message_id || Date.now()),
      participant: uid + '@tg.us'
    },
    message: {
      conversation: text,
      extendedTextMessage: { text }
    },
    pushName: msg.from?.first_name || msg.from?.username || 'TG-User',
    telegram: msg
  };
}

function parseCommand(text) {
  const prefixes = ['.', '!', '/', '#', ...((settings.prefixes) || [])];
  let body = String(text || '').trim();
  let used = '';
  for (const p of prefixes) {
    if (body.startsWith(p)) {
      used = p;
      body = body.slice(p.length).trim();
      break;
    }
  }
  // /start@BotName
  if (!used && body.startsWith('/')) {
    used = '/';
    body = body.slice(1).trim();
  }
  if (!used && !body) return null;
  // strip @botusername from /cmd@bot
  body = body.replace(/^([a-zA-Z0-9_]+)@[a-zA-Z0-9_]+\s*/, '$1 ');
  const parts = body.split(/\s+/);
  const cmd = (parts[0] || '').toLowerCase();
  const args = parts.slice(1);
  if (!cmd) return null;
  return { cmd, args, usedPrefix: used || '.', full: text };
}

// v2.9.0 — Custom pairing code via Telegram (owner-only).
// Number validate -> lib/pairing se 8-digit code -> XXXX-XXXX format me bhejo.
async function handlePair(tgBot, msg, numberText) {
  if (!isTgOwner(msg)) {
    return tgBot.sendMessage(msg.chat.id, '❌ /pair sirf Telegram owner ke liye hai.\nPehle TELEGRAM_OWNER_ID set karo (settings.js me telegramOwnerId ya .env me).');
  }
  const pairing = require('./pairing');
  const r = await pairing.requestPairCode(numberText || '', { from: 'telegram' });
  if (!r.ok) {
    return tgBot.sendMessage(msg.chat.id, '❌ ' + r.error);
  }
  return tgBot.sendMessage(
    msg.chat.id,
    `🔗 *Pairing Code*\n\n` +
    `📱 Number: \`${r.number}\`\n` +
    `🔑 Code: \`${r.code}\`\n\n` +
    `WhatsApp me ye steps karo:\n` +
    `1️⃣ WhatsApp kholo → *Linked devices*\n` +
    `2️⃣ *Link a device* → *Link with phone number*\n` +
    `3️⃣ Ye code dalo: \`${r.code}\`\n\n` +
    `⏰ Code 20 second me expire ho sakta hai — jaldi dalo!`,
    { parse_mode: 'Markdown' }
  );
}

async function runPlugin(tgBot, msg, parsed) {
  const ch = getHandler();
  if (!ch) {
    return tgBot.sendMessage(msg.chat.id, '❌ Command handler not ready.');
  }

  let plugin =
    (ch.commands && ch.commands.get(parsed.cmd)) ||
    null;
  if (!plugin && ch.aliases) {
    const main = ch.aliases.get(parsed.cmd);
    if (main) plugin = ch.commands.get(main);
  }
  // also try findCommand if exists
  if (!plugin && typeof ch.findCommand === 'function') {
    try {
      plugin = ch.findCommand(parsed.usedPrefix + parsed.cmd) || ch.findCommand(parsed.cmd);
    } catch (_) {}
  }

  if (!plugin || typeof plugin.handler !== 'function') {
    return tgBot.sendMessage(
      msg.chat.id,
      `❓ Command \`.${parsed.cmd}\` nahi mila.\n\`.menu\` ya \`.help\` try karo.`
    );
  }

  // Owner-only gates
  if (plugin.strictOwnerOnly || plugin.ownerOnly) {
    if (!isTgOwner(msg)) {
      return tgBot.sendMessage(msg.chat.id, '❌ Ye command sirf Telegram owner ke liye hai.\nSet: TELEGRAM_OWNER_ID');
    }
  }

  // Group-only
  if (plugin.groupOnly && msg.chat.type === 'private') {
    return tgBot.sendMessage(msg.chat.id, '⚠️ Ye command group me use karo.');
  }

  const sock = createTgSock(tgBot, msg.chat.id, msg);
  const message = createSyntheticMessage(msg, parsed.usedPrefix + parsed.cmd + (parsed.args.length ? ' ' + parsed.args.join(' ') : ''));
  const context = {
    chatId: String(msg.chat.id) + '@tg.us',
    args: parsed.args,
    isGroup: msg.chat.type === 'group' || msg.chat.type === 'supergroup',
    platform: 'telegram'
  };

  try {
    await plugin.handler(sock, message, parsed.args, context);
  } catch (e) {
    console.error('[Telegram] cmd error', parsed.cmd, e.message);
    await tgBot.sendMessage(msg.chat.id, '⚠️ Command error: ' + (e.message || 'fail')).catch(() => {});
  }
}

async function startTelegramBot() {
  // v2.8.10: token .env se ya settings.js (telegramBotToken) se — jo bhi set ho.
  // .env (TELEGRAM_BOT_TOKEN) ko priority milti hai, phir settings.js.
  let settingsToken = '';
  try { settingsToken = require('../settings').telegramBotToken || ''; } catch (_) {}
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TG_BOT_TOKEN || settingsToken || '';
  if (!token) {
    console.log('[Telegram] TELEGRAM_BOT_TOKEN not set — Telegram off');
    return null;
  }
  if (started) return bot;

  let TelegramBot;
  try {
    TelegramBot = require('node-telegram-bot-api');
  } catch {
    console.error('[Telegram] Run: npm i node-telegram-bot-api');
    return null;
  }

  bot = new TelegramBot(token, {
    polling: {
      interval: 300,
      autoStart: true,
      params: { timeout: 10 }
    }
  });
  started = true;

  bot.on('polling_error', (err) => {
    console.error('[Telegram] polling_error:', err.message);
  });

  bot.on('message', async (msg) => {
    try {
      // text commands
      let text = msg.text || msg.caption || '';
      if (!text) {
        // media without caption — ignore or hint
        return;
      }
      // ignore non-commands (no prefix)
      const trimmed = text.trim();
      const hasPrefix = /^[.!/#]/.test(trimmed) || trimmed.startsWith('/');
      if (!hasPrefix) {
        // v2.9.0: /pair ke baad plain number bheja ho to code generate karo
        if (pendingPair.has(String(msg.chat.id)) && /^[0-9+\s]{10,15}$/.test(trimmed)) {
          pendingPair.delete(String(msg.chat.id));
          return handlePair(bot, msg, trimmed);
        }
        return;
      }

      const parsed = parseCommand(trimmed);
      if (!parsed) return;

      // Built-in tg meta
      if (parsed.cmd === 'start') {
        // v2.9.0: welcome photo (bot photo) + caption; photo fail ho to text.
        const caption =
          `🤖 *${botProfile.get().botName || 'QUEEN AKUMA'}* Telegram\n\n` +
          `👋 Welcome! WhatsApp jaisi commands yahan bhi try karo:\n` +
          `\`.menu\` \`.ping\` \`.help\` \`.play\` …\n\n` +
          `🔗 Bot connect karna ho to: \`/pair 554488138425\`\n` +
          `🆔 Your Telegram ID: \`${msg.from?.id}\`\n` +
          `💬 Owner ID set karo: TELEGRAM_OWNER_ID`;
        try {
          const photo = settings.menuImage || '';
          if (photo) {
            await bot.sendPhoto(msg.chat.id, photo, { caption, parse_mode: 'Markdown' });
            return;
          }
        } catch (_) { /* photo fail -> text fallback */ }
        return bot.sendMessage(msg.chat.id, caption, { parse_mode: 'Markdown' });
      }

      // v2.9.0: /pair <number> — custom pairing code (owner-only)
      if (parsed.cmd === 'pair') {
        const num = (parsed.args || []).join(' ').trim();
        if (!num) {
          pendingPair.add(String(msg.chat.id));
          return bot.sendMessage(
            msg.chat.id,
            `🔗 *Pairing*\n\nApna WhatsApp number bhejo (country code ke saath):\n\`554488138425\``,
            { parse_mode: 'Markdown' }
          );
        }
        return handlePair(bot, msg, num);
      }

      if (parsed.cmd === 'tgid' || parsed.cmd === 'myid') {
        return bot.sendMessage(msg.chat.id, `User ID: \`${msg.from?.id}\`\nChat: \`${msg.chat.id}\``, {
          parse_mode: 'Markdown'
        });
      }

      await runPlugin(bot, msg, parsed);
    } catch (e) {
      console.error('[Telegram] message', e.message);
    }
  });

  try {
    const me = await bot.getMe();
    console.log(`[Telegram] FULL bridge @${me.username} — commands via plugin handler`);
  } catch (e) {
    console.error('[Telegram] getMe', e.message);
  }

  return bot;
}

function stopTelegramBot() {
  if (bot) {
    try {
      bot.stopPolling();
    } catch (_) {}
    bot = null;
    started = false;
  }
}

module.exports = { startTelegramBot, stopTelegramBot, createTgSock };
