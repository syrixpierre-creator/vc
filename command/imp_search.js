/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search.js",
  family: "B",
  command: "search",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "search",
  aliases: [],
  category: "restored",
  description: "Restored: search",
  usage: ".search",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
