/*****************************************************************************
 * QUEEN AKUMA — Auto view + react to WhatsApp Status
 * .autostatus on|off
 * .autostatus react on|off
 * .autostatusreact on|off   ← properly enables REACT (not just view)
 * .autostatus emoji 🔥
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const store = require('../lib/lightweight_store');
const botVars = require('../lib/botVars');

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

const configPath = path.join(__dirname, '../data/autoStatus.json');

if (!HAS_DB && !fs.existsSync(configPath)) {
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      JSON.stringify({ enabled: false, reactOn: false, emoji: '💚' }, null, 2)
    );
  } catch (_) {}
}

async function readConfig() {
  const defaults = { enabled: false, reactOn: false, emoji: '💚', reactMode: null, reactKeys: [] };
  try {
    let config = null;
    if (HAS_DB) {
      config = await store.getSetting('global', 'autoStatus');
    } else {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    if (!config || typeof config !== 'object') return defaults;
    return {
      enabled: !!config.enabled,
      reactOn: !!config.reactOn,
      emoji: config.emoji || '💚',
      // v2.8.0 FEI port: reactMode 'random' | emoji[] | null, reactKeys string[]
      reactMode: config.reactMode === 'random' || Array.isArray(config.reactMode) ? config.reactMode : null,
      reactKeys: Array.isArray(config.reactKeys) ? config.reactKeys.filter(k => typeof k === 'string') : []
    };
  } catch {
    return defaults;
  }
}

async function writeConfig(config) {
  try {
    if (HAS_DB) {
      await store.saveSetting('global', 'autoStatus', config);
    } else {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  } catch (error) {
    console.error('Error writing auto status config:', error.message);
  }
}

async function isAutoStatusEnabled() {
  // botVars AUTO_STATUS_VIEW can force view
  try {
    const v = String(botVars.get('AUTO_STATUS_VIEW') || '').toLowerCase();
    if (v && v !== 'off' && v !== 'false' && v !== '0') return true;
  } catch (_) {}
  const config = await readConfig();
  return !!config.enabled;
}

async function isStatusReactionEnabled() {
  try {
    const v = String(botVars.get('AUTO_STATUS_REACT') || '').toLowerCase();
    if (v === 'true' || v === 'on' || v === '1') return true;
  } catch (_) {}
  const config = await readConfig();
  return !!config.reactOn;
}

const REACT_POOL = ['❤️', '🔥', '💯', '👍', '😂', '😮', '😢', '🙏', '🥰', '👏'];
function pickEmoji(cfg) {
  // v2.8.0 FEI port (.statusreactmode): explicit pool wins over STATUS_VIEW_EMOJI
  if (cfg && cfg.reactMode === 'random') return REACT_POOL[Math.floor(Math.random() * REACT_POOL.length)];
  if (cfg && Array.isArray(cfg.reactMode) && cfg.reactMode.length) {
    return cfg.reactMode[Math.floor(Math.random() * cfg.reactMode.length)];
  }
  try {
    if (botVars.pickStatusEmoji) {
      const e = botVars.pickStatusEmoji();
      if (e) return e;
    }
  } catch (_) {}
  return (cfg && cfg.emoji) || '💚';
}

/**
 * React to a status — modern Baileys sendMessage react + relay fallback
 */
async function reactToStatus(sock, statusKey) {
  try {
    const enabled = await isStatusReactionEnabled();
    if (!enabled) return;

    const cfg = await readConfig();
    const emoji = pickEmoji(cfg);

    const key = {
      remoteJid: 'status@broadcast',
      id: statusKey.id,
      participant: statusKey.participant || statusKey.remoteJid,
      fromMe: false
    };

    const jidList = [
      statusKey.participant,
      statusKey.remoteJid
    ].filter(Boolean);

    // Method 1: sendMessage react (Baileys current)
    try {
      await sock.sendMessage(
        'status@broadcast',
        { react: { text: emoji, key } },
        { statusJidList: jidList }
      );
      console.log('[autostatus] reacted (sendMessage):', emoji);
      return;
    } catch (e1) {
      console.log('[autostatus] sendMessage react fail:', e1.message);
    }

    // Method 2: relayMessage reactionMessage
    try {
      await sock.relayMessage(
        'status@broadcast',
        {
          reactionMessage: {
            key,
            text: emoji
          }
        },
        {
          messageId: statusKey.id,
          statusJidList: jidList
        }
      );
      console.log('[autostatus] reacted (relay):', emoji);
    } catch (e2) {
      console.error('[autostatus] react fail:', e2.message);
    }
  } catch (error) {
    console.error('[autostatus] reactToStatus:', error.message);
  }
}

function statusTextOf(msg) {
  const m = (msg && msg.message) || {};
  const inner = (m.ephemeralMessage && m.ephemeralMessage.message) || m;
  return inner.conversation ||
    (inner.extendedTextMessage && inner.extendedTextMessage.text) ||
    (inner.imageMessage && inner.imageMessage.caption) ||
    (inner.videoMessage && inner.videoMessage.caption) || '';
}

async function handleStatusUpdate(sock, status) {
  try {
    const viewOn = await isAutoStatusEnabled();
    const reactOn = await isStatusReactionEnabled();
    // v2.8.8 vv2: status auto-download autostatus se independent hai —
    // view/react OFF hone par bhi vv2 download chalta hai.
    let vv2On = false;
    try { vv2On = require('../lib/vv2').isStatusDownloadOn(); } catch (_) {}
    if (!viewOn && !reactOn && !vv2On) return;

    // vv2 status auto-download (fire-and-forget — view/react ko slow nahi karta)
    const tryVv2Download = (st) => {
      if (!vv2On) return;
      try {
        const { handleStatusDownload } = require('../lib/vv2');
        handleStatusDownload(sock, st).catch(() => {});
      } catch (_) {}
    };

    const tryViewReact = async (key, msgText) => {
      if (!key || !key.id) return;
      if (viewOn) {
        try {
          await sock.readMessages([key]);
          console.log('[autostatus] viewed', key.id);
        } catch (err) {
          if (String(err.message || '').includes('rate-overlimit')) {
            await new Promise((r) => setTimeout(r, 1500));
            try {
              await sock.readMessages([key]);
            } catch (_) {}
          }
        }
      }
      if (reactOn) {
        // v2.8.0 FEI port (.statusreactkeys): bina keyword match ke react nahi
        const cfg = await readConfig();
        if (Array.isArray(cfg.reactKeys) && cfg.reactKeys.length) {
          const hay = String(msgText || '').toLowerCase();
          if (!cfg.reactKeys.some(k => hay.includes(String(k).toLowerCase()))) return;
        }
        await reactToStatus(sock, key);
      }
    };

    if (status.messages && status.messages.length > 0) {
      const msg = status.messages[0];
      if (msg.key && (msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid?.includes('status'))) {
        await tryViewReact(msg.key, statusTextOf(msg));
        tryVv2Download(status);
        return;
      }
    }

    if (status.key && (status.key.remoteJid === 'status@broadcast' || status.key.remoteJid?.includes('status'))) {
      await tryViewReact(status.key);
      tryVv2Download(status);
      return;
    }

    if (status.reaction && status.reaction.key) {
      await tryViewReact(status.reaction.key);
    }
  } catch (error) {
    console.error('[autostatus] handleStatusUpdate:', error.message);
  }
}

/** Detect if user meant REACT command via alias */
function isReactAlias(message, context) {
  const raw =
    (context && context.commandName) ||
    (message.message?.conversation) ||
    (message.message?.extendedTextMessage?.text) ||
    '';
  const t = String(raw).toLowerCase();
  return /autostatusreact|statusreact|autoreactstatus|reactstatus/.test(t);
}

module.exports = {
  command: 'autostatus',
  aliases: ['autoview', 'statusview', 'autostatusreact', 'statusreact', 'autoreactstatus', 'reactstatus'],
  category: 'owner',
  description: 'Auto view + react to statuses',
  usage: '.autostatus on|off | .autostatus react on|off | .autostatusreact on',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      let config = await readConfig();
      const reactAlias = isReactAlias(message, context);

      if (!args || args.length === 0) {
        const viewStatus = (await isAutoStatusEnabled()) ? '✅ ON' : '❌ OFF';
        const reactStatus = (await isStatusReactionEnabled()) ? '✅ ON' : '❌ OFF';
        const emojiShow = pickEmoji(config);
        return sock.sendMessage(
          chatId,
          {
            text:
              `🔄 *Auto Status*\n\n` +
              `📱 Auto View: *${viewStatus}*\n` +
              `💫 Auto React: *${reactStatus}*\n` +
              `😊 Emoji: ${emojiShow}\n\n` +
              `*Commands:*\n` +
              `• \`.autostatus on/off\` — auto view\n` +
              `• \`.autostatus react on/off\` — auto react\n` +
              `• \`.autostatusreact on/off\` — same as react\n` +
              `• \`.autostatus emoji 🔥\`\n` +
              `• \`.setvar STATUS_VIEW_EMOJI=❤️,🔥,✨\``
          },
          { quoted: message }
        );
      }

      let command = String(args[0] || '').toLowerCase();
      let rest = args.slice(1);

      // .autostatusreact on  → treat as react on
      if (reactAlias && (command === 'on' || command === 'off' || command === 'true' || command === 'false')) {
        rest = [command];
        command = 'react';
      }

      if (command === 'on') {
        // v2.8.4: .autostatus on = view + react DONO (pehle sirf view ON hota
        // tha, isliye status seen hota tha par reaction nahi aata tha).
        config.enabled = true;
        config.reactOn = true;
        await writeConfig(config);
        try {
          botVars.set('AUTO_STATUS_VIEW', 'view');
          botVars.set('AUTO_STATUS_REACT', 'true');
        } catch (_) {}
        return sock.sendMessage(chatId, { text: '✅ *Auto Status ON*\nAb status auto-view + auto-react dono honge.' }, { quoted: message });
      }

      if (command === 'off') {
        config.enabled = false;
        config.reactOn = false;
        await writeConfig(config);
        try {
          botVars.set('AUTO_STATUS_VIEW', 'off');
          botVars.set('AUTO_STATUS_REACT', 'false');
        } catch (_) {}
        return sock.sendMessage(chatId, { text: '✅ *Auto Status OFF*\nView + react dono band.' }, { quoted: message });
      }

      if (command === 'react' || command === 'reaction') {
        const sub = String(rest[0] || '').toLowerCase();
        if (sub === 'on' || sub === 'true' || sub === '1') {
          config.reactOn = true;
          // also enable view so we receive status events reliably
          config.enabled = true;
          await writeConfig(config);
          try {
            botVars.set('AUTO_STATUS_REACT', 'true');
            botVars.set('AUTO_STATUS_VIEW', 'view');
          } catch (_) {}
          return sock.sendMessage(
            chatId,
            {
              text:
                `✅ *Status React ON*\n` +
                `Emoji pool: ${pickEmoji(config)}\n` +
                `_View bhi ON kiya (status events ke liye)_`
            },
            { quoted: message }
          );
        }
        if (sub === 'off' || sub === 'false' || sub === '0') {
          config.reactOn = false;
          await writeConfig(config);
          try {
            botVars.set('AUTO_STATUS_REACT', 'false');
          } catch (_) {}
          return sock.sendMessage(chatId, { text: '✅ *Status React OFF*' }, { quoted: message });
        }
        return sock.sendMessage(chatId, { text: 'Usage: `.autostatus react on/off`' }, { quoted: message });
      }

      if (command === 'emoji' || command === 'emojis') {
        const em = rest.join(' ').trim() || args.slice(1).join(' ').trim();
        if (!em) {
          return sock.sendMessage(chatId, { text: 'Usage: `.autostatus emoji 🔥`\nYa multi: `.setvar STATUS_VIEW_EMOJI=❤️,🔥,✨`' }, { quoted: message });
        }
        config.emoji = em.split(/[,|]/)[0].trim();
        await writeConfig(config);
        try {
          botVars.set('STATUS_VIEW_EMOJI', em);
        } catch (_) {}
        return sock.sendMessage(chatId, { text: `✅ Status emoji: ${em}` }, { quoted: message });
      }

      return sock.sendMessage(
        chatId,
        {
          text:
            '❌ Invalid\n\n' +
            '• `.autostatus on/off`\n' +
            '• `.autostatus react on/off`\n' +
            '• `.autostatusreact on`\n' +
            '• `.autostatus emoji 🔥`'
        },
        { quoted: message }
      );
    } catch (error) {
      console.error('autostatus cmd', error);
      return sock.sendMessage(chatId, { text: '❌ Error: ' + error.message }, { quoted: message });
    }
  },

  handleStatusUpdate,
  isAutoStatusEnabled,
  isStatusReactionEnabled,
  reactToStatus,
  readConfig,
  writeConfig
};
