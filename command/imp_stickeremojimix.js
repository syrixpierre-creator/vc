/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-emojimix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-emojimix.js",
  family: "B",
  command: "stickeremojimix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickeremojimix",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-emojimix",
  usage: ".stickeremojimix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
