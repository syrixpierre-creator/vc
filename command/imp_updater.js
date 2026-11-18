/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for updater.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "updater.js",
  family: "B",
  command: "updater",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "updater",
  aliases: [],
  category: "restored",
  description: "Restored: updater",
  usage: ".updater",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
