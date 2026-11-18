/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bot-settings.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bot-settings.js",
  family: "B",
  command: "botsettings",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "botsettings",
  aliases: [],
  category: "restored",
  description: "Restored: bot-settings",
  usage: ".botsettings",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
