try { require('dotenv').config(); } catch (_) {}

const path = require('path');

function buildSettings() {
const settings = {
  prefixes: ['.', '!', '/', '#'],            // multiple prefixes supported
  packname: process.env.STICKER_PACKNAME || 'QUEEN AKUMA',
  author: 'INCONNU BOY SENSEI',
  timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
  botName: 'QUEEN AKUMA',
  botOwner: 'INCONNU BOY SENSEI',
  ownerLid: process.env.OWNER_LID || '',
  // Owner = the number paired to THIS session (like INCONNU XD); .setownernumber overrides it.
  ownerNumber: String(process.env.OWNER_NUMBER || process.env.PAIRING_NUMBER || process.env.BOT_ID || '554488138425').replace(/\D/g, ''),
  giphyApiKey: process.env.GIPHY_KEY || '',  // optional: https://developers.giphy.com
  commandMode: 'public',
  maxStoreMessages: 20,
  tempCleanupInterval: 1 * 60 * 60 * 1000,   // 1 hour
  storeWriteInterval: 10000,
  description: 'QUEEN AKUMA - advanced multi-device WhatsApp bot BY INCONNU BOY SENSEI.',
  version: '3.6.3', // package.json se match rakho — console banner + .menu yahi dikhate hain
  updateZipUrl: process.env.UPDATE_ZIP_URL || '', // set your own repo zip to enable .update
  channelName: 'INCONNU BOY SENSEI',
  channelId: '120363403408693274@newsletter',
  channelLink: 'https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J',
  autoFollowChannel: process.env.AUTO_FOLLOW_CHANNEL !== 'false', // bot follows YOUR channel on connect
  // Image du bot : fichier local assets/bot_image.jpg (MENU_IMAGE=url pour la remplacer)
  menuImage: process.env.MENU_IMAGE || path.join(__dirname, 'assets', 'bot_image.jpg'),
  botImage: process.env.MENU_IMAGE || path.join(__dirname, 'assets', 'bot_image.jpg'),
  menuVideo: '',  // vidéo du menu désactivée — image uniquement
  ytch: 'INCONNU BOY SENSEI',
  // Telegram bot token — yahin dalo (v2.8.10):
  //   Option A (easy): token seedha yahan paste karo, quotes ke andar.
  //     telegramBotToken: '123456789:AAExxx...',
  //     telegramOwnerId: '987654321',
  //   Option B (safe): .env file me TELEGRAM_BOT_TOKEN / TELEGRAM_OWNER_ID
  //     likho — .env set ho to wahi chalega, ye fields ignore hongi.
  // Token @BotFather se milta hai (/newbot), Owner ID @userinfobot se.
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramOwnerId: process.env.TELEGRAM_OWNER_ID || '',
};

// Runtime identity overrides saved by .setbotname / .setownername / .setownernumber / .setchannellink
try {
  const _fs = require('fs'), _path = require('path');
  const _f = _path.join(process.cwd(), 'data', 'identity.json');
  if (_fs.existsSync(_f)) {
    const _o = JSON.parse(_fs.readFileSync(_f, 'utf8'));
    for (const k of ['botName', 'botOwner', 'ownerNumber', 'channelLink']) if (typeof _o[k] === 'string' && _o[k]) settings[k] = _o[k];
  }
} catch (_) {}

// Customization overrides saved by .customize (botname/prefix/packname/author/menuimage)
try {
  const _fs2 = require('fs'), _path2 = require('path');
  const _cf = _path2.join(process.cwd(), 'data', 'custom.json');
  if (_fs2.existsSync(_cf)) {
    const _c = JSON.parse(_fs2.readFileSync(_cf, 'utf8'));
    if (typeof _c.botName === 'string' && _c.botName) settings.botName = _c.botName;
    if (typeof _c.botOwner === 'string' && _c.botOwner) settings.botOwner = _c.botOwner;
    if (typeof _c.ownerNumber === 'string' && _c.ownerNumber) settings.ownerNumber = _c.ownerNumber;
    if (typeof _c.channelLink === 'string' && _c.channelLink) settings.channelLink = _c.channelLink;
    if (Array.isArray(_c.prefixes) && _c.prefixes.length) settings.prefixes = _c.prefixes;
    if (typeof _c.packname === 'string' && _c.packname) settings.packname = _c.packname;
    if (typeof _c.author === 'string' && _c.author) settings.author = _c.author;
    if (typeof _c.menuImage === 'string' && _c.menuImage) settings.menuImage = _c.menuImage;
  }
} catch (_) {}

// Alias MAJUSCULES : des commandes importées lisent settings.BOT_NAME, settings.PREFIX…
// On les expose en getters branchés sur les vrais champs (sinon elles affichaient undefined).
const _upperAliases = {
  BOT_NAME: () => settings.botName,
  OWNER_NAME: () => settings.botOwner,
  OWNER_NUMBER: () => settings.ownerNumber,
  DESCRIPTION: () => settings.description || ('MADE BY ' + (settings.botOwner || settings.botName)),
  PREFIX: () => (Array.isArray(settings.prefixes) && settings.prefixes.length ? settings.prefixes[0] : '.'),
  TIMEZONE: () => settings.timeZone || process.env.TZ || 'Asia/Kolkata',
  MENU_IMAGE_URL: () => settings.menuImage,
  CHANNEL_LINK: () => settings.channelLink,
  NEWSLETTER_JID: () => settings.channelId,
  PACK_NAME: () => settings.packname,
};
for (const [k, fn] of Object.entries(_upperAliases)) {
  if (!(k in settings)) Object.defineProperty(settings, k, { enumerable: false, configurable: true, get: fn });
}
// .customize / .setbotname … call settings.__reload(): new values apply at once, no restart.
Object.defineProperty(settings, '__reload', { enumerable: false, configurable: true, value: () => {
  const fresh = buildSettings();
  for (const k of Object.keys(fresh)) settings[k] = fresh[k];
  return settings;
} });
return settings;
}

// HUB MODE (all bots in one process): every bot gets its own settings object
// (its owner number, prefixes, identity…), chosen from the bot that is running.
let settings;
const _baseSettings = buildSettings();
try {
  const bc = require('./lib/botContext');
  if (bc.HUB) {
    const pick = () => { const c = bc.current(); if (!c) return _baseSettings; if (!c.settings) c.settings = buildSettings(); return c.settings; };
    settings = new Proxy({}, {
      get: (_, k) => pick()[k],
      set: (_, k, v) => { pick()[k] = v; return true; },
      has: (_, k) => k in pick(),
      ownKeys: () => Reflect.ownKeys(pick()),
      getOwnPropertyDescriptor: (_, k) => { const d = Reflect.getOwnPropertyDescriptor(pick(), k); if (d) d.configurable = true; return d; },
      deleteProperty: (_, k) => { delete pick()[k]; return true; },
    });
  }
} catch (_) {}
if (!settings) settings = _baseSettings;

// Legacy commands read a free variable `config` (botName / DESCRIPTION / prefixes). Provide it globally (live getters).
if (!global.config) {
  Object.defineProperty(global, 'config', {
    configurable: true, writable: true,
    value: {
      get botName() { return settings.botName; },
      get DESCRIPTION() { return settings.description || ('Powered by ' + (settings.botOwner || settings.botName)); },
      get prefixes() { if (Array.isArray(settings.prefixes) && settings.prefixes.length) return settings.prefixes; try { return [require('./lib/prefix').getPrefix() || '.']; } catch (_) { return ['.']; } },
      get prefix() { return this.prefixes[0]; },
      get ownerNumber() { return settings.ownerNumber; },
      get ownerName() { return settings.botOwner; },
      get channelLink() { return settings.channelLink; },
      get timezone() { return process.env.TZ || 'Asia/Kolkata'; }
    }
  });
}

try { require('./lib/globals'); } catch (_) {}

module.exports = settings;
