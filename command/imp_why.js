/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for why.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "why.js",
  family: "A",
  command: "why",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "why",
  aliases: [],
  category: "restored",
  description: "Restored: why",
  usage: ".why",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
