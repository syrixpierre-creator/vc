/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-uptodown.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-uptodown.js",
  family: "B",
  command: "searchuptodown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchuptodown",
  aliases: [],
  category: "restored",
  description: "Restored: search-uptodown",
  usage: ".searchuptodown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
