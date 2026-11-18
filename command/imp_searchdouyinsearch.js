/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-douyinsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-douyinsearch.js",
  family: "A",
  command: "searchdouyinsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchdouyinsearch",
  aliases: [],
  category: "restored",
  description: "Restored: search-douyinsearch",
  usage: ".searchdouyinsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
