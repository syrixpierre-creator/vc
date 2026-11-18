/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search2.js",
  family: "B",
  command: "search2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "search2",
  aliases: [],
  category: "restored",
  description: "Restored: search2",
  usage: ".search2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
