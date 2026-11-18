/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pindl2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pindl2.js",
  family: "A",
  command: "xpindl2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpindl2",
  aliases: [],
  category: "restored",
  description: "Restored: pindl2",
  usage: ".xpindl2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
