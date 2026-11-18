/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-resep.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-resep.js",
  family: "A",
  command: "searchresep",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchresep",
  aliases: [],
  category: "restored",
  description: "Restored: search-resep",
  usage: ".searchresep",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
