/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-telegram.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-telegram.js",
  family: "B",
  command: "stickertelegram",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickertelegram",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-telegram",
  usage: ".stickertelegram",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
