/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-playstore.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-playstore.js",
  family: "A",
  command: "searchplaystore",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchplaystore",
  aliases: [],
  category: "restored",
  description: "Restored: search-playstore",
  usage: ".searchplaystore",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
