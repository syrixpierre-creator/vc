/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-info.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-info.js",
  family: "A",
  command: "xanimeinfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xanimeinfo",
  aliases: [],
  category: "restored",
  description: "Restored: anime-info",
  usage: ".xanimeinfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
