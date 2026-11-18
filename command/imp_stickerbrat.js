/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-brat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-brat.js",
  family: "B",
  command: "stickerbrat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerbrat",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-brat",
  usage: ".stickerbrat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
