/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-pinterest.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-pinterest.js",
  family: "B",
  command: "searchpinterest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchpinterest",
  aliases: [],
  category: "restored",
  description: "Restored: search-pinterest",
  usage: ".searchpinterest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
