/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-meme.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-meme.js",
  family: "A",
  command: "stickermeme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickermeme",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-meme",
  usage: ".stickermeme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
