/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dl_tiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dl_tiktok.js",
  family: "B",
  command: "xdltiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xdltiktok",
  aliases: [],
  category: "restored",
  description: "Restored: dl_tiktok",
  usage: ".xdltiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
