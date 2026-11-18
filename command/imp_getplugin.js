/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for getplugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "getplugin.js",
  family: "A",
  command: "getplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "getplugin",
  aliases: [],
  category: "restored",
  description: "Restored: getplugin",
  usage: ".getplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
