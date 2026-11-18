/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker.js",
  family: "B",
  command: 'stickerx',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeralt",
  aliases: [],
  category: "restored",
  description: "Restored: sticker",
  usage: ".sticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
