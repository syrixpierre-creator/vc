/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quote-maker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quote-maker.js",
  family: "B",
  command: "quotemaker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotemaker",
  aliases: [],
  category: "restored",
  description: "Restored: quote-maker",
  usage: ".quotemaker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
