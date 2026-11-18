/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-tenor.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-tenor.js",
  family: "A",
  command: "stickertenor",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickertenor",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-tenor",
  usage: ".stickertenor",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
