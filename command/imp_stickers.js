/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stickers.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stickers.js",
  family: "A",
  command: "stickers",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickers",
  aliases: [],
  category: "restored",
  description: "Restored: stickers",
  usage: ".stickers",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
