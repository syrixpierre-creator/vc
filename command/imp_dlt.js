/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dlt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dlt.js",
  family: "B",
  command: "dlt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dlt",
  aliases: [],
  category: "restored",
  description: "Restored: dlt",
  usage: ".dlt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
