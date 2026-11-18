/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pinterest.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pinterest.js",
  family: "B",
  command: "xpinterest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpinterest",
  aliases: [],
  category: "restored",
  description: "Restored: pinterest",
  usage: ".xpinterest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
