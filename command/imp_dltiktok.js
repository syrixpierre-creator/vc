/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl-tiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl-tiktok.js",
  family: "B",
  command: "dltiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dltiktok",
  aliases: [],
  category: "restored",
  description: "Restored: dl-tiktok",
  usage: ".dltiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
