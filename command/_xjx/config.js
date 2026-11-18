// Shim for ported commands: maps to QUEEN AKUMA settings
let prefix = '.';
try { prefix = require('../../lib/prefix').getPrefix() || '.'; } catch (_) {}
module.exports = {
  get prefix() { try { return require('../../lib/prefix').getPrefix() || '.'; } catch (_) { return prefix; } },
  get botName() { return process.env.BOT_NAME || 'QUEEN AKUMA'; },
  ownerNumber: process.env.OWNER_NUMBER || '',
  ownerName: process.env.OWNER_NAME || 'QUEEN AKUMA',
  timezone: process.env.TZ || 'Asia/Kolkata'
};
