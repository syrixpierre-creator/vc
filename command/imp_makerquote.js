/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-quote.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-quote.js",
  family: "B",
  command: "makerquote",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerquote",
  aliases: [],
  category: "restored",
  description: "Restored: maker-quote",
  usage: ".makerquote",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
