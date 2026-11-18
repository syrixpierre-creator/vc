/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmd-lock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmd-lock.js",
  family: "B",
  command: "cmdlock",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmdlock",
  aliases: [],
  category: "restored",
  description: "Restored: cmd-lock",
  usage: ".cmdlock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
