/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-wiki.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-wiki.js",
  family: "B",
  command: "searchwiki",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchwiki",
  aliases: [],
  category: "restored",
  description: "Restored: search-wiki",
  usage: ".searchwiki",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
