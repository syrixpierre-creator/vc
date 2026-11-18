/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmd.js",
  family: "B",
  command: "cmd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmd",
  aliases: [],
  category: "restored",
  description: "Restored: cmd",
  usage: ".cmd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
