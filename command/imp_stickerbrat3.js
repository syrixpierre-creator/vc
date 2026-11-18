/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-brat3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-brat3.js",
  family: "B",
  command: "stickerbrat3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerbrat3",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-brat3",
  usage: ".stickerbrat3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
