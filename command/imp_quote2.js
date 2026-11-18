/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quote2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quote2.js",
  family: "A",
  command: "quote2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quote2",
  aliases: [],
  category: "restored",
  description: "Restored: quote2",
  usage: ".quote2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
