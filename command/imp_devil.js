/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for devil.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "devil.js",
  family: "B",
  command: "devil",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "devil",
  aliases: [],
  category: "restored",
  description: "Restored: devil",
  usage: ".devil",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
