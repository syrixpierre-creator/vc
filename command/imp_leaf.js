/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for leaf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "leaf.js",
  family: "B",
  command: "leaf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "leaf",
  aliases: [],
  category: "restored",
  description: "Restored: leaf",
  usage: ".leaf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
