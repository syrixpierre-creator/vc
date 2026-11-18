/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for putuspasangan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "putuspasangan.js",
  family: "B",
  command: "xputuspasangan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xputuspasangan",
  aliases: [],
  category: "restored",
  description: "Restored: putuspasangan",
  usage: ".xputuspasangan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
