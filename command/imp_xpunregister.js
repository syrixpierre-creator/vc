/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-unregister.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-unregister.js",
  family: "B",
  command: "xpunregister",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpunregister",
  aliases: [],
  category: "restored",
  description: "Restored: xp-unregister",
  usage: ".xpunregister",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
