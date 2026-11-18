/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-bratvid2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-bratvid2.js",
  family: "A",
  command: "stickerbratvid2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerbratvid2",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-bratvid2",
  usage: ".stickerbratvid2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
