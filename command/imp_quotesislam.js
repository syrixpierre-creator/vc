/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-islam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-islam.js",
  family: "A",
  command: "quotesislam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotesislam",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-islam",
  usage: ".quotesislam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
