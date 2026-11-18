/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for clean.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "clean.js",
  family: "B",
  command: "clean",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "clean",
  aliases: [],
  category: "restored",
  description: "Restored: clean",
  usage: ".clean",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
