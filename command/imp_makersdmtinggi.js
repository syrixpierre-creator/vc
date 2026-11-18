/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-sdmtinggi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-sdmtinggi.js",
  family: "A",
  command: "makersdmtinggi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makersdmtinggi",
  aliases: [],
  category: "restored",
  description: "Restored: maker-sdmtinggi",
  usage: ".makersdmtinggi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
