/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-fstik.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-fstik.js",
  family: "B",
  command: "stickerfstik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerfstik",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-fstik",
  usage: ".stickerfstik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
