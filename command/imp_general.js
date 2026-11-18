/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for general.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "general.js",
  family: "B",
  command: "general",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "general",
  aliases: [],
  category: "restored",
  description: "Restored: general",
  usage: ".general",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
