/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-sfile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-sfile.js",
  family: "A",
  command: "searchsfile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchsfile",
  aliases: [],
  category: "restored",
  description: "Restored: search-sfile",
  usage: ".searchsfile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
