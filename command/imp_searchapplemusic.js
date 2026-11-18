/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-applemusic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-applemusic.js",
  family: "A",
  command: "searchapplemusic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchapplemusic",
  aliases: [],
  category: "restored",
  description: "Restored: search-applemusic",
  usage: ".searchapplemusic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
