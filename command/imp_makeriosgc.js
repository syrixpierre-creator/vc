/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-iosgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-iosgc.js",
  family: "B",
  command: "makeriosgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makeriosgc",
  aliases: [],
  category: "restored",
  description: "Restored: maker-iosgc",
  usage: ".makeriosgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
