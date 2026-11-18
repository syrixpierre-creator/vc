/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-alt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-alt.js",
  family: "A",
  command: "stickeralt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeralt",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-alt",
  usage: ".stickeralt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
