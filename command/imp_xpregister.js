/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-register.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-register.js",
  family: "A",
  command: "xpregister",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpregister",
  aliases: [],
  category: "restored",
  description: "Restored: xp-register",
  usage: ".xpregister",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
