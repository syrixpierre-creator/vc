/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for joingc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "joingc.js",
  family: "A",
  command: "joingc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "joingc",
  aliases: [],
  category: "restored",
  description: "Restored: joingc",
  usage: ".joingc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
