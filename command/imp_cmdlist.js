/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmd-list.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmd-list.js",
  family: "B",
  command: "cmdlist",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmdlist",
  aliases: [],
  category: "restored",
  description: "Restored: cmd-list",
  usage: ".cmdlist",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
