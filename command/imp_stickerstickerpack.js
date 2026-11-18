/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-stickerpack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-stickerpack.js",
  family: "B",
  command: "stickerstickerpack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerstickerpack",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-stickerpack",
  usage: ".stickerstickerpack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
