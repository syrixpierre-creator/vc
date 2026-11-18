/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for groupProtection.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "groupProtection.js",
  family: "B",
  command: "groupprotection",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupprotection",
  aliases: [],
  category: "restored",
  description: "Restored: groupProtection",
  usage: ".groupprotection",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
