/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-stikwiki.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-stikwiki.js",
  family: "A",
  command: "stickerstikwiki",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerstikwiki",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-stikwiki",
  usage: ".stickerstikwiki",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
