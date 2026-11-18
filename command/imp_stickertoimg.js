/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-toimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-toimg.js",
  family: "B",
  command: "stickertoimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickertoimg",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-toimg",
  usage: ".stickertoimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
