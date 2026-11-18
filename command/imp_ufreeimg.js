/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-freeimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-freeimg.js",
  family: "B",
  command: "ufreeimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ufreeimg",
  aliases: [],
  category: "restored",
  description: "Restored: u-freeimg",
  usage: ".ufreeimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
