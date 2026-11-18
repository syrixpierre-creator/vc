try { require('dotenv').config(); } catch (_) {}

global.SESSION_ID = process.env.SESSION_ID || '';
global.PAIRING_NUMBER = process.env.PAIRING_NUMBER || '';

// Optional third-party API providers
global.APIs = {
    lol: 'https://api.lolhuman.xyz',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    gemini: 'https://generativelanguage.googleapis.com',
    elite: process.env.ELITE_API_BASE || 'https://eliteprotech-apis.zone.id'
};

global.APIKeys = {
    'https://api.lolhuman.xyz': process.env.LOLHUMAN_KEY || '',
    'https://api.neoxr.my.id': process.env.NEOXR_KEY || '',
    'https://zenzapis.xyz': process.env.ZENZ_KEY || ''
};

// Gemini AI — set in .env: GEMINI_API_KEY=your_key
// Get key: https://aistudio.google.com/apikey

// EliteProTech APIs — https://eliteprotech-apis.zone.id
// Dashboard: https://eliteprotech-apis.zone.id/dashboard
// Many endpoints work without key; set key if dashboard gives you one
global.ELITE_API_BASE = process.env.ELITE_API_BASE || 'https://eliteprotech-apis.zone.id';
global.ELITE_API_KEY = process.env.ELITE_API_KEY || '';

global.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
global.GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// OSINT Hub — https://osint-apis-hub.onrender.com
global.OSINT_API_BASE = process.env.OSINT_API_BASE || 'https://osint-apis-hub.onrender.com/api';
global.OSINT_API_KEY = process.env.OSINT_API_KEY || '1MonthFree';

// DEXBOT defaults (runtime overrides in data/dexbot.json)
global.DEXBOT = {
    enabled: false,
    dm: true,
    group: false,
    ownerName: 'INCONNU BOY SENSEI',
    developerName: 'INCONNU BOY SENSEI',
    botName: 'QUEEN AKUMA',
    helloMessage: '👋 Hello! Main *QUEEN AKUMA* AI assistant hoon.\nKuch poochna ho to likho — ya command ke liye *.menu*',
    systemPrompt: 'You are QUEEN AKUMA, a helpful WhatsApp bot assistant. Reply in the same language the user uses (Hindi/English/Hinglish). Be short, friendly, useful. You help with bot commands and general questions.'
};

// ─────────────────────────────────────────────────────────────────────────
// Couche de compatibilité : beaucoup de commandes importées d'autres bots
// lisent leur config via `require('../config').XXX` (config.BOT_NAME,
// config.PREFIX, config.DESCRIPTION…). Avant, ces champs n'existaient pas ici
// et s'affichaient en "undefined". On les fournit, tous branchés sur settings/
// .env, pour que ces commandes montrent bien la marque QUEEN AKUMA.
let _settings = {};
try { _settings = require('./settings'); } catch (_) {}
const _img = (() => { try { return require('./lib/botImage').BOT_IMAGE; } catch (_) { return ''; } })();
const _bool = (v, d = false) => {
    if (v === undefined || v === null || v === '') return d;
    return String(v).toLowerCase() === 'true' || v === true;
};
const _prefix = Array.isArray(_settings.prefixes) && _settings.prefixes.length ? _settings.prefixes[0] : '.';

module.exports = {
    WARN_COUNT: 3,

    // Identité du bot
    BOT_NAME: process.env.BOT_NAME || _settings.botName || 'QUEEN AKUMA',
    OWNER_NAME: process.env.OWNER_NAME || _settings.botOwner || 'INCONNU BOY SENSEI',
    OWNER_NUMBER: process.env.OWNER_NUMBER || _settings.ownerNumber || '',
    DEV: process.env.OWNER_NAME || _settings.botOwner || 'INCONNU BOY SENSEI',
    DESCRIPTION: process.env.DESCRIPTION || 'MADE BY INCONNU BOY SENSEI',
    DISCRAPTION: process.env.DESCRIPTION || 'MADE BY INCONNU BOY SENSEI', // faute d'orthographe présente dans les commandes importées
    CAPTION: process.env.CAPTION || 'QUEEN AKUMA',
    PREFIX: process.env.PREFIX || _prefix,
    MODE: process.env.MODE || _settings.commandMode || 'public',
    PUBLIC_MODE: _bool(process.env.PUBLIC_MODE, (_settings.commandMode || 'public') === 'public'),

    // Canal / liens
    NEWSLETTER_JID: process.env.NEWSLETTER_JID || _settings.channelId || '120363403408693274@newsletter',
    CHANNEL_LINK: process.env.CHANNEL_LINK || _settings.channelLink || '',
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || '',
    REPO: process.env.REPO || process.env.UPDATE_ZIP_URL || '',

    // Média / stickers
    MENU_IMAGE_URL: process.env.MENU_IMAGE || _img,
    ALIVE_IMG: process.env.MENU_IMAGE || _img,
    BOT_PP: process.env.MENU_IMAGE || _img,
    IMAGE_PATH: process.env.MENU_IMAGE || _img,
    PACK_NAME: process.env.STICKER_PACKNAME || _settings.packname || 'QUEEN AKUMA',
    STICKER_NAME: process.env.STICKER_PACKNAME || _settings.packname || 'QUEEN AKUMA',

    // Réactions
    CUSTOM_REACT: _bool(process.env.CUSTOM_REACT, false),
    REACT_EMOJI: process.env.REACT_EMOJI || '⚡',
    REACT_MIN: parseInt(process.env.REACT_MIN || '1', 10),
    REACT_MAX: parseInt(process.env.REACT_MAX || '1', 10),

    // Interrupteurs (par défaut off ; gérés en vrai par les commandes de réglage)
    AUTO_BIO: _bool(process.env.AUTO_BIO), AUTO_BIO_TEXT: process.env.AUTO_BIO_TEXT || '',
    AUTO_REPLY: _bool(process.env.AUTO_REPLY), AUTO_REACT: _bool(process.env.AUTO_REACT),
    AUTO_STICKER: _bool(process.env.AUTO_STICKER), AUTO_VOICE: _bool(process.env.AUTO_VOICE),
    AUTO_TYPING: _bool(process.env.AUTO_TYPING), AUTO_RECORDING: _bool(process.env.AUTO_RECORDING),
    AUTO_DOWNLOAD: _bool(process.env.AUTO_DOWNLOAD),
    AUTO_STATUS_SEEN: _bool(process.env.AUTO_STATUS_SEEN), AUTO_STATUS_REACT: _bool(process.env.AUTO_STATUS_REACT),
    AUTO_STATUS_REPLY: _bool(process.env.AUTO_STATUS_REPLY),
    AUTOJOIN_GROUP: _bool(process.env.AUTOJOIN_GROUP), AUTOJOIN_CHANNEL: _bool(process.env.AUTOJOIN_CHANNEL),
    ANTI_LINK: _bool(process.env.ANTI_LINK), ANTI_BAD: _bool(process.env.ANTI_BAD),
    ANTI_BAD_WORD: _bool(process.env.ANTI_BAD_WORD), ANTI_VV: _bool(process.env.ANTI_VV),
    ANTI_FORWARDED: _bool(process.env.ANTI_FORWARDED), DELETE_LINKS: _bool(process.env.DELETE_LINKS),
    LINK_ACTION: process.env.LINK_ACTION || 'warn',
    READ_MESSAGE: _bool(process.env.READ_MESSAGE), READ_CMD: _bool(process.env.READ_CMD),
    MENTION_REPLY: _bool(process.env.MENTION_REPLY), WELCOME: _bool(process.env.WELCOME),
    TGTOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    QUOTE_API_URL: process.env.QUOTE_API_URL || '',

    APIs: global.APIs,
    APIKeys: global.APIKeys,
    GEMINI_API_KEY: global.GEMINI_API_KEY,
    GEMINI_MODEL: global.GEMINI_MODEL,
    ELITE_API_BASE: global.ELITE_API_BASE,
    ELITE_API_KEY: global.ELITE_API_KEY,
    DEXBOT: global.DEXBOT
};
