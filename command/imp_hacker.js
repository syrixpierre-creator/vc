/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for hacker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "hacker.js",
  family: "B",
  command: "hacker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "hacker",
  aliases: [],
  category: "restored",
  description: "Restored: hacker",
  usage: ".hacker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
