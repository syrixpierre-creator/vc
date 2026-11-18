/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-smeme.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-smeme.js",
  family: "B",
  command: "stickersmeme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickersmeme",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-smeme",
  usage: ".stickersmeme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
