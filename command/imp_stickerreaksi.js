/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-reaksi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-reaksi.js",
  family: "A",
  command: "stickerreaksi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerreaksi",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-reaksi",
  usage: ".stickerreaksi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
