/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for auto-recoding.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "auto-recoding.js",
  family: "B",
  command: "autorecoding",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "autorecoding",
  aliases: [],
  category: "restored",
  description: "Restored: auto-recoding",
  usage: ".autorecoding",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
