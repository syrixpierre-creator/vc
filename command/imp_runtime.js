/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for runtime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "runtime.js",
  family: "B",
  command: "runtime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "runtime",
  aliases: [],
  category: "restored",
  description: "Restored: runtime",
  usage: ".runtime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
