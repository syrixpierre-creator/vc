/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-bucin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-bucin.js",
  family: "A",
  command: "quotesbucin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesbucin",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-bucin",
  usage: ".quotesbucin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
