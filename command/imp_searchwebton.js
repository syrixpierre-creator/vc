/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-webton.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-webton.js",
  family: "A",
  command: "searchwebton",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchwebton",
  aliases: [],
  category: "restored",
  description: "Restored: search-webton",
  usage: ".searchwebton",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
