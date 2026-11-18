/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-premium.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-premium.js",
  family: "B",
  command: "ownerpremium",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerpremium",
  aliases: [],
  category: "restored",
  description: "Restored: owner-premium",
  usage: ".ownerpremium",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
