/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sticker-attp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sticker-attp.js",
  family: "B",
  command: "stickerattp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stickerattp",
  aliases: [],
  category: "restored",
  description: "Restored: sticker-attp",
  usage: ".stickerattp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
