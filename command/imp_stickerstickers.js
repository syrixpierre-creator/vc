/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-stickers.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-stickers.js",
  family: "B",
  command: "stickerstickers",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerstickers",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-stickers",
  usage: ".stickerstickers",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
