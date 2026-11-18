/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-sticker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-sticker.js",
  family: "B",
  command: "stickersticker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickersticker",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-sticker",
  usage: ".stickersticker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
