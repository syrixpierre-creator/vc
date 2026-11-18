/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-add.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-add.js",
  family: "B",
  command: "gcadd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcadd",
  aliases: [],
  category: "restored",
  description: "Restored: gc-add",
  usage: ".gcadd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
