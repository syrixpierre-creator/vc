/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-tiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-tiktok.js",
  family: "B",
  command: "downtiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downtiktok",
  aliases: [],
  category: "restored",
  description: "Restored: down-tiktok",
  usage: ".downtiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
