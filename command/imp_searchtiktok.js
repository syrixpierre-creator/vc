/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-tiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-tiktok.js",
  family: "B",
  command: "searchtiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchtiktok",
  aliases: [],
  category: "restored",
  description: "Restored: search-tiktok",
  usage: ".searchtiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
