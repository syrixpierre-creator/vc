/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for plugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "plugin.js",
  family: "B",
  command: "xplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xplugin",
  aliases: [],
  category: "restored",
  description: "Restored: plugin",
  usage: ".xplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
