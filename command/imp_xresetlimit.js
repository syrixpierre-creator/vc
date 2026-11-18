/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for resetlimit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "resetlimit.js",
  family: "B",
  command: "xresetlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xresetlimit",
  aliases: [],
  category: "restored",
  description: "Restored: resetlimit",
  usage: ".xresetlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
