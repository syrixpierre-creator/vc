/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-truth.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-truth.js",
  family: "B",
  command: "quotestruth",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotestruth",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-truth",
  usage: ".quotestruth",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
