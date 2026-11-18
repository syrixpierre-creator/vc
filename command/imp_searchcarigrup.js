/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-carigrup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-carigrup.js",
  family: "B",
  command: "searchcarigrup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchcarigrup",
  aliases: [],
  category: "restored",
  description: "Restored: search-carigrup",
  usage: ".searchcarigrup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
