/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_analyze.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_analyze.js",
  family: "B",
  command: "newanalyze",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newanalyze",
  aliases: [],
  category: "restored",
  description: "Restored: new_analyze",
  usage: ".newanalyze",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
