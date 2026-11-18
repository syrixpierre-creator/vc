/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmd-set.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmd-set.js",
  family: "B",
  command: "cmdset",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmdset",
  aliases: [],
  category: "restored",
  description: "Restored: cmd-set",
  usage: ".cmdset",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
