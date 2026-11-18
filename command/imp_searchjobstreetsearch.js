/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-jobstreetsearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-jobstreetsearch.js",
  family: "A",
  command: "searchjobstreetsearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchjobstreetsearch",
  aliases: [],
  category: "restored",
  description: "Restored: search-jobstreetsearch",
  usage: ".searchjobstreetsearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
