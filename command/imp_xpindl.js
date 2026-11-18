/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pindl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pindl.js",
  family: "B",
  command: "xpindl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpindl",
  aliases: [],
  category: "restored",
  description: "Restored: pindl",
  usage: ".xpindl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
