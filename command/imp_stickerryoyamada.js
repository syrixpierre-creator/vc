/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-ryoyamada.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-ryoyamada.js",
  family: "A",
  command: "stickerryoyamada",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerryoyamada",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-ryoyamada",
  usage: ".stickerryoyamada",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
