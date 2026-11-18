/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-anyabrat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-anyabrat.js",
  family: "B",
  command: "stickeranyabrat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeranyabrat",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-anyabrat",
  usage: ".stickeranyabrat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
