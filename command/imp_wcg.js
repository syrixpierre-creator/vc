/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for wcg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "wcg.js",
  family: "B",
  command: "wcg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "wcg",
  aliases: [],
  category: "restored",
  description: "Restored: wcg",
  usage: ".wcg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
