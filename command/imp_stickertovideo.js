/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-tovideo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-tovideo.js",
  family: "B",
  command: "stickertovideo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickertovideo",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-tovideo",
  usage: ".stickertovideo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
