/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-ppcp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-ppcp.js",
  family: "A",
  command: "randomppcp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomppcp",
  aliases: [],
  category: "restored",
  description: "Restored: random-ppcp",
  usage: ".randomppcp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
