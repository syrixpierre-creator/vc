/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pinlens.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pinlens.js",
  family: "B",
  command: "xpinlens",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpinlens",
  aliases: [],
  category: "restored",
  description: "Restored: pinlens",
  usage: ".xpinlens",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
