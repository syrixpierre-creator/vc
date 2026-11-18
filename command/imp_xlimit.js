/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for limit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "limit.js",
  family: "A",
  command: "xlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xlimit",
  aliases: [],
  category: "restored",
  description: "Restored: limit",
  usage: ".xlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
