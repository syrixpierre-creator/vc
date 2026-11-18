/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-happymod.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-happymod.js",
  family: "A",
  command: "searchhappymod",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchhappymod",
  aliases: [],
  category: "restored",
  description: "Restored: search-happymod",
  usage: ".searchhappymod",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
