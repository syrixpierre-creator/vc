/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-animebrat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-animebrat.js",
  family: "A",
  command: "stickeranimebrat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeranimebrat",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-animebrat",
  usage: ".stickeranimebrat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
