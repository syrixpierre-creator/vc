/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-wm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-wm.js",
  family: "B",
  command: "stickerwm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerwm",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-wm",
  usage: ".stickerwm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
