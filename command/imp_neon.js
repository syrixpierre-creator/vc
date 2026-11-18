/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for neon.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "neon.js",
  family: "B",
  command: "neon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "neon",
  aliases: [],
  category: "restored",
  description: "Restored: neon",
  usage: ".neon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
