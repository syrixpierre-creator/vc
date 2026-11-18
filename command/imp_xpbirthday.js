/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-birthday.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-birthday.js",
  family: "A",
  command: "xpbirthday",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpbirthday",
  aliases: [],
  category: "restored",
  description: "Restored: xp-birthday",
  usage: ".xpbirthday",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
