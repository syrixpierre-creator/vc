// Shim for plugins that read ../config
const settings = require('../settings');
const base = { PREFIX: settings.prefixes[0], prefix: settings.prefixes[0], OWNER_NUMBER: settings.ownerNumber, OWNER_NAME: settings.botOwner,
  BOT_NAME: settings.botName, botName: settings.botName, MODE: 'public', AUTHOR: settings.botOwner };
module.exports = new Proxy(base, { get: (t, k) => (k in t ? t[k] : (typeof k === 'string' && k !== 'then' ? '' : undefined)) });
