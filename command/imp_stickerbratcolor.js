/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-bratcolor.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-bratcolor.js",
  family: "A",
  command: "stickerbratcolor",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerbratcolor",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-bratcolor",
  usage: ".stickerbratcolor",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
