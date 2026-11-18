/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun-tools.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun-tools.js",
  family: "B",
  command: "funtools",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funtools",
  aliases: [],
  category: "restored",
  description: "Restored: fun-tools",
  usage: ".funtools",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
