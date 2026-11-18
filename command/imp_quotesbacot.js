/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-bacot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-bacot.js",
  family: "A",
  command: "quotesbacot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesbacot",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-bacot",
  usage: ".quotesbacot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
