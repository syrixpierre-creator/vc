/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for config.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "config.js",
  family: "B",
  command: "config",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "config",
  aliases: [],
  category: "restored",
  description: "Restored: config",
  usage: ".config",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
