/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-grupwa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-grupwa.js",
  family: "A",
  command: "searchgrupwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchgrupwa",
  aliases: [],
  category: "restored",
  description: "Restored: search-grupwa",
  usage: ".searchgrupwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
