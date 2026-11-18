/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-delete.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-delete.js",
  family: "B",
  command: "gcdelete",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcdelete",
  aliases: [],
  category: "restored",
  description: "Restored: gc-delete",
  usage: ".gcdelete",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
