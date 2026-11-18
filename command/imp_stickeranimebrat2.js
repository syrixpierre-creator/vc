/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-animebrat2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-animebrat2.js",
  family: "B",
  command: "stickeranimebrat2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeranimebrat2",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-animebrat2",
  usage: ".stickeranimebrat2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
