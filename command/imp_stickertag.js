/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-tag.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-tag.js",
  family: "B",
  command: "stickertag",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickertag",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-tag",
  usage: ".stickertag",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
