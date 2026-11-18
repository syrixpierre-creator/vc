/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-qc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-qc.js",
  family: "B",
  command: "stickerqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerqc",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-qc",
  usage: ".stickerqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
